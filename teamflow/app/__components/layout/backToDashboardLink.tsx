"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "../ui/utils";

export function BackToDashboardLink({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-white/70",
        className,
      )}
    >
      <ArrowLeft size={16} strokeWidth={2.25} />
      Back to Dashboard
    </Link>
  );
}
