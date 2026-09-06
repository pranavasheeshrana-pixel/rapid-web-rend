import { useCallback, useEffect, useState } from "react";
import { apiClient, delay, tryBackend } from "@/lib/api/client";
import type { AuthUser, Role } from "@/features/shared/types";

const STORAGE_KEY = "medilink.user";

const roleUnits: Record<Role, string> = {
  patient: "Patient portal",
  staff: "West Wing",
  admin: "Operations",
  auditor: "Compliance",
};

export const roleHome: Record<Role, string> = {
  patient: "/patient/dashboard",
  staff: "/staff/dashboard",
  admin: "/admin/dashboard",
  auditor: "/auditor/dashboard",
};

export interface Credentials {
  email: string;
  password: string;
  role: Role;
  name?: string;
}

export const authService = {
  login: (creds: Credentials) =>
    tryBackend<AuthUser>(
      async () => (await apiClient.post<AuthUser>("/api/auth/login", creds)).data,
      async () => {
        await delay(500);
        return buildUser(creds);
      },
    ),

  register: (creds: Credentials) =>
    tryBackend<AuthUser>(
      async () => (await apiClient.post<AuthUser>("/api/auth/register", creds)).data,
      async () => {
        await delay(600);
        return buildUser(creds);
      },
    ),

  me: () =>
    tryBackend<AuthUser | null>(
      async () => (await apiClient.get<AuthUser>("/api/me")).data,
      async () => readStored(),
    ),
};

function buildUser(creds: Credentials): AuthUser {
  const fallbackName = creds.email.split("@")[0]?.replace(/[._]/g, " ") ?? "MediLink user";
  return {
    id: `u-${Math.random().toString(36).slice(2, 8)}`,
    name: creds.name?.trim() || fallbackName,
    email: creds.email,
    role: creds.role,
    unit: roleUnits[creds.role],
  };
}

function readStored(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function persistUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.localStorage.setItem("medilink.token", `mock.${user.role}.token`);
}

export function clearUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem("medilink.token");
}

/** Client-side session state. Reads storage after hydration to avoid mismatches. */
export function useAuth(fallbackRole?: Role) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setUser(stored);
    } else if (fallbackRole) {
      setUser({
        id: "demo",
        name: "Demo session",
        email: `demo.${fallbackRole}@medilink.test`,
        role: fallbackRole,
        unit: roleUnits[fallbackRole],
      });
    }
    setReady(true);
  }, [fallbackRole]);

  const signOut = useCallback(() => {
    clearUser();
    setUser(null);
  }, []);

  return { user, ready, signOut };
}
