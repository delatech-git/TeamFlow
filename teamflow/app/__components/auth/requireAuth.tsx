"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { getAccessToken } from "@/src/infrastructure/auth/session";

export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div
        className="min-h-[50vh] bg-slate-950"
        aria-busy="true"
        aria-label="Checking session"
      />
    );
  }

  return <>{children}</>;
}
