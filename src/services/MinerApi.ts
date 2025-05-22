// src/hooks/useMinerApi.ts
import { useEffect } from 'react';
import { MinerApiResponse } from '@/types/miner-api';
import { toast } from 'sonner';
import { useMinerStore } from '@/store/minerStore';

// URL del servidor WebSocket
const WS_URL = 'wss://550e-138-84-54-223.ngrok-free.app';
let socket: WebSocket | null = null;
let reconnectInterval = 5000; // Tiempo de reconexión inicial (5 segundos)
const maxReconnectInterval = 50000; // Máximo tiempo de reconexión (50 segundos)
let callbacks: ((data: MinerApiResponse) => void)[] = [];

// Función para conectar al WebSocket
export function connectToMinerAPI(callback?: (data: MinerApiResponse) => void): () => void {
  if (callback) {
    callbacks.push(callback);
  }

  // Si ya hay una conexión, usarla
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
        reconnectInterval = 5000; // Restablecer el intervalo de reconexión
      };

      socket.onmessage = (event) => {
        try {
          const data: MinerApiResponse = JSON.parse(event.data);
          console.log('Datos recibidos del WebSocket:', data);

          // Actualizar la store con los nuevos datos
          useMinerStore.getState().updateMiners(data);

          // Ejecutar callbacks adicionales
          callbacks.forEach((cb) => cb(data));
        } catch (error) {
          console.error('Error al procesar mensaje del WebSocket:', error);
          toast.error('Error al procesar datos del servidor');
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket cerrado. Código:', event.code, 'Razón:', event.reason);
        console.log('Intentando reconexión en', reconnectInterval / 1000, 'segundos...');
        toast.warning('Conexión perdida, intentando reconectar...');

        // Reconectar con backoff exponencial
        setTimeout(() => {
          connect();
        }, reconnectInterval);

        // Incrementar el tiempo de reconexión
        reconnectInterval = Math.min(reconnectInterval * 1.5, maxReconnectInterval);
      };

      socket.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        toast.error('Error en la conexión con el servidor');
        socket?.close();
      };
    } catch (error) {
      console.error('Error al conectar con el WebSocket:', error);
      toast.error('No se pudo establecer conexión con el servidor');

      // Intentar reconectar
      setTimeout(() => {
        connect();
      }, reconnectInterval);

      // Incrementar el tiempo de reconexión
      reconnectInterval = Math.min(reconnectInterval * 1.5, maxReconnectInterval);
    }
  };

  // Iniciar conexión
  connect();

  // Devolver función para desconectar
  return () => {
    if (callback) {
      callbacks = callbacks.filter((cb) => cb !== callback);
    }

    // Si no hay más suscriptores, cerrar la conexión WebSocket
    if (callbacks.length === 0 && socket) {
      socket.close();
      socket = null;
    }
  };
}

// Hook para consumir datos de la API
export function useMinerApi() {
  const miners = useMinerStore((state) => state.miners);
  const timestamp = useMinerStore((state) => state.timestamp);

  useEffect(() => {
    const unsubscribe = connectToMinerAPI();
    return () => unsubscribe();
  }, []);

  return { data: { miners, timestamp } };
}