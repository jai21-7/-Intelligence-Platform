/**
 * LEARNING: seed data is the "day one" situation the app boots with.
 * Live weather, GPS, and field reports will mutate a copy of this in memory.
 */
import { DISTRICTS, ROADS } from "./ner-network";
import type { Incident, Vehicle, WeatherSnapshot } from "./types";

export const SEED_WEATHER: WeatherSnapshot[] = ROADS.map((road) => {
  // Higher elevation roads get more rain in this demo scenario.
  const rainfallMm = Math.round(8 + road.elevationM / 40 + road.landslideHistory * 40);
  const warning: WeatherSnapshot["warning"] =
    rainfallMm > 70 ? "flood-watch" : rainfallMm > 45 ? "storm" : rainfallMm > 25 ? "rain" : "none";
  return {
    roadId: road.id,
    rainfallMm,
    visibilityKm: Math.max(1, 12 - rainfallMm / 10),
    warning,
  };
});

export const SEED_INCIDENTS: Incident[] = [
  {
    id: "inc-tawang",
    kind: "landslide",
    roadId: "ar-ita-tawang",
    position: DISTRICTS.find((d) => d.id === "tawang")!.hq,
    note: "Debris on Tawang axis after overnight rain. One-lane crawl.",
    reporter: "BRO camp, Tawang",
    at: new Date().toISOString(),
    verified: true,
  },
  {
    id: "inc-sil-aiz",
    kind: "rainfall",
    roadId: "nh306-sil-aiz",
    position: { lat: 24.28, lng: 92.74 },
    note: "Continuous rain on NH-306. Surface slip risk near hill cuts.",
    reporter: "PWD Mizoram",
    at: new Date().toISOString(),
    verified: true,
  },
];

export const SEED_VEHICLES: Vehicle[] = [
  {
    id: "v-med-1",
    plate: "AS-01-MED-21",
    cargo: "medicines",
    origin: "kamrup",
    destination: "tawang",
    route: ["kamrup", "sonitpur", "papum", "tawang"],
    progress: 0.42,
    status: "delayed",
    etaMinutes: 540,
  },
  {
    id: "v-food-1",
    plate: "MN-01-FD-09",
    cargo: "food",
    origin: "kamrup",
    destination: "imphal-west",
    route: ["kamrup", "cachar", "imphal-west"],
    progress: 0.61,
    status: "moving",
    etaMinutes: 210,
  },
  {
    id: "v-con-1",
    plate: "NL-07-CV-44",
    cargo: "construction",
    origin: "dimapur",
    destination: "mokokchung",
    route: ["dimapur", "kohima", "mokokchung"],
    progress: 0.28,
    status: "moving",
    etaMinutes: 180,
  },
  {
    id: "v-agri-1",
    plate: "TR-01-AG-12",
    cargo: "agriculture",
    origin: "west-tripura",
    destination: "aizawl",
    route: ["west-tripura", "cachar", "aizawl"],
    progress: 0.15,
    status: "moving",
    etaMinutes: 360,
  },
  {
    id: "v-med-2",
    plate: "SK-02-MED-03",
    cargo: "medicines",
    origin: "kamrup",
    destination: "gangtok",
    route: ["kamrup", "namchi", "gangtok"],
    progress: 0.7,
    status: "moving",
    etaMinutes: 90,
  },
  {
    id: "v-food-2",
    plate: "ML-05-FD-18",
    cargo: "food",
    origin: "kamrup",
    destination: "w-garo",
    route: ["kamrup", "e-khasi", "w-garo"],
    progress: 0.5,
    status: "moving",
    etaMinutes: 150,
  },
];
