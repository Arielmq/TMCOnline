import { useMinerApiContext } from "@/context/MinerApiContext";

export function useMinerApi() {
  return useMinerApiContext();
}

export default useMinerApi;