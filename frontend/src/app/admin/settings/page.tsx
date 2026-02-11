"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { settingsApi } from "@/lib/api";

export default function AdminSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [appName, setAppName] = useState("");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const s = await settingsApi.get();
      setFullName(user?.full_name ?? "");
      setAppName(s.app_name ?? "");
      setEmailNotif(s.email_notifications);
      setPushNotif(s.push_notifications);
      setTheme(s.theme as "light" | "dark" | "system");
    } catch {
      setFullName(user?.full_name ?? "");
    } finally {
      setLoaded(true);
    }
  }, [user, setTheme]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      load();
    }
  }, [user, load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.update({
        full_name: fullName,
        theme,
        email_notifications: emailNotif,
        push_notifications: pushNotif,
        app_name: appName || undefined,
      });
      await refreshUser();
    } finally {
      setSaving(false);
    }
  }

  if (!loaded && user) return <p className="text-[var(--muted)]">Loading…</p>;

  return (
    <div>
      <h2 className="text-lg font-medium text-[var(--foreground)]">Admin & app settings</h2>
      <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Your name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-dark mt-1 w-full rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">App name</label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="input-dark mt-1 w-full rounded-xl px-4 py-2.5"
            placeholder="FreshApp"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
            className="input-dark mt-1 w-full rounded-xl px-4 py-2.5"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="emailNotif"
            checked={emailNotif}
            onChange={(e) => setEmailNotif(e.target.checked)}
            className="rounded border-[var(--border)]"
          />
          <label htmlFor="emailNotif" className="text-sm text-[var(--foreground)]">Email notifications</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pushNotif"
            checked={pushNotif}
            onChange={(e) => setPushNotif(e.target.checked)}
            className="rounded border-[var(--border)]"
          />
          <label htmlFor="pushNotif" className="text-sm text-[var(--foreground)]">Push notifications</label>
        </div>
        <button type="submit" disabled={saving} className="btn-primary rounded-xl px-4 py-2 disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
