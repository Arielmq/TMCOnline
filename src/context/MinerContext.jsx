import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { db } from "@/firebase";
import { doc, setDoc, collection, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export const MinerContext = createContext({
  locations: [],
  selectedLocation: null,
  selectedPanel: null,
  selectLocation: () => {},
  selectPanel: () => {},
  uploadCSV: async () => {},
  addLocation: () => {},
  addMiner: () => {},
  deleteMiner: () => {},
  updateMiner: () => {},
});

export const MinerProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const { user } = useAuth();

  // Listener en tiempo real de Firestore
  useEffect(() => {
    if (!user) {
      setLocations([]);
      setSelectedLocation(null);
      setSelectedPanel(null);
      return;
    }
    const colRef = collection(db, "users", user.uid, "locations");
    const unsubscribe = onSnapshot(colRef, (querySnapshot) => {
      const locationsArr = [];
      querySnapshot.forEach((doc) => {
        locationsArr.push(doc.data());
      });
      setLocations(locationsArr);

      // Mantener selectedLocation y selectedPanel actualizados
      if (selectedLocation) {
        const updated = locationsArr.find(l => l.id === selectedLocation.id) || null;
        setSelectedLocation(updated);
        if (selectedPanel && updated) {
          const updatedPanel = updated.panels.find(p => p.id === selectedPanel.id) || null;
          setSelectedPanel(updatedPanel);
        }
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, [user]);

  // Seleccionar ubicación
  const selectLocation = (locationId) => {
    if (!locationId) {
      setSelectedLocation(null);
      setSelectedPanel(null);
      return;
    }
    const location = locations.find((l) => l.id === locationId);
    setSelectedLocation(location || null);
    setSelectedPanel(null);
  };

  // Seleccionar panel
  const selectPanel = (panelId) => {
    if (!panelId) {
      setSelectedPanel(null);
      return;
    }
    if (!selectedLocation) {
      setSelectedPanel(null);
      return;
    }
    const panel = selectedLocation.panels.find((p) => p.id === panelId);
    setSelectedPanel(panel || null);
  };

  // Subir CSV (dummy)
  const uploadCSV = async (file) => {
    try {
      const text = await file.text();
      toast.success('Archivo CSV subido exitosamente');
    } catch (error) {
      console.error('Error subiendo archivo CSV:', error);
      toast.error('Error subiendo archivo CSV');
    }
  };

  // Agregar ubicación
  const addLocation = async ({ name, panelsCount, minersPerPanel }) => {
  if (!user) return;
  const colRef = collection(db, "users", user.uid, "locations");
  const id = crypto.randomUUID();
  const newLocation = {
    id,
    name,
    minersPerPanel, // <-- guarda el campo
    panels: Array.from({ length: panelsCount }, (_, i) => ({
      id: crypto.randomUUID(),
      number: i + 1,
      miners: Array.from({ length: minersPerPanel }, () => ({
        id: crypto.randomUUID(),
        IP: "",
      })),
    })),
  };
  await setDoc(doc(colRef, id), newLocation);
  return newLocation;
};
  // Agregar minero(s)
  const addMiner = async ({ locationId, panelId, ips }) => {
  if (!user) return;
  const locationRef = doc(db, "users", user.uid, "locations", locationId);
  const locationSnap = await getDoc(locationRef);
  if (!locationSnap.exists()) return;

  const locationData = locationSnap.data();
  const maxSlots = locationData.minersPerPanel || 60;
  const panels = locationData.panels.map(panel => {
    if (panel.id === panelId) {
      // Copia los mineros para no mutar el array original
      let miners = [...panel.miners];
      let ipIndex = 0;

      // Reemplaza slots vacíos primero
      for (let i = 0; i < miners.length && ipIndex < ips.length; i++) {
        if (!miners[i].IP || miners[i].IP.trim() === "") {
          miners[i] = { ...miners[i], IP: ips[ipIndex] };
          ipIndex++;
        }
      }

      // NO agregar más slots si ya llegaste al máximo
      // Si quedan IPs sin asignar, simplemente las ignoras (o puedes mostrar un toast de "panel lleno")

      // Si por algún motivo hay menos slots que maxSlots (no debería pasar), rellena con slots vacíos
      if (miners.length < maxSlots) {
        miners = [
          ...miners,
          ...Array.from({ length: maxSlots - miners.length }, () => ({
            id: crypto.randomUUID(),
            IP: "",
          })),
        ];
      }

      // Si hay más slots de los que corresponde (por error anterior), recorta
      if (miners.length > maxSlots) {
        miners = miners.slice(0, maxSlots);
      }

      return {
        ...panel,
        miners,
      };
    }
    return panel;
  });

  await updateDoc(locationRef, { panels });
  // El onSnapshot actualizará el estado global
};

  // Eliminar minero
  const deleteMiner = async ({ locationId, panelId, minerId }) => {
    if (!user) return;
    const locationRef = doc(db, "users", user.uid, "locations", locationId);
    const locationSnap = await getDoc(locationRef);
    if (!locationSnap.exists()) return;

    const locationData = locationSnap.data();
    const panels = locationData.panels.map(panel => {
      if (panel.id === panelId) {
        return {
          ...panel,
          miners: panel.miners.filter(miner => miner.id !== minerId),
        };
      }
      return panel;
    });

    await updateDoc(locationRef, { panels });
  };

  // Editar minero
  const updateMiner = async ({ locationId, panelId, minerId, newIp }) => {
    if (!user) return;
    const locationRef = doc(db, "users", user.uid, "locations", locationId);
    const locationSnap = await getDoc(locationRef);
    if (!locationSnap.exists()) return;

    const locationData = locationSnap.data();
    const panels = locationData.panels.map(panel => {
      if (panel.id === panelId) {
        return {
          ...panel,
          miners: panel.miners.map(miner =>
            miner.id === minerId ? { ...miner, IP: newIp } : miner
          ),
        };
      }
      return panel;
    });

    await updateDoc(locationRef, { panels });
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
        addLocation,
        addMiner,
        deleteMiner,
        updateMiner,
      }}
    >
      {children}
    </MinerContext.Provider>
  );
};

export const useMiner = () => useContext(MinerContext);