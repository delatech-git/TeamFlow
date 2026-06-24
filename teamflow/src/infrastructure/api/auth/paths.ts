import { buildProxyPath } from "../core/proxy-path";

export function authLoginPath(): string {
  return buildProxyPath(["auth", "login"]);
}

export function authRegisterPath(): string {
  return buildProxyPath(["auth", "register"]);
}

export function authMePath(): string {
  return buildProxyPath(["auth", "me"]);
}
