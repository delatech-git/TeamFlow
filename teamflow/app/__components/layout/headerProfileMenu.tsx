"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, LogOut, UserRound, Users } from "lucide-react";

import { cn } from "../ui/utils";
import {
  clearSession,
  fetchCurrentUser,
  uploadMyAvatar,
} from "@/src/infrastructure/api/auth/client";
import type { MeUser } from "@/src/infrastructure/api/auth/types";
import { getAccessToken } from "@/src/infrastructure/auth/session";

export function HeaderProfileMenu() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasSession, setHasSession] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<MeUser | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

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

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarError("");

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      setAvatarError("Image must be smaller than 2MB.");
      return;
    }

    setUploadingAvatar(true);

    try {
      const updatedUser = await uploadMyAvatar(file);

      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              avatarUrl: updatedUser.avatarUrl,
            }
          : updatedUser,
      );

      e.target.value = "";
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "Could not update profile image",
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (!hasSession || loadError) {
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
          className="absolute right-0 top-full z-60 mt-2 w-72 rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-xl"
          role="menu"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="group relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={showAvatar ? "Change profile image" : "Upload profile image"}
            >
              {showAvatar ? (
                <Image
                  src={user.avatarUrl!}
                  alt=""
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <UserRound size={22} className="text-slate-500" aria-hidden />
              )}

              <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100">
                <Camera size={17} className="text-white" aria-hidden />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {user.email}
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onAvatarChange}
          />

          {avatarError ? (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {avatarError}
            </p>
          ) : null}

          {user.role === "ADMIN" ? (
            <Link
              href="/admin/users"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="mt-4 flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
            >
              <Users size={16} className="text-slate-600" aria-hidden />
              Manage users
            </Link>
          ) : null}

          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className={[
              "flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50",
              user.role === "ADMIN" ? "mt-2" : "mt-4",
            ].join(" ")}
          >
            <LogOut size={16} className="text-slate-600" aria-hidden />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}