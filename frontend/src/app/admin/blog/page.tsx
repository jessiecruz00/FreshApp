"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { blogApi, type BlogPost } from "@/lib/api";

export default function AdminBlogPage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogApi.adminList({ limit: 50, search: search || undefined });
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
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-[var(--foreground)]">Blog management</h2>
        <Link href="/admin/blog/new" className="btn-primary rounded-lg px-4 py-2 text-sm">
          New post
        </Link>
      </div>
      <input
        type="search"
        placeholder="Search…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-dark mt-4 w-full max-w-sm rounded-xl px-4 py-2"
      />
      {loading ? (
        <p className="mt-6 text-[var(--muted)]">Loading…</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((post) => (
            <li key={post.id} className="card flex items-center justify-between p-4">
              <div>
                <span className="font-medium text-[var(--foreground)]">{post.title}</span>
                {!post.is_published && (
                  <span className="ml-2 text-xs text-amber-500">Draft</span>
                )}
              </div>
              <Link
                href={`/admin/blog/${post.id}`}
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-sm text-[var(--muted)]">Total: {total}</p>
    </div>
  );
}
