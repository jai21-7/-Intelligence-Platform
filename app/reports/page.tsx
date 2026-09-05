"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { useSnapshot } from "@/components/SnapshotProvider";
import { allQueued, flushOutbox, queueReport, type PendingReport } from "@/lib/offline/outbox";
import type { Incident } from "@/lib/data/types";

export default function ReportsPage() {
  const { tr } = useI18n();
  const { data, online, setData } = useSnapshot();
  const [queued, setQueued] = useState<PendingReport[]>([]);
  const [note, setNote] = useState("Landslide debris covering half carriageway.");
  const [districtId, setDistrictId] = useState("tawang");
  const [roadId, setRoadId] = useState("ar-ita-tawang");
  const [kind, setKind] = useState<Incident["kind"]>("landslide");
  const [photoDataUrl, setPhotoDataUrl] = useState<string>();
  const [status, setStatus] = useState("");

  useEffect(() => {
    allQueued().then(setQueued).catch(() => setQueued([]));
  }, []);

  useEffect(() => {
    async function onOnline() {
      await flushOutbox();
      setQueued(await allQueued());
      const res = await fetch("/api/snapshot");
      setData(await res.json());
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [setData]);

  if (!data) return <p className="text-slate-400">Loading…</p>;

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function submit() {
    const district = data!.districts.find((d) => d.id === districtId)!;
    const payload: PendingReport = {
      id: `local-${Date.now()}`,
      districtId,
      roadId,
      kind,
      note,
      reporter: "field-officer",
      lat: district.hq.lat,
      lng: district.hq.lng,
      photoDataUrl,
      at: new Date().toISOString(),
    };

    if (!online) {
      await queueReport(payload);
      setQueued(await allQueued());
      setStatus("Saved on this device. Will sync when network returns.");
      return;
    }

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        districtId,
        roadId,
        kind,
        note,
        reporter: payload.reporter,
        photoDataUrl,
        position: { lat: payload.lat, lng: payload.lng },
      }),
    });
    const json = await res.json();
    setData(json.snapshot);
    setStatus("Synced to the central dashboard.");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form
        className="card space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <h2 className="font-display text-xl">{tr("reportTitle")}</h2>
        <label className="block text-sm">
          District
          <select className="mt-1 w-full rounded-md bg-slate-900 p-2" value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
            {data.districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Road
          <select className="mt-1 w-full rounded-md bg-slate-900 p-2" value={roadId} onChange={(e) => setRoadId(e.target.value)}>
            {data.roads.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Kind
          <select
            className="mt-1 w-full rounded-md bg-slate-900 p-2"
            value={kind}
            onChange={(e) => setKind(e.target.value as Incident["kind"])}
          >
            <option value="landslide">landslide</option>
            <option value="flood">flood</option>
            <option value="rainfall">rainfall</option>
            <option value="road_damage">road damage</option>
            <option value="congestion">congestion</option>
            <option value="bridge_closed">bridge closed</option>
          </select>
        </label>
        <label className="block text-sm">
          {tr("note")}
          <textarea className="mt-1 w-full rounded-md bg-slate-900 p-2" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <label className="block text-sm">
          {tr("photo")}
          <input
            className="mt-1 block w-full text-sm"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => onPhoto(e.target.files?.[0])}
          />
        </label>
        {photoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoDataUrl} alt="Field upload preview" className="max-h-40 rounded-lg" />
        )}
        <button className="btn-primary" type="submit">
          {tr("submitReport")}
        </button>
        {status && <p className="text-sm text-emerald-300">{status}</p>}
      </form>

      <div className="space-y-3">
        <div className="card">
          <h3 className="font-display text-lg">Offline outbox ({queued.length})</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            {queued.map((q) => (
              <li key={q.id}>
                {q.kind} · {q.note}
              </li>
            ))}
            {queued.length === 0 && <li>Nothing waiting. Toggle airplane mode to try the outbox.</li>}
          </ul>
        </div>
        <div className="card">
          <h3 className="font-display text-lg">Synced reports</h3>
          <ul className="mt-2 space-y-3">
            {data.reports.map((r) => (
              <li key={r.id} className="rounded-lg bg-white/5 p-2 text-sm">
                <p>{r.note}</p>
                <p className="text-xs text-slate-400">
                  {r.reporter} · {r.position.lat.toFixed(3)}, {r.position.lng.toFixed(3)}
                </p>
                {r.photoDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.photoDataUrl} alt="" className="mt-2 max-h-32 rounded" />
                )}
              </li>
            ))}
            {data.incidents.map((inc) => (
              <li key={inc.id} className="rounded-lg bg-white/5 p-2 text-sm">
                <p className="text-amber-200">{inc.kind}</p>
                <p>{inc.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
