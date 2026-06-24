import { ConditionalHeader } from "./__components/layout/conditionalHeader";
import type { Metadata } from "next";
import { Caveat, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeamTide",
  description: "Collaborative idea boards where teams add and drag sticky-note suggestions together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${caveat.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-slate-900">
          <div className="min-h-screen">
            <ConditionalHeader />
            <main className="mx-auto w-full pt-0">
              {children}
            </main>
          </div>
      </body>
    </html>
  );
}
