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
      console.log('Connecting to WebSocket server:', WS_URL);
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        console.log('WebSocket connected');
        toast.success('Connected to monitoring server');
        reconnectInterval = 5000;
      };

      socket.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          console.log('Raw WebSocket data:', rawData);
          const data: MinerApiResponse = {
            ...rawData,
            cycleId: rawData.cycleId || rawData.timestamp,
            miners: rawData.miners.map((miner) => ({
              ...miner,
              ip: miner.ip || `unknown-${Math.random().toString(36).slice(2)}`,
            })),
          };
          console.log('Processed WebSocket data:', data);

          useMinerStore.getState().updateMiners(data);
          callbacks.forEach((cb) => cb(data));
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed. Code:', event.code, 'Reason:', event.reason);
        console.log('Attempting reconnection in', reconnectInterval / 1000, 'seconds...');
        setTimeout(() => {
          connect();
        }, reconnectInterval);
        reconnectInterval = Math.min(reconnectInterval * 1.5, maxReconnectInterval);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket?.close();
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
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