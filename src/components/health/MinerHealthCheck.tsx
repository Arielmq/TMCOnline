import { useState } from "react";
import { useMiner } from "@/context/MinerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check } from "lucide-react";
import { MinerData } from "@/types/miner";
import { Badge } from "@/components/ui/badge";
import MinerPopup from "../workers/MinerPopup";
import { useMinerApi } from "@/hooks/useMinerApi";

// Health check thresholds for different miner types
const HASHRATE_THRESHOLDS = {
  M30S: { green: 80, yellow: 70 },
  "M31S+": { green: 75, yellow: 67 },
  "M30S++": { green: 97, yellow: 85 },
  M50: { green: 98, yellow: 85 },
};

// Temperature thresholds (universal)
const TEMP_THRESHOLDS = { yellow: 87, red: 92 };

// Identify health issues (offline miners are filtered out upstream)
const identifyIssues = (miner: MinerData): string[] => {
  const issues: string[] = [];

  // Hashrate thresholds
  let type = miner.MinerType?.split("_")[0] || "M30S";
  if (type.includes("++")) type = "M30S++";
  const t = HASHRATE_THRESHOLDS[type as keyof typeof HASHRATE_THRESHOLDS] || HASHRATE_THRESHOLDS.M30S;
  if ((miner.THSAvg ?? 0) < t.yellow) issues.push("Bajo Hashrate");

  // Temperature thresholds
  if ((miner.EnvTemp ?? 0) > TEMP_THRESHOLDS.red) {
    issues.push("Sobrecalentamiento crítico");
  } else if ((miner.EnvTemp ?? 0) > TEMP_THRESHOLDS.yellow) {
    issues.push("Temperatura elevada");
  }

  return issues;
};

// Color indicator helpers
const getHashrateColor = (hr: number) => {
  if (hr === 0) return "red";
  let type = "M30S";
  const t = HASHRATE_THRESHOLDS[type];
  if (hr >= t.green) return "green";
  if (hr >= t.yellow) return "yellow";
  return "red";
};
const getTempColor = (temp: number) => {
  if (temp > TEMP_THRESHOLDS.red) return "red";
  if (temp > TEMP_THRESHOLDS.yellow) return "yellow";
  return "green";
};

const MinerHealthCheck = () => {
  const { locations } = useMiner();
  const { data } = useMinerApi();
  const [selectedMiner, setSelectedMiner] = useState<MinerData | null>(null);

  // Relaciona los datos del WebSocket con la configuración para saber ubicación y panel
  const minersWithIssues: {
    miner: MinerData;
    location: string;
    panel: number;
    issues: string[];
  }[] = [];

  if (data?.miners?.length && locations?.length) {
    data.miners.forEach((apiMiner) => {
      if (apiMiner.status !== "fulfilled" || !apiMiner.data) return;
      const minerData = apiMiner.data;
      // Buscar ubicación y panel por IP
      let found = false;
      locations.forEach((loc) => {
        loc.panels.forEach((panel) => {
          const miner = panel.miners.find((m) => m.IP === minerData.ip);
          if (miner) {
            // Mezcla datos de config + datos en vivo
            const mergedMiner: MinerData = {
              ...miner,
              ...minerData,
              THSAvg: minerData.summary?.hashrateAvg ?? 0,
              EnvTemp: minerData.summary?.envTemp ?? 0,
              MinerType: minerData.minerInfo?.minerType ?? miner.MinerType ?? "",
              MACAddr: minerData.minerInfo?.macAddress ?? miner.MACAddr ?? "",
              Status: minerData.summary?.hashrateAvg > 0 ? "Running" : "Stopped",
            };
            if (mergedMiner.THSAvg === 0 || mergedMiner.Status === "Suspended") return;
            const issues = identifyIssues(mergedMiner);
            if (issues.length > 0) {
              minersWithIssues.push({
                miner: mergedMiner,
                location: loc.name,
                panel: panel.number,
                issues,
              });
            }
            found = true;
          }
        });
      });
      // Si no está en la config, igual lo puedes mostrar (opcional)
    });
  }

  return (
    <div>
      {minersWithIssues.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold mb-4">
            Miners with Health Issues ({minersWithIssues.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {minersWithIssues.map((item, idx) => {
              const hrColor = getHashrateColor(item.miner.THSAvg);
              const tempColor = getTempColor(item.miner.EnvTemp);

              return (
                <Card
                  key={`${item.miner.IP}-${idx}`}
                  className="border-border bg-tmcdark-card cursor-pointer hover:border-tmcblue-light transition-all"
                  onClick={() => setSelectedMiner(item.miner)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{item.miner.IP}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.miner.MACAddr}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex flex-col">
                        <div className="text-xs text-muted-foreground">Hashrate</div>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full bg-${
                              hrColor === "green"
                                ? "green-500"
                                : hrColor === "yellow"
                                ? "yellow-500"
                                : "red-500"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {item.miner.THSAvg} TH/s
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="text-xs text-muted-foreground">
                          Temperature
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full bg-${
                              tempColor === "green"
                                ? "green-500"
                                : tempColor === "yellow"
                                ? "yellow-500"
                                : "red-500"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {item.miner.EnvTemp}°C
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.issues.map((issue, i) => (
                        <Badge
                          key={i}
                          variant={
                            issue.includes("Sobrecalentamiento")
                              ? "destructive"
                              : issue.includes("Temperatura")
                              ? "secondary"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {issue}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      Location: {item.location}, Panel {item.panel}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Alert className="bg-green-500/10 border-green-500/30">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm font-medium">
            All miners are working correctly. No performance issues detected.
          </AlertDescription>
        </Alert>
      )}

      <MinerPopup
        miner={selectedMiner}
        open={!!selectedMiner}
        onClose={() => setSelectedMiner(null)}
      />
    </div>
  );
};

export default MinerHealthCheck;