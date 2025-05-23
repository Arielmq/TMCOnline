// src/store/minerStore.js
import { create } from 'zustand';

export const useMinerStore = create((set, get) => {
  // Cargar datos iniciales desde localStorage
  const savedMiners = localStorage.getItem('miners');
  const savedTimestamp = localStorage.getItem('miners_timestamp');
  const initialMiners = savedMiners ? JSON.parse(savedMiners) : [];
  const initialTimestamp = savedTimestamp || new Date().toISOString();

  let batchTimeout = null;

  return {
    miners: Array.isArray(initialMiners) ? initialMiners : [], // Estado principal
    timestamp: initialTimestamp,
    tempMiners: [], // Estado temporal para acumular datos de todos los batches
    currentCycleId: null, // Identificador del ciclo actual
    batchCount: 0, // Contador de batches recibidos en el ciclo
    updateMiners: (data) => {
      set((state) => {
        // Obtener cycleId (puede ser un campo explícito o el timestamp)
        const cycleId = data.cycleId || data.timestamp;
        let { tempMiners, currentCycleId, batchCount } = state;

        // Si es un nuevo ciclo, inicializar tempMiners con una copia de los mineros actuales
        if (currentCycleId !== cycleId) {
          tempMiners = [...state.miners]; // Mantener datos actuales
          currentCycleId = cycleId;
          batchCount = 0;
        }

        // Incrementar contador de batches
        batchCount += 1;

        // Acumular datos del batch actual en tempMiners
        const updatedTempMiners = [...tempMiners];
        data.miners.forEach((apiMiner) => {
          const minerData = {
            ...apiMiner.data,
            ip: apiMiner.ip,
            status: apiMiner.status,
            error: apiMiner.status === 'rejected' ? apiMiner.data.error || 'No se pudo conectar' : apiMiner.data.error,
          };

          const index = updatedTempMiners.findIndex((m) => m.ip === apiMiner.ip);
          if (index !== -1) {
            updatedTempMiners[index] = {
              ...updatedTempMiners[index],
              ...minerData,
            };
          } else {
            updatedTempMiners.push(minerData);
          }
        });

        // Limpiar cualquier temporizador existente
        if (batchTimeout) {
          clearTimeout(batchTimeout);
        }

        // Configurar un temporizador para asumir que el ciclo está completo
        batchTimeout = setTimeout(() => {
          set((state) => {
            // Guardar en localStorage y actualizar estado principal
            localStorage.setItem('miners', JSON.stringify(state.tempMiners));
            localStorage.setItem('miners_timestamp', new Date().toISOString());
            return {
              miners: state.tempMiners, // Reemplazar estado principal SOLO al final del ciclo
              timestamp: new Date().toISOString(),
              tempMiners: [], // Limpiar estado temporal
              currentCycleId: null,
              batchCount: 0,
            };
          });
        }, 5000); // Esperar 5 segundos de inactividad para considerar el ciclo completo

        // Devolver estado intermedio sin modificar miners
        return {
          tempMiners: updatedTempMiners,
          currentCycleId,
          batchCount,
          miners: state.miners, // Mantener estado principal sin cambios
          timestamp: state.timestamp,
        };
      });
    },
  };
});