// src/pages/Index.jsx
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import MinerCard from "@/components/dashboard/MinerCard";
import Mining3DView from "@/components/dashboard/Mining3DView";
import { Card } from "@/components/ui/card";
import { useMiner } from "@/context/MinerContext";
import { Zap, Thermometer, LayoutGrid, Activity, ArrowDown } from "lucide-react";
import MinerApiMonitor from "@/components/miner-api/MinerApiMonitor";
import { useMinerApi } from "@/hooks/useMinerApi";
import { useEffect, useState } from "react";

// Utility function to convert MHS to TH/s
const mhsToThs = (mhs) => (mhs / 1_000_000).toFixed(2);

// Utility function to calculate average temperature
const calculateAvgTemperature = (miners) => {
  const validMiners = miners.filter((miner) => miner.status === "fulfilled" && miner.data?.summary?.envTemp);
  if (validMiners.length === 0) return "N/A";
  const totalTemp = validMiners.reduce((sum, miner) => sum + (miner.data.summary.envTemp || 0), 0);
  return `${(totalTemp / validMiners.length).toFixed(1)}°C`;
};

// Utility function to count active workers
const countActiveWorkers = (miners) => {
  const active = miners.filter((miner) => miner.status === "fulfilled").length;
  const total = miners.length;
  return `${active}/${total}`;
};

// Utility function to calculate total hashrate
const calculateTotalHashrate = (miners) => {
  const validMiners = miners.filter((miner) => miner.status === "fulfilled" && miner.data?.summary?.hashrateAvg);
  if (validMiners.length === 0) return "0 TH/s";
  const totalHashrate = validMiners.reduce((sum, miner) => sum + (miner.data.summary.hashrateAvg || 0), 0);
  return `${mhsToThs(totalHashrate)} TH/s`;
};

const Index = () => {
  const { selectedPanel } = useMiner();
  const { data } = useMinerApi();
  const [processedMiners, setProcessedMiners] = useState([]);
  const [stats, setStats] = useState({
    totalHashrate: "0 TH/s",
    activeWorkers: "0/0",
    avgTemperature: "N/A",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Process miner data when new API data is received
  useEffect(() => {
    console.log("Received data:", data); // Debug: Log data to inspect structure

    if (data && data.miners && Array.isArray(data.miners) && data.miners.length > 0) {
      // Process miners if at least one has valid data
      const validMiners = data.miners.filter(
        (miner) => miner.status === "fulfilled" && miner.data && miner.data.summary
      );

      if (validMiners.length > 0) {
        // Process miners for display
        const newProcessedMiners = data.miners.map((miner) => {
          if (miner.status !== "fulfilled" || !miner.data || !miner.data.summary) {
            return {
              name: `Miner ${miner.ip}`,
              hashrate: "0 TH/s",
              status: "error",
              temperature: "N/A",
              efficiency: "N/A",
            };
          }

          const { summary, ip } = miner.data;
          const hashrate = summary?.hashrateAvg ? mhsToThs(summary.hashrateAvg) : "0";
          const status = summary?.hashrateAvg > 0 ? "active" : "warning";
          const temperature = summary?.envTemp ? `${summary.envTemp.toFixed(1)}°C` : "N/A";
          const efficiency = summary?.powerRate ? `${summary.powerRate.toFixed(1)} J/TH` : "N/A";

          return {
            name: `WhatsMiner ${ip}`,
            hashrate: `${hashrate} TH/s`,
            status,
            temperature,
            efficiency,
          };
        });

        // Calculate stats for StatCard
        const newStats = {
          totalHashrate: calculateTotalHashrate(data.miners),
          activeWorkers: countActiveWorkers(data.miners),
          avgTemperature: calculateAvgTemperature(data.miners),
        };

        // Update state with new data
        setProcessedMiners(newProcessedMiners);
        setStats(newStats);
        setIsLoading(false);
      } else {
        console.warn("No valid miners found in data:", data.miners); // Debug: Log invalid miners
      }
    } else {
      console.warn("Invalid or empty data received:", data); // Debug: Log invalid data
    }

    // Fallback to localStorage data if available after a timeout
    const timeout = setTimeout(() => {
      if (isLoading && data.miners.length === 0) {
        const savedMiners = localStorage.getItem('miners');
        if (savedMiners) {
          const parsedMiners = JSON.parse(savedMiners);
          if (Array.isArray(parsedMiners) && parsedMiners.length > 0) {
            const newProcessedMiners = parsedMiners.map((miner) => ({
              name: `WhatsMiner ${miner.ip}`,
              hashrate: miner.summary?.hashrateAvg ? `${mhsToThs(miner.summary.hashrateAvg)} TH/s` : "0 TH/s",
              status: miner.summary?.hashrateAvg > 0 ? "active" : "warning",
              temperature: miner.summary?.envTemp ? `${miner.summary.envTemp.toFixed(1)}°C` : "N/A",
              efficiency: miner.summary?.powerRate ? `${miner.summary.powerRate.toFixed(1)} J/TH` : "N/A",
            }));
            setProcessedMiners(newProcessedMiners);
            setStats({
              totalHashrate: calculateTotalHashrate(parsedMiners),
              activeWorkers: countActiveWorkers(parsedMiners),
              avgTemperature: calculateAvgTemperature(parsedMiners),
            });
            setIsLoading(false);
            console.log("Fallback to localStorage data:", parsedMiners); // Debug: Log fallback
          }
        }
      }
    }, 5000); // 5-second timeout

    return () => clearTimeout(timeout);
  }, [data]);

  // Render loading state if no data is available
  if (isLoading) {
    return (
      <MainLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to TMC Watch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
   
        <StatCard
          title="Active Workers"
          value={stats.activeWorkers}
          icon={<LayoutGrid className="h-5 w-5 text-tmcblue-light" />}
        />
        <StatCard
          title="Avg. Temperature"
          value={stats.avgTemperature}
          icon={<Thermometer className="h-5 w-5 text-status-warning" />}
          trend={{ value: "N/A", isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Mining3DView />

        {!selectedPanel && (
          <div className="space-y-6">
            <MinerApiMonitor />

            <Card style={{ height: "600px" }} className="p-4 bg-tmcdark-card border-border">
              <h3 className="font-medium text-lg mb-3">Recent Activity</h3>
              <div style={{ overflow: "auto", height: "500px" }} className="space-y-2 text-sm">
                {processedMiners.map((miner, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded bg-tmcdark">
                    <span className="flex items-center">
                      {miner.status === "active" ? (
                        <Activity className="h-4 w-4 mr-2 text-status-success" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-2 text-status-danger" />
                      )}
                      {miner.name} {miner.status === "active" ? "online" : "offline"}
                    </span>
                    <span className="text-muted-foreground">
                      {data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;