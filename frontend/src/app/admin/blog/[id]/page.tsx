"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { blogApi, type BlogPost } from "@/lib/api";

export default function AdminBlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await blogApi.adminGet(id);
      setPost(p);
      setTitle(p.title);
      setContent(p.content);
      setExcerpt(p.excerpt ?? "");
      setIsPublished(p.is_published);
    } catch {
      setError("Post not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!post) return;
    setError("");
    setSaving(true);
    try {
      await blogApi.update(post.id, {
        title,
        content,
        excerpt: excerpt || undefined,
        is_published: isPublished,
      });
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post || !confirm("Delete this post?")) return;
    try {
      await blogApi.delete(post.id);
      router.push("/admin/blog");
      router.refresh();
    } catch {}
  }

  if (loading) return <p className="text-[var(--muted)]">Loading…</p>;
  if (error || !post) {
    return (
      <div>
        <p className="text-red-400">{error || "Not found"}</p>
        <Link href="/admin/blog" className="mt-4 inline-block text-[var(--accent)] hover:underline">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
        ← Blog
      </Link>
      <h2 className="mt-4 text-lg font-medium text-[var(--foreground)]">Edit: {post.title}</h2>
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
          <label htmlFor="pub" className="text-sm text-[var(--foreground)]">Published</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary rounded-xl px-4 py-2 disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={handleDelete} className="rounded-xl border border-red-500/50 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
            Delete
          </button>
          <Link href="/admin/blog" className="btn-ghost rounded-xl px-4 py-2">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
