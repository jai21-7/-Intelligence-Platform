import "./globals.css";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
        Scaffolding
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold">
        NER Smart Logistics platform is starting here.
      </h1>
      <p className="mt-4 max-w-2xl text-slate-300">
        Next commits will add NER geography data, a dashboard, a GIS map, and
        the prediction engine. Follow <code>docs/LEARNING.md</code>.
      </p>
    </main>
  );
}
