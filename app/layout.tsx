import type { Metadata } from "next";
import { LocaleProvider } from "@/components/LocaleProvider";
import { SnapshotProvider } from "@/components/SnapshotProvider";
import { Shell } from "@/components/Shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "NER Logistics Intelligence",
  description:
    "AI-based smart logistics and accessibility platform for India's North Eastern Region",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>
          <SnapshotProvider>
            <Shell>{children}</Shell>
          </SnapshotProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
