"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationsApi, type Notification } from "@/lib/api";

export default function DashboardNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = await notificationsApi.list({ limit: 50 });
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id: number) {
    try {
      await notificationsApi.markRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {}
  }

  async function markAllRead() {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  }

  if (loading) return <p className="text-[var(--muted)]">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Notifications</h1>
        {items.some((n) => !n.is_read) && (
          <button onClick={markAllRead} className="btn-ghost rounded-lg px-3 py-1.5 text-sm">
            Mark all read
          </button>
        )}
      </div>
      <ul className="mt-6 space-y-2">
        {items.length === 0 ? (
          <li className="text-[var(--muted)]">No notifications yet.</li>
        ) : (
          items.map((n) => (
            <li
              key={n.id}
              className={`card flex items-start justify-between gap-4 p-4 ${!n.is_read ? "border-[var(--accent)]/50" : ""}`}
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">{n.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{n.message}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="btn-ghost shrink-0 rounded-lg px-2 py-1 text-xs"
                >
                  Mark read
                </button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
