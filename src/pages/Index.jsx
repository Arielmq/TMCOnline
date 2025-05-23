// src/pages/Index.jsx
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import Mining3DView from "@/components/dashboard/Mining3DView";
import { Card } from "@/components/ui/card";
import { useMiner } from "@/context/MinerContext";
import { LayoutGrid, Thermometer, Activity, ArrowDown } from "lucide-react";
import MinerApiMonitor from "@/components/miner-api/MinerApiMonitor";
import { useEffect, useState, useRef } from "react";
import { useMinerApi } from "@/hooks/useMinerApi";

// Utility function to convert MHS to TH/s
const mhsToThs = (mhs) => (mhs / 1_000_000).toFixed(2);

// Utility function to calculate average temperature
const calculateAvgTemperature = (miners) => {
  const valid = miners.filter(
    (m) => m.status === "fulfilled" && m.data?.summary?.envTemp != null
  );
  if (valid.length === 0) return "N/A";
  const sum = valid.reduce((acc, m) => acc + m.data.summary.envTemp, 0);
  return `${(sum / valid.length).toFixed(1)}°C`;
};

// Utility function to count active workers
const countActiveWorkers = (miners) => {
  const active = miners.filter((m) => m.status === "fulfilled").length;
  return `${active}/${miners.length}`;
};

// Utility function to calculate total hashrate
const calculateTotalHashrate = (miners) => {
  const valid = miners.filter(
    (m) => m.status === "fulfilled" && m.data?.summary?.hashrateAvg != null
  );
  if (valid.length === 0) return "0 TH/s";
  const total = valid.reduce((acc, m) => acc + m.data.summary.hashrateAvg, 0);
  return `${mhsToThs(total)} TH/s`;
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

  // Demo popup state
  const [showDemoPopup, setShowDemoPopup] = useState(true);
  const popupRef = useRef(null);

  // Show demo popup on mount
  useEffect(() => {
    setShowDemoPopup(true);
  }, []);

  // Close popup on outside click or Escape
  useEffect(() => {
    const handleOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowDemoPopup(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowDemoPopup(false);
    };
    if (showDemoPopup) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showDemoPopup]);

  // Process miner data when API data arrives
  useEffect(() => {
    if (data?.miners?.length) {
      // build processedMiners
      const pm = data.miners.map((m) => {
        if (m.status !== "fulfilled" || !m.data?.summary) {
          return {
            name: `Miner ${m.ip}`,
            hashrate: "0 TH/s",
            status: "error",
            temperature: "N/A",
            efficiency: "N/A",
          };
        }
        const { summary, ip } = m.data;
        const hr = summary.hashrateAvg ? mhsToThs(summary.hashrateAvg) : "0";
        const status = summary.hashrateAvg > 0 ? "active" : "warning";
        const temp = summary.envTemp != null ? `${summary.envTemp.toFixed(1)}°C` : "N/A";
        const eff = summary.powerRate != null ? `${summary.powerRate.toFixed(1)} J/TH` : "N/A";
        return {
          name: `WhatsMiner ${ip}`,
          hashrate: `${hr} TH/s`,
          status,
          temperature: temp,
          efficiency: eff,
        };
      });

      setProcessedMiners(pm);
      setStats({
        totalHashrate: calculateTotalHashrate(data.miners),
        activeWorkers: countActiveWorkers(data.miners),
        avgTemperature: calculateAvgTemperature(data.miners),
      });
      setIsLoading(false);
    }
  }, [data]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          <div
            className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
            aria-label="Loading spinner"
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Demo Popup */}
      {showDemoPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
          style={{backgroundColor:"#1A1A1A",border:"solid 2px white",borderRadius:"5px"}}
            ref={popupRef}
            className="bg-[#1A1A1A] text-white p-8 rounded-xl max-w-lg w-full mx-4 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-4">Attention</h2>
            <p className="mb-6 leading-relaxed">
              This is a demo version of the program. You can see how it works and, above all, the
              quality of the software using real data from our mining farms.
            </p>
            <p className="mb-6 leading-relaxed">
              To obtain the full version, please request a trial through the Trial section or
              contact us by email at{" "}
              <span className="underline">hashiraAI@gmail.com</span>.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDemoPopup(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Hashira AI</p>
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
                {processedMiners.map((miner, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 rounded bg-tmcdark"
                  >
                    <span className="flex items-center">
                      {miner.status === "active" ? (
                        <Activity className="h-4 w-4 mr-2 text-status-success" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-2 text-status-danger" />
                      )}
                      {miner.name} {miner.status === "active" ? "online" : "offline"}
                    </span>
                    <span className="text-muted-foreground">
                      {data.timestamp
                        ? new Date(data.timestamp).toLocaleTimeString()
                        : "N/A"}
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
