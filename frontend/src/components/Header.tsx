"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const nav = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme, resolved } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-[var(--foreground)]">
          FreshApp
        </Link>
        <nav className="flex items-center gap-6">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm uppercase tracking-wide transition hover:opacity-80 ${
                pathname === href ? "text-[var(--foreground)]" : "text-[var(--muted)]"
              }`}
            >
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
            className="rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="Toggle theme"
          >
            {resolved === "dark" ? "Light" : "Dark"}
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm uppercase tracking-wide text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Admin
                </Link>
              )}
              <Link
                href={user.role === "admin" ? "/admin/settings" : "/dashboard/settings"}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={logout}
                className="btn-ghost rounded-lg px-3 py-1.5 text-sm"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
                Log in
              </Link>
              <Link
                href="/signup"
                className="btn-primary rounded-lg px-4 py-2 text-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
