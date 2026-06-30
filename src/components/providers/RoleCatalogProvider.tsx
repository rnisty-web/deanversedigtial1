"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_ROLE_CATALOG, type RoleDefinition } from "@/lib/roles/catalog";

type RoleCatalogContextValue = {
  catalog: RoleDefinition[];
};

const RoleCatalogContext = createContext<RoleCatalogContextValue>({
  catalog: DEFAULT_ROLE_CATALOG,
});

export function RoleCatalogProvider({
  catalog,
  children,
}: {
  catalog: RoleDefinition[];
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ catalog: catalog.length > 0 ? catalog : DEFAULT_ROLE_CATALOG }),
    [catalog],
  );

  return <RoleCatalogContext.Provider value={value}>{children}</RoleCatalogContext.Provider>;
}

export function useRoleCatalog() {
  return useContext(RoleCatalogContext).catalog;
}
