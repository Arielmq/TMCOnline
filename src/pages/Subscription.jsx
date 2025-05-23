import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Check } from 'lucide-react';
import { toast } from 'sonner';

const Subscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePlanSelection = () => {
    if (!user) {
      toast.error('You must log in to select a plan');
      navigate('/auth');
      return;
    }
    setLoading(true);
    // Navigate to contact page
    navigate('/contact');
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Choose the plan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className="p-6 border-2 border-border bg-tmcdark-card">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Free Plan</h3>
            <p className="text-3xl font-bold mt-2">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Basic dashboard access</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Monitoring of up to 3 miners</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Basic alerts</span>
            </li>
          </ul>

          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        </Card>

        {/* Premium Plan */}
        <Card className="p-6 border-2 border-bitcoin bg-tmcdark-card relative">
          <div className="absolute -top-3 right-4 bg-bitcoin text-black text-xs font-bold py-1 px-3 rounded-full">Recommended</div>
          
          <div className="mb-4">
            <h3 className="text-xl font-bold">Premium Plan</h3>
            <p className="text-3xl font-bold mt-2">$29<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Full dashboard access</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Unlimited miner monitoring</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Advanced real-time alerts</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Performance analytics</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Priority support</span>
            </li>
          </ul>

          <Button 
            className="w-full bg-bitcoin hover:bg-bitcoin/90 flex items-center justify-center gap-2" 
            onClick={handlePlanSelection}
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              <>
                <Zap className="h-4 w-4" />
                Select Plan
              </>
            )}
          </Button>
        </Card>

        {/* Enterprise Plan */}
        <Card className="p-6 border-2 border-border bg-tmcdark-card">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Enterprise Plan</h3>
            <p className="text-3xl font-bold mt-2">$99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Everything in the Premium Plan</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Dedicated API</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Multi-location management</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>24/7 support</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-status-success mr-2" />
              <span>Full customization</span>
            </li>
          </ul>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handlePlanSelection}
            disabled={loading}
          >
            Contact Sales
          </Button>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-tmcdark-card border border-border rounded-lg">
        <h3 className="text-lg font-medium mb-2">Why Subscribe?</h3>
        <p className="text-muted-foreground">
          With a premium subscription, you gain access to advanced monitoring and analytics tools 
          that will help you maximize the profitability of your Bitcoin mining. Our real-time alerts 
          keep you informed of any issues, allowing you to react quickly.
        </p>
      </div>
    </MainLayout>
  );
};

export default Subscription;