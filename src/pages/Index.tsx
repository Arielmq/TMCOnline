
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import MinerCard from "@/components/dashboard/MinerCard";
import Mining3DView from "@/components/dashboard/Mining3DView";
import { Card } from "@/components/ui/card";
import { useMiner } from "@/context/MinerContext";
import { Bitcoin, Activity, Zap, Thermometer, LayoutGrid, ArrowUp, ArrowDown } from "lucide-react";
import MinerApiMonitor from "@/components/miner-api/MinerApiMonitor";

const Index = () => {
  const { selectedPanel } = useMiner();
  
  // Sample data - this would come from API in a real application
  const miners = [
    { name: "Antminer S19 #1", hashrate: "95.5 TH/s", status: "active", temperature: "35°C", efficiency: "34.5 J/TH" },
    { name: "Whatsminer M30s #2", hashrate: "88.2 TH/s", status: "active", temperature: "42°C", efficiency: "38.0 J/TH" },
    { name: "Antminer S19 #3", hashrate: "94.8 TH/s", status: "warning", temperature: "48°C", efficiency: "36.2 J/TH" },
    { name: "Whatsminer M30s #4", hashrate: "87.3 TH/s", status: "active", temperature: "39°C", efficiency: "37.8 J/TH" },
  ];

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to TMC Watch</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Hashrate" 
          value="365.8 TH/s" 
          icon={<Zap className="h-5 w-5 text-bitcoin" />}
          trend={{ value: "2.4%", isPositive: true }}
        />
        <StatCard 
          title="Active Workers" 
          value="4/5" 
          icon={<LayoutGrid className="h-5 w-5 text-tmcblue-light" />}
        />
        <StatCard 
          title="Avg. Temperature" 
          value="41°C" 
          icon={<Thermometer className="h-5 w-5 text-status-warning" />}
          trend={{ value: "3.1°C", isPositive: false }}
        />
        <StatCard 
          title="Daily Earnings" 
          value="0.00143 BTC" 
          icon={<Bitcoin className="h-5 w-5 text-bitcoin" />}
          trend={{ value: "5.2%", isPositive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Mining3DView />
        
        {/* Añadimos el monitor de API de mineros */}
        {!selectedPanel && (
          <div className="space-y-6">
            <MinerApiMonitor />
            
            <Card className="p-4 bg-tmcdark-card border-border">
              <h3 className="font-medium text-lg mb-3">Recent Activity</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 rounded bg-tmcdark">
                  <span className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-status-success" />
                    Antminer S19 #1 online
                  </span>
                  <span className="text-muted-foreground">10m ago</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-tmcdark">
                  <span className="flex items-center">
                    <ArrowUp className="h-4 w-4 mr-2 text-status-success" />
                    Hashrate increased
                  </span>
                  <span className="text-muted-foreground">25m ago</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-tmcdark">
                  <span className="flex items-center">
                    <Thermometer className="h-4 w-4 mr-2 text-status-warning" />
                    Temperature warning
                  </span>
                  <span className="text-muted-foreground">1h ago</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-tmcdark">
                  <span className="flex items-center">
                    <ArrowDown className="h-4 w-4 mr-2 text-status-danger" />
                    Whatsminer M30s #5 offline
                  </span>
                  <span className="text-muted-foreground">3h ago</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
