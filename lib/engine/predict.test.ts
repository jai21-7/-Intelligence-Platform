import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { JUNCTIONS, ROADS } from "../data/ner-network";
import { predictAll, predictRoadRisk } from "./predict";
import { planRoute } from "./routing";
import type { Incident, WeatherSnapshot } from "../data/types";

describe("predictRoadRisk", () => {
  const tawang = ROADS.find((r) => r.id === "ar-ita-tawang")!;
  const plains = ROADS.find((r) => r.id === "nh27-gh-tez")!;

  it("scores a high Himalayan road with a landslide as blocked", () => {
    const weather: WeatherSnapshot = {
      roadId: tawang.id,
      rainfallMm: 90,
      visibilityKm: 2,
      warning: "storm",
    };
    const incidents: Incident[] = [
      {
        id: "x",
        kind: "landslide",
        roadId: tawang.id,
        position: { lat: 27.3, lng: 92.2 },
        note: "slide",
        reporter: "test",
        at: new Date().toISOString(),
        verified: true,
      },
    ];
    const risk = predictRoadRisk(tawang, weather, incidents);
    assert.equal(risk.accessibility, "blocked");
    assert.ok(risk.score >= 0.72);
  });

  it("keeps a low-elevation plains highway open in light rain", () => {
    const weather: WeatherSnapshot = {
      roadId: plains.id,
      rainfallMm: 6,
      visibilityKm: 10,
      warning: "none",
    };
    const risk = predictRoadRisk(plains, weather, []);
    assert.equal(risk.accessibility, "open");
  });
});

describe("planRoute", () => {
  it("finds Guwahati to Dibrugarh along NH-27", () => {
    const weather = ROADS.map((r) => ({
      roadId: r.id,
      rainfallMm: 5,
      visibilityKm: 10,
      warning: "none" as const,
    }));
    const risks = predictAll(ROADS, weather, []);
    const plan = planRoute("kamrup", "dibrugarh", ROADS, risks, JUNCTIONS);
    assert.equal(plan.ok, true);
    assert.ok(plan.nodes.includes("jorhat"));
    assert.ok(plan.totalKm > 400);
  });

  it("avoids a blocked Tawang axis and reports inaccessibility from Itanagar only if both AR roads fail", () => {
    const weather = ROADS.map((r) => ({
      roadId: r.id,
      rainfallMm: r.id === "ar-ita-tawang" ? 120 : 5,
      visibilityKm: 8,
      warning: "none" as const,
    }));
    const incidents: Incident[] = [
      {
        id: "b",
        kind: "landslide",
        roadId: "ar-ita-tawang",
        position: { lat: 27.4, lng: 92.4 },
        note: "blocked",
        reporter: "test",
        at: new Date().toISOString(),
        verified: true,
      },
    ];
    const risks = predictAll(ROADS, weather, incidents);
    const plan = planRoute("kamrup", "tawang", ROADS, risks, JUNCTIONS);
    assert.equal(plan.ok, false);
  });
});
