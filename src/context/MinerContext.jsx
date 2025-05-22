import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import { toast } from 'sonner';
import { useMinerApi } from '@/hooks/useMinerApi';


// Mapeo de letras a ubicaciones
const locationMap = {
  Z: 'zacatelco',
  A: 'apizaco',
  T: 'tlaxcala',
  H: 'huamantla',
};

// Mapeo de letras a paneles
const panelMap = {
  A: 'panel-a',
  B: 'panel-b',
  C: 'panel-c',
  D: 'panel-d',
};

// Crear ubicaciones vacías con paneles A-D
const createEmptyLocations = () => {
  const locations = [
    {
      id: 'zacatelco',
      name: 'Zacatelco',
      panels: [
        { id: 'zacatelco-panel-a', number: 'A', miners: [] },
        { id: 'zacatelco-panel-b', number: 'B', miners: [] },
        { id: 'zacatelco-panel-c', number: 'C', miners: [] },
        { id: 'zacatelco-panel-d', number: 'D', miners: [] },
      ],
    },
    {
      id: 'apizaco',
      name: 'Apizaco',
      panels: [
        { id: 'apizaco-panel-a', number: 'A', miners: [] },
        { id: 'apizaco-panel-b', number: 'B', miners: [] },
        { id: 'apizaco-panel-c', number: 'C', miners: [] },
        { id: 'apizaco-panel-d', number: 'D', miners: [] },
      ],
    },
    {
      id: 'tlaxcala',
      name: 'Tlaxcala',
      panels: [
        { id: 'tlaxcala-panel-a', number: 'A', miners: [] },
        { id: 'tlaxcala-panel-b', number: 'B', miners: [] },
        { id: 'tlaxcala-panel-c', number: 'C', miners: [] },
        { id: 'tlaxcala-panel-d', number: 'D', miners: [] },
      ],
    },
    {
      id: 'huamantla',
      name: 'Huamantla',
      panels: [
        { id: 'huamantla-panel-a', number: 'A', miners: [] },
        { id: 'huamantla-panel-b', number: 'B', miners: [] },
        { id: 'huamantla-panel-c', number: 'C', miners: [] },
        { id: 'huamantla-panel-d', number: 'D', miners: [] },
      ],
    },
  ];
  return locations;
};


export const MinerContext = createContext({
  locations: [],
  selectedLocation: null,
  selectedPanel: null,
  selectLocation: () => {},
  selectPanel: () => {},
  uploadCSV: async () => {},
});

