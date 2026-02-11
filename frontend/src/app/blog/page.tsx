"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { blogApi, type BlogPost } from "@/lib/api";

export default function BlogListPage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogApi.list({ limit: 20, search: search || undefined });
      setItems(res.items);
      setTotal(res.total);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Blog</h1>
      <div className="mt-4 flex gap-2">
        <input
          type="search"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark w-full max-w-sm rounded-xl px-4 py-2"
        />
      </div>
      {loading ? (
        <p className="mt-8 text-[var(--muted)]">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-[var(--muted)]">No posts yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="card block p-6 transition hover:border-[var(--accent)]"
              >
                <h2 className="font-medium text-[var(--foreground)]">{post.title}</h2>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{post.excerpt}</p>
                )}
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {new Date(post.created_at).toLocaleDateString()} · {post.view_count} views
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {total > items.length && (
        <p className="mt-4 text-sm text-[var(--muted)]">Showing {items.length} of {total}</p>
      )}
    </div>
  );
}
