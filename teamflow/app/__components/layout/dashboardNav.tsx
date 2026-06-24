"use client";

import Link from "next/link";
import { cn } from "../ui/utils";

const navLinks = [
  { label: "Create Idea", href: "/dashboard/create" },
  { label: "Discover Ideas", href: "/discover-ideas" },
  { label: "Planned Ideas", href: "/planned-ideas" },
];

export function DashboardNav({ className }: { className?: string }) {
  return (
    <nav className={cn("flex flex-wrap justify-center gap-4", className)}>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border-2 border-white px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-slate-950"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}