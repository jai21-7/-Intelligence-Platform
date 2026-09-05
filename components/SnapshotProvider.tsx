"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Snapshot } from "@/lib/store/state";

const SnapshotContext = createContext<{
  data: Snapshot | null;
  loading: boolean;
  error: string | null;
  online: boolean;
  refresh: () => Promise<void>;
  tick: () => Promise<void>;
  pullWeather: () => Promise<void>;
  reset: () => Promise<void>;
  setData: (s: Snapshot) => void;
} | null>(null);

export function SnapshotProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/snapshot", { cache: "no-store" });
      if (!res.ok) throw new Error("snapshot failed");
      setData(await res.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "network error");
    } finally {
      setLoading(false);
    }
  }, []);

  const tick = useCallback(async () => {
    const res = await fetch("/api/tick", { method: "POST" });
    setData(await res.json());
  }, []);

  const pullWeather = useCallback(async () => {
    const res = await fetch("/api/weather", { method: "POST" });
    const json = await res.json();
    setData(json.snapshot);
  }, []);

  const reset = useCallback(async () => {
    const res = await fetch("/api/reset", { method: "POST" });
    setData(await res.json());
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <SnapshotContext.Provider value={{ data, loading, error, online, refresh, tick, pullWeather, reset, setData }}>
      {children}
    </SnapshotContext.Provider>
  );
}

export function useSnapshot() {
  const ctx = useContext(SnapshotContext);
  if (!ctx) throw new Error("useSnapshot must be inside SnapshotProvider");
  return ctx;
}
