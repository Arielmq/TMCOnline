import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useMiner } from "@/context/MinerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Pencil, Trash, X } from "lucide-react";
import { DataTable } from "@/components/workers/DataTable";
import { columns } from "@/components/workers/columns";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMinerApi } from "@/hooks/useMinerApi";
import { log } from "console";


// Helper para transformar los datos crudos del WebSocket a la estructura de la tabla
// Helper para transformar los datos crudos del WebSocket a la estructura de la tabla
const mapMinerApiToWorkerRow = (minerApiItem) => {
  if (!minerApiItem || minerApiItem.status !== "fulfilled" || !minerApiItem.data) return null;
  const data = minerApiItem.data;

  // Sumar los dos primeros dígitos (parte entera en TH/s) de cada hashrate de los slots 0, 1 y 2
  const thsrtSum = (data.hashboards || [])
    .slice(0, 3)
    .reduce((acc, hb) => {
      const ths = Math.floor((hb.hashrate || 0) / 1_000_000);
      return acc + ths;
    }, 0);

  return {
    IP: data.ip,
    Status: "Running",
    MinerType: data.minerInfo?.minerType || "",
    MACAddr: data.minerInfo?.macAddress || "N/A",
    VersionInfo: data.psu?.model || "N/A", // O usa otro campo si tienes versión de firmware
    ChipType: data.psu?.model || "N/A",   // O usa otro campo si tienes tipo de chip
    HashBoardTemp: data.hashboards?.[0]?.temperature ?? "N/A",
    SpdIn: data.summary?.fanSpeedIn ?? "N/A",
    SpdOut: data.summary?.fanSpeedOut ?? "N/A",
    ActivePool: data.pool?.worker || "N/A", // O usa el campo correcto si tienes el pool activo
    Worker1: data.pool?.worker || "N/A",
    RejectRate: data.summary?.rejectRate ?? "N/A", // Si tienes este dato, si no pon "N/A"
    THSRT: thsrtSum,
    THSAvg: data.summary?.hashrateAvg ?? "",
    Efficiency: data.summary?.powerRate ?? "",
    Power: data.summary?.power ?? "",
    EnvTemp: data.hashboards?.[0]?.temperature ?? "",
    UpTime: data.summary?.elapsed ?? "",
    Performance: data.summary?.hashrateAvg ?? "",
  };
};
const Workers = () => {
  const {
    locations,
    selectedLocation: selectedLocationState,
    selectedPanel: selectedPanelState,
    selectLocation,
    selectPanel,
    uploadCSV,
    addLocation,
    addMiner,
    deleteMiner,
    updateMiner,
  } = useMiner();

  // Siempre busca la referencia actualizada de la ubicación y el panel
  const selectedLocation = locations.find(l => l.id === selectedLocationState?.id) || null;
  const selectedPanel = selectedLocation?.panels.find(p => p.id === selectedPanelState?.id) || null;

  const [minerIPs, setMinerIPs] = useState(['']);
  const [editingMiner, setEditingMiner] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddMinerDialogOpen, setIsAddMinerDialogOpen] = useState(false);
  const [selectedPanelForMiner, setSelectedPanelForMiner] = useState(null);
  const [newMinerIP, setNewMinerIP] = useState("");

  const [newLocation, setNewLocation] = useState({
    place: "",
    panels: "",
    minersPerPanel: "",
  });

  // Trae los datos crudos del WebSocket
  const { data: minerApiData } = useMinerApi();
  console.log(minerApiData, "ESTA ES TODA MI DATA");

  // Mapea los datos crudos a la estructura de la tabla
  const workersRows = useMemo(() => (
    (minerApiData?.miners || [])
      .map(mapMinerApiToWorkerRow)
      .filter(Boolean)
  ), [minerApiData]);

  // Columnas con acciones de editar y eliminar, reciben panelId
  const columnsWithActions = (panelId) => [
    ...columns,
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditMiner(row.original, panelId);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMiner(row.original, panelId);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Cambia el tab activo cuando cambia la ubicación seleccionada
  useEffect(() => {
    if (selectedLocation && selectedLocation.panels.length > 0) {
      const firstPanel = selectedLocation.panels[0];
      setActiveTab(firstPanel.id);
      selectPanel(firstPanel.id);
    }
    // eslint-disable-next-line
  }, [selectedLocation?.id]);

  const handleAddMiner = () => {
    const validIPs = minerIPs.filter(ip => ip.trim() !== '');
    if (validIPs.length === 0) {
      toast.error("Por favor ingrese al menos una IP");
      return;
    }

    if (!selectedLocation || !selectedPanelForMiner) {
      toast.error("Error al agregar minero");
      return;
    }

    const panel = selectedLocation.panels.find(p => p.id === selectedPanelForMiner);
    const maxMiners = selectedLocation.minersPerPanel || 60;
    const currentCount = panel.miners.filter(m => m.IP && m.IP.trim() !== "").length;
    if (currentCount + validIPs.length > maxMiners) {
      toast.error(`El panel está lleno (${currentCount}/${maxMiners}). Elimina máquinas para agregar más.`);
      return;
    }

    addMiner({
      locationId: selectedLocation.id,
      panelId: selectedPanelForMiner,
      ips: validIPs
    });

    setMinerIPs(['']);
    setIsAddMinerDialogOpen(false);
    toast.success("Mineros agregados exitosamente");
  };

  const handleAddIPInput = () => {
    setMinerIPs([...minerIPs, '']);
  };

  const handleRemoveIPInput = (index) => {
    if (minerIPs.length > 1) {
      const newIPs = minerIPs.filter((_, i) => i !== index);
      setMinerIPs(newIPs);
    }
  };

  const handleIPChange = (index, value) => {
    const newIPs = [...minerIPs];
    newIPs[index] = value;
    setMinerIPs(newIPs);
  };

  // Recibe panelId para borrar del panel correcto
  const handleDeleteMiner = (miner, panelId) => {
    if (!selectedLocation) return;
    deleteMiner({
      locationId: selectedLocation.id,
      panelId: panelId,
      minerId: miner.id
    });
    toast.success("Minero eliminado exitosamente");
  };

  // Recibe panelId para editar del panel correcto
  const handleEditMiner = (miner, panelId) => {
    setEditingMiner({ ...miner, panelId });
    setNewMinerIP(miner.IP);
    setIsAddMinerDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!newMinerIP) {
      toast.error("Por favor ingrese una IP");
      return;
    }
    if (!selectedLocation || !editingMiner) return;

    updateMiner({
      locationId: selectedLocation.id,
      panelId: editingMiner.panelId,
      minerId: editingMiner.id,
      newIp: newMinerIP
    });

    setNewMinerIP("");
    setEditingMiner(null);
    setIsAddMinerDialogOpen(false);
    toast.success("Minero actualizado exitosamente");
  };

  const handleCSVUpload = async (event, panelId) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const ips = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0 && /^\d{1,3}(\.\d{1,3}){3}$/.test(line));
      if (ips.length === 0) {
        toast.error("El archivo no contiene IPs válidas.");
        return;
      }
      if (!selectedLocation) {
        toast.error("Selecciona una ubicación antes de cargar el CSV.");
        return;
      }
      const panel = selectedLocation.panels.find(p => p.id === panelId);
      const maxMiners = selectedLocation.minersPerPanel || 60;
      // CORRIGE AQUÍ:
      const currentCount = panel.miners.filter(m => m.IP && m.IP.trim() !== "").length;

      if (currentCount + ips.length > maxMiners) {
        toast.error(`El panel está lleno (${currentCount}/${maxMiners}). Elimina máquinas para agregar más.`);
        return;
      }

      addMiner({
        locationId: selectedLocation.id,
        panelId,
        ips,
      });
      toast.success(`Se agregaron ${ips.length} IPs desde el CSV.`);
    } catch (err) {
      toast.error("Error leyendo el archivo CSV.");
    }
  };

  const handleAddLocation = () => {
    if (!newLocation.place || !newLocation.panels || !newLocation.minersPerPanel) {
      toast.error("Por favor complete todos los campos");
      return;
    }


    const panelsCount = parseInt(newLocation.panels);
    const minersPerPanel = parseInt(newLocation.minersPerPanel);

    if (isNaN(panelsCount) || isNaN(minersPerPanel)) {
      toast.error("Los valores deben ser números válidos");
      return;
    }

    if (panelsCount <= 0 || minersPerPanel <= 0) {
      toast.error("Los valores deben ser mayores a 0");
      return;
    }

    if (panelsCount > 26) {
      toast.error("Máximo 26 paneles permitidos");
      return;
    }

    if (minersPerPanel > 200) {
      toast.error("Máximo 200 máquinas por panel");
      return;
    }

    addLocation({
      name: newLocation.place,
      panelsCount,
      minersPerPanel, // <-- pasa el nuevo campo
    });

    setNewLocation({ place: "", panels: "", minersPerPanel: "" });
    setIsDialogOpen(false);
    toast.success("Ubicación creada exitosamente");
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (!selectedLocation) return;
    const panel = selectedLocation.panels.find(p => p.id === value);
    if (panel) {
      selectPanel(panel.id);
    }
  };

  if (!selectedLocation) {
    return (
      <MainLayout>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Workers</h1>
            <p className="text-muted-foreground">Selecciona o crea una ubicación</p>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-tmcblue-light hover:bg-tmcblue">
                  <Plus className="mr-2 h-5 w-5" />
                  Agregar Ubicación
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nueva Ubicación</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Nombre de la ubicación"
                    value={newLocation.place}
                    onChange={(e) => setNewLocation({ ...newLocation, place: e.target.value })}
                  />
                  <Input
                    placeholder="Número de paneles"
                    type="number"
                    min="1"
                    max="26"
                    value={newLocation.panels}
                    onChange={(e) => setNewLocation({ ...newLocation, panels: e.target.value })}
                  />
                  <Input
                    placeholder="Cantidad de máquinas por panel"
                    type="number"
                    min="1"
                    max="200" // <-- Cambia aquí el máximo a 200
                    value={newLocation.minersPerPanel}
                    onChange={(e) => setNewLocation({ ...newLocation, minersPerPanel: e.target.value })}
                  />
                  <Button
                    className="w-full bg-tmcblue-light hover:bg-tmcblue"
                    onClick={handleAddLocation}
                  >
                    Crear Ubicación
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map(location => (
            <Card
              key={location.id}
              className="hover:border-tmcblue-light cursor-pointer transition-colors"
              onClick={() => selectLocation(location.id)}
            >
              <CardHeader>
                <CardTitle>{location.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Paneles: {location.panels.length}</p>
                <p>
                  Mineros Totales: {
                    location.panels.reduce(
                      (acc, panel) => acc + panel.miners.filter(m => m.IP && m.IP.trim() !== "").length,
                      0
                    )
                  }
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => selectLocation(null)}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedLocation.name}</h1>
            <p className="text-muted-foreground">
              {selectedPanel
                ? `Panel ${selectedPanel.number}: ${selectedPanel.miners.filter(m => m.IP && m.IP.trim() !== "").length} mineros`
                : `${selectedLocation.panels.reduce((acc, panel) => acc + panel.miners.filter(m => m.IP && m.IP.trim() !== "").length, 0)} mineros en total`}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b mb-4">
          <TabsList className="flex overflow-x-auto">
            {selectedLocation.panels.map(panel => (
              <TabsTrigger
                key={panel.id}
                value={panel.id}
                className="min-w-max"
              >
                Panel {panel.number} ({panel.miners.filter(m => m.IP && m.IP.trim() !== "").length})
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {selectedLocation.panels.map(panel => (
          <TabsContent key={panel.id} value={panel.id} className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-end">
                <span
                  className={`font-semibold text-sm px-2 py-1 rounded ${panel.miners.filter(m => m.IP && m.IP.trim() !== "").length >= (selectedLocation.minersPerPanel || 60)
                    ? "text-red-600"
                    : "text-white-700"
                    }`}
                >
                  {panel.miners.filter(m => m.IP && m.IP.trim() !== "").length}/{selectedLocation.minersPerPanel || 60}
                </span>
                <Button
                  className="bg-tmcblue-light hover:bg-tmcblue"
                  onClick={() => {
                    setSelectedPanelForMiner(panel.id);
                    setIsAddMinerDialogOpen(true);
                    setEditingMiner(null);
                    setMinerIPs(['']);
                  }}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Agregar IP
                </Button>
                <Button
                  asChild
                  className="bg-tmcblue-light hover:bg-tmcblue ml-2"
                >
                  <label>
                    <Plus className="mr-2 h-5 w-5" />
                    Cargar CSV
                    <input
                      type="file"
                      accept=".csv"
                      style={{ display: "none" }}
                      onChange={(e) => handleCSVUpload(e, panel.id)}
                    />
                  </label>
                </Button>

              </div>
              <div className="rounded-md border border-border">
                <DataTable
                  columns={columnsWithActions(panel.id)}
                  data={panel.miners
                    .filter(miner => miner.IP && miner.IP.trim() !== "") // <-- SOLO mineros con IP real
                    .map(miner => {
                      const wsData = workersRows.find(row => row.IP === miner.IP);
                      return wsData
                        ? { ...wsData, id: miner.id, IP: miner.IP }
                        : {
                          id: miner.id,
                          IP: miner.IP,
                          tipo: "",
                          THSRT: "",
                          THSAvg: "",
                          eficiencia: "--",
                          potencia: "--",
                          temp: "--",
                          uptime: "--",
                          rendimiento: "--",
                          status: "offline"
                        };
                    })
                  }

                  key={`${panel.id}-${panel.miners.length}`}
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog
        open={isAddMinerDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setMinerIPs(['']);
            setEditingMiner(null);
          }
          setIsAddMinerDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMiner ? "Editar IP" : "Agregar Nuevas IPs"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingMiner ? (
              <Input
                placeholder="Dirección IP"
                value={newMinerIP}
                onChange={(e) => setNewMinerIP(e.target.value)}
              />
            ) : (
              <>
                {minerIPs.map((ip, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="Dirección IP"
                      value={ip}
                      onChange={(e) => handleIPChange(index, e.target.value)}
                    />
                    {minerIPs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveIPInput(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {index === minerIPs.length - 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleAddIPInput}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </>
            )}
            <Button
              className="w-full bg-tmcblue-light hover:bg-tmcblue"
              onClick={editingMiner ? handleSaveEdit : handleAddMiner}
            >
              {editingMiner ? "Guardar Cambios" : "Agregar IPs"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Workers;