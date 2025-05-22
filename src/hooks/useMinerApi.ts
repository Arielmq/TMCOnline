
import { useEffect, useState } from 'react';
import { connectToMinerAPI } from '@/services/MinerApi';
import { MinerApiResponse, MinerApiData, isMinerApiData } from '@/types/miner-api';

export function useMinerApi() {
  const [data, setData] = useState<MinerApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    console.log("Conectando al servidor WebSocket...");
    
    const disconnect = connectToMinerAPI((newData: MinerApiResponse) => {
      console.log("Datos recibidos del servidor:", newData);
      
      // Verificar que realmente hay datos antes de procesarlos
      if (newData && newData.miners && Array.isArray(newData.miners) && newData.miners.length > 0) {
        setData(newData);
      } else {
        console.log("No se recibieron datos válidos del servidor");
        // No actualizamos el estado con datos vacíos, mantenemos el estado anterior
        // o mostramos un error si es la primera carga
        if (!data) {
          setError(new Error("No se recibieron datos de mineros"));
        }
      }
      
      setLoading(false);
    });
    
    return () => {
      console.log("Desconectando del servidor WebSocket");
      disconnect();
    };
  }, []);

  // Función auxiliar para encontrar un minero por IP
  const getMinerByIp = (ip: string): MinerApiData | null => {
    if (!data) return null;
    
    const minerItem = data.miners.find(m => m.ip === ip);
    if (!minerItem || minerItem.status !== 'fulfilled') return null;
    
    // Usar el type guard para asegurarnos que tenemos datos válidos
    if (isMinerApiData(minerItem.data)) {
      return minerItem.data;
    }
    
    return null;
  };

  return { data, loading, error, getMinerByIp };
}

export default useMinerApi;
