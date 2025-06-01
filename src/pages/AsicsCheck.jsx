import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMiner } from "@/context/MinerContext";
import { useMinerApi } from "@/hooks/useMinerApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Cpu, Thermometer, Gauge, Hash, Barcode, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Simple progress bar component
const ProgressBar = ({ percent }) => (
  <div className="w-full bg-gray-700 rounded h-3 mt-2">
    <div
      className="bg-tmcblue-light h-3 rounded transition-all"
      style={{ width: `${percent}%` }}
    ></div>
  </div>
);

const loadingSteps = [
  "Loading...",
  "Diagnosing...",
  "Deep checking...",
  "Almost ready...",
];

const icons = {
  slot: <Layers className="inline w-4 h-4 mr-1 text-tmcblue-light" />,
  status: <Cpu className="inline w-4 h-4 mr-1 text-green-500" />,
  temperature: <Thermometer className="inline w-4 h-4 mr-1 text-orange-400" />,
  chipFrequency: <Gauge className="inline w-4 h-4 mr-1 text-blue-400" />,
  hashrate: <Hash className="inline w-4 h-4 mr-1 text-yellow-400" />,
  effectiveChips: <Cpu className="inline w-4 h-4 mr-1 text-green-400" />,
  chipTempMin: <Thermometer className="inline w-4 h-4 mr-1 text-blue-300" />,
  chipTempMax: <Thermometer className="inline w-4 h-4 mr-1 text-red-400" />,
  chipTempAvg: <Thermometer className="inline w-4 h-4 mr-1 text-orange-300" />,
  pcbSn: <Barcode className="inline w-4 h-4 mr-1 text-gray-400" />,
  chip: <Cpu className="inline w-4 h-4 mr-1 text-tmcblue-light" />
};

