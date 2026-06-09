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

export type WorkspaceRole = "OWNER" | "ADMIN" | "USER";

export type Workspace = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  role: WorkspaceRole;
};

type WorkspaceContextType = {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  setActiveWorkspace: (ws: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  activeWorkspace: null,
  isLoading: true,
  setActiveWorkspace: () => {},
  refreshWorkspaces: async () => {},
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function getToken(): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
    return null;
  }

  const refreshWorkspaces = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/workspaces`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const list: Workspace[] = data.data;
        setWorkspaces(list);

        // Restaurar workspace activo desde localStorage o usar el primero
        const savedId =
          typeof localStorage !== "undefined"
            ? localStorage.getItem("shujman_active_workspace")
            : null;
        const saved = savedId ? list.find((w) => w.id === savedId) : null;
        setActiveWorkspaceState(saved ?? list[0] ?? null);
      }
    } catch {
      // silenciar error de red
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar workspaces al montar
  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  function setActiveWorkspace(ws: Workspace) {
    setActiveWorkspaceState(ws);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("shujman_active_workspace", ws.id);
    }
  }

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, activeWorkspace, isLoading, setActiveWorkspace, refreshWorkspaces }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
