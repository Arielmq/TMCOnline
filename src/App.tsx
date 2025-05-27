import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { MinerProvider } from '@/context/MinerContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Index from './pages/IndexApp.jsx';
import Workers from './pages/Workers';
import CloudMining from './pages/CloudMining';
import HealthCheck from './pages/HealthCheck';
import HowItWorks from './pages/HowItWorks';
import Quote from './pages/Quote';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import Auth from './pages/Auth';
import Subscription from './pages/Subscription';
import NotFound from './pages/NotFound';
import Home from './pages/Home.jsx';

const queryClient = new QueryClient();

const App = () => {
  const network = WalletAdapterNetwork.Devnet; // Change to Mainnet for production
  const wallets = useMemo(() => [
    new PhantomWalletAdapter({ network })
  ], [network]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <MinerProvider>
            <WalletProvider wallets={wallets} autoConnect>
              <Toaster />
              <BrowserRouter>
                <Sonner />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/app" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/workers" element={<ProtectedRoute><Workers /></ProtectedRoute>} />
                  <Route path="/cloud-mining" element={<ProtectedRoute><CloudMining /></ProtectedRoute>} />
                  <Route path="/health-check" element={<ProtectedRoute><HealthCheck /></ProtectedRoute>} />
                  <Route path="/how-it-works" element={<ProtectedRoute><HowItWorks /></ProtectedRoute>} />
                  <Route path="/quote" element={<ProtectedRoute><Quote /></ProtectedRoute>} />
                  <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
                  <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
                  <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </WalletProvider>
          </MinerProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;