
import { MinerData } from "@/types/miner";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<MinerData>[] = [
  {
    accessorKey: "IP",
    header: "IP",
  },
  {
    accessorKey: "Status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("Status") as string;
      return (
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            status === "Running" ? "bg-green-500" : 
            status === "Warning" || status === "ToolVerLower" ? "bg-yellow-500" : 
            "bg-red-500"
          }`} />
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "MinerType",
    header: "Tipo",
  },
  {
    accessorKey: "THSRT",
    header: "THS RT",
    cell: ({ row }) => {
      return <span>{row.getValue("THSRT")} TH/s</span>;
    }
  },
  {
    accessorKey: "THSAvg",
    header: "THS Avg",
    cell: ({ row }) => {
      return <span>{row.getValue("THSAvg")} TH/s</span>;
    }
  },
  {
    accessorKey: "Efficiency",
    header: "Eficiencia",
    cell: ({ row }) => {
      const efficiency = row.getValue("Efficiency") as number;
      return <span>{efficiency >= 1000 ? "N/A" : `${efficiency} W/T`}</span>;
    },
  },
  {
    accessorKey: "Power",
    header: "Potencia",
    cell: ({ row }) => {
      return <span>{row.getValue("Power")} W</span>;
    },
  },
  {
    accessorKey: "EnvTemp",
    header: "Temp",
    cell: ({ row }) => {
      return <span>{row.getValue("EnvTemp")}°C</span>;
    },
  },
  {
    accessorKey: "Performance",
    header: "Rendimiento",
  },
  {
    accessorKey: "UpTime",
    header: "Uptime",
  },
];
