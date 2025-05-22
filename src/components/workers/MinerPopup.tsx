
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MinerData } from "@/types/miner";

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
        <style>
{`
/* Main container */
.miner-container {
  width: 162px;
  height: 295px;
  background-color: #27272a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4), inset 0 -2px 6px
    rgba(255, 255, 255, 0.1);
  border: 1px solid #3f3f46;
  position: relative;
  transform: perspective(800px) rotateX(5deg);
  transform-style: preserve-3d;
  margin-top: 20px;
}

/* Ventilation grill - Top section */
.ventilation-grill {
  height: 24px;
  background: linear-gradient(to bottom, #D3D6DF, #D3D6DF);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 4;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid #2d2d2d;
  transform: translateZ(5px);
}

.vent-slot {
  width: 4px;
  height: 12px;
  background-color: #18181b;
  margin: 0 2px;
  border-radius: 1px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.8);
}

/* Display panel */
.display-panel {
  padding: 8px;
  background: linear-gradient(145deg, #111, #000);
  border-top: 1px solid #3f3f46;
  border-bottom: 1px solid #3f3f46;
  height: 50px;
  position: relative;
  z-index: 3;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5), inset 0 1px 5px rgba(0, 0, 0, 0.8);
  transform: translateZ(3px);
}

.display-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.model-name {
  color: #a1a1aa;
  font-family: monospace;
  font-size: 12px;
  text-shadow: 0 0 5px rgba(161, 161, 170, 0.5);
}

.status-led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #4ade80, #22c55e);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.8);
}

.status-led2 {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #8b21218a, #6d03038a);
  box-shadow: 0 0 8px rgba(94, 1, 1, 0.63);
}

.temperature-display {
  text-align: center;
  margin-top: -20px;
}

.temperature-display span {
  color: #22c55e;
  font-size: 24px;
  font-weight: bold;
  font-family: monospace;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
}

/* Ports section */
.ports-section {
  height: 16px;
  color: black;
  font-weight: bold;
  background: linear-gradient(to bottom, #D3D6DF, #D3D6DF);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 4px;
  position: relative;
  z-index: 2;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.1);
  border-top: 1px solid #4a4a4a;
  border-bottom: 1px solid #2d2d2d;
  transform: translateZ(2px);
}

/* Fan section - Enhanced 3D metallic look */
.fan-section {
  padding: 6px;
  background: linear-gradient(145deg, #333, #222);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  height: 180px;
  width: 100px;
  margin: 0 auto;
  border-top: 1px solid #999999;
  border-bottom: 1px solid #666666;
  transform: translateZ(0);
}

.fan-container {
  position: relative;
  width: 140px;
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  padding-left: 180px;
}

/* New fan frame style based on the image */
.fan-frame {
  position: absolute;
  inset: 0;
  border-radius: 2px;
  background: linear-gradient(145deg, #333, #222);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
  transform: translateZ(2px);
  width: 150px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Corner screws */
.screw {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #999, #666);
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.8), 0 0 2px rgba(255, 255, 255, 0.2);
  z-index: 9;
  transform: translateZ(3px);
}

.screw::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 1px;
  background-color: #333;
  transform: translate(-50%, -50%);
}

.screw-top-left {
  top: 4px;
  left: 4px;
}

.screw-top-right {
  top: 4px;
  right: 4px;
}

.screw-bottom-left {
  bottom: 4px;
  left: 4px;
}

.screw-bottom-right {
  bottom: 4px;
  right: 4px;
}

/* Concentric grid style based on the image - ENLARGED */
.concentric-grid {
  position: absolute;
  inset: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  z-index: 7;
}

.concentric-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(200, 200, 200, 0.7);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  transform: translateZ(2.5px);
}

/* Cross lines */
.cross-line {
  position: absolute;
  background-color: rgba(200, 200, 200, 0.7);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  transform: translateZ(2.5px);
}

.cross-horizontal {
  width: 100%;
  height: 1px;
  top: 50%;
  transform: translateY(-50%) translateZ(2.5px);
}

.cross-vertical {
  height: 100%;
  width: 1px;
  left: 50%;
  transform: translateX(-50%) translateZ(2.5px);
}

/* Internal fan styles */
.internal-fan {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  animation: spin-internal 2s linear infinite;
  z-index: 4;
}

@keyframes spin-internal {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}

.internal-fan-hub {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #444, #222);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5), inset 0 0 3px rgba(255, 255, 255, 0.2);
  z-index: 6;
  transform: translateZ(4px);
}

.internal-fan-hub::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #333, #111);
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.8);
}

.internal-blade {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70px;
  height: 15px;
  background: linear-gradient(to bottom, #555, #333);
  border-radius: 50% 20% 20% 50%;
  transform-origin: 0 50%;
  margin-left: 0;
  margin-top: -6px;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px
    rgba(0, 0, 0, 0.3);
}

.air-flow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    transparent 30%,
    rgba(255, 255, 255, 0.03) 40%,
    rgba(255, 255, 255, 0.02) 60%,
    transparent 70%
  );
  animation: air-pulse 3s ease-in-out infinite;
  z-index: 2;
  opacity: 0.7;
}

/* Hashrate display - Enhanced 3D holographic effect */
.hashrate-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translateZ(10px);
  z-index: 10;
  perspective: 800px;
}

.hashrate-value {
  font-size: 40px;
  font-weight: bold;
  font-family: monospace;
  text-shadow: 0 0 10px currentColor;
  box-shadow: 0 0 15px rgb(0, 0, 0), 0 0 5px currentColor;
  animation: pulse 2s infinite;
  backdrop-filter: blur(2px);
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  position: relative;
}

.hashrate-value::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: inset 0 0 10px currentColor;
  opacity: 0.5;
}

.hashrate-green {
  color: #22c55e;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.7), inset 0 0 8px rgba(34, 197, 94, 0.5);
}

.hashrate-yellow {
  color: #eab308;
  box-shadow: 0 0 15px rgba(234, 179, 8, 0.7), inset 0 0 8px rgba(234, 179, 8, 0.5);
}

.hashrate-red {
  color: #ef4444;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.7), inset 0 0 8px rgba(239, 68, 68, 0.5);
}

/* Bottom section */
.bottom-section {
  height: 16px;
  background: linear-gradient(to bottom, #D3D6DF 10%, #d3d6dfb6);
  border-top: 1px solid #3f3f46;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 0;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  transform: translateZ(-2px);
}

.hashrate-label {
  color: black;
  font-weight: bold;
  font-size: 10px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

/* Animations */
@keyframes pulse {
  0% {
    opacity: 0.8;
    transform: scale(0.98) translateZ(10px);
  }
  50% {
    opacity: 1;
    transform: scale(1.02) translateZ(12px);
  }
  100% {
    opacity: 0.8;
    transform: scale(0.98) translateZ(10px);
  }
}

@keyframes air-pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
}
`}
        </style>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Miner 3D visualization */}
            <div className="md:w-1/3 flex justify-center">
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
                  <span className="hashrate-label">HASHRATE %</span>
                </div>
              </div>
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
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MinerPopup;
