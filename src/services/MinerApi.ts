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
    console.log('IPs del frontend obtenidas:', ips);
    return ips;
  };

  const connect = () => {
    try {
      const WS_URL = getWsUrl();
      console.log('Conectando al servidor WebSocket:', WS_URL);
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        console.log('WebSocket conectado');
        toast.success('Conectado al servidor de monitoreo');
        reconnectInterval = 5000;

        // Enviar las IPs al servidor después de conectar
        const frontendIPs = getFrontendIPs();
        console.log('Listo para recibir datos del WebSocket. IPs:', frontendIPs);

        if (frontendIPs.length > 0) {
          const userId = 'default-user'; // Ajusta según tu lógica para obtener el userId
          console.log('Enviando IPs al servidor:', { userId, ips: frontendIPs });
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
              console.log('Respuesta del servidor al enviar IPs:', data);
              if (data.success) {
                toast.success('IPs enviadas al servidor con éxito');
              } else {
               console.error('Error al enviar IPs al servidor: ' + (data.error || 'Desconocido'));
              }
            })
            .catch(error => {
              console.error('Error al enviar IPs al servidor:', error);
          
            });
        } else {
          console.warn('No hay IPs válidas para enviar al servidor');
         
        }
      };

      socket.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          console.log('Datos crudos del WebSocket recibidos:', JSON.stringify(rawData, null, 2));

          if (rawData.error) {
            console.error('Error recibido del WebSocket:', rawData.error);
            toast.error(`Error del servidor: ${rawData.error}`);
            return;
          }

          const frontendIPs = getFrontendIPs();
          console.log('IPs del frontend para filtrado:', frontendIPs);

          if (!Array.isArray(rawData.miners)) {
            console.warn('rawData.miners no es un arreglo:', rawData.miners);
            return;
          }

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
              console.log('No se recibieron datos para las IPs configuradas');
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
  }, [locations, localStorage.getItem("tunnelSubdomain")]); // Se reconecta si cambia el subdominio

  return {
    data: {
      miners: miners || [],
      timestamp: timestamp || new Date().toISOString(),
    },
  };
}