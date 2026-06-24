"use client";

import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

import { getAccessToken } from "@/src/infrastructure/auth/session";

/** Avoid server redirect to /login so session stored in localStorage is respected without a login UI flash. */
export default function Home() {
  const router = useRouter();

  useLayoutEffect(() => {
    router.replace(getAccessToken() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div
      className="min-h-screen bg-slate-950"
      aria-busy="true"
      aria-label="Loading"
    />
  );
}
