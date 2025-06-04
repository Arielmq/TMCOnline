import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useMiner } from "@/context/MinerContext";
import { MinerData, LocationData, PanelData } from "@/types/miner";
import MinerPopup from "../workers/MinerPopup";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import MinerVisualization from "./MinerVisualization";
import "./Mining3dView.css";
import { useMinerApi } from "@/hooks/useMinerApi";
type FilterType = "all" | "online";

// Helper para extraer letra de panel y slot del worker
function parseWorker(worker: string) {
  // Ejemplo: Adrianm211120.ZC007
  const match = worker?.match(/\.Z([A-Z])(\d{3})/i);
  if (!match) return { panel: null, slot: null };
  return {
    panel: match[1].toUpperCase(),
    slot: parseInt(match[2], 10),
  };
}

const Mining3DView = () => {
  const { data: minerApiData } = useMinerApi();
  const wsMiners = minerApiData?.miners || [];
  const navigate = useNavigate();
  const { locations, selectLocation } = useMiner();
  const [displayedLocations, setDisplayedLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [selectedMiner, setSelectedMiner] = useState<MinerData | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<PanelData | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  // Helper para combinar datos del WebSocket con los del minero del panel
  const getMinerWithWSData = (miner) => {
    const wsData = wsMiners.find((m) => m.ip === miner.IP && m.status === "fulfilled");
    if (!wsData || !wsData.data) return { ...miner, THSRT: 0, _parsed: parseWorker(miner.Worker1 || "") };
    const data = wsData.data;
    if (!('minerInfo' in data)) {
      return { ...miner, THSRT: 0, _parsed: parseWorker(miner.Worker1 || "") };
    }
    const thsrtSum = (data.hashboards || [])
      .slice(0, 3)
      .reduce((acc, hb) => acc + Math.floor((hb.hashrate || 0) / 1_000_000), 0);

    return {
      ...miner,
      Status: "Running",
      MinerType: data.minerInfo?.minerType || "none",
      MACAddr: data.minerInfo?.macAddress || "N/A",
      VersionInfo: data.psu?.model || "N/A",
      ChipType: data.psu?.model || "N/A",
      HashBoardTemp: data.hashboards?.[0]?.temperature ?? "N/A",
      SpdIn: data.summary?.fanSpeedIn ?? "N/A",
      SpdOut: data.summary?.fanSpeedOut ?? "N/A",
      ActivePool: data.pool?.worker || "N/A",
      Worker1: data.pool?.worker || "N/A",
      RejectRate: "N/A",
      THSRT: thsrtSum,
      THSAvg: data.summary?.hashrateAvg ?? "",
      Efficiency: data.summary?.powerRate ?? "",
      Power: data.summary?.power ?? "",
      EnvTemp: data.hashboards?.[0]?.temperature ?? "",
      UpTime: data.summary?.elapsed ?? "",
      Performance: data.summary?.hashrateAvg ?? "",
      _parsed: parseWorker(data.pool?.worker || miner.Worker1 || ""),
    };
  };

  // Validate if locations data is complete
  const isValidLocationsData = (locations: LocationData[]): boolean => {
    return (
      Array.isArray(locations) &&
      locations.length > 0 &&
      locations.every(
        (location) =>
          location.id &&
          location.name &&
          Array.isArray(location.panels) &&
          location.panels.every(
            (panel) =>
              panel.id &&
              panel.number &&
              Array.isArray(panel.miners)
          )
      )
    );
  };

  useEffect(() => {
    if (isValidLocationsData(locations)) {
      setDisplayedLocations(locations);
    }
  }, [locations]);

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    selectLocation(location.id);
  };

  const handlePanelClick = (panel: PanelData) => {
    setSelectedPanel(panel);
  };

  const handleClosePanel = () => {
    setSelectedPanel(null);
  };

  const handleMinerClick = (miner: MinerData) => {
    setSelectedMiner(miner);
  };

  // Filtra mineros por THSRT > 0
  const filterMiners = (miners: MinerData[]): MinerData[] => {
    if (filter === "all") return miners.filter(miner => miner.THSRT > 0);
    if (filter === "online") {
      return miners.filter((miner) => miner.THSRT > 0);
    }
    return miners.filter(miner => miner.THSRT > 0);
  };

  // Si hay panel seleccionado, muestra los mineros de ese panel
  if (selectedPanel) {
    // Mapea los mineros del panel con los datos del WebSocket y parsea worker
    let minersWithWSData = selectedPanel.miners.map(getMinerWithWSData)
      .map(miner => ({
        ...miner,
        _parsed: parseWorker(miner.Worker1 || miner.ActivePool || ""),
      }))
      .sort((a, b) => {
        // Ordena por slot (de menor a mayor)
        if (a._parsed.slot == null) return 1;
        if (b._parsed.slot == null) return -1;
        return a._parsed.slot - b._parsed.slot;
      });

    const filteredMiners = filterMiners(minersWithWSData);

    return (
      <div className="col-span-3 row-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            Panel {minersWithWSData[0]?._parsed.panel || String.fromCharCode(65 + (selectedPanel.number - 1))} - {filteredMiners.length} Miners
          </h3>
          <div className="flex gap-2">
            <Button
              variant={filter === "online" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("online")}
            >
              Online ({filteredMiners.length})
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({minersWithWSData.length})
            </Button>
            <Button variant="ghost" onClick={handleClosePanel}>
              <X className="h-5 w-5 mr-2" />
              Close
            </Button>
          </div>
        </div>
        <Card className="bg-tmcdark-card border-border p-4">
          <ScrollArea>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-4">
              {minersWithWSData
                .filter((miner) => miner.IP && miner.IP.trim() !== "")
                .map((miner) => (
                  <div
                    key={miner.IP}
                    className="cursor-pointer hover:scale-105 transition-transform flex justify-center"
                    onClick={() => handleMinerClick(miner)}
                    title={`Worker: ${miner.Worker1 || ""} | Slot: ${miner._parsed.slot ?? "?"}`}
                  >
                    <MinerVisualization miner={miner} />
                  </div>
                ))}
            </div>
          </ScrollArea>
        </Card>

        <MinerPopup
          miner={selectedMiner}
          open={!!selectedMiner}
          onClose={() => setSelectedMiner(null)}
        />
      </div>
    );
  }

  // Vista estándar mostrando ubicaciones y paneles
  return (
    <div className="mining3d__panel col-span-2 row-span-2">
      <h3 className="text-lg font-medium mb-2">Mining Farm Overview</h3>
      <p className="text-sm text-muted-foreground mb-4">Locations and panels</p>
      <Card className="bg-tmcdark-card border-border p-4">
        <Tabs defaultValue={displayedLocations[0]?.id} className="w-full h-full flex flex-col">
          <TabsList className="grid  text-center flex justify-center grid-cols-4 mb-4">
            {displayedLocations.map((location) => (
              <TabsTrigger
                key={location.id}
                value={location.id}
                onClick={() => handleLocationSelect(location)}
                className="text-sm"
              >
                {location.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {displayedLocations.map((location) => (
            <TabsContent
              key={location.id}
              value={location.id}
              className="flex-1 overflow-visible min-h-0"
            >
              <ScrollArea className="h-fit w-full pr-4 overflow-visible">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium">{location.name} - Panels</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-[1366px]:grid-cols-1" style={{ gridTemplateColumns: undefined }}>
                    {location.panels.map((panel) => {
                      // Mapea los mineros del panel con los datos del WebSocket y parsea worker
                      let minersWithWSData = panel.miners.map(getMinerWithWSData)
                        .map(miner => {
                          const parsed = parseWorker(miner.Worker1 || miner.ActivePool || "");
                          // Forzar la letra del panel según el número del panel
                          const panelLetter = String.fromCharCode(65 + (panel.number - 1));
                          return {
                            ...miner,
                            _parsed: {
                              panel: panelLetter,
                              slot: parsed.slot,
                            },
                          };
                        })
                        .sort((a, b) => {
                          if (a._parsed.slot == null) return 1;
                          if (b._parsed.slot == null) return -1;
                          return a._parsed.slot - b._parsed.slot;
                        });

                      // Panel letter
                      const panelLetter = String.fromCharCode(65 + (panel.number - 1));
                      return (
                        <div
                          key={panel.id}
                          className="mining3DView border border-gray-700 rounded-md p-3 cursor-pointer hover:bg-tmcdark-lighter transition-colors aspect-square"
                          onClick={() => handlePanelClick(panel)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="text-sm font-medium">Panel {panelLetter}</h5>
                            <span className="text-xs text-muted-foreground">
                              {minersWithWSData.length} Miners
                            </span>
                          </div>

                          <div className="w-full aspect-square bg-gray-800 rounded-md p-2 relative overflow-hidden">
                            <div
                              className="grid h-full"
                              style={{
                                gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(panel.miners.length || 60))}, 1fr)`,
                                gridTemplateRows: `repeat(${Math.ceil((panel.miners.length || 60) / Math.ceil(Math.sqrt(panel.miners.length || 60)))}, 1fr)`,
                                gap: "2px",
                              }}
                            >
                              {minersWithWSData.map((miner, idx) => {
                                const hasValidMiner = miner && miner.IP && miner.IP.trim() !== "";
                                let thsValue = hasValidMiner && miner.THSRT ? Math.round(miner.THSRT) : 0;
                                if (!Number.isFinite(thsValue) || thsValue > 160) thsValue = 0;

                                let textClass = "";
                                let shadow = "";
                                let bgClass = hasValidMiner ? "bg-white/40" : "bg-white/10";

                                if (hasValidMiner) {
                                  if (thsValue <= 80) {
                                    textClass = "text-yellow-500";
                                    shadow = "0 0 10px rgba(234, 179, 8, 0.6)";
                                  } else {
                                    textClass = "text-green-500";
                                    shadow = "0 0 10px rgba(34, 197, 94, 0.6)";
                                  }
                                }

                                return (
                                  <div
                                    key={miner.IP || idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (hasValidMiner) handleMinerClick(miner);
                                    }}
                                    title={
                                      hasValidMiner
                                        ? `Worker: ${miner.Worker1 || ""} | Slot: ${miner._parsed.slot ?? "?"}`
                                        : "Empty Slot"
                                    }
                                    className={`
                                      w-full aspect-square min-h-[8px] rounded-sm border border-gray-700
                                      ${bgClass}
                                      flex items-center justify-center overflow-hidden
                                      ${hasValidMiner ? "cursor-pointer" : "cursor-default"}
                                    `}
                                  >
                                    {hasValidMiner && (
                                      <span
                                        className={`font-bold leading-none mining3d__span ${textClass}`}
                                        style={{
                                          textShadow: shadow,
                                          fontSize: "clamp(0.5rem, 1.2vw, 1rem)",
                                          width: "100%",
                                          textAlign: "center",
                                          overflow: "hidden",
                                          display: "block",
                                          lineHeight: 1,
                                        }}
                                      >
                                        {thsValue}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      <MinerPopup
        miner={selectedMiner}
        open={!!selectedMiner}
        onClose={() => setSelectedMiner(null)}
      />
    </div>
  );
};

export default Mining3DView;