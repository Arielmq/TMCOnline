
export interface MinerData {
  IP: string;
  Status: string;
  MinerType: string;
  PowerVersion: string;
  MACAddr: string;
  ErrorCode?: string;
  UpTime: string;
  Elapsed: string;
  THSRT: number;
  THSAvg: number;
  Efficiency: number;
  Power: number;
  VersionInfo: string;
  ChipType: string;
  FreqAvg: number;
  HashBoardTemp: string;
  EnvTemp: number;
  Volt: number;
  SpdIn: number;
  SpdOut: number;
  Performance: string;
  ActivePool: string;
  RejectRate: number;
  LastValidWork: string;
  Pool1: string;
  Worker1: string;
  Pool2: string;
  Worker2: string;
  Pool3: string;
  Worker3: string;
}

export interface LocationData {
  id: string;
  name: string;
  panels: PanelData[];
}

export interface PanelData {
  id: string;
  number: number;
  miners: MinerData[];
}