export const MinerProvider = ({ children }) => {
  const [locations, setLocations] = useState(createEmptyLocations());
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const { data: minerApiData } = useMinerApi();

  const selectLocation = (locationId) => {
    if (!locationId) {
      setSelectedLocation(null);
      setSelectedPanel(null);
      return;
    }
    const location = locations.find((loc) => loc.id === locationId) || null;
    setSelectedLocation(location);
  };

  const selectPanel = (panelId) => {
    if (!panelId) {
      setSelectedPanel(null);
      return;
    }
    for (const location of locations) {
      const panel = location.panels.find((p) => p.id === panelId);
      if (panel) {
        setSelectedPanel(panel);
        return;
      }
    }
    setSelectedPanel(null);
  };

  // Función para parsear el worker
  const parseWorker = (worker) => {
    try {
      // Aceptar caracteres adicionales después de los 3 dígitos
      const match = worker.match(/\.([ZATH])([A-D])(\d{3})/);
      if (!match) {
        console.warn(`Worker no válido: ${worker}`);
        return null;
      }
      const [, locationLetter, panelLetter, slotStr] = match;
      const location = locationMap[locationLetter];
      const panel = panelMap[panelLetter];
      const slot = parseInt(slotStr, 10);
      if (slot < 1 || slot > 120) {
        console.warn(`Slot fuera de rango: ${slot} en worker ${worker}`);
        return null;
      }
      return { location, panel, slot };
    } catch (error) {
      console.error(`Error al parsear worker ${worker}:`, error);
      return null;
    }
  };

  // Verificar si el dato es MinerApiData
  const isMinerApiData = (data) => {
    return data && typeof data === 'object';
  };

  // Actualizar datos de mineros desde la API
  useEffect(() => {
    if (!minerApiData) return;

    console.log('Actualizando con datos del servidor:', minerApiData);

    // Crear ubicaciones vacías
    const newLocations = createEmptyLocations();

    // Procesar mineros
    const convertedMiners = [];
    minerApiData.miners.forEach((apiMiner) => {
      if (apiMiner.status !== 'fulfilled') {
        console.warn(`Minero excluido: ${apiMiner.ip}. Estado: ${apiMiner.status}`);
        return;
      }

      const minerData = apiMiner.data;
      if (!isMinerApiData(minerData)) {
        console.warn(`Minero excluido: ${apiMiner.ip}. Datos inválidos:`, minerData);
        return;
      }

      // Verificar campos requeridos y loguear si faltan
      const missingFields = [];
      if (!minerData.minerInfo) missingFields.push('minerInfo');
      if (!minerData.hashboards) missingFields.push('hashboards');
      if (!minerData.pool) missingFields.push('pool');
      if (!minerData.summary) missingFields.push('summary');
      if (!minerData.psu) missingFields.push('psu');
      if (missingFields.length > 0) {
        console.warn(`Minero ${apiMiner.ip} con campos faltantes:`, missingFields);
      }

      const worker = minerData.pool?.worker || '';
      const parsed = worker ? parseWorker(worker) : null;

      const hashrateAvg =
        minerData.summary?.hashrateAvg ??
        (minerData.hashboards?.reduce((sum, hb) => sum + (hb.hashrate || 0), 0) * 1e6) ??
        0;

      const convertedMiner = {
        IP: minerData.ip || 'N/A',
        Status: minerData.hashboards?.some((b) => b.status !== 'Alive')
          ? 'Warning'
          : minerData.hashboards
          ? 'Running'
          : 'Stopped',
        MinerType: minerData.minerInfo?.minerType || 'Unknown',
        MACAddr: minerData.minerInfo?.macAddress || 'N/A',
        THSRT: typeof hashrateAvg === 'number' ? hashrateAvg / 1e6 : 0,
        THSAvg: typeof hashrateAvg === 'number' ? hashrateAvg / 1e6 : 0,
        EnvTemp: minerData.summary?.envTemp ?? minerData.psu?.temperature ?? 0,
        Efficiency: minerData.summary?.powerRate ?? 0,
        Power: minerData.summary?.power ?? minerData.psu?.power ?? 0,
        SpdIn: minerData.summary?.fanSpeedIn ?? minerData.psu?.fanSpeed ?? 0,
        SpdOut: minerData.summary?.fanSpeedOut ?? minerData.psu?.fanSpeed ?? 0,
        Worker1: worker || 'N/A',
        ChipType: minerData.minerInfo?.serialNumber || 'N/A',
        FreqAvg: minerData.hashboards?.[0]?.chipFrequency ?? 0,
        HashBoardTemp: minerData.hashboards
          ?.map((hb) => (hb.temperature ? hb.temperature.toFixed(1) : '0'))
          .join('_') || '0',
        Volt: minerData.psu?.voltage ?? 0,
        Performance: 'Normal',
        UpTime:
          minerData.summary?.elapsed && typeof minerData.summary.elapsed === 'number'
            ? `${Math.floor(minerData.summary.elapsed / 86400)}d ${Math.floor(
                (minerData.summary.elapsed % 86400) / 3600
              )}:${Math.floor((minerData.summary.elapsed % 3600) / 60).toString().padStart(2, '0')}`
            : 'N/A',
        LastValidWork: minerData.timestamp ? new Date(minerData.timestamp).toLocaleString() : 'N/A',
        PowerVersion: minerData.psu?.model || 'N/A',
        ErrorCode: missingFields.length > 0 ? `Datos incompletos: ${missingFields.join(', ')}` : minerData.error || '',
        VersionInfo: '',
        RejectRate: 0,
        ActivePool: '',
        Elapsed: '',
        Pool1: '',
        Pool2: '',
        Pool3: '',
        Worker2: '',
        Worker3: '',
        location: parsed?.location,
        panel: parsed?.panel,
        slot: parsed?.slot,
      };

      convertedMiners.push(convertedMiner);
    });

    // Asignar mineros a ubicaciones y paneles
    convertedMiners.forEach((miner) => {
      const locationId = miner.location || 'unknown';
      const panelId = miner.panel ? `${locationId}-${miner.panel}` : null;
      const slot = miner.slot;

      // Encontrar ubicación
      let location = newLocations.find((loc) => loc.id === locationId);
      if (!location && locationId !== 'unknown') {
        location = {
          id: locationId,
          name: locationId.charAt(0).toUpperCase() + locationId.slice(1),
          panels: [
            { id: `${locationId}-panel-a`, number: 'A', miners: [] },
            { id: `${locationId}-panel-b`, number: 'B', miners: [] },
            { id: `${locationId}-panel-c`, number: 'C', miners: [] },
            { id: `${locationId}-panel-d`, number: 'D', miners: [] },
          ],
        };
        newLocations.push(location);
      }

      if (location && panelId && slot) {
        const panel = location.panels.find((p) => p.id === panelId);
        if (panel) {
          panel.miners.push(miner);
        }
      }
    });

    // Ordenar mineros por slot en cada panel
    newLocations.forEach((location) => {
      location.panels.forEach((panel) => {
        panel.miners.sort((a, b) => (a.slot || 0) - (b.slot || 0));
      });
    });

    setLocations(newLocations);

    const totalMiners = convertedMiners.length;
    if (totalMiners > 0) {
      toast.success(`Conectado a ${totalMiners} mineros`);
    } else if (minerApiData.miners.length > 0) {
      toast.warning('No se encontraron mineros con datos válidos');
    } else {
      toast.info('Esperando datos de mineros...');
    }
  }, [minerApiData]);

  const uploadCSV = async (file) => {
    try {
      const text = await file.text();
      toast.success('Archivo CSV cargado correctamente');
    } catch (error) {
      console.error('Error al cargar el archivo CSV:', error);
      toast.error('Error al cargar el archivo CSV');
    }
  };

  return (
    <MinerContext.Provider
      value={{
        locations,
        selectedLocation,
        selectedPanel,
        selectLocation,
        selectPanel,
        uploadCSV,
      }}
    >
      {children}
    </MinerContext.Provider>
  );
};

export function useMiner() {
  const context = useContext(MinerContext);
  if (context === undefined) {
    throw new Error('useMiner must be used within a MinerProvider');
  }
  return context;
}