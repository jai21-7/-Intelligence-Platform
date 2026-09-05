import { NextResponse } from "next/server";
import { resetState, snapshot } from "@/lib/store/state";

export const dynamic = "force-dynamic";

export function POST() {
  resetState();
  return NextResponse.json(snapshot());
}
