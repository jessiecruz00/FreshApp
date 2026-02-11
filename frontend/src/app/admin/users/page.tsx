"use client";

import { useCallback, useEffect, useState } from "react";
import { usersApi, type User } from "@/lib/api";

export default function AdminUsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({ limit: 50, search: search || undefined });
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
      <h2 className="text-lg font-medium text-[var(--foreground)]">User management</h2>
      <input
        type="search"
        placeholder="Search by email or name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-dark mt-4 w-full max-w-sm rounded-xl px-4 py-2"
      />
      {loading ? (
        <p className="mt-6 text-[var(--muted)]">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-sm text-[var(--muted)]">
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4 text-[var(--foreground)]">{u.email}</td>
                  <td className="py-3 pr-4 text-[var(--foreground)]">{u.full_name}</td>
                  <td className="py-3 pr-4 text-[var(--muted)]">{u.role}</td>
                  <td className="py-3 pr-4">
                    <span className={u.is_active ? "text-green-500" : "text-red-500"}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-sm text-[var(--muted)]">Total: {total}</p>
    </div>
  );
}
