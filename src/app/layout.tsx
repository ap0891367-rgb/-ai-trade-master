import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./anchor.css";

export const metadata: Metadata = {
  title: "AI Trade Master — Trade Smarter with AI.",
  description: "Enterprise AI Stock Market Research and Paper Trading SaaS platform with 10 Master AI Agents, 12 Indian Languages, and multi-market simulation.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070b19] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
