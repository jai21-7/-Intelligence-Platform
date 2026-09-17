/**
 * LEARNING — the live store
 * Next.js API routes can import this module. In a single Node server
 * process, the `globalThis` singleton keeps state between requests.
 *
 * We also write `data/live-store.json` so a field report still exists
 * after you restart `npm run dev`. That file is gitignored on purpose:
 * it is *your* demo, not shared geography.
 *
 * (On Vercel serverless you would use Redis / Postgres instead of a file.)
 */
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DISTRICTS, JUNCTIONS, NER_STATES, ROADS } from "../data/ner-network";
import { SEED_INCIDENTS, SEED_VEHICLES, SEED_WEATHER } from "../data/seed";
import type { FieldReport, Incident, Vehicle, WeatherSnapshot } from "../data/types";
import { districtConnectivity, emergencySpine } from "../engine/accessibility";
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

const STORE_FILE = join(process.cwd(), "data", "live-store.json");
const g = globalThis as typeof globalThis & { __nerStore?: LiveState };

function initial(): LiveState {
  return {
    weather: structuredClone(SEED_WEATHER),
    incidents: structuredClone(SEED_INCIDENTS),
    vehicles: structuredClone(SEED_VEHICLES),
    reports: [],
  };
}

function readDisk(): LiveState | null {
  try {
    if (!existsSync(STORE_FILE)) return null;
    const parsed = JSON.parse(readFileSync(STORE_FILE, "utf8")) as Partial<LiveState>;
    if (!parsed.weather || !parsed.vehicles) return null;
    return {
      weather: parsed.weather,
      incidents: parsed.incidents ?? [],
      vehicles: parsed.vehicles,
      reports: parsed.reports ?? [],
    };
  } catch {
    return null;
  }
}

function persist(state: LiveState) {
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  writeFileSync(STORE_FILE, JSON.stringify(state, null, 2));
}

export function getState(): LiveState {
  if (!g.__nerStore) g.__nerStore = readDisk() ?? initial();
  return g.__nerStore;
}

export function resetState() {
  g.__nerStore = initial();
  try {
    if (existsSync(STORE_FILE)) unlinkSync(STORE_FILE);
  } catch {
    /* ignore */
  }
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
    emergency: emergencySpine(risks),
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
  const state = getState();
  state.incidents.unshift(incident);
  persist(state);
}

export function addReport(report: FieldReport) {
  const state = getState();
  state.reports.unshift(report);
  persist(state);
}

export function stepSimulation() {
  const state = getState();
  const risks = predictAll(ROADS, state.weather, state.incidents);
  state.vehicles = tickVehicles(state.vehicles, risks);
  persist(state);
  return snapshot();
}

export function mergeWeather(updates: WeatherSnapshot[]) {
  const state = getState();
  const map = new Map(state.weather.map((w) => [w.roadId, w]));
  for (const u of updates) map.set(u.roadId, u);
  state.weather = [...map.values()];
  persist(state);
}
