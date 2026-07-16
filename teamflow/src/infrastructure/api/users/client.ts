import { proxyDelete, proxyGetJson, proxyPatchJson } from "../core/fetch-client";
import { getAccessToken } from "../../auth/session";
import { userDetailPath, usersListPath } from "./paths";
import type { AdminUserDto, UpdateUserBody } from "./types";

export type { AdminUserDto, UpdateUserBody };

export async function getUsers(): Promise<AdminUserDto[]> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return proxyGetJson<AdminUserDto[]>(usersListPath(), {
    errorMessage: "Failed to fetch users",
    init: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function updateUser(
  id: string,
  body: UpdateUserBody,
): Promise<AdminUserDto> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return proxyPatchJson<AdminUserDto, UpdateUserBody>(userDetailPath(id), body, {
    errorMessage: "Could not update user",
    init: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function deleteUser(id: string): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return proxyDelete(userDetailPath(id), {
    errorMessage: "Could not delete user",
    init: { headers: { Authorization: `Bearer ${token}` } },
  });
}
