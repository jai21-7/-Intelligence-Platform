/**
 * LEARNING — Disruption prediction (the "AI" you can read)
 * -------------------------------------------------------
 * We turn several *features* into a single risk number between 0 and 1.
 *
 *   rainfallMm        — from weather API (or our seed)
 *   landslideHistory  — how often this slope has failed
 *   elevationM        — hill roads fail more often
 *   damage            — already-broken pavement
 *   incidents         — live field reports on this road
 *
 * Weights add up to 1.0 so the score stays in range. This is a
 * *linear model* — the same idea as the first layer of many ML models.
 *
 * Production upgrade path:
 *   1. Log (features, did_the_road_close?) every day for a year
 *   2. Train logistic regression or a small gradient-boosted tree
 *   3. Keep this function as the fallback when the model is unavailable
 */
import type { Accessibility, Incident, RoadSegment, WeatherSnapshot } from "../data/types";

export type RoadRisk = {
  roadId: string;
  score: number;
  accessibility: Accessibility;
  delayFactor: number;
  reasons: string[];
};

const WEIGHTS = {
  rain: 0.32,
  history: 0.28,
  elevation: 0.18,
  damage: 0.12,
  incidents: 0.1,
} as const;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function rainFeature(mm: number) {
  // 0 mm -> 0, 100 mm/day -> 1 (very high for NER monsoon bursts)
  return clamp01(mm / 100);
}

function elevationFeature(metres: number) {
  return clamp01(metres / 2500);
}

export function predictRoadRisk(
  road: RoadSegment,
  weather: WeatherSnapshot | undefined,
  incidents: Incident[],
): RoadRisk {
  const rain = weather?.rainfallMm ?? 0;
  const onThisRoad = incidents.filter((i) => i.roadId === road.id);
  const incidentHit = onThisRoad.some((i) => i.kind === "landslide" || i.kind === "flood" || i.kind === "bridge_closed")
    ? 1
    : onThisRoad.length
      ? 0.55
      : 0;

  const parts = {
    rain: rainFeature(rain),
    history: road.landslideHistory,
    elevation: elevationFeature(road.elevationM),
    damage: road.damage,
    incidents: incidentHit,
  };

  const score = clamp01(
    WEIGHTS.rain * parts.rain +
      WEIGHTS.history * parts.history +
      WEIGHTS.elevation * parts.elevation +
      WEIGHTS.damage * parts.damage +
      WEIGHTS.incidents * parts.incidents,
  );

  const reasons: string[] = [];
  if (parts.rain > 0.4) reasons.push(`Heavy rainfall (${rain} mm)`);
  if (parts.history > 0.5) reasons.push("Frequent landslide / flood history");
  if (parts.elevation > 0.4) reasons.push(`High-elevation corridor (${road.elevationM} m)`);
  if (parts.damage > 0.4) reasons.push("Existing pavement / cut-slope damage");
  if (incidentHit > 0) reasons.push(`${onThisRoad.length} live incident(s)`);
  if (reasons.length === 0) reasons.push("Corridor currently within normal monsoon envelope");

  const accessibility: Accessibility =
    score >= 0.72 || incidentHit === 1 ? "blocked" : score >= 0.55 ? "restricted" : score >= 0.38 ? "watch" : "open";

  // Delay multiplier used by the router (1.0 = free flow).
  const delayFactor =
    accessibility === "blocked" ? 99 : accessibility === "restricted" ? 2.4 : accessibility === "watch" ? 1.45 : 1.0;

  return { roadId: road.id, score: Number(score.toFixed(3)), accessibility, delayFactor, reasons };
}

export function predictAll(
  roads: RoadSegment[],
  weather: WeatherSnapshot[],
  incidents: Incident[],
): RoadRisk[] {
  const weatherByRoad = new Map(weather.map((w) => [w.roadId, w]));
  return roads.map((road) => predictRoadRisk(road, weatherByRoad.get(road.id), incidents));
}
