import { NextResponse } from "next/server";
import { ROADS } from "@/lib/data/ner-network";
import { fetchOpenMeteo } from "@/lib/engine/weather";
import { mergeWeather, snapshot } from "@/lib/store/state";

export const dynamic = "force-dynamic";

export async function POST() {
  const updates = await Promise.all(ROADS.map((road) => fetchOpenMeteo(road)));
  const ok = updates.filter((u): u is NonNullable<typeof u> => Boolean(u));
  if (ok.length) mergeWeather(ok);
  return NextResponse.json({
    source: ok.length ? "open-meteo" : "seed-fallback",
    updated: ok.length,
    snapshot: snapshot(),
  });
}
