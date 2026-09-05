import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
