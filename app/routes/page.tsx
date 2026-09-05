"use client";

import { useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { useSnapshot } from "@/components/SnapshotProvider";
import type { RoutePlan } from "@/lib/engine/routing";
import dynamic from "next/dynamic";

const NerMap = dynamic(() => import("@/components/NerMap").then((m) => m.NerMap), { ssr: false });

export default function RoutesPage() {
  const { tr } = useI18n();
  const { data } = useSnapshot();
  const [origin, setOrigin] = useState("kamrup");
  const [destination, setDestination] = useState("imphal-west");
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [busy, setBusy] = useState(false);

  if (!data) return <p className="text-slate-400">Loading…</p>;

  async function suggest() {
    setBusy(true);
    const res = await fetch("/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination }),
    });
    setPlan(await res.json());
    setBusy(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="card lg:col-span-2 space-y-3">
        <h2 className="font-display text-xl">{tr("planRoute")}</h2>
        <p className="text-sm text-slate-400">
          The engine skips blocked edges and multiplies travel time by the predicted delay factor.
          Try Guwahati → Tawang to see an inaccessible Himalayan axis.
        </p>
        <label className="block text-sm">
          {tr("origin")}
          <select className="mt-1 w-full rounded-md bg-slate-900 p-2" value={origin} onChange={(e) => setOrigin(e.target.value)}>
            {data.districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          {tr("destination")}
          <select
            className="mt-1 w-full rounded-md bg-slate-900 p-2"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            {data.districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-primary" type="button" disabled={busy} onClick={suggest}>
          {busy ? "Planning…" : tr("planRoute")}
        </button>
        {plan && (
          <div className="rounded-xl bg-white/5 p-3 text-sm">
            <p className={plan.ok ? "text-emerald-300" : "text-rose-300"}>{plan.message}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              {plan.hops.map((h) => (
                <li key={`${h.roadId}-${h.from}`}>
                  {data.roads.find((r) => r.id === h.roadId)?.name} · {h.km} km · {h.minutes} min · {h.accessibility}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      <div className="lg:col-span-3 overflow-hidden rounded-2xl border border-white/10">
        <NerMap data={data} highlightRoadIds={plan?.hops.map((h) => h.roadId) ?? []} />
      </div>
    </div>
  );
}
