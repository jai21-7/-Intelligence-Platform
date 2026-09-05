/**
 * LEARNING — the live store
 * Next.js API routes can import this module. In a single Node server
 * process, the `globalThis` singleton keeps state between requests.
 * (On Vercel serverless you would use Redis / Postgres instead.)
 */
import { DISTRICTS, JUNCTIONS, NER_STATES, ROADS } from "../data/ner-network";
import { SEED_INCIDENTS, SEED_VEHICLES, SEED_WEATHER } from "../data/seed";
import type { FieldReport, Incident, Vehicle, WeatherSnapshot } from "../data/types";
import { districtConnectivity } from "../engine/accessibility";
import { buildAlerts } from "../engine/alerts";
import { predictAll } from "../engine/predict";
import { planRoute } from "../engine/routing";
import { tickVehicles, vehiclePosition } from "../engine/simulator";

export type Snapshot = ReturnType<typeof computeSnapshot>;

type LiveState = {
  weather: WeatherSnapshot[];
  incidents: Incident[];
  vehicles: Vehicle[];
  reports: FieldReport[];
};

const g = globalThis as typeof globalThis & { __nerStore?: LiveState };

function initial(): LiveState {
  return {
    weather: structuredClone(SEED_WEATHER),
    incidents: structuredClone(SEED_INCIDENTS),
    vehicles: structuredClone(SEED_VEHICLES),
    reports: [],
  };
}

export function getState(): LiveState {
  if (!g.__nerStore) g.__nerStore = initial();
  return g.__nerStore;
}

export function resetState() {
  g.__nerStore = initial();
}

function computeSnapshot() {
  const state = getState();
  const risks = predictAll(ROADS, state.weather, state.incidents);
  const districts = districtConnectivity(risks);
  const vehicles = state.vehicles.map((v) => ({ ...v, position: vehiclePosition(v) }));
  const alerts = buildAlerts(risks, districts, state.vehicles, state.incidents);
  return {
    states: NER_STATES,
    districts: DISTRICTS,
    junctions: JUNCTIONS,
    roads: ROADS,
    weather: state.weather,
    incidents: state.incidents,
    reports: state.reports,
    risks,
    districtStatus: districts,
    vehicles,
    alerts,
    hub: "kamrup",
  };
}

export function snapshot() {
  return computeSnapshot();
}

export function routeQuery(origin: string, destination: string) {
  const snap = computeSnapshot();
  return planRoute(origin, destination, ROADS, snap.risks, JUNCTIONS);
}

export function addIncident(incident: Incident) {
  getState().incidents.unshift(incident);
}

export function addReport(report: FieldReport) {
  getState().reports.unshift(report);
}

export function stepSimulation() {
  const state = getState();
  const risks = predictAll(ROADS, state.weather, state.incidents);
  state.vehicles = tickVehicles(state.vehicles, risks);
  return snapshot();
}

export function mergeWeather(updates: WeatherSnapshot[]) {
  const state = getState();
  const map = new Map(state.weather.map((w) => [w.roadId, w]));
  for (const u of updates) map.set(u.roadId, u);
  state.weather = [...map.values()];
}
