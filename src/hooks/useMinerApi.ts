import { useEffect, useState } from 'react';
import { connectToMinerAPI } from '@/services/MinerApi';
import { MinerApiResponse, MinerApiData, isMinerApiData } from '@/types/miner-api';
import { useMiner } from '@/context/MinerContext';

export function useMinerApi() {
  const { locations } = useMiner();
  const [data, setData] = useState<MinerApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // ENVÍA LAS IPS AL BACKEND CADA VEZ QUE CAMBIAN
  useEffect(() => {
    const safeLocations = Array.isArray(locations) ? locations : [];
    const ips = safeLocations.flatMap(loc =>
      Array.isArray(loc.panels)
        ? loc.panels.flatMap(panel =>
            Array.isArray(panel.miners)
              ? panel.miners.map(miner => miner.IP)
              : []
          )
        : []
    );
    if (ips.length > 0) {
      fetch('http://tmcwatch.loca.lt/api/set-miner-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'frontend', // Puedes poner el userId real si lo tienes
          ips,
        }),
      })
        .then(res => res.json())
        .then(res => {
          if (!res.success) {
            console.error('Error enviando IPs al backend:', res.error);
          } else {
            console.log('IPs enviadas al backend:', res.ips);
          }
        })
        .catch(err => {
          console.error('Error enviando IPs al backend:', err);
        });
    }
  }, [locations]);

   useEffect(() => {
    setLoading(true);
    const safeLocations = Array.isArray(locations) ? locations : [];
    const disconnect = connectToMinerAPI(safeLocations, (newData: MinerApiResponse) => {
      if (newData && newData.miners && Array.isArray(newData.miners) && newData.miners.length > 0) {
        setData(newData);
      } else {
        if (!data) setError(new Error("No se recibieron datos de mineros"));
      }
      setLoading(false);
    });
    return () => disconnect();
  }, [locations]);



  // Función auxiliar para encontrar un minero por IP
const getMinerByIp = (ip: string): MinerApiData | null => {
    if (!data) return null;
    const minerItem = data.miners.find(m => m.ip === ip);
    if (!minerItem || minerItem.status !== 'fulfilled') return null;
    if (isMinerApiData(minerItem.data)) return minerItem.data;
    return null;
  };

  return { data, loading, error, getMinerByIp };
}


export default useMinerApi;