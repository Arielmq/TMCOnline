// src/hooks/useMinerApi.ts
import { useEffect } from 'react';
import { MinerApiResponse } from '@/types/miner-api';
import { toast } from 'sonner';
import { useMinerStore } from '@/store/minerStore';

const WS_URL = 'wss://tmcwatch.loca.lt';
let socket: WebSocket | null = null;
let reconnectInterval = 5000;
const maxReconnectInterval = 50000;
let callbacks: ((data: MinerApiResponse) => void)[] = [];

export function connectToMinerAPI(callback?: (data: MinerApiResponse) => void): () => void {
  if (callback) {
    callbacks.push(callback);
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    return () => {
      callbacks = callbacks.filter((cb) => cb !== callback);
    };
  }

  const connect = () => {
    try {
      console.log('Conectando al servidor WebSocket:', WS_URL);
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        console.log('WebSocket conectado');
        toast.success('Conectado al servidor de monitoreo');
        reconnectInterval = 5000;
      };

      socket.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          const data: MinerApiResponse = {
            ...rawData,
            cycleId: rawData.cycleId || rawData.timestamp, // Usar cycleId o timestamp
          };
          console.log('Datos recibidos del WebSocket:', data);

          // Actualizar la store
          useMinerStore.getState().updateMiners(data);

          callbacks.forEach((cb) => cb(data));
        } catch (error) {
          console.error('Error al procesar mensaje del WebSocket:', error);
       
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket cerrado. Código:', event.code, 'Razón:', event.reason);
        console.log('Intentando reconexión en', reconnectInterval / 1000, 'segundos...');
        
        setTimeout(() => {
          connect();
        }, reconnectInterval);

        reconnectInterval = Math.min(reconnectInterval * 1.5, maxReconnectInterval);
      };

      socket.onerror = (error) => {
        console.error('Error en WebSocket:', error);
     
        socket?.close();
      };
    } catch (error) {
      console.error('Error al conectar con el WebSocket:', error);
      

      setTimeout(() => {
        connect();
      }, reconnectInterval);

      reconnectInterval = Math.min(reconnectInterval * 1.5, maxReconnectInterval);
    }
  };

  connect();

  return () => {
    if (callback) {
      callbacks = callbacks.filter((cb) => cb !== callback);
    }

    if (callbacks.length === 0 && socket) {
      socket.close();
      socket = null;
    }
  };
}

export function useMinerApi() {
  const miners = useMinerStore((state) => state.miners);
  const timestamp = useMinerStore((state) => state.timestamp);

  useEffect(() => {
    const unsubscribe = connectToMinerAPI();
    return () => unsubscribe();
  }, []);

  return {
    data: {
      miners: miners || [],
      timestamp: timestamp || new Date().toISOString(),
    },
  };
}