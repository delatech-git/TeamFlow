import { proxyGetJson, proxyPostJson } from "../core/fetch-client";
import { authLoginPath, authMePath, authRegisterPath } from "./paths";
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

/** Register then sign in with the same credentials. */
export async function registerAndSignIn(
  body: RegisterBody,
): Promise<LoginResponse> {
  await registerAccount(body);
  return loginWithPassword({
    username: body.username,
    password: body.password,
  });
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
