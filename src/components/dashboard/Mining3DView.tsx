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
    if (!wsData || !wsData.data) return { ...miner, THSRT: 0 }; // o los campos vacíos
    const data = wsData.data;

    // Type guard: check if data has 'minerInfo' property
    if (!('minerInfo' in data)) {
      return { ...miner, THSRT: 0 };
    }

    const thsrtSum = (data.hashboards || [])
      .slice(0, 3)
      .reduce((acc, hb) => acc + Math.floor((hb.hashrate || 0) / 1_000_000), 0);

    return {
      ...miner,
      Status: "Running",
      MinerType: data.minerInfo?.minerType || "",
      MACAddr: data.minerInfo?.macAddress || "N/A",
      VersionInfo: data.psu?.model || "N/A",
      ChipType: data.psu?.model || "N/A",
      HashBoardTemp: data.hashboards?.[0]?.temperature ?? "N/A",
      SpdIn: data.summary?.fanSpeedIn ?? "N/A",
      SpdOut: data.summary?.fanSpeedOut ?? "N/A",
      ActivePool: data.pool?.worker || "N/A",
      Worker1: data.pool?.worker || "N/A",
      // RejectRate: data.pool?.rejectRate ?? "N/A", // Property does not exist on PoolInfo
      RejectRate: "N/A",
      THSRT: thsrtSum,
      THSAvg: data.summary?.hashrateAvg ?? "",
      Efficiency: data.summary?.powerRate ?? "",
      Power: data.summary?.power ?? "",
      EnvTemp: data.hashboards?.[0]?.temperature ?? "",
      UpTime: data.summary?.elapsed ?? "",
      Performance: data.summary?.hashrateAvg ?? "",
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

  const getMinerStatusColor = (miner: MinerData) => {
    if (miner.THSRT === 0) {
      return "bg-[#ea384c]";
    }
    if (
      miner.RejectRate > 0.1 ||
      miner.EnvTemp > 45 ||
      (miner.MinerType.includes("M30S") && miner.THSRT < 80) ||
      (miner.MinerType.includes("M50") && miner.THSRT < 100)
    ) {
      return "bg-[#FEF7CD]";
    }
    return "bg-white";
  };

  const getTHSRTextColor = (ths: number) => {
    if (ths <= 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Filtra mineros por THSRT > 0
  const filterMiners = (miners: MinerData[]): MinerData[] => {
    if (filter === "all") return miners.filter(miner => miner.THSRT > 0);
    if (filter === "online") {
      return miners.filter((miner) => miner.THSRT > 0);
    }
    return miners.filter(miner => miner.THSRT > 0);
  };

  // Cuenta mineros online/total para una ubicación
  const countMinersByStatus = (location: LocationData) => {
    let online = 0;
    let total = 0;
    location.panels.forEach((panel) => {
      panel.miners.forEach((miner) => {
        if (miner.THSRT > 0) {
          total++;
          online++;
        }
      });
    });
    return { online, total };
  };

  // Cuenta mineros online/total para un panel
  const countPanelMinersByStatus = (panel: PanelData) => {
    let online = 0;
    let total = 0;
    panel.miners.forEach((miner) => {
      if (miner.THSRT > 0) {
        total++;
        online++;
      }
    });
    return { online, total };
  };

  // Si hay panel seleccionado, muestra los mineros de ese panel
  if (selectedPanel) {
    // Mapea los mineros del panel con los datos del WebSocket
    const minersWithWSData = selectedPanel.miners.map(getMinerWithWSData);
    const filteredMiners = filterMiners(minersWithWSData);
    const counts = countPanelMinersByStatus({ ...selectedPanel, miners: minersWithWSData });

    return (
      <div className="col-span-3 row-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ display: "none" }} className="text-lg font-medium">
            Panel #{selectedPanel.number} - {filteredMiners.length} Miners
          </h3>
          <div className="flex gap-2">
            <Button
              variant={filter === "online" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("online")}
            >
              Online ({counts.online})
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({counts.total})
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
              {filteredMiners.map((miner) => (
                <div
                  key={miner.IP}
                  className="cursor-pointer hover:scale-105 transition-transform flex justify-center"
                  onClick={() => handleMinerClick(miner)}
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
          <TabsList className="grid grid-cols-4 mb-4">
            {displayedLocations.map((location) => {
              const counts = countMinersByStatus(location);

              return (
                <TabsTrigger
                  key={location.id}
                  value={location.id}
                  onClick={() => handleLocationSelect(location)}
                  className="text-sm"
                >
                  {location.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {displayedLocations.map((location) => {
            const counts = countMinersByStatus(location);

            return (
              <TabsContent
                key={location.id}
                value={location.id}
                className="flex-1 overflow-visible min-h-0"
              >
                <ScrollArea className="h-fit w-full pr-4 overflow-visible">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-medium">{location.name} - Panels</h4>
                      <div className="flex gap-2">
                        <Button
                          variant={filter === "online" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilter("online")}
                        >
                          Online ({counts.online})
                        </Button>
                        <Button
                          variant={filter === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilter("all")}
                        >
                          All ({counts.total})
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {location.panels.map((panel) => {
                        // Mapea los mineros del panel con los datos del WebSocket
                        const minersWithWSData = panel.miners.map(getMinerWithWSData);
                        const filteredMiners = filterMiners(minersWithWSData);

                        // Skip panels with no miners after filtering
                        if (filteredMiners.length === 0 && filter !== "all") {
                          return null;
                        }

                        return (
                          <div
                            key={panel.id}
                            className="mining3DView border border-gray-700 rounded-md p-3 cursor-pointer hover:bg-tmcdark-lighter transition-colors aspect-square"
                            onClick={() => handlePanelClick(panel)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="text-sm font-medium">Panel #{panel.number}</h5>
                              <span className="text-xs text-muted-foreground">
                                {filteredMiners.length} Miners
                              </span>
                            </div>

                            <div className="w-full aspect-square bg-gray-800 rounded-md p-2 relative overflow-hidden">
                              <div className="grid grid-cols-10 grid-rows-6 gap-[2px] h-full">
                                {Array.from({ length: 60 }).map((_, index) => {
                                  const miner = minersWithWSData[index];
                                  const hasValidMiner = !!miner && filterMiners([miner]).length > 0;

                                  let thsValue = miner ? Math.round(miner.THSRT) : 0;
                                  if (!Number.isFinite(thsValue) || thsValue > 999) thsValue = 0;

                                  let textClass = '';
                                  let shadow = '';
                                  let bgClass = hasValidMiner ? 'bg-white/40' : 'bg-white/10';

                                  if (hasValidMiner) {
                                    if (thsValue <= 80) {
                                      textClass = 'text-yellow-500';
                                      shadow = '0 0 10px rgba(234, 179, 8, 0.6)';
                                    } else {
                                      textClass = 'text-green-500';
                                      shadow = '0 0 10px rgba(34, 197, 94, 0.6)';
                                    }
                                  }

                                  return (
                                    <div
                                      key={index}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (hasValidMiner) handleMinerClick(miner);
                                      }}
                                      title={miner && hasValidMiner ? `${miner.IP} – ${miner.MinerType}` : 'Empty Slot'}
                                      className={`
                                        w-full aspect-square min-h-[8px] rounded-sm border border-gray-700
                                        ${bgClass}
                                        flex items-center justify-center overflow-hidden
                                        ${hasValidMiner ? 'cursor-pointer' : 'cursor-default'}
                                      `}
                                    >
                                      {hasValidMiner && (
                                        <span
                                          className={`text-lg xl:text-2xl font-bold leading-none mining3d__span ${textClass}`}
                                          style={{ textShadow: shadow }}
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
            );
          })}
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