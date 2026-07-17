import { proxyPostFormData } from "@/src/infrastructure/api/core/fetch-client";
import { authRegisterPath } from "@/src/infrastructure/api/auth/paths";
import { setAccessToken } from "@/src/infrastructure/auth/session";

export async function registerAndSignIn(body: {
  username: string;
  email: string;
  fullName: string;
  password: string;
  avatarFile?: File | null;
}) {
  const formData = new FormData();

  formData.append("username", body.username);
  formData.append("email", body.email);
  formData.append("fullName", body.fullName);
  formData.append("password", body.password);
  if (body.avatarFile) {
    formData.append("avatar", body.avatarFile);
  }

  const result = await proxyPostFormData<{ accessToken?: string }>(
    authRegisterPath(),
    formData,
    { errorMessage: "Registration failed" },
  );

  if (result.accessToken) {
    setAccessToken(result.accessToken);
  }

  return result;
}
