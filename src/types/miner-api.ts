
// Estructura para la información del minero
export interface MinerInfo {
  macAddress: string;
  minerType: string;
  serialNumber: string;
  hostname: string;
}

// Estructura para la información del pool
export interface PoolInfo {
  worker: string;
}

// Estructura para la información de hashboards
export interface HashboardInfo {
  slot: number;
  status: string;
  temperature: number;
  chipFrequency: number;
  hashrate: number;
  effectiveChips: number;
  chipTempMin: number;
  chipTempMax: number;
  chipTempAvg: number;
  pcbSn: string;
}

// Estructura para el resumen del minero
export interface SummaryInfo {
  elapsed: number;
  hashrateAvg: number;
  power: number;
  powerRate: number;
  fanSpeedIn: number;
  fanSpeedOut: number;
  envTemp: number;
  powerMode: string;
  factoryGhs: number;
  powerLimit: number;
}

// Estructura para la información de la fuente de alimentación
export interface PsuInfo {
  model: string;
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  fanSpeed: number;
}

// Datos completos de un minero
export interface MinerApiData {
  ip: string;
  minerInfo: MinerInfo;
  pool: PoolInfo;
  hashboards: HashboardInfo[];
  summary: SummaryInfo;
  psu: PsuInfo;
  timestamp: string;
}

// Estructura para errores
export interface MinerApiError {
  error: string;
}

// Estructura para un item de minero en la respuesta
export interface MinerApiResponseItem {
  ip: string;
  status: 'fulfilled' | 'rejected';
  data: MinerApiData | MinerApiError;
}

// Respuesta completa de la API
export interface MinerApiResponse {
  miners: MinerApiResponseItem[];
  timestamp: string;
}

// Función auxiliar para verificar si un objeto es del tipo MinerApiData
export function isMinerApiData(data: any): data is MinerApiData {
  return data && 
         typeof data === 'object' && 
         'minerInfo' in data && 
         'summary' in data && 
         'hashboards' in data && 
         'pool' in data;
}
