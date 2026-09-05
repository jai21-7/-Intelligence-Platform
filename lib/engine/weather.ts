/**
 * LEARNING — weather adapter
 * Swap `fetchLiveWeather` to call IMD / Open-Meteo later.
 * The rest of the app only understands WeatherSnapshot, so the UI
 * does not care which API you used.
 */
import type { RoadSegment, WeatherSnapshot } from "../data/types";

export async function fetchOpenMeteo(road: RoadSegment): Promise<WeatherSnapshot | null> {
  const mid = road.path[Math.floor(road.path.length / 2)] ?? road.path[0];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${mid.lat}&longitude=${mid.lng}&current=precipitation,visibility&timezone=Asia%2FKolkata`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      current?: { precipitation?: number; visibility?: number };
    };
    const rainfallMm = json.current?.precipitation ?? 0;
    const visibilityKm = json.current?.visibility ? json.current.visibility / 1000 : 8;
    const warning: WeatherSnapshot["warning"] =
      rainfallMm > 8 ? "storm" : rainfallMm > 2 ? "rain" : "none";
    return { roadId: road.id, rainfallMm, visibilityKm, warning };
  } catch {
    return null;
  }
}
