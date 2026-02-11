import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="bg-gradient-to-r from-[var(--foreground)] to-[var(--muted)] bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
        FreshApp
      </h1>
      <p className="mt-6 max-w-xl text-lg text-[var(--muted)]">
        Modern blog, user management, and settings. Sign up or sign in to get started.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/signup"
          className="btn-primary inline-flex items-center justify-center rounded-xl px-6 py-3 text-base"
        >
          Get started
        </Link>
        <Link
          href="/blog"
          className="btn-ghost inline-flex items-center justify-center rounded-xl border px-6 py-3 text-base"
        >
          Read blog
        </Link>
      </div>
    </div>
  );
}
