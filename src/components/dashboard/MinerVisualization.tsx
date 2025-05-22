
import { useEffect, useState } from "react";
import { MinerData } from "@/types/miner";

interface MinerVisualizationProps {
  miner: MinerData;
}

export const MinerVisualization = ({ miner }: MinerVisualizationProps) => {
  const [temperature, setTemperature] = useState(miner.EnvTemp || 37);
  const [hashrate, setHashrate] = useState(miner.THSRT || 85);
  const [rotation, setRotation] = useState({ x: 5, y: 0 });
  const [fanSpeed, setFanSpeed] = useState(2); // Fan speed in seconds (lower = faster)

  // Simulate changing values
  useEffect(() => {
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
  }, []);

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

  return (
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
        <p style={{fontSize:"12px",color:"black",fontWeight:"bold",padding:"10px"}}>{miner.Worker1 || `${miner.MinerType}.${miner.IP}`}</p>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="vent-slot"></div>
        ))}
      </div>

      {/* Display panel */}
      <div className="display-panel">
        <div className="display-header">
          <div style={{display:"flex",gap:"5px"}}>
            <div className={miner.Status === 'Running' ? "status-led" : "status-led2"}></div>
          </div>
          <span className="model-name">{miner.MinerType || 'M30'}</span>
        </div>
        <div className="temperature-display">
          <span>{temperature.toFixed(1)}°C</span>
        </div>
      </div>

      {/* Middle section with ports */}
      <div className="ports-section">
        <p style={{fontSize:"13px",fontWeight:"bold",padding:"5px"}}>Fan: {miner.SpdIn || 7000} / {miner.SpdOut || 6900}</p>
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
              <p style={{backgroundColor:"black",borderRadius:"50%",height:"65px",width:"65px",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {hashrate.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="bottom-section">
        <span className="hashrate-label">HASHRATE %</span>
      </div>
    </div>
  );
};

export default MinerVisualization;
