import { NextResponse } from "next/server";
import { snapshot, stepSimulation } from "@/lib/store/state";

export const dynamic = "force-dynamic";

export function POST() {
  return NextResponse.json(stepSimulation());
}

export function GET() {
  return NextResponse.json(snapshot());
}
