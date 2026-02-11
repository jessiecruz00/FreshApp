"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { blogApi } from "@/lib/api";

export default function AdminBlogNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await blogApi.create({
        title,
        content,
        excerpt: excerpt || undefined,
        is_published: isPublished,
      });
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
        ← Blog
      </Link>
      <h2 className="mt-4 text-lg font-medium text-[var(--foreground)]">New post</h2>
      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
        {error && (
          <p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-dark mt-1 w-full rounded-xl px-4 py-2.5"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Excerpt (optional)</label>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="input-dark mt-1 w-full rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-dark mt-1 w-full rounded-xl px-4 py-2.5"
            rows={12}
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pub"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded border-[var(--border)]"
          />
          <label htmlFor="pub" className="text-sm text-[var(--foreground)]">Publish</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary rounded-xl px-4 py-2 disabled:opacity-50">
            {saving ? "Creating…" : "Create post"}
          </button>
          <Link href="/admin/blog" className="btn-ghost rounded-xl px-4 py-2">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
