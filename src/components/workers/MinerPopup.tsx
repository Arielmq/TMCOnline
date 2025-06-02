import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MinerData } from "@/types/miner";
import "./minerPopUp.css";
import AnimatedLineChartD3 from "../../components/AnimatedLineChartD3/AnimatedLineChartD3";
import { useMinerStore } from "@/store/minerStore";

interface MinerPopupProps {
  open: boolean;
  onClose: () => void;
  miner: MinerData | null;
}

const MinerPopup = ({ open, onClose, miner }: MinerPopupProps) => {
  const [rotation, setRotation] = useState({ x: 5, y: 0 });

  // Fan speed en base a temperatura real
  const displayTemp = Number(miner?.EnvTemp ?? miner?.HashBoardTemp ?? 0);
  const fanSpeed =
    displayTemp < 38 ? 2.5 :
    displayTemp < 40 ? 2 :
    displayTemp < 42 ? 1.5 : 1;

  // 3D perspective effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - container.left;
    const y = e.clientY - container.top;
    const rotateY = (x / container.width - 0.5) * 8;
    const rotateX = (y / container.height - 0.5) * -6;
    setRotation({ x: 5 + rotateX, y: rotateY });
  };

  // Hashrate color
  const getHashrateColorClass = (value: number) => {
    if (value >= 80) return "hashrate-green";
    if (value >= 70) return "hashrate-yellow";
    return "hashrate-red";
  };

  // Concentric circles for fan grid
  const generateConcentricCircles = () => {
    return Array.from({ length: 10 }).map((_, i) => {
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
                style={{
                  transform: `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setRotation({ x: 5, y: 0 })}
              >
                {/* Top ventilation grill */}
                <div className="ventilation-grill">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="vent-slot"></div>
                  ))}
                  <p style={{ fontSize: "12px", color: "black", fontWeight: "bold", padding: "10px" }}>
                    {miner.Worker1 || miner.IP}
                  </p>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="vent-slot"></div>
                  ))}
                </div>

                {/* Display panel */}
                <div className="display-panel">
                  <div className="display-header">
                    <div style={{ display: "flex", gap: "5px" }}>
                      <div className="status-led"></div>
                      <div className="status-led2"></div>
                    </div>
                    <span className="model-name">{miner.MinerType?.split('_')[0]}</span>
                  </div>
                  <div className="temperature-display">
                    <span>{displayTemp ? `${displayTemp}°C` : "--"}</span>
                  </div>
                </div>

                {/* Middle section with ports */}
                <div className="ports-section">
                  <p style={{ fontSize: "13px", fontWeight: "bold", padding: "5px" }}>
                    Fan: {miner.SpdIn || 7000} / {miner.SpdOut || 6900}
                  </p>
                </div>

                {/* Fan section */}
                <div className="fan-section">
                  <div className="fan-container">
                    {/* Fan frame */}
                    <div className="fan-frame">
                      {/* Corner screws */}
                      <div className="screw screw-top-left"></div>
                      <div className="screw screw-top-right"></div>
                      <div className="screw screw-bottom-left"></div>
                      <div className="screw screw-bottom-right"></div>
                      {/* Air flow effect */}
                      <div className="air-flow"></div>
                      {/* Internal fan */}
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
                      {/* Fan hub */}
                      <div className="internal-fan-hub"></div>
                      {/* Concentric grid */}
                      <div className="concentric-grid">{generateConcentricCircles()}</div>
                    </div>
                    {/* Holographic hashrate display */}
                    <div className="hashrate-display">
                      <div className={`hashrate-value ${getHashrateColorClass(Number(miner.THSRT))}`}>
                        <p style={{
                          backgroundColor: "black",
                          borderRadius: "50%",
                          height: "65px",
                          width: "65px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                     
                        }}>
                          {miner.THSRT ? Math.round(miner.THSRT) : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom section */}
                <div className="bottom-section">
                  <span className="hashrate-label">MAC {miner.MACAddr}</span>
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
                            miner.Status === "Running" ? "bg-green-500" :
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

           
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MinerPopup;