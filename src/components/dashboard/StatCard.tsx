
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => {
  return (
    <Card className={cn("p-4 bg-tmcdark-card border-border", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={cn(
                "text-xs",
                trend.isPositive ? "text-status-success" : "text-status-danger"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}
              </span>
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-tmcdark-lighter">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
