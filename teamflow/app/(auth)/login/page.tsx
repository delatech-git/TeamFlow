"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";

import { AuthHeroLayout } from "@/app/__components/layout/authHeroLayout";
import { Button } from "@/app/__components/ui/button";
import { Input } from "@/app/__components/ui/input";
import loginImage from "@/assets/loginImage.png";
import { loginWithPassword } from "@/src/infrastructure/api/auth/client";
import { getAccessToken } from "@/src/infrastructure/auth/session";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAccessToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithPassword({
        username: username.trim(),
        password,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthHeroLayout
      titleWhite="Welcome"
      titleAccent="Back"
      subtitle="Sign in with your username or email — big plans start here."
      image={loginImage}
      imageAlt=""
      footer={
        <>
          No account?{" "}
          <Link
            href="/register"
            className="font-semibold text-orange-400 underline decoration-orange-400/40 underline-offset-4 hover:text-orange-300"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {error ? (
          <p
            className="rounded-full border border-red-500/35 bg-red-950/50 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <Input
          id="login-username"
          name="username"
          label="Username or email"
          type="text"
          autoComplete="username"
          variant="authDark"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />

        <Input
          id="login-password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          variant="authDark"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <Button
          type="submit"
          rounded
          fullWidth
          size="lg"
          disabled={loading}
          leadingIcon={<LogIn size={20} strokeWidth={2.25} />}
          className="h-14 border-0 bg-orange-500 px-5 text-lg font-extrabold uppercase tracking-wide text-white shadow-lg shadow-orange-600/30 hover:bg-orange-400 focus-visible:ring-orange-400"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthHeroLayout>
  );
}
