import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { connectToMinerAPI } from "@/services/MinerApi";
import { useMiner } from "@/context/MinerContext";
import { MinerApiResponse } from "@/types/miner-api";

type MinerApiContextType = {
  data: MinerApiResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

const MinerApiContext = createContext<MinerApiContextType>({
  data: null,
  loading: true,
  error: null,
  refetch: () => {},
});

export const MinerApiProvider = ({ children }) => {
  const { locations } = useMiner();
  const [data, setData] = useState<MinerApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const disconnectRef = useRef<() => void>();

  const connect = useCallback(() => {
    setLoading(true);
    const safeLocations = Array.isArray(locations) ? locations : [];
    const disconnect = connectToMinerAPI(safeLocations, (newData: MinerApiResponse) => {
      setData(newData);
      setLoading(false);
    });
    disconnectRef.current = disconnect;
  }, [locations]);

  useEffect(() => {
    connect();
    return () => {
      if (disconnectRef.current) disconnectRef.current();
    };
  }, [connect]);

  const refetch = useCallback(() => {
    if (disconnectRef.current) disconnectRef.current();
    connect();
  }, [connect]);

  return (
    <MinerApiContext.Provider value={{ data, loading, error, refetch }}>
      {children}
    </MinerApiContext.Provider>
  );
};

export const useMinerApiContext = () => useContext(MinerApiContext);