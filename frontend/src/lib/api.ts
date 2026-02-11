const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function setTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export async function api<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...init } = options;
  const token = skipAuth ? null : getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && !skipAuth && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${getToken()}`;
      res = await fetch(`${API_BASE}${path}`, { ...init, headers });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || String(res.status));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const data = await api<{ access_token: string; refresh_token: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refresh }),
      skipAuth: true,
    });
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ access_token: string; refresh_token: string; token_type: string; expires_in: number }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }), skipAuth: true }
    ),
  signup: (email: string, password: string, full_name?: string) =>
    api<{ access_token: string; refresh_token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: full_name || "" }),
      skipAuth: true,
    }),
  verifyEmail: (token: string) =>
    api<{ access_token: string; refresh_token: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
      skipAuth: true,
    }),
  google: (id_token: string) =>
    api<{ access_token: string; refresh_token: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ id_token }),
      skipAuth: true,
    }),
  googleCode: (code: string) =>
    api<{ access_token: string; refresh_token: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ code }),
      skipAuth: true,
    }),
  me: () => api<{ id: number; email: string; full_name: string; avatar_url: string | null; role: string; is_verified: boolean; is_active: boolean; created_at: string }>("/auth/me"),
};

export const blogApi = {
  list: (params?: { skip?: number; limit?: number; search?: string }) => {
    const sp = new URLSearchParams();
    if (params?.skip != null) sp.set("skip", String(params.skip));
    if (params?.limit != null) sp.set("limit", String(params.limit));
    if (params?.search) sp.set("search", params.search);
    return api<{ items: BlogPost[]; total: number }>(`/blog?${sp}`);
  },
  get: (id: number) => api<BlogPost>(`/blog/${id}`),
  getBySlug: (slug: string) => api<BlogPost>(`/blog/slug/${slug}`),
  adminGet: (id: number) => api<BlogPost>(`/blog/admin/${id}`),
  adminList: (params?: { skip?: number; limit?: number; search?: string }) => {
    const sp = new URLSearchParams();
    if (params?.skip != null) sp.set("skip", String(params.skip));
    if (params?.limit != null) sp.set("limit", String(params.limit));
    if (params?.search) sp.set("search", params.search || "");
    return api<{ items: BlogPost[]; total: number }>(`/blog/admin/list?${sp}`);
  },
  create: (body: { title: string; content: string; excerpt?: string; cover_image_url?: string; is_published?: boolean }) =>
    api<BlogPost>("/blog", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: Partial<{ title: string; content: string; excerpt?: string; cover_image_url?: string; is_published?: boolean }>) =>
    api<BlogPost>(`/blog/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: number) => api<void>(`/blog/${id}`, { method: "DELETE" }),
};

export const settingsApi = {
  get: () =>
    api<{ id: number; user_id: number; theme: string; email_notifications: boolean; push_notifications: boolean; app_name?: string; app_logo_url?: string; meta_description?: string }>(
      "/settings"
    ),
  update: (body: Partial<{ theme: string; email_notifications: boolean; push_notifications: boolean; full_name?: string; avatar_url?: string; app_name?: string; app_logo_url?: string; meta_description?: string }>) =>
    api<unknown>("/settings", { method: "PATCH", body: JSON.stringify(body) }),
};

export const notificationsApi = {
  list: (params?: { skip?: number; limit?: number; unread_only?: boolean }) => {
    const sp = new URLSearchParams();
    if (params?.skip != null) sp.set("skip", String(params.skip));
    if (params?.limit != null) sp.set("limit", String(params.limit));
    if (params?.unread_only) sp.set("unread_only", "true");
    return api<Notification[]>(`/notifications?${sp}`);
  },
  markRead: (id: number) => api<Notification>(`/notifications/${id}`, { method: "PATCH", body: JSON.stringify({ is_read: true }) }),
  markAllRead: () => api<{ ok: boolean }>("/notifications/mark-all-read", { method: "POST" }),
};

export const usersApi = {
  list: (params?: { skip?: number; limit?: number; search?: string }) => {
    const sp = new URLSearchParams();
    if (params?.skip != null) sp.set("skip", String(params.skip));
    if (params?.limit != null) sp.set("limit", String(params.limit));
    if (params?.search) sp.set("search", params.search || "");
    return api<{ items: User[]; total: number }>(`/users?${sp}`);
  },
  get: (id: number) => api<User>(`/users/${id}`),
  create: (body: { email: string; password: string; full_name?: string; role?: string }) =>
    api<User>("/users", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: Partial<{ full_name?: string; avatar_url?: string; is_active?: boolean }>) =>
    api<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
};

export type User = {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  author_id: number | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type Notification = {
  id: number;
  user_id: number;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export { setTokens, getToken };
