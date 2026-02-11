"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setTokens } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const verify = useCallback(async () => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token");
      return;
    }
    setStatus("loading");
    try {
      const data = await api<{ access_token: string; refresh_token: string }>("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token }),
        skipAuth: true,
      });
      setTokens(data.access_token, data.refresh_token);
      setStatus("success");
      setMessage("Email verified. Redirecting…");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Invalid or expired link");
    }
  }, [token, router]);

  useEffect(() => {
    if (token && status === "idle") verify();
    else if (!token) setStatus("error");
  }, [token, status, verify]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 text-center">
      {status === "loading" && <p className="text-[var(--muted)]">Verifying your email…</p>}
      {status === "success" && (
        <p className="text-[var(--foreground)]">{message}</p>
      )}
      {status === "error" && (
        <>
          <p className="text-red-400">{message}</p>
          <a href="/login" className="mt-4 inline-block text-[var(--accent)] hover:underline">
            Back to login
          </a>
        </>
      )}
      {!token && status === "idle" && (
        <p className="text-[var(--muted)]">No token provided.</p>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-[var(--muted)]">Loading…</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
