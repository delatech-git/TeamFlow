"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { BackToDashboardLink } from "@/app/__components/layout/backToDashboardLink";
import { fetchCurrentUser } from "@/src/infrastructure/api/auth/client";
import {
  deleteUser,
  getUsers,
  updateUser,
  type AdminUserDto,
  type UpdateUserBody,
} from "@/src/infrastructure/api/users/client";
import { getAccessToken } from "@/src/infrastructure/auth/session";
import { hashAccent } from "@/app/planned-ideas/colorAccents";

type EditFormValues = {
  username: string;
  email: string;
  fullName: string;
  password: string;
};

const inputClass =
  "w-full rounded-lg border border-slate-600/50 bg-[#081120] px-2 py-1 text-sm text-white outline-none focus:border-cyan-400/50";

export default function AdminUsersPage() {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditFormValues>({
    username: "",
    email: "",
    fullName: "",
    password: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchCurrentUser();
        if (cancelled) return;
        setCurrentUserId(me.id);
        if (me.role !== "ADMIN") {
          router.replace("/dashboard");
          return;
        }
        setIsAdmin(true);
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setCheckingAccess(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getUsers();
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load users.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const startEditing = (user: AdminUserDto) => {
    setEditingId(user.id);
    setEditError("");
    setDraft({
      username: user.username,
      email: user.email,
      fullName: user.fullName ?? "",
      password: "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditError("");
  };

  const setDraftField = (field: keyof EditFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setDraft((prev) => ({ ...prev, [field]: event.target.value }));

  const saveEditing = async (userId: string) => {
    setSavingEdit(true);
    setEditError("");
    try {
      const body: UpdateUserBody = {
        username: draft.username.trim(),
        email: draft.email.trim(),
        fullName: draft.fullName.trim(),
      };
      if (draft.password.trim()) {
        body.password = draft.password.trim();
      }

      const updated = await updateUser(userId, body);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditingId(null);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Could not update user.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (user: AdminUserDto) => {
    if (!window.confirm(`Delete ${user.username}? This cannot be undone.`)) {
      return;
    }
    setDeletingId(user.id);
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Could not delete user.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (checkingAccess) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#050b16] text-sm text-slate-300">
        Checking access...
      </section>
    );
  }

  if (!isAdmin) return null;

  return (
    <section className="min-h-screen bg-[#050b16] px-4 pb-8 pt-25 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto mb-4 flex max-w-300 flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-400/10 bg-[#0b1424] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">
            TeamTide
          </p>
          <h1 className="mt-1 text-lg font-semibold text-white">
            Manage Users
          </h1>
        </div>
        <BackToDashboardLink />
      </div>

      <div className="mx-auto max-w-300 rounded-2xl border border-cyan-400/10 bg-[#0b1424] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        {loading ? (
          <p className="p-4 text-sm text-slate-400">Loading users...</p>
        ) : error ? (
          <p className="p-4 text-sm text-red-300">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700/40 text-xs uppercase tracking-wide text-cyan-300/80">
                  <th className="px-3 py-2 font-semibold">User</th>
                  <th className="px-3 py-2 font-semibold">Email</th>
                  <th className="px-3 py-2 font-semibold">Role</th>
                  <th className="px-3 py-2 font-semibold">Joined</th>
                  <th className="px-3 py-2 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const accent = hashAccent(user.id);
                  const name = user.fullName || user.username;
                  const isEditing = editingId === user.id;

                  if (isEditing) {
                    return (
                      <tr
                        key={user.id}
                        className="border-b border-slate-700/30 align-top last:border-0"
                      >
                        <td className="px-3 py-3">
                          <div className="space-y-1.5">
                            <input
                              value={draft.username}
                              onChange={setDraftField("username")}
                              placeholder="Username"
                              className={inputClass}
                            />
                            <input
                              value={draft.fullName}
                              onChange={setDraftField("fullName")}
                              placeholder="Full name"
                              className={inputClass}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <input
                            value={draft.email}
                            onChange={setDraftField("email")}
                            type="email"
                            placeholder="Email"
                            className={inputClass}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            value={draft.password}
                            onChange={setDraftField("password")}
                            type="password"
                            placeholder="New password"
                            className={inputClass}
                          />
                        </td>
                        <td className="px-3 py-3 text-slate-500">
                          Leave password blank to keep current
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => saveEditing(user.id)}
                              disabled={savingEdit}
                              aria-label="Save"
                              className="rounded-full border border-cyan-400/40 p-1.5 text-cyan-200 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Check size={14} aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={savingEdit}
                              aria-label="Cancel"
                              className="rounded-full border border-slate-600/50 p-1.5 text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <X size={14} aria-hidden />
                            </button>
                          </div>
                          {editError ? (
                            <p className="mt-1.5 text-right text-xs text-red-300">
                              {editError}
                            </p>
                          ) : null}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-700/30 last:border-0"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${accent.solidBg}`}
                            aria-hidden
                          >
                            {name.slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-100">
                              {name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-300">
                        {user.email}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={[
                            "rounded-full border px-2 py-0.5 text-xs font-semibold",
                            user.role === "ADMIN"
                              ? "border-amber-300/30 bg-amber-400/10 text-amber-200"
                              : "border-slate-600/50 text-slate-300",
                          ].join(" ")}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(user)}
                            aria-label={`Edit ${user.username}`}
                            className="rounded-full border border-slate-600/50 p-1.5 text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
                          >
                            <Pencil size={14} aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={
                              deletingId === user.id ||
                              user.id === currentUserId
                            }
                            aria-label={`Delete ${user.username}`}
                            title={
                              user.id === currentUserId
                                ? "You cannot delete your own account"
                                : undefined
                            }
                            className="rounded-full border border-slate-600/50 p-1.5 text-slate-300 transition hover:border-red-400/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={14} aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
