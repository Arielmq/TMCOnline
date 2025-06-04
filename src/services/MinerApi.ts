import { useEffect } from 'react';
import { MinerApiResponse } from '@/types/miner-api';
import { toast } from 'sonner';
import { useMinerStore } from '@/store/minerStore';
import { useMiner } from '@/context/MinerContext';

// Obtiene el subdominio desde localStorage o usa "tmcwatch" por defecto
function getWsUrl() {
  const subdomain = localStorage.getItem("tunnelSubdomain") || "tmcwatch";
  return `wss://${subdomain}.loca.lt`;
}

let socket: WebSocket | null = null;
let reconnectInterval = 5000;
const maxReconnectInterval = 50000;
let callbacks: ((data: MinerApiResponse) => void)[] = [];
let lastSentIPs: string[] = [];

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
      return [];
    }
    const ips = locations.flatMap(loc =>
      Array.isArray(loc.panels)
        ? loc.panels.flatMap(panel =>
            Array.isArray(panel.miners)
              ? panel.miners
                  .map(miner => miner.IP)
                  .filter(ip => ip && ip.trim() !== "")
              : []
          )
        : []
    );
    return ips;
  };

  const connect = () => {
    try {
      const WS_URL = getWsUrl();
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        toast.success('Conectado al servidor de monitoreo');
        reconnectInterval = 5000;

        // Enviar las IPs solo si han cambiado
        const frontendIPs = getFrontendIPs();
        if (
          frontendIPs.length > 0 &&
          (lastSentIPs.length !== frontendIPs.length ||
            !frontendIPs.every((ip, i) => ip === lastSentIPs[i]))
        ) {
          lastSentIPs = [...frontendIPs];
          const userId = 'default-user'; // Ajusta según tu lógica para obtener el userId
          fetch(`https://${localStorage.getItem("tunnelSubdomain") || "tmcwatch"}.loca.lt/api/set-miner-ips`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, ips: frontendIPs }),
          })
            .then(async response => {
              if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
              }
              return response.json();
            })
            .then(data => {
              if (data.success) {
                toast.success('IPs enviadas al servidor con éxito');
              } else {
                console.error('Error al enviar IPs al servidor: ' + (data.error || 'Desconocido'));
              }
            })
            .catch(error => {
              console.error('Error al enviar IPs al servidor:', error);
            });
        }
      };

 socket.onmessage = (event) => {
  try {
    const rawData = JSON.parse(event.data);

    if (rawData.error) {
      toast.error(`Error del servidor: ${rawData.error}`);
      // NO limpiar el estado si hay error
      return;
    }

    const frontendIPs = getFrontendIPs();

    if (!Array.isArray(rawData.miners)) {
      // NO limpiar el estado si la respuesta no tiene mineros
      return;
    }

    const filteredMiners = rawData.miners.filter(miner => frontendIPs.includes(miner.ip));
    const rejectedMiners = rawData.miners.filter(miner => miner.status === 'rejected');
    if (rejectedMiners.length > 0) {
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

    // SIEMPRE actualiza el timestamp, pero solo actualiza los mineros si hay nuevos
    if (data.miners.length > 0) {
      useMinerStore.getState().updateMiners(data);
      callbacks.forEach((cb) => cb(data));
    } else {
      // Solo actualiza el timestamp para que la UI sepa que hubo ciclo, pero no borra mineros
      useMinerStore.setState((state) => ({
        ...state,
        timestamp: data.timestamp || new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.error('Error procesando mensaje del WebSocket:', error);
  }
};

      socket.onclose = (event) => {
        setTimeout(() => {
          connect();
        }, reconnectInterval);
        reconnectInterval = Math.min(reconnectInterval * 1.5, maxReconnectInterval);
      };

      socket.onerror = (error) => {
        socket?.close();
      };
    } catch (error) {
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
    if (!Array.isArray(locations)) return;
    const unsubscribe = connectToMinerAPI(locations);
    return () => unsubscribe();
  }, [locations, localStorage.getItem("tunnelSubdomain")]);

  return {
    data: {
      miners: miners || [],
      timestamp: timestamp || new Date().toISOString(),
    },
  };
}