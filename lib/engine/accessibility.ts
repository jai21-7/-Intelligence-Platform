/**
 * LEARNING — district accessibility
 * A district is reachable if Dijkstra can walk from the logistics hub
 * (Guwahati / Kamrup Metro) without using blocked edges.
 */
import { DISTRICTS, JUNCTIONS, ROADS } from "../data/ner-network";
import type { RoadRisk } from "./predict";
import { planRoute } from "./routing";

export type DistrictStatus = {
  districtId: string;
  name: string;
  stateId: string;
  remote: boolean;
  reachable: boolean;
  minutesFromHub: number | null;
  worstIncoming: RoadRisk["accessibility"];
};

export function districtConnectivity(risks: RoadRisk[]): DistrictStatus[] {
  const riskByRoad = new Map(risks.map((r) => [r.roadId, r]));
  return DISTRICTS.map((d) => {
    const plan = planRoute("kamrup", d.id, ROADS, risks, JUNCTIONS);
    const incoming = ROADS.filter((r) => r.from === d.id || r.to === d.id).map(
      (r) => riskByRoad.get(r.id)?.accessibility ?? "open",
    );
    const rank = { blocked: 3, restricted: 2, watch: 1, open: 0 } as const;
    const worstIncoming = incoming.reduce<RoadRisk["accessibility"]>((w, a) => (rank[a] > rank[w] ? a : w), "open");
    return {
      districtId: d.id,
      name: d.name,
      stateId: d.stateId,
      remote: d.remote,
      reachable: plan.ok,
      minutesFromHub: plan.ok ? plan.totalMinutes : null,
      worstIncoming: d.id === "kamrup" ? "open" : worstIncoming,
    };
  });
}