const AsicsCheck = () => {
  const { locations } = useMiner();
  const { data } = useMinerApi();
  const wsMiners = data?.miners || [];
  const [selectedMiner, setSelectedMiner] = useState(null);
  const [selectedPanels, setSelectedPanels] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const closeBtnRef = useRef(null);

  // Set first panel as selected by default per location
  useEffect(() => {
    if (locations && locations.length > 0) {
      const initial = {};
      locations.forEach((loc) => {
        if (
          loc.panels &&
          loc.panels.length > 0 &&
          !selectedPanels[loc.id]
        ) {
          initial[loc.id] = loc.panels[0].id;
        }
      });
      if (Object.keys(initial).length > 0) {
        setSelectedPanels((prev) => ({ ...initial, ...prev }));
      }
    }
    // eslint-disable-next-line
  }, [locations]);

  // Helper to get websocket data by IP
  const getWsMinerData = (ip) =>
    wsMiners.find((m) => m.ip === ip && m.status === "fulfilled")?.data || null;

  // Only miners with valid IP
  const filterValidMiners = (miners) =>
    miners.filter(
      (miner) =>
        miner.IP &&
        miner.IP !== "N/A" &&
        miner.IP !== "null" &&
        miner.IP !== ""
    );

  // Panel selection per location
  const handlePanelSelect = (locationId, panelId) => {
    setSelectedPanels((prev) => ({
      ...prev,
      [locationId]: panelId,
    }));
  };

  // Check if there are locations and at least one panel
  const hasPanels =
    locations &&
    locations.length > 0 &&
    locations.some((loc) => loc.panels && loc.panels.length > 0);

  // Handle click on miner: show loading, then show data
  const handleMinerClick = (miner, wsData, location, panel) => {
    setLoading(true);
    setProgress(0);
    setLoadingStep(0);
    setSelectedMiner(null);

    // Random loading time between 2 and 6 seconds
    const duration = Math.floor(Math.random() * 4000) + 2000;
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      let percent = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(percent);

      // Change loading step based on percent
      if (percent < 30) setLoadingStep(0);
      else if (percent < 60) setLoadingStep(1);
      else if (percent < 90) setLoadingStep(2);
      else setLoadingStep(3);

      if (percent >= 100) {
        clearInterval(interval);
        setLoading(false);
        setSelectedMiner({
          ...miner,
          wsData,
          location,
          panel,
        });
      }
    }, 50);
  };

  // Remove focus from close button when dialog opens
  useEffect(() => {
    if (loading && closeBtnRef.current) {
      closeBtnRef.current.blur();
    }
  }, [loading]);

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ASICs Check</h1>
        <p className="text-muted-foreground">
          View the status of each ASIC and inspect their hashboards in detail.
        </p>
      </div>
      <Card className="max-w-5xl mx-auto bg-tmcdark-card border-border">
        <CardHeader>
          <CardTitle>ASICs by Location and Panel</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasPanels ? (
            <div className="text-center text-muted-foreground py-8">
              No locations or panels configured.<br />
              <Link
                to="/workers"
                className="inline-block mt-4 px-6 py-2 bg-tmcblue-light text-white rounded hover:bg-tmcblue transition"
              >
                Go to /workers to create them
              </Link>
            </div>
          ) : (
            locations.map((location) => (
              <div key={location.id} className="mb-8">
                <h2 className="text-lg font-semibold mb-2">{location.name}</h2>
                {/* Panel navigation */}
                <nav className="flex flex-wrap justify-center gap-2 mb-4">
                  {location.panels.map((panel) => (
                    <button
                      key={panel.id}
                      className={`px-4 py-1 rounded-full border font-medium transition-colors text-xs
                        ${
                          selectedPanels[location.id] === panel.id
                            ? "bg-tmcblue-light text-white border-tmcblue-light shadow"
                            : "bg-tmcdark text-tmcblue-light border-tmcblue-light hover:bg-tmcblue-light/20"
                        }
                      `}
                      onClick={() => handlePanelSelect(location.id, panel.id)}
                      type="button"
                    >
                      Panel {panel.number}
                    </button>
                  ))}
                </nav>
                {location.panels
                  .filter(
                    (panel) =>
                      selectedPanels[location.id] == null ||
                      selectedPanels[location.id] === panel.id
                  )
                  .map((panel) => (
                    <div key={panel.id} className="mb-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {filterValidMiners(panel.miners).length === 0 ? (
                          <span className="text-sm text-muted-foreground">
                            No miners configured in this panel.
                          </span>
                        ) : (
                          filterValidMiners(panel.miners).map((miner) => {
                            const wsData = getWsMinerData(miner.IP);
                            return (
                              <Button
                                key={miner.id}
                                variant="outline"
                                className="rounded px-3 py-2 text-xs bg-tmcdark hover:bg-tmcblue-light border border-tmcblue-light flex items-center gap-1"
                                onClick={() =>
                                  handleMinerClick(
                                    miner,
                                    wsData,
                                    location.name,
                                    panel.number
                                  )
                                }
                              >
                                {icons.chip}
                                {miner.IP}
                              </Button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Loading popup */}
            <Dialog open={loading || !!selectedMiner} onOpenChange={() => { setLoading(false); setSelectedMiner(null); }}>
        <DialogContent className="max-w-2xl w-full" hideCloseButton={loading}>
          {loading ? (
            <div className="py-12 flex flex-col items-center">
              <span className="text-lg font-semibold mb-4">{loadingSteps[loadingStep]}</span>
              <ProgressBar percent={progress} />
              <span className="mt-2 text-sm text-muted-foreground">{progress}%</span>
            </div>
          ) : selectedMiner ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  ASIC: {selectedMiner?.IP}{" "}
                  <span className="text-xs text-muted-foreground ml-2">
                    ({selectedMiner?.location} - Panel {selectedMiner?.panel})
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {!selectedMiner?.wsData ? (
                  <div className="text-center text-muted-foreground py-8">
                    No real-time data for this miner.
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold mb-2">Hashboards</h4>
                    <div className="space-y-4">
                      {(selectedMiner.wsData.hashboards || []).map((hb, idx) => (
                        <Card
                          key={idx}
                          className="bg-tmcdark border border-tmcblue-light p-4"
                        >
                          <div className="font-medium mb-2 flex flex-wrap items-center gap-2">
                            {icons.slot} Slot {hb.slot} {icons.status}
                            <span
                              className={
                                hb.status === "Alive"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {hb.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              {icons.temperature}
                              <span>Temp:</span>
                              <span className="font-semibold">
                                {hb.temperature != null
                                  ? `${hb.temperature.toFixed(2)}°C`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {icons.chipFrequency}
                              <span>Chip Freq:</span>
                              <span className="font-semibold">
                                {hb.chipFrequency || "N/A"} MHz
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {icons.hashrate}
                              <span>Hashrate:</span>
                              <span className="font-semibold">
                                {hb.hashrate != null
                                  ? `${(hb.hashrate / 1e6).toFixed(2)} MH/s`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {icons.effectiveChips}
                              <span>Chips:</span>
                              <span className="font-semibold">
                                {hb.effectiveChips || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {icons.chipTempMin}
                              <span>Chip Temp Min:</span>
                              <span className="font-semibold">
                                {hb.chipTempMin != null
                                  ? `${hb.chipTempMin.toFixed(2)}°C`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {icons.chipTempMax}
                              <span>Chip Temp Max:</span>
                              <span className="font-semibold">
                                {hb.chipTempMax != null
                                  ? `${hb.chipTempMax.toFixed(2)}°C`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {icons.chipTempAvg}
                              <span>Chip Temp Avg:</span>
                              <span className="font-semibold">
                                {hb.chipTempAvg != null
                                  ? `${hb.chipTempAvg.toFixed(2)}°C`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {icons.pcbSn}
                              <span>PCB SN:</span>
                              <span className="font-semibold">
                                {hb.pcbSn || "N/A"}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AsicsCheck;