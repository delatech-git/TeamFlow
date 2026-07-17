import { proxyGetJson, proxyPostJson, proxyPostFormData, proxyPatchFormData } from "../core/fetch-client";
import { authLoginPath, authMeAvatarPath, authMePath, authRegisterPath } from "./paths";
import type {
  AuthUser,
  LoginBody,
  LoginResponse,
  MeUser,
  RegisterBody,
  RegisterResponse,
} from "./types";
import { clearAccessToken, getAccessToken, setAccessToken } from "../../auth/session";

export type {
  AuthUser,
  LoginBody,
  LoginResponse,
  MeUser,
  RegisterBody,
  RegisterResponse,
};
export type RegisterWithAvatarBody = RegisterBody & {
  avatarFile: File;
};

/** Sign in and persist JWT for later API calls. */
export async function loginWithPassword(
  body: LoginBody,
): Promise<LoginResponse> {
  const data = await proxyPostJson<LoginResponse, LoginBody>(
    authLoginPath(),
    body,
    { errorMessage: "Invalid username or password" },
  );
  setAccessToken(data.accessToken);
  return data;
}

/** Create account (does not issue a session; call `loginWithPassword` after). */
export async function registerAccount(
  body: RegisterBody,
): Promise<RegisterResponse> {
  return proxyPostJson<RegisterResponse, RegisterBody>(
    authRegisterPath(),
    body,
    { errorMessage: "Could not create account" },
  );
}

/** Register with avatar in one request and persist JWT. */
export async function registerAndSignIn(
  body: RegisterWithAvatarBody,
): Promise<LoginResponse> {
  const formData = new FormData();

  formData.append("username", body.username);
  formData.append("email", body.email);
  formData.append("fullName", body.fullName);
  formData.append("password", body.password);
  formData.append("avatar", body.avatarFile);

  const data = await proxyPostFormData<LoginResponse>(
    authRegisterPath(),
    formData,
    { errorMessage: "Could not create account" },
  );

  setAccessToken(data.accessToken);

  return data;
}

/** Current user from JWT (`Authorization: Bearer`). */
export async function fetchCurrentUser(): Promise<MeUser> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return proxyGetJson<MeUser>(authMePath(), {
    init: { headers: { Authorization: `Bearer ${token}` } },
    errorMessage: "Could not load profile",
  });
}

/** Clear stored session (client). */
export function clearSession(): void {
  clearAccessToken();
}

export async function uploadMyAvatar(file: File) {
  const token = getAccessToken();

  if (!token) {
    throw new Error('You must be logged in to upload an avatar.');
  }

  const formData = new FormData();
  formData.append('avatar', file);

  return proxyPatchFormData<MeUser>(authMeAvatarPath(), formData, {
    errorMessage: "Avatar upload failed",
    init: { headers: { Authorization: `Bearer ${token}` } },
  });
}