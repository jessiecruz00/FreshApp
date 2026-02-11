"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { blogApi, type BlogPost } from "@/lib/api";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError("");
    try {
      const p = await blogApi.getBySlug(slug);
      setPost(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Post not found");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-12"><p className="text-[var(--muted)]">Loading…</p></div>;
  if (error || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-red-400">{error || "Post not found"}</p>
        <Link href="/blog" className="mt-4 inline-block text-[var(--accent)] hover:underline">Back to blog</Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/blog" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
        ← Blog
      </Link>
      <h1 className="mt-4 text-3xl font-semibold text-[var(--foreground)]">{post.title}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {new Date(post.created_at).toLocaleDateString()} · {post.view_count} views
      </p>
      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt=""
          className="mt-6 w-full rounded-xl object-cover"
        />
      )}
      <div
        className="prose prose-invert mt-8 max-w-none text-[var(--foreground)]"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }}
      />
    </article>
  );
}
