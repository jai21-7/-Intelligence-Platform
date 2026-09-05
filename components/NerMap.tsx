"use client";

import { useMemo } from "react";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip } from "react-leaflet";
import type { Snapshot } from "@/lib/store/state";
import "leaflet/dist/leaflet.css";

const COLORS: Record<string, string> = {
  open: "#34d399",
  watch: "#fbbf24",
  restricted: "#fb923c",
  blocked: "#f87171",
};

export function NerMap({
  data,
  highlightRoadIds = [],
}: {
  data: Snapshot;
  highlightRoadIds?: string[];
}) {
  const riskByRoad = useMemo(() => new Map(data.risks.map((r) => [r.roadId, r])), [data.risks]);

  return (
    <MapContainer
      center={[26.2, 92.8]}
      zoom={6}
      minZoom={5}
      maxZoom={12}
      scrollWheelZoom
      className="h-[70vh] min-h-[420px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {data.roads.map((road) => {
        const risk = riskByRoad.get(road.id);
        const status = risk?.accessibility ?? "open";
        const highlighted = highlightRoadIds.includes(road.id);
        return (
          <Polyline
            key={road.id}
            positions={road.path.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{
              color: highlighted ? "#38bdf8" : COLORS[status],
              weight: highlighted ? 7 : 4,
              opacity: 0.9,
            }}
          >
            <Popup>
              <strong>{road.name}</strong>
              <br />
              {status} · risk {risk?.score ?? "—"} · {road.km} km
              <br />
              {risk?.reasons.join(" · ")}
            </Popup>
          </Polyline>
        );
      })}
      {data.districts.map((d) => {
        const st = data.districtStatus.find((x) => x.districtId === d.id);
        return (
          <CircleMarker
            key={d.id}
            center={[d.hq.lat, d.hq.lng]}
            radius={d.remote ? 7 : 9}
            pathOptions={{
              color: st?.reachable ? "#6ee7b7" : "#fda4af",
              fillColor: st?.reachable ? "#064e3b" : "#7f1d1d",
              fillOpacity: 0.9,
            }}
          >
            <Tooltip>{d.name}</Tooltip>
            <Popup>
              <strong>{d.name}</strong>
              <br />
              {st?.reachable ? `${st.minutesFromHub} min from Guwahati` : "Inaccessible from hub"}
            </Popup>
          </CircleMarker>
        );
      })}
      {data.vehicles.map((v) => (
        <CircleMarker
          key={v.id}
          center={[v.position.lat, v.position.lng]}
          radius={6}
          pathOptions={{ color: "#e0f2fe", fillColor: "#0ea5e9", fillOpacity: 1 }}
        >
          <Popup>
            {v.plate} · {v.cargo}
            <br />
            {v.status} · ETA {v.etaMinutes} min
          </Popup>
        </CircleMarker>
      ))}
      {data.incidents.map((inc) => (
        <CircleMarker
          key={inc.id}
          center={[inc.position.lat, inc.position.lng]}
          radius={8}
          pathOptions={{ color: "#fecdd3", fillColor: "#e11d48", fillOpacity: 0.85 }}
        >
          <Popup>
            {inc.kind}: {inc.note}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
