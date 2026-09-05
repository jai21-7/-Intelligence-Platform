"use client";

import { useSnapshot } from "@/components/SnapshotProvider";
import { useI18n } from "@/components/LocaleProvider";
import dynamic from "next/dynamic";

const NerMap = dynamic(() => import("@/components/NerMap").then((m) => m.NerMap), { ssr: false });

const CARGO_HELP: Record<string, string> = {
  medicines: "Cold-chain / PHC replenishment — delay is a public-health risk",
  food: "PDS and relief rations",
  construction: "Roads, bridges, housing material for infrastructure missions",
  agriculture: "Perishable produce leaving farm-gate markets",
};

export default function VehiclesPage() {
  const { data, tick } = useSnapshot();
  const { tr } = useI18n();
  if (!data) return <p className="text-slate-400">Loading fleet…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-400">
          Each consignment is a GPS track along planned junctions. Press “{tr("tickGps")}” to move
          trucks. A real device would POST lat/lng instead of using the simulator.
        </p>
        <button className="btn-primary" type="button" onClick={() => tick()}>
          {tr("tickGps")}
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <NerMap data={data} />
        </div>
        <ul className="space-y-3">
          {data.vehicles.map((v) => (
            <li key={v.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-sky-300">{v.cargo}</p>
                  <p className="font-display text-lg">{v.plate}</p>
                  <p className="text-sm text-slate-400">{CARGO_HELP[v.cargo]}</p>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs">{v.status}</span>
              </div>
              <p className="mt-2 text-sm">
                {v.origin} → {v.destination} · last ping {v.position.lat.toFixed(3)}, {v.position.lng.toFixed(3)}
              </p>
              <p className="text-sm text-slate-400">ETA {v.etaMinutes} min · progress {Math.round(v.progress * 100)}%</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
