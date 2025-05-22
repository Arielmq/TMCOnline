
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useMiner } from "@/context/MinerContext";
import { MinerData, LocationData, PanelData } from "@/types/miner";
import MinerPopup from "../workers/MinerPopup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import MinerVisualization from "./MinerVisualization";

type FilterType = 'all' | 'online' | 'offline';

const Mining3DView = () => {
  const navigate = useNavigate();
  const { locations, selectLocation } = useMiner();
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [selectedMiner, setSelectedMiner] = useState<MinerData | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<PanelData | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  
  // Handle location selection
  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    selectLocation(location.id);
  };

  // Handle panel click
  const handlePanelClick = (panel: PanelData) => {
    setSelectedPanel(panel);
  };

  // Close panel view
  const handleClosePanel = () => {
    setSelectedPanel(null);
  };

  // Handle miner click
  const handleMinerClick = (miner: MinerData) => {
    setSelectedMiner(miner);
  };

  // Get a status color for a miner based on its properties
  const getMinerStatusColor = (miner: MinerData) => {
    if (miner.Status === 'Running') {
      return 'bg-white'; // White for running miners
    }
    if (miner.THSRT === 0 || miner.Status === 'Suspended') {
      return 'bg-[#ea384c]'; // Red for suspended or 0 hashrate miners
    }
    // For miners with warning conditions
    if (miner.RejectRate > 0.1 || 
        miner.EnvTemp > 45 || 
        (miner.MinerType.includes('M30S') && miner.THSRT < 80) ||
        (miner.MinerType.includes('M50') && miner.THSRT < 100)) {
      return 'bg-[#FEF7CD]'; // Soft yellow for warnings
    }
    
    return 'bg-white'; // Default color for normal operation
  };

  // Filter miners based on selected filter
  const filterMiners = (miners: MinerData[]): MinerData[] => {
    if (filter === 'all') return miners;
    
    if (filter === 'online') {
      return miners.filter(miner => miner.Status === 'Running');
    }
    
    if (filter === 'offline') {
      return miners.filter(miner => miner.Status !== 'Running');
    }
    
    return miners;
  };

  // Count miners by status for a location
  const countMinersByStatus = (location: LocationData) => {
    let online = 0;
    let offline = 0;
    let total = 0;
    
    location.panels.forEach(panel => {
      panel.miners.forEach(miner => {
        total++;
        if (miner.Status === 'Running') {
          online++;
        } else {
          offline++;
        }
      });
    });
    
    return { online, offline, total };
  };

  // Count miners by status for a panel
  const countPanelMinersByStatus = (panel: PanelData) => {
    let online = 0;
    let offline = 0;
    
    panel.miners.forEach(miner => {
      if (miner.Status === 'Running') {
        online++;
      } else {
        offline++;
      }
    });
    
    return { online, offline, total: panel.miners.length };
  };

  // If a panel is selected, show the miners in that panel
  if (selectedPanel) {
    const filteredMiners = filterMiners(selectedPanel.miners);
    const counts = countPanelMinersByStatus(selectedPanel);
    
    return (
      <div className="col-span-3 row-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Panel #{selectedPanel.number} - {filteredMiners.length} Miners</h3>
          <div className="flex gap-2">
            <Button 
              variant={filter === 'online' ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter('online')}
            >
              Online ({counts.online})
            </Button>
            <Button 
              variant={filter === 'offline' ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter('offline')}
            >
              Offline ({counts.offline})
            </Button>
            <Button 
              variant={filter === 'all' ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({counts.total})
            </Button>
            <Button variant="ghost" onClick={handleClosePanel}>
              <X className="h-5 w-5 mr-2" />
              Close
            </Button>
          </div>
        </div>
        <Card className="bg-tmcdark-card border-border overflow-hidden h-[700px] p-4">
          <ScrollArea className="h-[650px]">
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
        
        {/* Miner Popup */}
        <MinerPopup 
          miner={selectedMiner} 
          open={!!selectedMiner} 
          onClose={() => setSelectedMiner(null)} 
        />
      </div>
    );
  }

  // Standard view showing locations and panels
  return (
    <div className="col-span-2 row-span-2">
      <h3 className="text-lg font-medium mb-2">Mining Farm Overview</h3>
      <p className="text-sm text-muted-foreground mb-4">Ubicaciones y paneles</p>
      <Card className="bg-tmcdark-card border-border overflow-hidden h-[700px] p-4">
        {/* Location Tabs */}
        <Tabs defaultValue={locations[0]?.id} className="w-full h-full flex flex-col">
          <TabsList className="grid grid-cols-4 mb-4">
            {locations.map((location) => {
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

          {/* Content for each location */}
          {locations.map((location) => {
            const counts = countMinersByStatus(location);
            
            return (
              <TabsContent 
                key={location.id} 
                value={location.id} 
                className="flex-grow overflow-hidden"
              >
                <ScrollArea className="h-[620px] w-full pr-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-medium">{location.name} - Paneles</h4>
                      <div className="flex gap-2">
                        <Button 
                          variant={filter === 'online' ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setFilter('online')}
                        >
                          Online ({counts.online})
                        </Button>
                        <Button 
                          variant={filter === 'offline' ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setFilter('offline')}
                        >
                          Offline ({counts.offline})
                        </Button>
                        <Button 
                          variant={filter === 'all' ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setFilter('all')}
                        >
                          Todas ({counts.total})
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {location.panels.map((panel) => {
                        const filteredMiners = filterMiners(panel.miners);
                        
                        // Skip panels with no miners after filtering
                        if (filteredMiners.length === 0 && filter !== 'all') {
                          return null;
                        }
                        
                        return (
                          <div 
                            key={panel.id}
                            className="border border-gray-700 rounded-md p-3 cursor-pointer hover:bg-tmcdark-lighter transition-colors aspect-square"
                            onClick={() => handlePanelClick(panel)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="text-sm font-medium">Panel #{panel.number}</h5>
                              <span className="text-xs text-muted-foreground">
                                {filteredMiners.length} Mineros
                              </span>
                            </div>
                            
                            {/* Grid of miners - square layout */}
                            <div className="w-full aspect-square bg-gray-800 rounded-md p-2 relative overflow-hidden">
                              <div className="grid grid-cols-10 grid-rows-6 gap-[2px] h-full">
                                {Array.from({ length: 60 }).map((_, index) => {
                                  const miner = panel.miners[index];
                                  const shouldShow = miner && filterMiners([miner]).length > 0;
                                  
                                  return (
                                    <div 
                                      key={index}
                                      className={`w-full aspect-square min-h-[8px] rounded-sm border border-gray-700 ${
                                        shouldShow ? getMinerStatusColor(miner) : 'bg-white/10'
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (miner && shouldShow) handleMinerClick(miner);
                                      }}
                                      title={miner && shouldShow ? `${miner.IP} - ${miner.MinerType}` : 'Empty Slot'}
                                    ></div>
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
      
      {/* Miner Popup */}
      <MinerPopup 
        miner={selectedMiner} 
        open={!!selectedMiner} 
        onClose={() => setSelectedMiner(null)} 
      />
    </div>
  );
};

export default Mining3DView;
