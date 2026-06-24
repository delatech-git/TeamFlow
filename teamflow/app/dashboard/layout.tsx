import type { ReactNode } from "react";

import { RequireAuth } from "../__components/auth/requireAuth";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
