import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import Mining3DView from "@/components/dashboard/Mining3DView";
import { Card } from "@/components/ui/card";
import { useMiner } from "@/context/MinerContext";
import { LayoutGrid, Thermometer, Activity, ArrowDown } from "lucide-react";
import MinerApiMonitor from "@/components/miner-api/MinerApiMonitor";
import { useEffect, useState, useRef } from "react";
import { useMinerApi } from "@/hooks/useMinerApi";
import { useNavigate } from "react-router-dom";

// Utilidades para stats
const mhsToThs = (mhs) => (mhs / 1_000_000).toFixed(2);

const Index = () => {
  const { locations, selectedPanel } = useMiner();
  const { data } = useMinerApi();
  const [processedMiners, setProcessedMiners] = useState([]);
  const [stats, setStats] = useState({
    totalHashrate: "0 TH/s",
    activeWorkers: "0/0",
    avgTemperature: "N/A",
  });
  const [tunnelSubdomain, setTunnelSubdomain] = useState(() => {
  return localStorage.getItem("tunnelSubdomain") || "tmcwatch";
});
const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  // Demo popup state
  const [showDemoPopup, setShowDemoPopup] = useState(true);
  const popupRef = useRef(null);

  // Show demo popup on mount
  useEffect(() => {
    setShowDemoPopup(true);
  }, []);


  useEffect(() => {
  localStorage.setItem("tunnelSubdomain", tunnelSubdomain);
  // Si quieres que el WS_URL se actualice globalmente, puedes emitir un evento o usar contexto aquí
}, [tunnelSubdomain]);


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

  // Procesar miners para stats y visualización
  useEffect(() => {
    if (!data?.miners?.length || !locations.length) {
      setIsLoading(false);
      setProcessedMiners([]);
      setStats({
        totalHashrate: "0 TH/s",
        activeWorkers: "0/0",
        avgTemperature: "N/A",
      });
      return;
    }

    // 1. Crear lista de todos los miners definidos por el usuario (con lugar y panel)
    const allUserMiners = [];
    locations.forEach((loc) => {
      loc.panels.forEach((panel) => {
        panel.miners.forEach((miner) => {
          if (miner.IP && miner.IP.trim() !== "") {
            allUserMiners.push({
              ...miner,
              location: loc.name,
              panel: panel.number,
            });
          }
        });
      });
    });

    // 2. Para cada miner, buscar su info en la API por IP
    const minersWithApi = allUserMiners.map((miner) => {
      const apiMiner = data.miners.find(
        (m) => m.ip === miner.IP || m.data?.ip === miner.IP
      );
      if (apiMiner && apiMiner.status === "fulfilled" && apiMiner.data?.summary) {
        const { summary } = apiMiner.data;
        return {
          ...miner,
          status: summary.hashrateAvg > 0 ? "active" : "offline",
          hashrate: summary.hashrateAvg ? `${mhsToThs(summary.hashrateAvg)} TH/s` : "0 TH/s",
          temperature: summary.envTemp != null ? `${summary.envTemp.toFixed(1)}°C` : "N/A",
        };
      }
      return {
        ...miner,
        status: "offline",
        hashrate: "0 TH/s",
        temperature: "N/A",
      };
    });

    setProcessedMiners(minersWithApi);

    // 3. Stats
    const active = minersWithApi.filter((m) => m.status === "active");
    const totalHashrate = minersWithApi.reduce(
      (acc, m) => acc + (parseFloat(m.hashrate) || 0), 0
    );
    const avgTemp =
      active.length > 0
        ? (
            active.reduce(
              (acc, m) =>
                acc +
                (parseFloat(m.temperature) || 0),
              0
            ) / active.length
          ).toFixed(1) + "°C"
        : "N/A";

    setStats({
      totalHashrate:
        minersWithApi.length > 0
          ? minersWithApi
              .reduce(
                (acc, m) =>
                  acc +
                  (parseFloat(m.hashrate) || 0),
                0
              )
              .toFixed(2) + " TH/s"
          : "0 TH/s",
      activeWorkers: `${active.length}/${minersWithApi.length}`,
      avgTemperature: avgTemp,
    });

    setIsLoading(false);
  }, [locations, data]);

  if (!isLoading && locations.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">No locations found</h1>
          <p className="mb-6 text-muted-foreground text-center">
            You need to create a new location before using the dashboard.
          </p>
          <button
            onClick={() => navigate("/workers")}
            className="px-6 py-2 bg-tmcblue-light hover:bg-tmcblue text-white font-medium rounded-md transition-colors"
          >
            Create Location
          </button>
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
            style={{ backgroundColor: "#1A1A1A", border: "solid 2px white", borderRadius: "5px" }}
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



  {/* Download & Configure */}
  <div className="bg-tmcdark-card border border-border rounded-lg p-4 flex flex-col justify-between">
    <div>
      <h3 className="font-bold text-lg mb-2">Download & configure</h3>
      <a
        href="https://github.com/hashira-ai/tmc-agent/releases/latest"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline mb-3 inline-block"
      >
        Download from here
      </a>
    </div>
    <div className="mt-4">
      <label className="block text-sm mb-1 font-medium text-muted-foreground">
        Configure your tunnel
      </label>
      <div className="flex items-center">
        <input
          type="text"
          value={tunnelSubdomain}
          onChange={e => setTunnelSubdomain(e.target.value)}
          disabled={!isEditing}
          className="bg-tmcdark border border-border rounded px-2 py-1 text-white w-32 mr-2"
          placeholder="subdomain"
        />
        <span className="text-muted-foreground text-sm mr-2">.loca.lt</span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-2 py-1 text-xs bg-tmcblue-light text-white rounded hover:bg-tmcblue transition"
        >
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        WebSocket URL: <span className="font-mono">ws://{tunnelSubdomain || "tmcwatch"}.loca.lt</span>
      </p>
    </div>
  </div>
</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Mining3DView />

        {!selectedPanel && (
          <div className="space-y-6">
            <MinerApiMonitor />

            <Card style={{ height: "600px" }} className="p-4 bg-tmcdark-card border-border">
              <h3 className="font-medium text-lg mb-3">Recent Activity</h3>
              <div style={{ overflow: "auto", height: "500px" }} className="space-y-2 text-sm">
                {processedMiners.length === 0 ? (
                  <div className="text-center text-muted-foreground mt-10">
                    No miners found.
                  </div>
                ) : (
                  processedMiners.map((miner, idx) => (
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
                        {miner.Worker1 || miner.IP || miner.name}{" "}
                        {miner.status === "active" ? "online" : "offline"}
                        {miner.location && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({miner.location} - Panel {miner.panel})
                          </span>
                        )}
                      </span>
                      <span className="text-muted-foreground">
                        {miner.temperature}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;