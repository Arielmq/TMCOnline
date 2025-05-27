import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useMinerApi } from '@/hooks/useMinerApi';

// Mapeo de letras a ubicaciones
const locationMap = {
  Z: 'za',
  A: 'ap',
  T: 'tx',
  H: 'hu',
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
      id: 'za',
      name: 'Za',
      panels: [
        { id: 'za-panel-a', number: 'A', miners: [] },
        { id: 'za-panel-b', number: 'B', miners: [] },
        { id: 'za-panel-c', number: 'C', miners: [] },
        { id: 'za-panel-d', number: 'D', miners: [] },
      ],
    },
    {
      id: 'ap',
      name: 'Ap',
      panels: [
        { id: 'ap-panel-a', number: 'A', miners: [] },
        { id: 'ap-panel-b', number: 'B', miners: [] },
        { id: 'ap-panel-c', number: 'C', miners: [] },
        { id: 'ap-panel-d', number: 'D', miners: [] },
      ],
    },
    {
      id: 'tx',
      name: 'Tx',
      panels: [
        { id: 'tx-panel-a', number: 'A', miners: [] },
        { id: 'tx-panel-b', number: 'B', miners: [] },
        { id: 'tx-panel-c', number: 'C', miners: [] },
        { id: 'tx-panel-d', number: 'D', miners: [] },
      ],
    },
    {
      id: 'hu',
      name: 'Hu',
      panels: [
        { id: 'hu-panel-a', number: 'A', miners: [] },
        { id: 'hu-panel-b', number: 'B', miners: [] },
        { id: 'hu-panel-c', number: 'C', miners: [] },
        { id: 'hu-panel-d', number: 'D', miners: [] },
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

  // Validate minerApiData
  const isValidMinerApiData = (data) => {
    return (
      data &&
      Array.isArray(data.miners) &&
      data.miners.length > 0 &&
      data.miners.some((miner) => miner.ip && miner.status === 'fulfilled')
    );
  };

  // Parse worker string
  const parseWorker = (worker) => {
    try {
      const match = worker.match(/\.([ZATH])([A-D])(\d{3})/);
      if (!match) {
        console.warn(`Invalid worker: ${worker}`);
        return null;
      }
      const [, locationLetter, panelLetter, slotStr] = match;
      const location = locationMap[locationLetter];
      const panel = panelMap[panelLetter];
      const slot = parseInt(slotStr, 10);
      if (slot < 1 || slot > 120) {
        console.warn(`Slot out of range: ${slot} in worker ${worker}`);
        return null;
      }
      return { location, panel, slot };
    } catch (error) {
      console.error(`Error parsing worker ${worker}:`, error);
      return null;
    }
  };

  // Process miner data incrementally
  const processedLocations = useMemo(() => {
    if (!minerApiData || !isValidMinerApiData(minerApiData)) {
      console.log('No valid minerApiData, retaining previous locations');
      return locations;
    }

    console.log('Processing minerApiData:', minerApiData);

    // Create a deep copy of current locations to avoid mutating state directly
    const newLocations = JSON.parse(JSON.stringify(locations));

    // Process new miners
    const convertedMiners = minerApiData.miners
      .filter((apiMiner) => apiMiner.status === 'fulfilled')
      .map((apiMiner, index) => {
        const minerData = apiMiner.data || {};
        const worker = minerData.pool?.worker || '';
        const parsed = worker ? parseWorker(worker) : {
          location: 'za',
          panel: 'panel-a',
          slot: index + 1
        };

        const hashrateAvg =
          minerData.summary?.hashrateAvg ??
          (minerData.hashboards?.reduce((sum, hb) => sum + (hb.hashrate || 0), 0) * 1e6) ??
          0;

        return {
          IP: apiMiner.ip || 'N/A',
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
          UpTime: minerData.summary?.elapsed && typeof minerData.summary.elapsed === 'number'
            ? `${Math.floor(minerData.summary.elapsed / 86400)}d ${Math.floor(
                (minerData.summary.elapsed % 86400) / 3600
              )}:${Math.floor((minerData.summary.elapsed % 3600) / 60).toString().padStart(2, '0')}`
            : 'N/A',
          LastValidWork: minerData.timestamp ? new Date(minerData.timestamp).toLocaleString() : 'N/A',
          PowerVersion: minerData.psu?.model || 'N/A',
          ErrorCode: minerData.error || '',
          VersionInfo: '',
          RejectRate: minerData.pool?.['Pool Rejected%'] ?? 0,
          ActivePool: '',
          Elapsed: '',
          Pool1: '',
          Pool2: '',
          Pool3: '',
          Worker2: '',
          Worker3: '',
          location: parsed?.location || 'za',
          panel: parsed?.panel || 'panel-a',
          slot: parsed?.slot || index + 1,
        };
      });

    if (convertedMiners.length === 0) {
      console.warn('No valid miners to process, retaining previous locations');
      return locations;
    }

    // Clear existing miners in panels to avoid duplicates
    newLocations.forEach((location) => {
      location.panels.forEach((panel) => {
        panel.miners = [];
      });
    });

    // Assign new miners to locations and panels
    convertedMiners.forEach((miner) => {
      const locationId = miner.location || 'za';
      const panelId = miner.panel ? `${locationId}-${miner.panel}` : `${locationId}-panel-a`;
      const slot = miner.slot || convertedMiners.indexOf(miner) + 1;

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
          // Replace or add miner based on IP and slot
          const existingMinerIndex = panel.miners.findIndex(
            (m) => m.IP === miner.IP && m.slot === miner.slot
          );
          if (existingMinerIndex !== -1) {
            panel.miners[existingMinerIndex] = miner;
          } else {
            panel.miners.push(miner);
          }
        }
      }
    });

    // Sort miners by slot in each panel
    newLocations.forEach((location) => {
      location.panels.forEach((panel) => {
        panel.miners.sort((a, b) => (a.slot || 0) - (b.slot || 0));
      });
    });

    return newLocations;
  }, [minerApiData, locations]);

  // Update locations when processedLocations changes
  useEffect(() => {
    if (processedLocations !== locations) {
      setLocations(processedLocations);
      console.log('Updated locations with processed data:', processedLocations);
    }
  }, [processedLocations]);

  // Initialize locations from localStorage only if no WebSocket data
  useEffect(() => {
    if (minerApiData && isValidMinerApiData(minerApiData)) {
      console.log('Skipping localStorage initialization due to available WebSocket data');
      return;
    }

    const savedMiners = localStorage.getItem('miners');
    if (savedMiners) {
      try {
        const parsedMiners = JSON.parse(savedMiners);
        if (Array.isArray(parsedMiners) && parsedMiners.length > 0) {
          const newLocations = createEmptyLocations();
          const convertedMiners = parsedMiners
            .filter((miner) => miner.ip && miner.status === 'fulfilled')
            .map((miner, index) => {
              const worker = miner.data?.pool?.worker || '';
              const parsed = worker ? parseWorker(worker) : {
                location: 'za',
                panel: 'panel-a',
                slot: index + 1
              };
              return {
                IP: miner.ip || 'N/A',
                Status: miner.data?.summary?.hashrateAvg > 0 ? 'Running' : 'Suspended',
                MinerType: miner.data?.minerInfo?.minerType || 'Unknown',
                MACAddr: miner.data?.minerInfo?.macAddress || 'N/A',
                THSRT: miner.data?.summary?.hashrateAvg ? miner.data.summary.hashrateAvg / 1e6 : 0,
                THSAvg: miner.data?.summary?.hashrateAvg ? miner.data.summary.hashrateAvg / 1e6 : 0,
                EnvTemp: miner.data?.summary?.envTemp ?? miner.data?.psu?.temperature ?? 0,
                Efficiency: miner.data?.summary?.powerRate ?? 0,
                Power: miner.data?.summary?.power ?? miner.data?.psu?.power ?? 0,
                SpdIn: miner.data?.summary?.fanSpeedIn ?? miner.data?.psu?.fanSpeed ?? 0,
                SpdOut: miner.data?.summary?.fanSpeedOut ?? miner.data?.psu?.fanSpeed ?? 0,
                Worker1: worker || 'N/A',
                ChipType: miner.data?.minerInfo?.serialNumber || 'N/A',
                FreqAvg: miner.data?.hashboards?.[0]?.chipFrequency ?? 0,
                HashBoardTemp: miner.data?.hashboards
                  ?.map((hb) => (hb.temperature ? hb.temperature.toFixed(1) : '0'))
                  .join('_') || '0',
                Volt: miner.data?.psu?.voltage ?? 0,
                Performance: 'Normal',
                UpTime: miner.data?.summary?.elapsed && typeof miner.data.summary.elapsed === 'number'
                  ? `${Math.floor(miner.data.summary.elapsed / 86400)}d ${Math.floor(
                      (miner.data.summary.elapsed % 86400) / 3600
                    )}:${Math.floor((miner.data.summary.elapsed % 3600) / 60).toString().padStart(2, '0')}`
                  : 'N/A',
                LastValidWork: miner.data?.timestamp ? new Date(miner.data.timestamp).toLocaleString() : 'N/A',
                PowerVersion: miner.data?.psu?.model || 'N/A',
                ErrorCode: miner.data?.error || '',
                VersionInfo: '',
                RejectRate: miner.data?.pool?.['Pool Rejected%'] ?? 0,
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
            });

          convertedMiners.forEach((miner) => {
            const locationId = miner.location || 'za';
            const panelId = miner.panel ? `${locationId}-${miner.panel}` : `${locationId}-panel-a`;
            const slot = miner.slot || convertedMiners.indexOf(miner) + 1;

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

          newLocations.forEach((location) => {
            location.panels.forEach((panel) => {
              panel.miners.sort((a, b) => (a.slot || 0) - (b.slot || 0));
            });
          });

          setLocations(newLocations);
          console.log('Initialized locations from localStorage:', newLocations);
        }
      } catch (error) {
        console.error('Error parsing localStorage miners:', error);
      }
    }
  }, [minerApiData]);

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

  const uploadCSV = async (file) => {
    try {
      const text = await file.text();
      toast.success('CSV file uploaded successfully');
    } catch (error) {
      console.error('Error uploading CSV file:', error);
      toast.error('Error uploading CSV file');
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
};