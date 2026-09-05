"use client";

import { useSnapshot } from "@/components/SnapshotProvider";

export default function AlertsPage() {
  const { data } = useSnapshot();
  if (!data) return <p className="text-slate-400">Loading alerts…</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        Alerts are generated on the server from risk scores, unreachable districts, late vehicles,
        and field incidents — so SMS, dashboards, and radio rooms can share one list.
      </p>
      {data.alerts.map((a) => (
        <article
          key={a.id}
          className={`card border-l-4 ${
            a.level === "critical" ? "border-l-rose-400" : a.level === "warning" ? "border-l-amber-400" : "border-l-sky-400"
          }`}
        >
          <p className="text-xs uppercase tracking-wide text-slate-400">{a.level}</p>
          <h2 className="font-display text-lg">{a.title}</h2>
          <p className="text-sm text-slate-300">{a.detail}</p>
        </article>
      ))}
    </div>
  );
}
