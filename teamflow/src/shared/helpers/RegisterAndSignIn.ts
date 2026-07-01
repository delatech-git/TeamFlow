import { proxyPostFormData } from "@/src/infrastructure/api/core/fetch-client";
import { setAccessToken } from "@/src/infrastructure/auth/session";

export async function registerAndSignIn(body: {
  username: string;
  email: string;
  fullName: string;
  password: string;
  avatarFile: File;
}) {
  const formData = new FormData();

  formData.append("username", body.username);
  formData.append("email", body.email);
  formData.append("fullName", body.fullName);
  formData.append("password", body.password);
  formData.append("avatar", body.avatarFile);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: "POST",
    body: formData,
  });

  const rawText = await res.text();

  console.log("REGISTER STATUS:", res.status);
  console.log("REGISTER RESPONSE:", rawText);

  let result: any = null;

  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    result = null;
  }

  if (!res.ok) {
    throw new Error(
      Array.isArray(result?.message)
        ? result.message.join(", ")
        : result?.message || rawText || "Registration failed"
    );
  }

  if (result.accessToken) {
    setAccessToken(result.accessToken);
  }

  return result;
}