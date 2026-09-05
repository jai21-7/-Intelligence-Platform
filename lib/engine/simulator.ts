/**
 * LEARNING — GPS without a real truck
 * Each tick, push the vehicle a little further along its planned node list.
 * In production, replace tickVehicles() with POSTs from a GPS device:
 *   { vehicleId, lat, lng, timestamp }
 */
import { JUNCTIONS, ROADS } from "../data/ner-network";
import type { LatLng, Vehicle } from "../data/types";
import type { RoadRisk } from "./predict";
import { planRoute } from "./routing";

export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

export function vehiclePosition(vehicle: Vehicle): LatLng {
  const nodes = vehicle.route
    .map((id) => JUNCTIONS.find((j) => j.id === id)?.position)
    .filter((p): p is LatLng => Boolean(p));
  if (nodes.length === 0) return { lat: 26.14, lng: 91.73 };
  if (nodes.length === 1) return nodes[0];
  const scaled = vehicle.progress * (nodes.length - 1);
  const i = Math.min(nodes.length - 2, Math.floor(scaled));
  const t = scaled - i;
  return interpolate(nodes[i], nodes[i + 1], t);
}

export function tickVehicles(vehicles: Vehicle[], risks: RoadRisk[]): Vehicle[] {
  return vehicles.map((v) => {
    if (v.status === "arrived") return v;
    const plan = planRoute(v.origin, v.destination, ROADS, risks, JUNCTIONS);
    const blocked = !plan.ok;
    const nextProgress = Math.min(1, v.progress + (blocked ? 0.002 : 0.018));
    const status: Vehicle["status"] = blocked
      ? "delayed"
      : nextProgress >= 1
        ? "arrived"
        : plan.nodes.join(",") !== v.route.join(",")
          ? "rerouted"
          : "moving";
    return {
      ...v,
      route: plan.ok ? plan.nodes : v.route,
      progress: nextProgress,
      status,
      etaMinutes: plan.ok ? Math.max(0, Math.round(plan.totalMinutes * (1 - nextProgress))) : v.etaMinutes + 15,
    };
  });
}
