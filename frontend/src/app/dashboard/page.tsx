"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Dashboard</h1>
      <p className="mt-2 text-[var(--muted)]">
        Welcome, {user?.full_name || user?.email}.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/blog"
          className="card block p-6 transition hover:border-[var(--accent)]"
        >
          <h2 className="font-medium text-[var(--foreground)]">Blog</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Browse and read posts</p>
        </Link>
        <Link
          href="/dashboard/settings"
          className="card block p-6 transition hover:border-[var(--accent)]"
        >
          <h2 className="font-medium text-[var(--foreground)]">Settings</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Profile and theme</p>
        </Link>
      </div>
    </div>
  );
}
