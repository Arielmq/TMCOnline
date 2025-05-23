
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MinerData } from "@/types/miner";
import "./minerPopUp.css"
import AnimatedLineChartD3 from "../../components/AnimatedLineChartD3/AnimatedLineChartD3"
interface MinerPopupProps {
  open: boolean;
  onClose: () => void;
  miner: MinerData | null;
}

const MinerPopup = ({ open, onClose, miner }: MinerPopupProps) => {
  const [temperature, setTemperature] = useState(37);
  const [hashrate, setHashrate] = useState(85);
  const [rotation, setRotation] = useState({ x: 5, y: 0 });
  const [fanSpeed, setFanSpeed] = useState(2); // Fan speed in seconds (lower = faster)
  console.log(hashrate,"ESTE ES EL HASH");
  
  // Reset values when a different miner is selected
  useEffect(() => {
    if (miner) {
      // Initialize with actual miner values if available
      const initialTemp = miner.EnvTemp || 37;
      
      // Calculate hashrate percentage based on miner type
      let hashratePercentage = 85;
      const minerType = miner.MinerType.split('_')[0];
      const avgHashrate = miner.THSAvg || 0;
      
      if (minerType === "M30S++") {
        hashratePercentage = avgHashrate >= 97 ? 95 : 
                             avgHashrate >= 85 ? 80 : 70;
      } else if (minerType === "M31S+") {
        hashratePercentage = avgHashrate >= 75 ? 95 : 
                             avgHashrate >= 67 ? 80 : 70;
      } else if (minerType === "M50") {
        hashratePercentage = avgHashrate >= 98 ? 95 :
                             avgHashrate >= 85 ? 80 : 70;
      } else { // M30S
        hashratePercentage = avgHashrate >= 80 ? 95 :
                             avgHashrate >= 70 ? 80 : 70;
      }
      
      setTemperature(initialTemp);
      setHashrate(hashratePercentage);
    }
  }, [miner]);

  // Simulate changing values
  useEffect(() => {
    if (!open) return;
    
    const tempInterval = setInterval(() => {
      setTemperature((prev) => {
        const newTemp = prev + (Math.random() > 0.5 ? 0.1 : -0.1);
        return Number.parseFloat(Math.min(Math.max(newTemp, 35), 45).toFixed(1));
      });

      setHashrate((prev) => {
        const newRate = prev + (Math.random() > 0.5 ? 2 : -2);
        return Math.min(Math.max(newRate, 65), 95);
      });
    }, 3000);

    return () => {
      clearInterval(tempInterval);
    };
  }, [open]);

  // Update fan speed based on temperature
  useEffect(() => {
    // Fan spins faster as temperature increases
    if (temperature < 38) {
      setFanSpeed(2.5); // Slower
    } else if (temperature < 40) {
      setFanSpeed(2); // Medium
    } else if (temperature < 42) {
      setFanSpeed(1.5); // Fast
    } else {
      setFanSpeed(1); // Very fast
    }
  }, [temperature]);

  // Add mouse move effect for 3D perspective
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - container.left;
    const y = e.clientY - container.top;

    // Calculate rotation based on mouse position - reduced effect to maintain visibility
    const rotateY = (x / container.width - 0.5) * 8;
    const rotateX = (y / container.height - 0.5) * -6;

    setRotation({ x: 5 + rotateX, y: rotateY });
  };

  // Determine hashrate color class
  const getHashrateColorClass = (value: number) => {
    if (value >= 80) return "hashrate-green";
    if (value >= 70) return "hashrate-yellow";
    return "hashrate-red";
  };

  // Generate concentric circles for the fan grid
  const generateConcentricCircles = () => {
    // Create 9 concentric circles with increasing size
    return Array.from({ length: 10 }).map((_, i) => {
      // Adjusted to make circles larger and cover more area
      // Start from 14px and increase by 15px each time
      const size = 10 + i * 15;
      return (
        <div
          key={i}
          className="concentric-circle"
          style={{
            width: `${size}px`,
            height: `${size}px`,
          }}
        ></div>
      );
    });
  };

  if (!miner) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-tmcdark-card">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Miner 3D visualization */}
        <div className="md:w-1/3 flex-col flex mt-5 gap-5 items-center">
              <div
                className="miner-container"
                style={{ transform: `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setRotation({ x: 5, y: 0 })} // Reset rotation when mouse leaves
              >
                {/* Top ventilation grill */}
                <div className="ventilation-grill">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="vent-slot"></div>
                  ))}
                  <p style={{fontSize:"12px", color:"black", fontWeight:"bold", padding:"10px"}}>
                    {miner.Worker1 || miner.IP}
                  </p>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="vent-slot"></div>
                  ))}
                </div>

                {/* Display panel */}
                <div className="display-panel">
                  <div className="display-header">
                    <div style={{display:"flex", gap:"5px"}}>
                      <div className="status-led"></div>
                      <div className="status-led2"></div>
                    </div>
                    <span className="model-name">{miner.MinerType.split('_')[0]}</span>
                  </div>
                  <div className="temperature-display">
                    <span>{temperature}°C</span>
                  </div>
                </div>

                {/* Middle section with ports */}
                <div className="ports-section">
                  <p style={{fontSize:"13px", fontWeight:"bold", padding:"5px"}}>
                    Fan: {miner.SpdIn || 7000} / {miner.SpdOut || 6900}
                  </p>
                </div>

                {/* Fan section */}
                <div className="fan-section">
                  <div className="fan-container">
                    {/* Fan frame - new style based on the image */}
                    <div className="fan-frame">
                      {/* Corner screws */}
                      <div className="screw screw-top-left"></div>
                      <div className="screw screw-top-right"></div>
                      <div className="screw screw-bottom-left"></div>
                      <div className="screw screw-bottom-right"></div>

                      {/* Air flow effect */}
                      <div className="air-flow"></div>

                      {/* Internal fan - the actual fan blades inside the frame */}
                      <div className="internal-fan" style={{ animation: `spin-internal ${fanSpeed}s linear infinite` }}>
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div
                            key={i}
                            className="internal-blade"
                            style={{
                              transform: `rotate(${i * (360 / 7)}deg)`,
                            }}
                          ></div>
                        ))}
                      </div>

                      {/* Fan hub - the center part of the fan */}
                      <div className="internal-fan-hub"></div>

                      {/* Concentric grid like in the image */}
                      <div className="concentric-grid">
                        {generateConcentricCircles()}
                      </div>
                    </div>

                    {/* Holographic hashrate display - NOT rotating */}
                    <div className="hashrate-display">
                      <div className={`hashrate-value ${getHashrateColorClass(hashrate)}`}>
                        <p style={{backgroundColor:"black", borderRadius:"50%", height:"65px", width:"65px", textAlign:"center"}}>{Math.round(hashrate)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom section */}
                <div className="bottom-section">
                  <span className="hashrate-label">M.a.c.d</span>
                </div>
              </div>
              


                     <div className="col-span-2">
                  <div className="bg-tmcdark p-4 rounded-md border border-border">
                    <h3 className="text-lg font-medium mb-2">Pool Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Pool</p>
                        <p className="font-medium text-sm truncate">{miner.ActivePool || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Worker</p>
                        <p className="font-medium">{miner.Worker1 || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reject Rate</p>
                        <p className="font-medium">{miner.RejectRate}%</p>
                      </div>
                       </div>
                    </div>
                </div>

               <h1 style={{fontSize:"50px",marginTop:"50px"}}>TMC</h1>
            </div>

            {/* Miner details */}
            <div className="md:w-2/3">
              <h2 className="text-xl font-semibold mb-4">Miner Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="bg-tmcdark p-4 rounded-md border border-border">
                    <h3 className="text-lg font-medium mb-2">Device Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">IP Address</p>
                        <p className="font-medium">{miner.IP}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            miner.Status === "Running" ? "bg-white" : 
                            miner.Status === "Warning" || miner.Status === "ToolVerLower" ? "bg-[#FEF7CD]" : 
                            "bg-[#ea384c]"
                          }`} />
                          <span>{miner.Status}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{miner.MinerType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">MAC Address</p>
                        <p className="font-medium">{miner.MACAddr}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Version</p>
                        <p className="font-medium truncate text-xs">{miner.VersionInfo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Chip</p>
                        <p className="font-medium">{miner.ChipType}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-tmcdark p-4 rounded-md border border-border h-full">
                    <h3 className="text-lg font-medium mb-2">Performance</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Hashrate (RT)</p>
                        <p className="font-medium">{miner.THSRT} TH/s</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Hashrate (Avg)</p>
                        <p className="font-medium">{miner.THSAvg} TH/s</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Efficiency</p>
                        <p className="font-medium">{miner.Efficiency >= 1000 ? "N/A" : `${miner.Efficiency} W/T`}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Frequency</p>
                        <p className="font-medium">{miner.FreqAvg || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-tmcdark p-4 rounded-md border border-border h-full">
                    <h3 className="text-lg font-medium mb-2">Environment</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Temperature</p>
                        <p className="font-medium">{miner.EnvTemp}°C</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Board Temp</p>
                        <p className="font-medium">{miner.HashBoardTemp}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fan In/Out</p>
                        <p className="font-medium">{miner.SpdIn} / {miner.SpdOut}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Power</p>
                        <p className="font-medium">{miner.Power} W</p>
                      </div>
                    </div>
                  </div>
                </div>
          
                <div className="col-span-2">
                       <AnimatedLineChartD3/> 
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MinerPopup;
