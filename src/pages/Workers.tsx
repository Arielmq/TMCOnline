
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useMiner } from "@/context/MinerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload } from "lucide-react";
import { DataTable } from "@/components/workers/DataTable";
import { columns } from "@/components/workers/columns";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Workers = () => {
  const { 
    locations, 
    selectedLocation, 
    selectedPanel,
    selectLocation, 
    selectPanel,
    uploadCSV 
  } = useMiner();
  
  const [activeTab, setActiveTab] = useState<string>("");
  
  useEffect(() => {
    if (selectedLocation && selectedLocation.panels.length > 0) {
      setActiveTab(selectedLocation.panels[0].id);
    }
  }, [selectedLocation]);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadCSV(file);
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const panel = selectedLocation?.panels.find(p => p.id === value) || null;
    selectPanel(panel?.id || null);
  };
  
  if (!selectedLocation) {
    return (
      <MainLayout>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Workers</h1>
            <p className="text-muted-foreground">Selecciona una ubicación desde el Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center px-4 py-2 bg-tmcblue-light text-white rounded-md cursor-pointer hover:bg-tmcblue transition-colors">
              <Upload className="mr-2 h-5 w-5" />
              <span>Importar CSV</span>
              <Input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
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
                <p>Mineros Totales: {location.panels.reduce((acc, panel) => acc + panel.miners.length, 0)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }
  
  const miners = selectedPanel?.miners || [];
  
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
                ? `Panel ${selectedPanel.number}: ${selectedPanel.miners.length} mineros`
                : `${selectedLocation.panels.reduce((acc, panel) => acc + panel.miners.length, 0)} mineros en total`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center px-4 py-2 bg-tmcblue-light text-white rounded-md cursor-pointer hover:bg-tmcblue transition-colors">
            <Upload className="mr-2 h-5 w-5" />
            <span>Importar CSV</span>
            <Input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
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
                Panel {panel.number} ({panel.miners.length})
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {selectedLocation.panels.map(panel => (
          <TabsContent key={panel.id} value={panel.id} className="mt-0">
            <div className="rounded-md border border-border">
              <DataTable columns={columns} data={panel.miners} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </MainLayout>
  );
};

export default Workers;
