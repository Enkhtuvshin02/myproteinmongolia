"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type User = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type AuthResult = { ok: boolean; error?: string };
export type SignUpInput = Omit<User, "id"> & { password: string };

type AccountState = {
  user: User | null;
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (data: SignUpInput) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AccountContext = createContext<AccountState | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data ?? null))
      .catch(() => setUser(null))
      .finally(() => setHydrated(true));
  }, []);

  const signIn: AccountState["signIn"] = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      return { ok: false, error };
    }
    const data = await res.json();
    setUser(data);
    return { ok: true };
  };

  const signUp: AccountState["signUp"] = async (data) => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { error } = await res.json();
      return { ok: false, error };
    }
    const user = await res.json();
    setUser(user);
    return { ok: true };
  };

  const signOut: AccountState["signOut"] = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AccountContext.Provider value={{ user, hydrated, signIn, signUp, signOut }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
