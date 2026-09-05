/**
 * LEARNING — Dijkstra's algorithm
 * -------------------------------
 * We want the cheapest path from origin to destination on the road graph.
 *
 * Cost of an edge = travel minutes * delayFactor from the predictor.
 * Blocked roads (delayFactor >= 20) are skipped so we get an *alternate*.
 *
 * Dijkstra repeatedly expands the currently cheapest unfinished node.
 * For a highway network of ~20 nodes this is instant. For a full OSM
 * extract you would use A* (same idea + a straight-line heuristic).
 */
import type { Junction, RoadSegment } from "../data/types";
import type { RoadRisk } from "./predict";

export type RouteHop = {
  roadId: string;
  from: string;
  to: string;
  km: number;
  minutes: number;
  accessibility: RoadRisk["accessibility"];
};

export type RoutePlan = {
  ok: boolean;
  nodes: string[];
  hops: RouteHop[];
  totalKm: number;
  totalMinutes: number;
  message: string;
};

const AVG_KMH = 38; // hill-road average, not plains expressway

function undirectedEdges(roads: RoadSegment[]) {
  const list: { road: RoadSegment; from: string; to: string }[] = [];
  for (const road of roads) {
    list.push({ road, from: road.from, to: road.to });
    list.push({ road, from: road.to, to: road.from });
  }
  return list;
}

export function planRoute(
  origin: string,
  destination: string,
  roads: RoadSegment[],
  risks: RoadRisk[],
  junctions: Junction[],
): RoutePlan {
  if (origin === destination) {
    return { ok: true, nodes: [origin], hops: [], totalKm: 0, totalMinutes: 0, message: "Already at destination" };
  }
  const ids = new Set(junctions.map((j) => j.id));
  if (!ids.has(origin) || !ids.has(destination)) {
    return { ok: false, nodes: [], hops: [], totalKm: 0, totalMinutes: 0, message: "Unknown origin or destination" };
  }

  const riskByRoad = new Map(risks.map((r) => [r.roadId, r]));
  const adj = new Map<string, { road: RoadSegment; to: string; cost: number; minutes: number }[]>();
  for (const id of ids) adj.set(id, []);

  for (const { road, from, to } of undirectedEdges(roads)) {
    const risk = riskByRoad.get(road.id);
    const delay = risk?.delayFactor ?? 1;
    if (delay >= 20) continue;
    const minutes = (road.km / AVG_KMH) * 60 * delay;
    adj.get(from)!.push({ road, to, cost: minutes, minutes });
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, { node: string; road: RoadSegment; minutes: number }>();
  for (const id of ids) dist.set(id, Infinity);
  dist.set(origin, 0);

  const pending = new Set(ids);
  while (pending.size) {
    let u: string | null = null;
    let best = Infinity;
    for (const id of pending) {
      const d = dist.get(id)!;
      if (d < best) {
        best = d;
        u = id;
      }
    }
    if (u === null || best === Infinity) break;
    pending.delete(u);
    if (u === destination) break;
    for (const edge of adj.get(u)!) {
      const next = dist.get(u)! + edge.cost;
      if (next < dist.get(edge.to)!) {
        dist.set(edge.to, next);
        prev.set(edge.to, { node: u, road: edge.road, minutes: edge.minutes });
      }
    }
  }

  if (!prev.has(destination) && origin !== destination) {
    return {
      ok: false,
      nodes: [],
      hops: [],
      totalKm: 0,
      totalMinutes: 0,
      message: "No open corridor — district is currently inaccessible. Use air / river / wait for restoration.",
    };
  }

  const nodes: string[] = [destination];
  const hopsRev: RouteHop[] = [];
  let cursor = destination;
  while (cursor !== origin) {
    const step = prev.get(cursor);
    if (!step) break;
    const risk = riskByRoad.get(step.road.id);
    hopsRev.push({
      roadId: step.road.id,
      from: step.node,
      to: cursor,
      km: step.road.km,
      minutes: Math.round(step.minutes),
      accessibility: risk?.accessibility ?? "open",
    });
    cursor = step.node;
    nodes.push(cursor);
  }
  nodes.reverse();
  hopsRev.reverse();

  const totalKm = hopsRev.reduce((s, h) => s + h.km, 0);
  const totalMinutes = hopsRev.reduce((s, h) => s + h.minutes, 0);
  return {
    ok: true,
    nodes,
    hops: hopsRev,
    totalKm,
    totalMinutes,
    message: `Alternate / optimal corridor ${totalKm} km, ~${Math.round(totalMinutes / 60)} h ${totalMinutes % 60} min`,
  };
}
