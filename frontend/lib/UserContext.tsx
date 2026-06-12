"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { API_BASE } from "./api";

export type User = {
  fullName: string;
  email: string;
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  isError: false,
  refreshUser: async () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  function getToken(): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
    return null;
  }

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/usuarios/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setIsError(false);
      } else {
        setUser(null);
        setIsError(true);
      }
    } catch {
      setUser(null);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar perfil al montar
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  function logout() {
    document.cookie = "token=; path=/; max-age=0";
    setUser(null);
    setIsError(false);
  }

  return (
    <UserContext.Provider value={{ user, isLoading, isError, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
