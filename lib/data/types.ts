/**
 * LEARNING: these TypeScript `type` aliases are contracts.
 * Every district, road, vehicle, and alert in the app must match one of them.
 * If you misspell a field, TypeScript will refuse to compile — that is a feature.
 */

export type CargoKind =
  | "medicines"
  | "food"
  | "construction"
  | "agriculture";

export type Accessibility =
  | "open"
  | "watch"
  | "restricted"
  | "blocked";

export type IncidentKind =
  | "landslide"
  | "flood"
  | "rainfall"
  | "road_damage"
  | "congestion"
  | "bridge_closed";

export type LatLng = {
  lat: number;
  lng: number;
};

export type NerState = {
  id: string;
  name: string;
  /** Short code used on the dashboard chips */
  code: string;
};

export type District = {
  id: string;
  stateId: string;
  name: string;
  hq: LatLng;
  populationLakh: number;
  remote: boolean;
};

/**
 * A graph NODE. Think of it as a pin on the map where roads meet.
 * Vehicles travel from node to node.
 */
export type Junction = {
  id: string;
  name: string;
  districtId: string;
  position: LatLng;
};

/**
 * A graph EDGE. One stretch of highway / hill road between two junctions.
 * `path` is the polyline Leaflet draws. `km` is used for travel-time estimates.
 */
export type RoadSegment = {
  id: string;
  name: string;
  from: string;
  to: string;
  km: number;
  lanes: 1 | 2;
  /** 0 = freshly paved, 1 = severely damaged */
  damage: number;
  /** 0–1 historical landslide / flood frequency */
  landslideHistory: number;
  /** metres above sea level (rough) — higher = more landslide risk */
  elevationM: number;
  path: LatLng[];
};

export type WeatherSnapshot = {
  roadId: string;
  rainfallMm: number;
  visibilityKm: number;
  warning: "none" | "rain" | "storm" | "flood-watch";
};

export type Vehicle = {
  id: string;
  plate: string;
  cargo: CargoKind;
  origin: string;
  destination: string;
  /** Ordered junction ids that make up the planned trip */
  route: string[];
  /** 0–1 progress along the current route (simulator uses this) */
  progress: number;
  status: "moving" | "delayed" | "arrived" | "rerouted";
  etaMinutes: number;
};

export type Incident = {
  id: string;
  kind: IncidentKind;
  roadId: string;
  position: LatLng;
  note: string;
  photoDataUrl?: string;
  reporter: string;
  at: string;
  verified: boolean;
};

export type Alert = {
  id: string;
  level: "info" | "warning" | "critical";
  title: string;
  detail: string;
  roadId?: string;
  districtId?: string;
  vehicleId?: string;
  at: string;
};

export type FieldReport = {
  id: string;
  districtId: string;
  position: LatLng;
  note: string;
  photoDataUrl?: string;
  reporter: string;
  at: string;
  synced: boolean;
};
