# Step-by-step learning notes

Read this while you click through the running app (`/learn` page) and the git log.

## 1. Full-stack in one sentence

The **browser** draws maps and tables. The **server** (Next.js route handlers
under `app/api`) holds the live logistics state and runs prediction + routing.
The browser talks to the server with `fetch("/api/...")`.

## 2. GIS (Geographic Information System)

GIS means: every important object has a **latitude and longitude**.

- A district HQ is a point: `{ lat: 26.14, lng: 91.73 }` (Guwahati)
- A road is a **polyline**: a list of points from A to B
- A field photo is a point plus an image URL

Leaflet draws those numbers on a map tile from OpenStreetMap.

## 3. A road network is a graph

In computer science a **graph** is circles (nodes) connected by lines (edges).

- Node = junction / town
- Edge = road segment with length, condition, and a risk score

Finding a path that avoids a landslide is the same problem as finding a path
in that graph that **does not use blocked edges**. Dijkstra's algorithm is the
classic way to do this. You will find it in `lib/engine/routing.ts`.

## 4. What "AI" means in this project

There are two layers:

1. **Rules + weighted features** (you can read every number). Example:
   `risk = 0.4*rain + 0.3*landslideHistory + 0.2*elevation + 0.1*damage`
2. **Optional next step**: train a real ML model on years of landslide data.
   The function `predictDisruption` is the plug-in point.

Beginners should master layer 1 first. If you cannot explain the score, you
cannot trust the model in a disaster.

## 5. GPS tracking

A vehicle sends `{ vehicleId, lat, lng, timestamp }` every few seconds.
The dashboard stores the last N points as a trail. If `now - lastPing` is
too large, we raise a **delayed / missing** alert.

In this demo, a simulator in `lib/engine/simulator.ts` moves vehicles along
roads so you can see tracking without real trucks.

## 6. Offline sync

Phones in hills often have no signal. The field form saves reports into
**IndexedDB** (a small database inside the browser). When the network
returns, a sync worker POSTs them to `/api/reports`.

This pattern is called an **outbox**.

## 7. Multilingual copy

Never hard-code user-visible sentences in JSX if you want Hindi and Assamese.
Put strings in `lib/i18n/messages.ts` and pick them with the current locale.

## 8. How to practice

1. Change a road's rainfall in the seed data and watch risk change.
2. Block an edge on the map and ask for an alternate route.
3. Add a ninth "virtual" district and a road to it.
4. Translate one more string into a language you speak.
