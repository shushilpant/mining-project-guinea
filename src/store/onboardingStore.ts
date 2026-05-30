// ============================================================
// onboardingStore — remembers what first-time guidance the user has
// already seen, so we help newcomers without nagging returning users.
//
//   • tourSeen        — has the first-run guided tour been completed
//                       or skipped at least once.
//   • dismissedIntros — per-route map of collapsed "what is this page"
//                       intro panels.
//
// Persisted to localStorage so the state survives reloads.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  tourSeen: boolean;
  dismissedIntros: Record<string, boolean>;

  markTourSeen: () => void;
  resetTour: () => void;

  dismissIntro: (route: string) => void;
  restoreIntro: (route: string) => void;
  isIntroDismissed: (route: string) => boolean;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      tourSeen: false,
      dismissedIntros: {},

      markTourSeen: () => set({ tourSeen: true }),
      resetTour: () => set({ tourSeen: false }),

      dismissIntro: (route) =>
        set((state) => ({ dismissedIntros: { ...state.dismissedIntros, [route]: true } })),
      restoreIntro: (route) =>
        set((state) => ({ dismissedIntros: { ...state.dismissedIntros, [route]: false } })),
      isIntroDismissed: (route) => !!get().dismissedIntros[route],
    }),
    { name: 'peb-onboarding-v1' },
  ),
);
