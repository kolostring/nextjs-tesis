"use client";

import { createContext, useContext, useRef } from "react";
import { DIManager } from "../common/types";

const DependenciesContext = createContext<DIManager | null>(null);

export default function DependenciesProvider({
  children,
  manager,
}: {
  children: React.ReactNode;
  manager: DIManager;
}) {
  const managerRef = useRef(manager);

  return (
    <DependenciesContext.Provider value={managerRef.current}>
      {children}
    </DependenciesContext.Provider>
  );
}

export function useDependencies() {
  const manager = useContext(DependenciesContext);
  if (!manager) throw new Error("Dependencies Provider not found");
  return manager;
}
