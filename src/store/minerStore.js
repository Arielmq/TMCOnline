import { create } from 'zustand';

export const useMinerStore = create((set, get) => {
  // Cargar datos iniciales desde localStorage
 const savedMiners = localStorage.getItem('miners');
  const initialMiners = savedMiners ? JSON.parse(savedMiners) : [];

   return {
    
    miners: Array.isArray(initialMiners) ? initialMiners : [],
    timestamp: new Date().toISOString(),
   updateMiners: (data) => {
  set((state) => {
    // Normaliza todas las IPs a minúsculas y usa 'ip' como clave
    const normalizeIp = (ip) => (ip || "").trim().toLowerCase();

    // Crear un mapa de mineros existentes para actualizaciones eficientes
    const minerMap = new Map(
      state.miners.map((m) => [normalizeIp(m.ip || m.IP), m])
    );

    // Actualizar o añadir mineros del lote actual
    data.miners.forEach((apiMiner) => {
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
        ...minerMap.get(key), // Preservar datos existentes
        ...minerData, // Sobrescribir con nuevos datos
      });
    });

    // NO eliminar mineros que no llegaron en el lote, solo actualiza los que sí llegaron
    const updatedMiners = Array.from(minerMap.values());

    // Guardar en localStorage
    localStorage.setItem("miners", JSON.stringify(updatedMiners));
    localStorage.setItem("miners_timestamp", new Date().toISOString());

    return {
      miners: updatedMiners,
      timestamp: new Date().toISOString(),
    };
  });
},
  };
});