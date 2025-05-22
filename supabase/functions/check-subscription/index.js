
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Manejo de solicitudes preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Crear cliente de Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2022-11-15",
    });

    // Crear cliente de Supabase con rol de servicio para actualizaciones
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );

    // Autenticar al usuario
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Se requiere autenticación");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Usuario no autenticado");
    }

    // Buscar cliente en Stripe
    const { data: customers } = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.length === 0) {
      // No hay suscripción
      await supabaseAdmin
        .from("profiles")
        .update({ is_paid: false, membership_status: "free" })
        .eq("id", user.id);

      return new Response(JSON.stringify({ 
        active: false, 
        customer: null,
        subscription: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers[0].id;

    // Buscar suscripciones activas
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      expand: ["data.default_payment_method"],
    });

    if (subscriptions.data.length === 0) {
      // No hay suscripción activa
      await supabaseAdmin
        .from("profiles")
        .update({ is_paid: false, membership_status: "free" })
        .eq("id", user.id);

      return new Response(JSON.stringify({ 
        active: false, 
        customer: customerId,
        subscription: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Hay una suscripción activa
    const subscription = subscriptions.data[0];
    
    // Actualizar perfil de usuario
    await supabaseAdmin
      .from("profiles")
      .update({ 
        is_paid: true, 
        membership_status: "premium" 
      })
      .eq("id", user.id);

    return new Response(JSON.stringify({ 
      active: true, 
      customer: customerId,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000),
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error en check-subscription:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
