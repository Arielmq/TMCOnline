import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
     import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
     import fetch from "https://esm.sh/node-fetch@2.6.7";

     const corsHeaders = {
       "Access-Control-Allow-Origin": "*",
       "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
     };

     serve(async (req) => {
       if (req.method === "OPTIONS") {
         return new Response(null, { headers: corsHeaders });
       }

       try {
         const { terahash, blockchain } = await req.json();

         if (!terahash || !blockchain) {
           throw new Error("Faltan parámetros: terahash o blockchain");
         }

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

         const costUSD = terahash * 25;
         const coinId = blockchain === "ethereum" ? "ethereum" : "solana";
         const response = await fetch(
           `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
         );
         const priceData = await response.json();
         const cryptoPrice = priceData[coinId].usd;
         const amountCrypto = costUSD / cryptoPrice;

         const walletAddress = Deno.env.get(blockchain === "ethereum" ? "ETH_WALLET_ADDRESS" : "SOL_WALLET_ADDRESS") || "";

         return new Response(
           JSON.stringify({
             amount: amountCrypto,
             walletAddress,
             userId: user.id,
             terahash,
             blockchain,
           }),
           {
             headers: { ...corsHeaders, "Content-Type": "application/json" },
             status: 200,
           }
         );
       } catch (error) {
         console.error("Error en create-transaction:", error);
         return new Response(JSON.stringify({ error: error.message }), {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
           status: 400,
         });
       }
     });