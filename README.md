# NER Smart Logistics & Accessibility Intelligence Platform

A beginner-friendly, AI-assisted logistics platform for India's **North Eastern Region (NER)**.

This project is built so you can **learn by reading the code**, not just by using the app.
Each major idea (maps, graphs, prediction, GPS, alerts, offline sync) lives in its own folder
with comments that explain *why* the code looks the way it does.

## What problem does this solve?

The North Eastern Region has eight states: Arunachal Pradesh, Assam, Manipur,
Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura. Roads are often cut by
landslides, floods, and heavy rain. Essential goods (medicines, food,
construction material, farm produce) get delayed.

This platform helps planners and field officials:

1. See which districts and roads are reachable **right now**
2. **Predict** which corridors may fail next (rain + terrain + history)
3. Suggest **alternate routes** and delay estimates
4. **Track GPS** of vehicles carrying essential cargo
5. Raise **alerts** for blocked roads and late deliveries
6. Let field staff **upload geo-tagged reports and photos**
7. Work in **low-network** areas with offline save-and-sync
8. Send **multilingual** notifications (English, Hindi, Assamese)

## How to run (after later commits add the app)

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Learning path (follow the git history)

We commit **after each important idea**, so you can:

```bash
git log --oneline
```

Then inspect one commit at a time:

```bash
git show <commit-hash>
```

Typical order you will see:

1. This README — the *why*
2. App scaffolding — Next.js, TypeScript, Tailwind
3. NER data model — states, districts, roads as a **graph**
4. Dashboard — district connectivity
5. GIS map — Leaflet + OpenStreetMap
6. Disruption prediction — a small, readable scoring model
7. Route engine — Dijkstra shortest / safest path
8. GPS vehicle tracking
9. Alerts and notifications
10. Field reports (geo-tagged)
11. Multilingual + offline sync
12. Weather API adapter

## Mental model (keep this in your head)

```
Weather + terrain + incidents  -->  risk score per road
Road graph + risk scores       -->  "is this district reachable?"
Road graph + blocked edges     -->  alternate route + delay
GPS pings                      -->  vehicle map + late delivery alerts
Field photos                   -->  ground truth that updates the map
```

You do **not** need a huge neural network to start. A transparent scoring
model plus a graph algorithm already produces useful decisions. That is
how many real logistics systems begin.

## Tech stack (and why)

| Piece | Choice | Why it is good for learning |
| --- | --- | --- |
| Language | TypeScript | Catches mistakes while you type |
| UI | Next.js (App Router) | Website + API in one project |
| Styling | Tailwind CSS | Fast layout without a separate CSS file per page |
| Map | Leaflet | Free GIS map in the browser |
| Data | JSON + in-memory store | No database install on day one |
| Tests | Node test runner | Prove the AI/route math without opening a browser |

## Project layout (grows as we commit)

```
app/          UI pages (dashboard, map, vehicles, reports, learn)
lib/data/     NER geography, roads, vehicles (the "truth" we seed)
lib/engine/   prediction + routing algorithms
lib/store/    how the app reads/writes live state
lib/i18n/     English / Hindi / Assamese strings
public/       static files, sample photos
docs/         extra learning notes
```

## Disclaimer

This is a **learning / prototype** platform. Road geometries, rainfall, and
vehicle positions are **illustrative**. A production MDoNER system would
connect live IMD weather, NHAI / PWD road databases, and authenticated GPS
devices. The architecture here is designed so those real feeds can plug in
later without rewriting the UI.
