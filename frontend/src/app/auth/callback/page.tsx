"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const params = new URLSearchParams(hash.slice(1));
    const idToken = params.get("id_token") || searchParams.get("id_token");

    if (idToken) {
      loginWithGoogle(idToken)
        .then(() => router.replace("/dashboard"))
        .catch((err) => setError(err instanceof Error ? err.message : "Google sign-in failed"));
      return;
    }
    if (code) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.access_token) {
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
            router.replace("/dashboard");
          } else setError(data.detail || "Failed");
        })
        .catch(() => setError("Google sign-in failed"));
      return;
    }
    setError("No authorization data received");
  }, [searchParams, router, loginWithGoogle]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 text-center">
      {!error && <p className="text-[var(--muted)]">Completing sign in…</p>}
      {error && (
        <>
          <p className="text-red-400">{error}</p>
          <a href="/login" className="mt-4 inline-block text-[var(--accent)] hover:underline">
            Back to login
          </a>
        </>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-[var(--muted)]">Loading…</div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
