"use client";

import { useI18n } from "@/components/LocaleProvider";
import { useSnapshot } from "@/components/SnapshotProvider";
import { NER_STATES } from "@/lib/data/ner-network";

function Pill({ status }: { status: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs pill-${status}`}>{status}</span>;
}

export default function DashboardPage() {
  const { tr } = useI18n();
  const { data, loading, error } = useSnapshot();

  if (loading || !data) {
    return <p className="text-slate-400">{error ?? "Loading NER snapshot…"}</p>;
  }

  const blocked = data.risks.filter((r) => r.accessibility === "blocked").length;
  const inaccessible = data.districtStatus.filter((d) => !d.reachable).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label={tr("kpiDistricts")} value={String(data.districts.length)} />
        <Kpi label={tr("kpiBlocked")} value={String(blocked)} warn={blocked > 0} />
        <Kpi label={tr("kpiInaccessible")} value={String(inaccessible)} warn={inaccessible > 0} />
        <Kpi label={tr("kpiVehicles")} value={String(data.vehicles.length)} />
        <Kpi label={tr("kpiAlerts")} value={String(data.alerts.length)} warn />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-3 font-display text-xl">{tr("connectivity")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-2">District</th>
                  <th>State</th>
                  <th>From Guwahati</th>
                  <th>Incoming roads</th>
                </tr>
              </thead>
              <tbody>
                {data.districtStatus.map((d) => (
                  <tr key={d.districtId} className="border-t border-white/5">
                    <td className="py-2">
                      {d.name} {d.remote && <span className="text-xs text-amber-200">remote</span>}
                    </td>
                    <td>{NER_STATES.find((s) => s.id === d.stateId)?.code}</td>
                    <td>
                      {d.reachable ? (
                        <span>{d.minutesFromHub} min</span>
                      ) : (
                        <span className="text-rose-300">inaccessible</span>
                      )}
                    </td>
                    <td>
                      <Pill status={d.worstIncoming} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-3 font-display text-xl">{tr("bottlenecks")}</h2>
            <ul className="space-y-2 text-sm">
              {data.risks
                .filter((r) => r.accessibility !== "open")
                .slice(0, 6)
                .map((r) => {
                  const road = data.roads.find((x) => x.id === r.roadId);
                  return (
                    <li key={r.roadId} className="rounded-lg bg-white/5 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <span>{road?.name}</span>
                        <Pill status={r.accessibility} />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{r.reasons[0]}</p>
                    </li>
                  );
                })}
            </ul>
          </div>
          <div className="card">
            <h2 className="mb-3 font-display text-xl">{tr("emergency")}</h2>
            <p className="text-sm text-slate-300">
              Hub is Guwahati (Kamrup Metro). Open corridors from the hub are the disaster-time spine.
              Blocked Himalayan axes (Tawang, NH-306, Kohima–Imphal) need restoration or airlift.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 font-display text-xl">{tr("supplies")}</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data.vehicles.map((v) => (
            <div key={v.id} className="rounded-xl border border-white/10 p-3">
              <p className="text-xs uppercase tracking-wide text-emerald-300">{v.cargo}</p>
              <p className="font-medium">{v.plate}</p>
              <p className="text-sm text-slate-400">
                {v.origin} → {v.destination} · {v.status} · ETA {v.etaMinutes} min
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-emerald-400" style={{ width: `${Math.round(v.progress * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 font-display text-3xl ${warn ? "text-amber-300" : "text-white"}`}>{value}</p>
    </div>
  );
}
