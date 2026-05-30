import { create } from 'zustand';
import { useMemo, type DependencyList } from 'react';

interface DataState {
  version: number;
  refresh: () => void;
}

// A simple store to trigger re-renders across the app when in-memory data changes
export const useDataStore = create<DataState>((set) => ({
  version: 0,
  refresh: () => set((state) => ({ version: state.version + 1 })),
}));

/**
 * Like `useMemo`, but also re-computes whenever the in-memory DB mutates.
 *
 * Values derived from dataService getters (getOperators, getRiskFlags, …) read
 * the mutable module-level `DB`. ESLint's exhaustive-deps can't see through the
 * getter, so it can't know those values depend on the store's `version`. This
 * hook folds that cache-bust token into the dependency list in one place,
 * keeping call sites clean and warning-free.
 */
export function useStoreData<T>(compute: () => T, deps: DependencyList): T {
  const version = useDataStore((s) => s.version);
  // `version` is the cache-bust token; `compute` closes over `deps` by contract.
  // Forwarding a caller-supplied dep list is exactly what the array-literal and
  // exhaustive-deps rules can't model, so we vouch for it here, in one place.
  // eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
  return useMemo(compute, [...deps, version]);
}
