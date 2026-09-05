export default function LearnPage() {
  return (
    <article className="prose prose-invert max-w-3xl space-y-6 text-slate-200">
      <h1 className="font-display text-3xl text-white">How this platform works (beginner tour)</h1>
      <p>
        You are looking at a small version of a government logistics control room. Walk the git
        history with <code className="rounded bg-white/10 px-1">git log --oneline</code> — each
        commit added one idea.
      </p>
      <section className="card space-y-2">
        <h2 className="font-display text-xl">1. Data first, widgets second</h2>
        <p>
          <code>lib/data/types.ts</code> is the dictionary. A road is an <em>edge</em> between two
          district headquarters. If you understand that, GIS, routing, and GPS all click.
        </p>
      </section>
      <section className="card space-y-2">
        <h2 className="font-display text-xl">2. “AI” you can audit</h2>
        <p>
          Open <code>lib/engine/predict.ts</code>. Rain, landslide history, elevation, pavement
          damage, and live incidents are multiplied by weights. The number 0.72 is the blocked
          threshold — change it and rerun <code>npm test</code>.
        </p>
      </section>
      <section className="card space-y-2">
        <h2 className="font-display text-xl">3. Graphs beat guesswork</h2>
        <p>
          Dijkstra in <code>lib/engine/routing.ts</code> walks the cheapest unblocked path. That is
          how alternate routes and “district inaccessible” are decided — not by drawing on the map
          by hand.
        </p>
      </section>
      <section className="card space-y-2">
        <h2 className="font-display text-xl">4. GPS is just repeating coordinates</h2>
        <p>
          The simulator in <code>lib/engine/simulator.ts</code> slides a truck along its node list.
          Swap it for a real GPS ping and the map / alerts keep working.
        </p>
      </section>
      <section className="card space-y-2">
        <h2 className="font-display text-xl">5. Hills need an outbox</h2>
        <p>
          Field reports write to IndexedDB when there is no signal (
          <code>lib/offline/outbox.ts</code>), then POST to <code>/api/reports</code> later.
        </p>
      </section>
      <section className="card space-y-2">
        <h2 className="font-display text-xl">Try these exercises</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Raise Tawang rainfall in seed weather and watch the dashboard go red.</li>
          <li>Plan Guwahati → Imphal vs Guwahati → Tawang.</li>
          <li>Upload a field photo on the reports page.</li>
          <li>Switch the header language to हिन्दी / অসমীয়া.</li>
          <li>Add a ninth dummy district in <code>ner-network.ts</code> and a road to Guwahati.</li>
        </ol>
      </section>
    </article>
  );
}
