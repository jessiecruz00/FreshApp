"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="text-lg font-medium text-[var(--foreground)]">Overview</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Manage users, blog, and app settings.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users" className="card block p-6 hover:border-[var(--accent)]">
          <span className="font-medium text-[var(--foreground)]">Users</span>
          <p className="mt-1 text-sm text-[var(--muted)]">User management</p>
        </Link>
        <Link href="/admin/blog" className="card block p-6 hover:border-[var(--accent)]">
          <span className="font-medium text-[var(--foreground)]">Blog</span>
          <p className="mt-1 text-sm text-[var(--muted)]">Posts and drafts</p>
        </Link>
        <Link href="/admin/settings" className="card block p-6 hover:border-[var(--accent)]">
          <span className="font-medium text-[var(--foreground)]">Settings</span>
          <p className="mt-1 text-sm text-[var(--muted)]">App and theme</p>
        </Link>
        <Link href="/admin/notifications" className="card block p-6 hover:border-[var(--accent)]">
          <span className="font-medium text-[var(--foreground)]">Notifications</span>
          <p className="mt-1 text-sm text-[var(--muted)]">Send to users</p>
        </Link>
      </div>
    </div>
  );
}
