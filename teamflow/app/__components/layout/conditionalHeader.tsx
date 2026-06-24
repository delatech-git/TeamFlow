"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { getAccessToken } from "@/src/infrastructure/auth/session";

import Header from "./header";

const AUTH_PATHS = new Set(["/login", "/register"]);

export function ConditionalHeader() {
  const pathname = usePathname() ?? "";
  const isAuthRoute = AUTH_PATHS.has(pathname);
  const isDashboardRoute = pathname.startsWith("/dashboard");

  const [show, setShow] = useState(() => !isDashboardRoute);

  useLayoutEffect(() => {
    if (AUTH_PATHS.has(pathname)) {
      return;
    }
    if (!pathname.startsWith("/dashboard")) {
      setShow(true);
      return;
    }
    setShow(Boolean(getAccessToken()));
  }, [pathname]);

  if (isAuthRoute) {
    return null;
  }

  if (isDashboardRoute && !show) {
    return null;
  }

  return <Header />;
}
