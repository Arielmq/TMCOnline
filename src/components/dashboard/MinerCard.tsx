
import { Card } from "@/components/ui/card";

interface MinerCardProps {
  name: string;
  hashrate: string;
  status: "active" | "warning" | "danger";
  temperature: string;
  efficiency: string;
}

const MinerCard = ({ name, hashrate, status, temperature, efficiency }: MinerCardProps) => {
  return (
    <Card className="p-4 bg-tmcdark-card border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">{name}</div>
        <span className={`status-led ${status}`}></span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Hashrate</div>
          <div className="text-sm font-medium">{hashrate}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Temp</div>
          <div className="text-sm font-medium">{temperature}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Efficiency</div>
          <div className="text-sm font-medium">{efficiency}</div>
        </div>
      </div>
    </Card>
  );
};

export default MinerCard;
