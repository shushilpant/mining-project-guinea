import { create } from 'zustand';

interface DataState {
  version: number;
  refresh: () => void;
}

// A simple store to trigger re-renders across the app when in-memory data changes
export const useDataStore = create<DataState>((set) => ({
  version: 0,
  refresh: () => set((state) => ({ version: state.version + 1 })),
}));
