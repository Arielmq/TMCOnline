
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MinerData } from "@/types/miner";
import { AlertTriangle, Thermometer, Cpu } from "lucide-react";

interface MinerHealthDetailsProps {
  minerInfo: {
    miner: MinerData;
    location: string;
    panel: number;
    issues: string[];
  };
  open: boolean;
  onClose: () => void;
}

const MinerHealthDetails = ({ minerInfo, open, onClose }: MinerHealthDetailsProps) => {
  const { miner, location, panel, issues } = minerInfo;
  
  // Determine the main issue for the headline
  const mainIssue = issues.includes("Sobrecalentamiento crítico") 
    ? "Sobrecalentamiento crítico" 
    : issues.includes("Temperatura elevada")
    ? "Temperatura elevada"
    : "Bajo Hashrate";
    
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mainIssue.includes("Sobrecalentamiento") ? (
              <Thermometer className="h-5 w-5 text-red-500" />
            ) : mainIssue.includes("Temperatura") ? (
              <Thermometer className="h-5 w-5 text-yellow-500" />
            ) : (
              <Cpu className="h-5 w-5 text-red-500" />
            )}
            {miner.IP} - {mainIssue}
          </DialogTitle>
          <DialogDescription>
            Detalles del minero con problemas de rendimiento
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
              <p>{location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Panel</p>
              <p>Panel {panel}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo de Minero</p>
              <p>{miner.MinerType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">MAC Address</p>
              <p>{miner.MACAddr}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hashrate</p>
              <p>{miner.THSAvg} TH/s</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Temperatura</p>
              <p>{miner.EnvTemp}°C</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Problemas detectados</p>
            <div className="space-y-2">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <p>{issue}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Recomendaciones</p>
            {issues.includes("Sobrecalentamiento crítico") && (
              <p className="text-sm">Apagar el minero inmediatamente y revisar el sistema de enfriamiento.</p>
            )}
            {issues.includes("High") && (
              <p className="text-sm">Mejorar la ventilación y verificar el sistema de refrigeración.</p>
            )}
            {issues.includes("Low Hashrate") && (
              <p className="text-sm">Verificar las conexiones y considerar un reinicio del dispositivo.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MinerHealthDetails;
