import { create } from 'zustand';

export const useMinerStore = create((set, get) => {
  // Cargar datos iniciales desde localStorage
  const savedMiners = localStorage.getItem('miners');
  const initialMiners = savedMiners ? JSON.parse(savedMiners) : [];

  // Estado temporal para acumulación de lotes
  let batchAccumulator = [];
  let batchCount = 0;
  let expectedBatches = 1;

  return {
    miners: Array.isArray(initialMiners) ? initialMiners : [],
    timestamp: new Date().toISOString(),

    // Llama a este método por cada lote recibido
    accumulateMinersBatch: (data, batchIndex, totalBatches) => {
      // batchIndex: número del lote recibido (empezando en 1)
      // totalBatches: total de lotes esperados

      if (batchIndex === 1) {
        // Si es el primer lote, reinicia el acumulador
        batchAccumulator = [];
        batchCount = 0;
        expectedBatches = totalBatches;
      }

      // Acumula los mineros de este lote
      batchAccumulator = batchAccumulator.concat(data.miners);
      batchCount++;

      // Si ya llegaron todos los lotes, actualiza el store
      if (batchCount === expectedBatches) {
        set((state) => {
          const normalizeIp = (ip) => (ip || "").trim().toLowerCase();
          const minerMap = new Map(
            state.miners.map((m) => [normalizeIp(m.ip || m.IP), m])
          );

          batchAccumulator.forEach((apiMiner) => {
            const minerData = {
              ...apiMiner.data,
              ip: apiMiner.ip || apiMiner.IP,
              status: apiMiner.status,
              error:
                apiMiner.status === "rejected"
                  ? apiMiner.data?.error || "No se pudo conectar"
                  : apiMiner.data?.error,
            };
            const key = normalizeIp(minerData.ip);
            minerMap.set(key, {
              ...minerMap.get(key),
              ...minerData,
            });
          });

          const updatedMiners = Array.from(minerMap.values());
          localStorage.setItem("miners", JSON.stringify(updatedMiners));
          localStorage.setItem("miners_timestamp", new Date().toISOString());

          return {
            miners: updatedMiners,
            timestamp: new Date().toISOString(),
          };
        });
      }
    },
  };
});