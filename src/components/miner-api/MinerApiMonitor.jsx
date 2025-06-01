import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMiner } from '@/context/MinerContext';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle } from 'lucide-react';
import { useMinerApi } from "@/hooks/useMinerApi";

// Mostrar hashrate en TH/s si es posible, sin sumar ni dividir mal
const formatHashrate = (hashrate) => {
  if (typeof hashrate !== 'number' || isNaN(hashrate)) return 'N/A';
  if (hashrate >= 1e12) return `${(hashrate / 1e12).toFixed(2)} PH/s`;
  if (hashrate >= 1e9) return `${(hashrate / 1e9).toFixed(2)} TH/s`;
  if (hashrate >= 1e6) return `${(hashrate / 1e6).toFixed(2)} GH/s`;
  if (hashrate >= 1e3) return `${(hashrate / 1e3).toFixed(2)} MH/s`;
  return `${hashrate.toFixed(2)} H/s`;
};

const formatPower = (power) => {
  if (typeof power !== 'number' || isNaN(power)) return 'N/A';
  if (power >= 1000) return `${(power / 1000).toFixed(2)} kW`;
  return `${power} W`;
};

export function MinerApiMonitor() {
  const { data } = useMinerApi();
  const wsMiners = data?.miners || [];
  const { locations, selectedLocation, selectedPanel } = useMiner();

  // Filtrar mineros según la ubicación y panel seleccionados
  let displayedLocations = locations;
  if (selectedLocation) displayedLocations = [selectedLocation];

  // Para errores
  const minersWithErrors = locations
    .flatMap((loc) => loc.panels.flatMap((panel) => panel.miners))
    .filter((miner) => miner.ErrorCode || miner.Status !== 'Running');

  if (displayedLocations.every((loc) => loc.panels.every((panel) => panel.miners.length === 0))) {
    return (
      <Card className="bg-tmcdark-card border-border">
        <CardHeader>
          <CardTitle>Miners API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 space-y-2">
            <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto" />
            <p>No se han encontrado datos de mineros.</p>
            <p className="text-sm text-muted-foreground">
              Asegúrate de que el servidor WebSocket esté en funcionamiento y que tengas mineros
              configurados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-tmcdark-card overflow-hidden border-border">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Miners API</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="max-h-[400px] overflow-hidden">
          <div className="max-h-[300px] overflow-auto space-y-4 pr-2">
            {displayedLocations.map((location) => (
              <div key={location.id}>
                <h2 className="text-lg font-semibold mb-2">{location.name}</h2>
                {location.panels
                  .filter((panel) => !selectedPanel || panel.id === selectedPanel.id)
                  .map((panel) => (
                    <div key={panel.id} className="mb-4">
                      <h3 className="text-md font-medium mb-2">Panel {panel.number}</h3>
                      {panel.miners.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay mineros en este panel.</p>
                      ) : (
                        <div className="space-y-2">
                         {panel.miners
                            .filter((miner) => miner.IP && miner.IP.trim() !== "")
                            .map((miner) => {
                              // Buscar datos en tiempo real por IP
                              const wsMiner = wsMiners.find(
                                (m) => (m.ip === miner.IP || m.data?.ip === miner.IP) && m.status === "fulfilled"
                              );
                              const data = wsMiner?.data;

                              // Usar los valores reales del WebSocket
                              const hashrate = data?.summary?.hashrateAvg ?? null;
                              const power = data?.summary?.power ?? null;
                              // Cambia aquí: toma la temperatura de dashboards[0].temperature
                              const envTemp = Array.isArray(data?.dashboards) && data.dashboards[0]
                                ? data.dashboards[0].temperature
                                : null;
                              const minerType = data?.minerInfo?.minerType || miner.MinerType || "N/A";
                              const worker = data?.pool?.worker || miner.Worker1 || "N/A";
                              const status = hashrate && hashrate > 0 ? "Running" : "Offline";

                              return (
                                <div
                                  key={miner.IP}
                                  className="border border-gray-300 p-4 rounded-md"
                                  data-miner-ip={miner.IP}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="font-medium">
                                        {miner.IP} (Slot {miner.slot || 'N/A'})
                                      </span>
                                      <span className="text-sm text-muted-foreground ml-2">
                                        ({minerType} - {worker})
                                      </span>
                                    </div>
                                    <Badge
                                      variant={status === 'Running' ? 'default' : 'destructive'}
                                    >
                                      {status}
                                    </Badge>
                                  </div>
                                  <div className="text-sm mt-2">
                                    <p>
                                      Hashrate:{" "}
                                      {hashrate !== null
                                        ? formatHashrate(hashrate)
                                        : "N/A"}
                                    </p>
                                    <p>
                                      Power:{" "}
                                      {power !== null
                                        ? formatPower(power)
                                        : "N/A"}
                                    </p>
                                
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ))}
            {minersWithErrors.length > 0 && (
              <div className="p-4 bg-red-900/20 border border-red-800 rounded-md">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="font-medium">Errores de conexión</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  {minersWithErrors.map((miner, idx) => (
                    <li key={miner.IP || idx} className="ml-7">
                      <span className="font-medium">{miner.IP}:</span>{" "}
                      {miner.ErrorCode || "Error desconocido"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default MinerApiMonitor;