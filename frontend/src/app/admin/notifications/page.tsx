"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { usersApi, type User } from "@/lib/api";

export default function AdminNotificationsPage() {
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function loadUsers() {
    if (loaded) return;
    try {
      const res = await usersApi.list({ limit: 200 });
      setUsers(res.items);
    } catch {}
    setLoaded(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const uid = parseInt(userId, 10);
    if (!uid || !title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await api("/notifications/admin", {
        method: "POST",
        body: JSON.stringify({
          user_id: uid,
          title: title.trim(),
          message: message.trim(),
          link: link.trim() || undefined,
        }),
      });
      setTitle("");
      setMessage("");
      setLink("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-[var(--foreground)]">Send notification</h2>
      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">User</label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onFocus={loadUsers}
            className="input-dark mt-1 w-full rounded-xl px-4 py-2.5"
            required
          >
            <option value="">Select user…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email} ({u.full_name})
              </option>
            ))}
          </select>
          {users.length === 0 && loaded && (
            <p className="mt-1 text-xs text-[var(--muted)]">Load users by opening the dropdown.</p>
          )}
        </div>
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
          <label className="block text-sm font-medium text-[var(--foreground)]">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-dark mt-1 w-full rounded-xl px-4 py-2.5"
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Link (optional)</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="input-dark mt-1 w-full rounded-xl px-4 py-2.5"
          />
        </div>
        <button type="submit" disabled={sending} className="btn-primary rounded-xl px-4 py-2 disabled:opacity-50">
          {sending ? "Sending…" : "Send notification"}
        </button>
      </form>
    </div>
  );
}
