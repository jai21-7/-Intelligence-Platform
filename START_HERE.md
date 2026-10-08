# START HERE (beginner)

You do **not** need to understand the whole repo on day one.
Follow this file from top to bottom. Each step is one idea.

## 0. Run the app (so the code has a face)

In a terminal, from this folder:

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

Also open **http://localhost:3000/learn** in another tab.

If `npm` is missing, install Node.js LTS first (nodejs.org), then retry.

---

## Week-zero map of the repo

```
app/            what you see in the browser (pages + APIs)
components/     reusable UI (header, map, language, live data)
lib/data/       NER geography — the "board game pieces"
lib/engine/     the brain (risk score, routes, GPS, alerts)
lib/store/      live memory of the demo
lib/i18n/       English / Hindi / Assamese words
lib/offline/    save reports when there is no network
docs/           extra notes
```

Rule: **data first, brain second, screens last.**
If you start in `app/` you will feel lost. Start in `lib/data/`.

---

## Day 1 — What is a type? What is a graph?

1. Open `lib/data/types.ts`
   - A `District` is a name + HQ pin (`lat`, `lng`).
   - A `RoadSegment` is a **line between two districts** (`from`, `to`).
   - That line is called an **edge**. The districts are **nodes**.
   - Together, nodes + edges = a **graph** (the road network).

2. Open `lib/data/ner-network.ts`
   - Scroll to `ROADS`.
   - Find `"NH-27 Guwahati – Tezpur"`.
   - Notice `from: "kamrup"` and `to: "sonitpur"`.
   - That is one highway stored as data, not drawn by hand in CSS.

3. Open `lib/data/seed.ts`
   - Weather, two incidents, and a few trucks that exist on day one.

**Check you understood:** Can you say out loud what `from` and `to` mean on a road?

---

## Day 2 — Fake “AI” you can read

Open `lib/engine/predict.ts`.

The model is only this idea:

```
risk = rain + landslide history + elevation + road damage + live incidents
```

Each piece is a number between 0 and 1. Weights (0.32, 0.28, …) say
how much we trust each piece. If the score is high, the road is
`watch` → `restricted` → `blocked`.

Then run:

```bash
npm test
```

You should see 4 tests pass. Those tests prove “Tawang + landslide = blocked”
and “Guwahati plains in light rain = open”.

**Exercise:** change the blocked threshold `0.72` to `0.90`, run `npm test`,
see a test fail, then put `0.72` back.

---

## Day 3 — Alternate routes (Dijkstra)

Open `lib/engine/routing.ts`.

Plain English: “from A to B, walk the cheapest unblocked roads.”
Blocked roads are skipped. That is how **Tawang can become inaccessible**
and how **Guwahati → Imphal** still finds a path via Silchar.

In the app: open **Route planner**.

- Origin Kamrup Metro → Destination **Tawang** → Suggest route (should fail).
- Then Destination **Imphal West** (should show hops and a cyan line).

---

## Day 4 — Screens talk to the brain through APIs

The browser does not import `predict.ts` directly on every page.
It asks the server:

| You click…        | Browser calls           | Server file                 |
| ----------------- | ----------------------- | --------------------------- |
| Dashboard load    | `GET /api/snapshot`     | `app/api/snapshot/route.ts` |
| Suggest route     | `POST /api/route`       | `app/api/route/route.ts`    |
| GPS tick          | `POST /api/tick`        | `app/api/tick/route.ts`     |
| Save field report | `POST /api/reports`     | `app/api/reports/route.ts`  |
| Live weather      | `POST /api/weather`     | `app/api/weather/route.ts`  |

The snapshot is built in `lib/store/state.ts` (live memory + optional
`data/live-store.json` on disk).

**Check:** open the dashboard, then in the browser DevTools Network tab
look for `/api/snapshot`.

---

## Day 5 — Click the product, then find the file

| Screen (nav)     | URL           | Main file                 |
| ---------------- | ------------- | ------------------------- |
| Dashboard        | `/`           | `app/page.tsx`            |
| GIS map          | `/map`        | `app/map/page.tsx` + `components/NerMap.tsx` |
| GPS fleet        | `/vehicles`   | `app/vehicles/page.tsx`   |
| Alerts           | `/alerts`     | `app/alerts/page.tsx`     |
| Field reports    | `/reports`    | `app/reports/page.tsx`    |
| Route planner    | `/routes`     | `app/routes/page.tsx`     |
| Learn            | `/learn`      | `app/learn/page.tsx`      |

Header / language / live data:

- `components/Shell.tsx` — top bar
- `lib/i18n/messages.ts` — English, Hindi, Assamese
- `components/SnapshotProvider.tsx` — fetches snapshot, auto-moves trucks

GPS movement is `lib/engine/simulator.ts`.
Offline reports are `lib/offline/outbox.ts`.

---

## How to use git as a teacher

```bash
git log --oneline
```

Oldest ideas are at the bottom. Open one commit:

```bash
git show 99043d8
```

(Use a hash from *your* `git log`. Do not memorise this example.)

Each commit was meant to be **one idea** (data, then brain, then one screen).

---

## If you feel stuck

1. You do not need React expertise on day 1. Stay in `lib/data` and `lib/engine`.
2. TypeScript red squiggles are the teacher: they mean “this field name is wrong”.
3. Ignore `package-lock.json` and `.next/` — generated, not for reading.
4. Read comments that start with `LEARNING —` inside the engine files.

When you can explain **graph → risk score → route → alert** in one minute,
you understand this project. Everything else is packaging.
