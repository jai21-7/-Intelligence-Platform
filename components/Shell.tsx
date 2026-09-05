"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_LABEL } from "@/lib/i18n/messages";
import { useI18n } from "./LocaleProvider";
import { useSnapshot } from "./SnapshotProvider";

const LINKS = [
  { href: "/", key: "navDashboard" },
  { href: "/map", key: "navMap" },
  { href: "/vehicles", key: "navVehicles" },
  { href: "/alerts", key: "navAlerts" },
  { href: "/reports", key: "navReports" },
  { href: "/routes", key: "navRoutes" },
  { href: "/learn", key: "navLearn" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { tr, locale, setLocale } = useI18n();
  const { online, tick, pullWeather, reset } = useSnapshot();

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-[#07111f]/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="mr-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-300">{tr("appTag")}</p>
            <h1 className="font-display text-lg text-white md:text-xl">{tr("appName")}</h1>
          </div>
          <nav className="flex flex-1 flex-wrap gap-1">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    active ? "bg-emerald-400 text-slate-950" : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {tr(l.key)}
                </Link>
              );
            })}
          </nav>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            {tr("language")}
            <select
              className="rounded-md border border-white/15 bg-slate-900 px-2 py-1 text-slate-100"
              value={locale}
              onChange={(e) => setLocale(e.target.value as typeof locale)}
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {LOCALE_LABEL[l]}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn-ghost" onClick={() => pullWeather()}>
            {tr("refreshWeather")}
          </button>
          <button type="button" className="btn-ghost" onClick={() => tick()}>
            {tr("tickGps")}
          </button>
          <button type="button" className="btn-ghost" onClick={() => reset()}>
            {tr("reset")}
          </button>
        </div>
        {!online && <p className="bg-amber-500/20 px-4 py-2 text-center text-sm text-amber-100">{tr("offlineBanner")}</p>}
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </div>
  );
}
