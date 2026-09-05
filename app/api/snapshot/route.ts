import { NextResponse } from "next/server";
import { snapshot } from "@/lib/store/state";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(snapshot());
}
