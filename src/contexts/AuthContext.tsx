"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { setAuthHandlers } from "@/lib/api";
import type { AuthUser, LoginResponse } from "@/lib/types";

/** Persisted in localStorage so all tabs share the same session and new tabs can restore. */
const REFRESH_TOKEN_KEY = "tog_refresh_token";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isInitialized: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Returns new access token on success, null on failure. Used by API client for 401 retry. */
  refreshTokens: () => Promise<string | null>;
  /** Wait until auth init (and refresh, if needed) is finished */
  ready: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setStoredRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token == null) localStorage.removeItem(REFRESH_TOKEN_KEY);
  else localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/** Normalize API login user to AuthUser so missing optional fields don't break the app. */
function normalizeLoginUser(raw: unknown): AuthUser {
  const u = raw as Record<string, unknown>;
  if (!u || typeof u.id !== "string" || typeof u.email !== "string") {
    throw new Error("Invalid login response: missing user id or email");
  }
  return {
    id: u.id as string,
    email: u.email as string,
    name:
      typeof u.name === "string" ? u.name : u.name == null ? null : String(u.name),
    role: (u.role as AuthUser["role"]) ?? "editor",
    mustChangePassword: Boolean(u.mustChangePassword),
    isSystem: Boolean(u.isSystem),
    bio:
      typeof u.bio === "string" ? u.bio : u.bio == null ? null : String(u.bio),
    avatarUrl:
      typeof u.avatarUrl === "string"
        ? u.avatarUrl
        : u.avatarUrl == null
        ? null
        : String(u.avatarUrl),
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isInitialized: false,
  });

  // Prevent parallel refresh calls
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  // A promise that resolves when init+refresh is done (single source of truth)
  const initPromiseRef = useRef<Promise<void> | null>(null);

  const onUnauthorized = useCallback(() => {
    setState({ user: null, accessToken: null, isInitialized: true });
    setStoredRefreshToken(null);
    router.push("/login");
  }, [router]);

  const refreshTokens = useCallback(async (): Promise<string | null> => {
    const stored = getStoredRefreshToken();
    if (!stored) return null;

    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const promise = (async () => {
      try {
        // ✅ SAME ORIGIN (Next rewrite will proxy to api.theoceangame.com)
        const res = await fetch("/api/v1/admin/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: stored }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStoredRefreshToken(null);
          return null;
        }

        const data = (json.data ?? json) as LoginResponse;

        // ✅ normalize user here too (same as login)
        const user = normalizeLoginUser(data.user);

        setStoredRefreshToken(data.refreshToken);
        setState((s) => ({
          ...s,
          user,
          accessToken: data.accessToken,
        }));

        return data.accessToken;
      } catch {
        setStoredRefreshToken(null);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
  }, []);

  /** ✅ Single init path used by both boot and any page needing auth */
  const ready = useCallback(async () => {
    // Already initialized
    if (state.isInitialized) return;

    // If init already in progress, wait
    if (initPromiseRef.current) {
      await initPromiseRef.current;
      return;
    }

    const p = (async () => {
      const stored = getStoredRefreshToken();
      if (stored && !state.accessToken) {
        await refreshTokens();
      }
      setState((s) => ({ ...s, isInitialized: true }));
    })();

    initPromiseRef.current = p;

    try {
      await p;
    } finally {
      initPromiseRef.current = null;
    }
  }, [refreshTokens, state.accessToken, state.isInitialized]);

  // Wire API client handlers
  useEffect(() => {
    setAuthHandlers(() => state.accessToken, refreshTokens, onUnauthorized);
  }, [state.accessToken, refreshTokens, onUnauthorized]);

  // ✅ Initialize ONCE on mount via ready() (no duplicate boot logic)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ready();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  // Cross-tab logout
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === REFRESH_TOKEN_KEY && e.newValue == null) {
        setState({ user: null, accessToken: null, isInitialized: true });
        router.push("/login");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    // ✅ SAME ORIGIN
    const res = await fetch("/api/v1/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = json?.error?.message ?? "Login failed";
      throw new Error(msg);
    }

    const data = json?.data ?? json;
    if (
      !data ||
      typeof data.accessToken !== "string" ||
      typeof data.refreshToken !== "string"
    ) {
      throw new Error("Invalid login response: missing tokens");
    }

    const user = normalizeLoginUser(data.user);
    setStoredRefreshToken(data.refreshToken);
    setState({
      user,
      accessToken: data.accessToken,
      isInitialized: true,
    });
  }, []);

  const logout = useCallback(async () => {
    const stored = getStoredRefreshToken();
    if (stored) {
      try {
        // ✅ SAME ORIGIN
        await fetch("/api/v1/admin/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: stored }),
        });
      } catch {
        // ignore
      }
      setStoredRefreshToken(null);
    }
    setState({ user: null, accessToken: null, isInitialized: true });
    router.push("/login");
  }, [router]);

  const setUser = useCallback((user: AuthUser | null) => {
    setState((s) => (s.user ? { ...s, user } : s));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      refreshTokens,
      ready,
      setUser,
    }),
    [state, login, logout, refreshTokens, ready, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
