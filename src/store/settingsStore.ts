import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_THRESHOLDS, type RiskThresholds } from '@/services/dataService';

interface SettingsState {
  riskThresholds: RiskThresholds;
  updateThresholds: (newThresholds: Partial<RiskThresholds>) => void;
  resetThresholds: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      riskThresholds: { ...DEFAULT_THRESHOLDS },
      updateThresholds: (newThresholds) =>
        set((state) => ({
          riskThresholds: { ...state.riskThresholds, ...newThresholds },
        })),
      resetThresholds: () => set({ riskThresholds: { ...DEFAULT_THRESHOLDS } }),
    }),
    {
      name: 'peb-settings-storage',
    }
  )
);
