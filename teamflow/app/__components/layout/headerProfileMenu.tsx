"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";

import { cn } from "../ui/utils";
import {
  clearSession,
  fetchCurrentUser,
} from "@/src/infrastructure/api/auth/client";
import type { MeUser } from "@/src/infrastructure/api/auth/types";
import { getAccessToken } from "@/src/infrastructure/auth/session";

export function HeaderProfileMenu() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [hasSession, setHasSession] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<MeUser | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setHasSession(Boolean(getAccessToken()));
  }, []);

  useEffect(() => {
    if (!hasSession) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchCurrentUser();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          clearSession();
          setHasSession(false);
          router.replace("/login");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasSession, router]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  function onLogout() {
    clearSession();
    setOpen(false);
    setHasSession(false);
    setUser(null);
    router.replace("/login");
    router.refresh();
  }

  if (!hasSession) {
    return null;
  }

  if (loadError) {
    return null;
  }

  if (!user) {
    return (
      <div
        className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-white/20"
        aria-hidden
      />
    );
  }

  const displayName = user.fullName?.trim() || user.username;
  const showAvatar = Boolean(user.avatarUrl?.trim());

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Account menu for ${displayName}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full",
          "outline-none transition hover:opacity-90",
          "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        )}
      >
        {showAvatar ? (
          <Image
            src={user.avatarUrl!}
            alt=""
            width={36}
            height={36}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-white/20">
            <UserRound size={18} className="text-white" aria-hidden />
          </span>
        )}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-60 mt-2 w-64 rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-xl"
          role="menu"
        >
          <p className="text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="mt-4 flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            <LogOut size={16} className="text-slate-600" aria-hidden />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
