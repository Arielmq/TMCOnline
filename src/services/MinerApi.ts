// minerApi.ts
import { useEffect } from 'react';
import { MinerApiResponse } from '@/types/miner-api';
import { toast } from 'sonner';
import { useMinerStore } from '@/store/minerStore';
import { useMiner } from '@/context/MinerContext';

const WS_URL = 'ws://tmcwatch.loca.lt';
let socket: WebSocket | null = null;
let reconnectInterval = 5000;
const maxReconnectInterval = 50000;
let callbacks: ((data: MinerApiResponse) => void)[] = [];

export function connectToMinerAPI(
  locations: any[],
  callback?: (data: MinerApiResponse) => void
): () => void {
  if (callback) {
    callbacks.push(callback);
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    return () => {
      callbacks = callbacks.filter((cb) => cb !== callback);
    };
  }

  const getFrontendIPs = () => {
    if (!Array.isArray(locations)) {
      console.error('Locations no es un arreglo:', locations);
      toast.error('Error: No se pudieron obtener las IPs de los mineros');
      return [];
    }
    const ips = locations.flatMap(loc =>
      Array.isArray(loc.panels)
        ? loc.panels.flatMap(panel =>
            Array.isArray(panel.miners)
              ? panel.miners.map(miner => miner.IP)
              : []
          )
        : []
    );
    console.log('IPs del frontend obtenidas:', ips);
    return ips;
  };

  const connect = () => {
    try {
      console.log('Conectando al servidor WebSocket:', WS_URL);
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        console.log('WebSocket conectado');
        toast.success('Conectado al servidor de monitoreo');
        reconnectInterval = 5000;
        setTimeout(() => {
          console.log('Listo para recibir datos del WebSocket. IPs:', getFrontendIPs());
        }, 2000);
      };

      socket.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          console.log('Datos crudos del WebSocket:', JSON.stringify(rawData, null, 2));

          if (rawData.error) {
            console.error('Error recibido del WebSocket:', rawData.error);
            toast.error(`Error del servidor: ${rawData.error}`);
            return;
          }

          if (!Array.isArray(rawData.miners)) {
            console.warn('rawData.miners no es un arreglo:', rawData.miners);
            return;
          }

          const frontendIPs = getFrontendIPs();
          const filteredMiners = rawData.miners.filter(miner => frontendIPs.includes(miner.ip));
          const rejectedMiners = rawData.miners.filter(miner => miner.status === 'rejected');
          if (rejectedMiners.length > 0) {
            console.warn('Miners rechazados:', rejectedMiners);
            rejectedMiners.forEach(miner => {
              toast.error(`Error en IP ${miner.ip}: ${miner.data.error}`);
            });
          }

          const data: MinerApiResponse = {
            ...rawData,
            cycleId: rawData.cycleId || rawData.timestamp || Date.now().toString(),
            miners: filteredMiners.map((miner) => ({
              ...miner,
              ip: miner.ip || `unknown-${Math.random().toString(36).slice(2)}`,
            })),
          };
          console.log('Datos procesados del WebSocket:', data);

          if (data.miners.length > 0) {
            useMinerStore.getState().updateMiners(data);
            callbacks.forEach((cb) => cb(data));
          } else {
            console.log('No se recibieron datos válidos para las IPs:', frontendIPs);
            if (frontendIPs.length > 0) {
              toast.warning('No se recibieron datos para las IPs configuradas');
            }
          }
        } catch (error) {
          console.error('Error procesando mensaje del WebSocket:', error);
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
      console.error('Error conectando al WebSocket:', error);
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
  const { locations } = useMiner();
  const miners = useMinerStore((state) => state.miners);
  const timestamp = useMinerStore((state) => state.timestamp);

  useEffect(() => {
    console.log('Iniciando conexión WebSocket con locations:', locations);
    if (!Array.isArray(locations)) {
      console.error('Locations no es un arreglo en useMinerApi:', locations);
      return;
    }
    const unsubscribe = connectToMinerAPI(locations);
    return () => unsubscribe();
  }, [locations]);

  return {
    data: {
      miners: miners || [],
      timestamp: timestamp || new Date().toISOString(),
    },
  };
}