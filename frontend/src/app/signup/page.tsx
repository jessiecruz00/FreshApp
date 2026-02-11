"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, fullName || undefined);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  const googleAuthUrl = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || "#";

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Create account</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">We’ll send a verification link to your email.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-[var(--foreground)]">
            Full name (optional)
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-dark mt-1 w-full rounded-xl px-4 py-2.5"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark mt-1 w-full rounded-xl px-4 py-2.5"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark mt-1 w-full rounded-xl px-4 py-2.5"
            minLength={6}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full rounded-xl py-2.5 font-medium disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
        {googleAuthUrl !== "#" && (
          <a
            href={googleAuthUrl}
            className="btn-ghost flex w-full items-center justify-center gap-2 rounded-xl border py-2.5"
          >
            Continue with Google
          </a>
        )}
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
