// src/components/MinerVisualization.jsx
import { useEffect, useState } from "react";
import { MinerData } from "@/types/miner";

interface MinerVisualizationProps {
  miner: MinerData;
}

export const MinerVisualization = ({ miner }: MinerVisualizationProps) => {
  const isStopped = miner.Status === 'Stopped';
  console.log(miner,"ESTA ES LA DATA DE MINER");
  
  // Estados internos (seguirán cambiando pero se ignorarán si isStopped)
  const [temperature, setTemperature] = useState(miner.EnvTemp || 37);
  const [hashrate, setHashrate] = useState(miner.THSRT || 85);
  const [rotation, setRotation] = useState({ x: 5, y: 0 });
  const [fanSpeed, setFanSpeed] = useState(2);

  // Simula cambios en temp/hashrate cada 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature(prev => {
        const v = prev + (Math.random() > 0.5 ? 0.1 : -0.1);
        return Number((Math.min(Math.max(v, 35), 45)).toFixed(1));
      });
      setHashrate(prev => {
        const v = prev + (Math.random() > 0.5 ? 2 : -2);
        return Math.min(Math.max(v, 65), 95);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Ajusta fanSpeed según temperatura
  useEffect(() => {
    const t = isStopped ? 0 : temperature;
    if (t < 38) setFanSpeed(2.5);
    else if (t < 40) setFanSpeed(2);
    else if (t < 42) setFanSpeed(1.5);
    else setFanSpeed(1);
  }, [temperature, isStopped]);

  // Mouse-move 3D
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = (x / rect.width - 0.5) * 8;
    const rotateX = (y / rect.height - 0.5) * -6;
    setRotation({ x: 5 + rotateX, y: rotateY });
  };

  const handleMouseLeave = () => setRotation({ x: 5, y: 0 });

  // Color de hashrate
  const getHashrateColorClass = (v: number) => {
    if (v >= 80) return "hashrate-green";
    if (v >= 70) return "hashrate-yellow";
    return "hashrate-red";
  };

  // Valores que realmente mostramos (override a 0 si está detenido)
  const displayTemp = isStopped ? 0 : temperature;
  const displayHash = isStopped ? 0 : hashrate;
  const displaySpdIn = isStopped ? 0 : miner.SpdIn ?? 0;
  const displaySpdOut = isStopped ? 0 : miner.SpdOut ?? 0;

  // Concentric circles gen
  const generateConcentricCircles = () =>
    Array.from({ length: 10 }).map((_, i) => {
      const size = 10 + i * 15;
      return (
        <div
          key={i}
          className="concentric-circle"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      );
    });

  return (
    <div
      className="miner-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
      }}
    >
      {/* Top grill */}
 <div className="ventilation-grill">
  {[0,1,2].map(i => <div key={i} className="vent-slot" />)}

  {/* Aquí mostramos Worker1 o "n/a" */}
  <p style={{color:"black"}} className="font-bold  text-xs px-2">
    {miner.Worker1 && miner.Worker1.trim() !== '' 
      ? miner.Worker1 
      : 'n/a'}
  </p>

  {[0,1,2].map(i => <div key={i} className="vent-slot" />)}
</div>
      {/* Display */}
      <div className="display-panel">
        <div className="display-header">
          <div className="flex gap-1">
            <div className={miner.Status === 'Running' ? "status-led" : "status-led2"} />
          </div>
          <span style={{marginTop:"-10px",marginBottom:"10px"}} className="model-name">{miner.MinerType}</span>
        </div>
        <div className="temperature-display">
          <span>{displayTemp.toFixed(1)}°C</span>
        </div>
      </div>

      {/* Ports */}
      <div className="ports-section">
        <p className="text-xs font-bold px-2">
          Fan: {displaySpdIn} / {displaySpdOut}
        </p>
      </div>

      {/* Fan */}
      <div className="fan-section">
        <div className="fan-container">
          <div className="fan-frame">
            <div className="screw screw-top-left" />
            <div className="screw screw-top-right" />
            <div className="screw screw-bottom-left" />
            <div className="screw screw-bottom-right" />

            <div className="air-flow" />

           <div
  className="internal-fan"
  style={{
    // si displayHash === 0 (o isStopped), no gira
    animation:
      displayHash === 0
        ? 'none'
        : `spin-internal ${fanSpeed}s linear infinite`,
  }}
>
  {Array.from({ length: 7 }).map((_, i) => (
    <div
      key={i}
      className="internal-blade"
      style={{ transform: `rotate(${i * (360/7)}deg)` }}
    />
  ))}
</div>
            <div className="internal-fan-hub" />

            <div className="concentric-grid">
              {generateConcentricCircles()}
            </div>
          </div>

          <div className="hashrate-display">
            <div className={`hashrate-value ${getHashrateColorClass(displayHash)}`}>
              <p className="bg-black rounded-full h-16 w-16 flex items-center justify-center text-white font-bold">
                {displayHash.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="bottom-section">
        <span className="hashrate-label">{miner.MACAddr}</span>
      </div>
    </div>
  );
};

export default MinerVisualization;
