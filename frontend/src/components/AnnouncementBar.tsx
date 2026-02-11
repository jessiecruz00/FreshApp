"use client";

export function AnnouncementBar() {
  return (
    <div className="announcement-bar">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <p className="text-sm text-[var(--muted)]">
          Welcome to FreshApp — modern blog and user management.
        </p>
        <a
          href="/blog"
          className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--card)]"
        >
          Read blog
        </a>
      </div>
    </div>
  );
}
