// src/store/minerStore.js
import { create } from 'zustand';

export const useMinerStore = create((set) => {
  // Cargar datos iniciales desde localStorage
  const savedMiners = localStorage.getItem('miners');
  const savedTimestamp = localStorage.getItem('miners_timestamp');
  const initialMiners = savedMiners ? JSON.parse(savedMiners) : [];
  const initialTimestamp = savedTimestamp || new Date().toISOString();

  return {
    miners: Array.isArray(initialMiners) ? initialMiners : [], // Ensure miners is always an array
    timestamp: initialTimestamp || new Date().toISOString(), // Ensure timestamp is always a string
    updateMiners: (data) => {
      set((state) => {
        // Clonar el array de mineros existentes
        const updatedMiners = [...state.miners];

        // Procesar cada minero recibido
        data.miners.forEach((apiMiner) => {
          const index = updatedMiners.findIndex((m) => m.ip === apiMiner.ip);
          const minerData = {
            ...apiMiner.data,
            ip: apiMiner.ip,
            status: apiMiner.status, // Incluir status ('fulfilled' o 'rejected')
            error: apiMiner.status === 'rejected' ? apiMiner.data.error || 'No se pudo conectar' : apiMiner.data.error,
          };

          if (index !== -1) {
            // Actualizar minero existente
            updatedMiners[index] = {
              ...updatedMiners[index],
              ...minerData,
            };
          } else {
            // Agregar nuevo minero
            updatedMiners.push(minerData);
          }
        });

        // Guardar en localStorage para persistencia
        localStorage.setItem('miners', JSON.stringify(updatedMiners));
        localStorage.setItem('miners_timestamp', data.timestamp);

        return {
          miners: updatedMiners,
          timestamp: data.timestamp,
        };
      });
    },
  };
});