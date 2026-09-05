"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { t, type Locale } from "@/lib/i18n/messages";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  tr: (key: string) => string;
} | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const value = useMemo(
    () => ({ locale, setLocale, tr: (key: string) => t(locale, key) }),
    [locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be inside LocaleProvider");
  return ctx;
}
