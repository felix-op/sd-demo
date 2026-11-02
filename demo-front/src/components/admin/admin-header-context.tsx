"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";

export interface AdminHeaderOptions {
  title: string;
  searchPlaceholder?: string;
  createLabel?: string;
  onCreate?: () => void;
  loading?: boolean;
}

// En SSR, useLayoutEffect no corre y React tira warning; en el cliente sí corre antes
// del paint, evitando el "flash" de un frame con el título/buscador de la página anterior.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface AdminHeaderContextValue {
  options: AdminHeaderOptions;
  search: string;
  setSearch: (value: string) => void;
  register: (options: AdminHeaderOptions) => void;
  unregister: () => void;
}

const DEFAULT_OPTIONS: AdminHeaderOptions = {
  title: "Backoffice",
  searchPlaceholder: "Buscar...",
  createLabel: "Crear",
};

const AdminHeaderContext = createContext<AdminHeaderContextValue | null>(null);

export function AdminHeaderProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<AdminHeaderOptions>(DEFAULT_OPTIONS);
  const [search, setSearch] = useState("");

  const register = useCallback((next: AdminHeaderOptions) => {
    setOptions(next);
  }, []);

  const unregister = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
    setSearch("");
  }, []);

  const value = useMemo(
    () => ({ options, search, setSearch, register, unregister }),
    [options, search, register, unregister],
  );

  return <AdminHeaderContext.Provider value={value}>{children}</AdminHeaderContext.Provider>;
}

export function useAdminHeaderContext() {
  const ctx = useContext(AdminHeaderContext);
  if (!ctx) {
    throw new Error("useAdminHeaderContext debe usarse dentro de AdminHeaderProvider");
  }
  return ctx;
}

/**
 * Registra el título, buscador y acción de crear de la página actual en el header
 * compartido del admin. `onCreate` debe tener identidad estable (useCallback) para
 * no re-registrar en cada render.
 */
export function useAdminHeader(options: AdminHeaderOptions) {
  const { register, unregister } = useAdminHeaderContext();
  const { title, searchPlaceholder, createLabel, onCreate, loading } = options;

  useIsomorphicLayoutEffect(() => {
    register({ title, searchPlaceholder, createLabel, onCreate, loading });
    return unregister;
  }, [register, unregister, title, searchPlaceholder, createLabel, onCreate, loading]);
}

export function useAdminSearch() {
  const { search, setSearch } = useAdminHeaderContext();
  return [search, setSearch] as const;
}
