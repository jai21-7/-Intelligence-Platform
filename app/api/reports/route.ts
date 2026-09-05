import { NextResponse } from "next/server";
import { addIncident, addReport, snapshot } from "@/lib/store/state";
import type { FieldReport, Incident } from "@/lib/data/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<FieldReport> & { kind?: Incident["kind"]; roadId?: string };
  if (!body.districtId || !body.note || !body.position) {
    return NextResponse.json({ error: "districtId, note, position required" }, { status: 400 });
  }
  const report: FieldReport = {
    id: `rpt-${Date.now()}`,
    districtId: body.districtId,
    position: body.position,
    note: body.note,
    photoDataUrl: body.photoDataUrl,
    reporter: body.reporter || "field-officer",
    at: new Date().toISOString(),
    synced: true,
  };
  addReport(report);

  if (body.roadId && body.kind) {
    const incident: Incident = {
      id: `inc-${Date.now()}`,
      kind: body.kind,
      roadId: body.roadId,
      position: body.position,
      note: body.note,
      photoDataUrl: body.photoDataUrl,
      reporter: report.reporter,
      at: report.at,
      verified: false,
    };
    addIncident(incident);
  }

  return NextResponse.json({ report, snapshot: snapshot() });
}
