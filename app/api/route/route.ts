import { NextResponse } from "next/server";
import { routeQuery } from "@/lib/store/state";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { origin?: string; destination?: string };
  if (!body.origin || !body.destination) {
    return NextResponse.json({ error: "origin and destination required" }, { status: 400 });
  }
  return NextResponse.json(routeQuery(body.origin, body.destination));
}
