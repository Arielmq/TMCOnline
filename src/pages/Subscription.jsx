
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Check } from 'lucide-react';
import { toast } from 'sonner';

const PRICE_ID = 'price_1Oqdw2JPm91MqDmM10kY2H4x'; // Reemplaza con tu ID de precio real de Stripe

const Subscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para suscribirte');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: PRICE_ID },
      });

      if (error) {
        throw error;
      }

      // Redirigir a la página de checkout de Stripe
      window.location.href = data.url;
    } catch (error) {
      console.error('Error al iniciar el proceso de suscripción:', error);
      toast.error('Hubo un error al procesar tu solicitud. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Suscripción</h1>
        <p className="text-muted-foreground">Elige el plan que mejor se adapte a tus necesidades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Plan Gratuito */}
        <Card className="p-6 border-2 border-border bg-tmcdark-card">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Plan Gratuito</h3>
            <p className="text-3xl font-bold mt-2">$0<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Acceso básico al dashboard</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Monitoreo de hasta 3 mineros</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Alertas básicas</span>
            </li>
          </ul>

          <Button variant="outline" className="w-full" disabled>
            Plan Actual
          </Button>
        </Card>

        {/* Plan Premium */}
        <Card className="p-6 border-2 border-bitcoin bg-tmcdark-card relative">
          <div className="absolute -top-3 right-4 bg-bitcoin text-black text-xs font-bold py-1 px-3 rounded-full">Recomendado</div>
          
          <div className="mb-4">
            <h3 className="text-xl font-bold">Plan Premium</h3>
            <p className="text-3xl font-bold mt-2">$29<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Acceso completo al dashboard</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Monitoreo ilimitado de mineros</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Alertas avanzadas en tiempo real</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Análisis de rendimiento</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Soporte prioritario</span>
            </li>
          </ul>

          <Button 
            className="w-full bg-bitcoin hover:bg-bitcoin/90 flex items-center justify-center gap-2" 
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? 'Procesando...' : (
              <>
                <Zap className="h-4 w-4" />
                Suscribirse Ahora
              </>
            )}
          </Button>
        </Card>

        {/* Plan Empresa */}
        <Card className="p-6 border-2 border-border bg-tmcdark-card">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Plan Empresa</h3>
            <p className="text-3xl font-bold mt-2">$99<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Todo lo del plan Premium</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>API dedicada</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Gestión de múltiples ubicaciones</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Soporte 24/7</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Personalización completa</span>
            </li>
          </ul>

          <Button variant="outline" className="w-full">
            Contactar Ventas
          </Button>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-tmcdark-card border border-border rounded-lg">
        <h3 className="text-lg font-medium mb-2">¿Por qué suscribirse?</h3>
        <p className="text-muted-foreground">
          Con la suscripción premium, obtienes acceso a herramientas avanzadas de monitoreo y análisis 
          que te ayudarán a maximizar la rentabilidad de tu minería de Bitcoin. Nuestras alertas en 
          tiempo real te mantendrán informado sobre cualquier problema, permitiéndote reaccionar rápidamente.
        </p>
      </div>
    </MainLayout>
  );
};

export default Subscription;
