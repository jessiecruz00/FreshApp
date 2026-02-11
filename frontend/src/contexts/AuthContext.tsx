"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, setTokens, clearTokens } from "@/lib/api";
import type { User } from "@/lib/api";

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setTokens(data.access_token, data.refresh_token);
    await refreshUser();
  }, [refreshUser]);

  const signup = useCallback(async (email: string, password: string, fullName?: string) => {
    const data = await authApi.signup(email, password, fullName);
    setTokens(data.access_token, data.refresh_token);
    await refreshUser();
  }, [refreshUser]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const data = await authApi.google(idToken);
    setTokens(data.access_token, data.refresh_token);
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, loginWithGoogle, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
