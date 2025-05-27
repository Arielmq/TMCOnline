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
        // Crear un mapa de mineros existentes para actualizaciones eficientes
        const minerMap = new Map(state.miners.map((m) => [m.ip, m]));

        // Actualizar o añadir mineros del lote actual
        data.miners.forEach((apiMiner) => {
          const minerData = {
            ...apiMiner.data,
            ip: apiMiner.ip,
            status: apiMiner.status,
            error: apiMiner.status === 'rejected' ? apiMiner.data?.error || 'No se pudo conectar' : apiMiner.data?.error,
          };

          // Actualizar o añadir el minero en el mapa
          minerMap.set(minerData.ip, {
            ...minerMap.get(minerData.ip), // Preservar datos existentes
            ...minerData, // Sobrescribir con nuevos datos
          });
        });

        // Convertir el mapa de vuelta a un array
        const updatedMiners = Array.from(minerMap.values());

        // Guardar en localStorage
        localStorage.setItem('miners', JSON.stringify(updatedMiners));
        localStorage.setItem('miners_timestamp', new Date().toISOString());

        console.log('Updated miners:', updatedMiners.length);

        return {
          miners: updatedMiners,
          timestamp: new Date().toISOString(),
        };
      });
    },
  };
});