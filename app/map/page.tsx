"use client";

import dynamic from "next/dynamic";
import { useSnapshot } from "@/components/SnapshotProvider";

const NerMap = dynamic(() => import("@/components/NerMap").then((m) => m.NerMap), {
  ssr: false,
  loading: () => <div className="card h-[70vh]">Loading GIS tiles…</div>,
});

export default function MapPage() {
  const { data, loading } = useSnapshot();
  if (loading || !data) return <p className="text-slate-400">Loading map…</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        Green = open, amber = watch, orange = restricted, red = blocked. Blue dots are GPS
        consignments. Click any line for the risk explanation.
      </p>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <NerMap data={data} />
      </div>
    </div>
  );
}
