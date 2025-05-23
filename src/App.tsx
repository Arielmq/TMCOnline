
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { MinerProvider } from "@/context/MinerContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/IndexApp.jsx";
import Workers from "./pages/Workers";
import CloudMining from "./pages/CloudMining";
import HealthCheck from "./pages/HealthCheck";
import HowItWorks from "./pages/HowItWorks";
import Quote from "./pages/Quote";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Auth from "./pages/Auth";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home.jsx"
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <MinerProvider>
            <Toaster />
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
          </MinerProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
