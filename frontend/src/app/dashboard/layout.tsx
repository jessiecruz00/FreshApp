"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-8 flex gap-4 border-b border-[var(--border)] pb-4">
        <Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          Dashboard
        </Link>
        <Link href="/blog" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          Blog
        </Link>
        <Link href="/dashboard/settings" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          Settings
        </Link>
        <Link href="/dashboard/notifications" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          Notifications
        </Link>
      </nav>
      {children}
    </div>
  );
}
