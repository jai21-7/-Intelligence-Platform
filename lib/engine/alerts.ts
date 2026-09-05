/**
 * LEARNING — alerts are just data derived from other data.
 * Never invent alerts in the UI; generate them in one place so the
 * dashboard, map, and SMS/WhatsApp later all say the same thing.
 */
import type { Alert, Incident, Vehicle } from "../data/types";
import type { DistrictStatus } from "./accessibility";
import type { RoadRisk } from "./predict";
import { ROADS } from "../data/ner-network";

export function buildAlerts(
  risks: RoadRisk[],
  districts: DistrictStatus[],
  vehicles: Vehicle[],
  incidents: Incident[],
): Alert[] {
  const now = new Date().toISOString();
  const alerts: Alert[] = [];

  for (const risk of risks) {
    if (risk.accessibility === "blocked" || risk.accessibility === "restricted") {
      const road = ROADS.find((r) => r.id === risk.roadId);
      alerts.push({
        id: `road-${risk.roadId}`,
        level: risk.accessibility === "blocked" ? "critical" : "warning",
        title: risk.accessibility === "blocked" ? "Corridor blocked" : "High-risk corridor",
        detail: `${road?.name ?? risk.roadId}: ${risk.reasons.join("; ")}`,
        roadId: risk.roadId,
        at: now,
      });
    }
  }

  for (const d of districts) {
    if (!d.reachable) {
      alerts.push({
        id: `iso-${d.districtId}`,
        level: "critical",
        title: "District inaccessible from Guwahati hub",
        detail: `${d.name} has no open road path. Prioritise air / river / restoration.`,
        districtId: d.districtId,
        at: now,
      });
    }
  }

  for (const v of vehicles) {
    if (v.status === "delayed" || v.etaMinutes > 400) {
      alerts.push({
        id: `veh-${v.id}`,
        level: v.cargo === "medicines" ? "critical" : "warning",
        title: `Delayed ${v.cargo} consignment`,
        detail: `${v.plate} ${v.origin} → ${v.destination}, ETA ${v.etaMinutes} min`,
        vehicleId: v.id,
        at: now,
      });
    }
  }

  for (const inc of incidents) {
    alerts.push({
      id: `inc-${inc.id}`,
      level: inc.kind === "landslide" || inc.kind === "flood" ? "critical" : "info",
      title: `Field incident: ${inc.kind.replace("_", " ")}`,
      detail: inc.note,
      roadId: inc.roadId,
      at: inc.at,
    });
  }

  return alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.level] - order[b.level];
  });
}
