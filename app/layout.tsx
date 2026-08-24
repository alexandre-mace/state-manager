import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { MadeWithLove } from "@/components/made-with-love";

export const metadata: Metadata = {
  title: "Finances Publiques Françaises 2026",
  description: "Comprendre les finances de l'État, de la Sécurité Sociale et des collectivités locales en France",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50%' y='50%' style='dominant-baseline:central;text-anchor:middle;font-size:90px;'>🏛️</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {children}
        <MadeWithLove className="pb-8" />
      </body>
    </html>
  );
}
