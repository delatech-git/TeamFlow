"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";

import { AuthHeroLayout } from "@/app/__components/layout/authHeroLayout";
import { Button } from "@/app/__components/ui/button";
import { Input } from "@/app/__components/ui/input";
import loginImage from "@/assets/loginImage.png";
import { registerAndSignIn } from "@/src/infrastructure/api/auth/client";
import { getAccessToken } from "@/src/infrastructure/auth/session";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerAndSignIn({
        username: username.trim(),
        email: email.trim(),
        fullName: fullName.trim(),
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
      titleWhite="Join"
      titleAccent="TeamTide"
      subtitle="Create your account and plan events your whole team can shape together."
      image={loginImage}
      imageAlt=""
      wideForm
      footer={
        <>
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-orange-400 underline decoration-orange-400/40 underline-offset-4 hover:text-orange-300"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5 sm:gap-6">
        {error ? (
          <p
            className="rounded-full border border-red-500/35 bg-red-950/50 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <Input
          id="register-full-name"
          name="fullName"
          label="Full name"
          type="text"
          autoComplete="name"
          variant="authDark"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
        />

        <Input
          id="register-username"
          name="username"
          label="Username"
          type="text"
          autoComplete="username"
          variant="authDark"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />

        <Input
          id="register-email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          variant="authDark"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <Input
          id="register-password"
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 6 characters."
          variant="authDark"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
        />

        <Button
          type="submit"
          rounded
          fullWidth
          size="lg"
          disabled={loading}
          leadingIcon={<UserPlus size={20} strokeWidth={2.25} />}
          className="mt-1 h-14 border-0 bg-orange-500 px-5 text-lg font-extrabold uppercase tracking-wide text-white shadow-lg shadow-orange-600/30 hover:bg-orange-400 focus-visible:ring-orange-400"
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthHeroLayout>
  );
}
