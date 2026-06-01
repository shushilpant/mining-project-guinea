// ============================================================
// alertStore — runtime acknowledgement state for the Automated
// Alerts layer (AlertCenter + Dashboard alert summary).
//
// The alert *definitions* are seed data (dataService.getSystemAlerts);
// this store only records which alert IDs the operator has acknowledged
// or dismissed, so the work survives reloads without mutating the DB.
//
// Persisted to localStorage so acknowledgements carry across sessions.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AlertState {
  /** Acknowledged alert IDs → the operator who cleared them. */
  acknowledged: Record<string, string>;
  /** Dismissed (hidden) alert IDs. */
  dismissed: Record<string, boolean>;

  acknowledge: (id: string, by?: string) => void;
  unacknowledge: (id: string) => void;
  dismiss: (id: string) => void;
  isAcknowledged: (id: string) => boolean;
  isDismissed: (id: string) => boolean;
  reset: () => void;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      acknowledged: {},
      dismissed: {},

      acknowledge: (id, by = 'Operator') =>
        set((s) => ({ acknowledged: { ...s.acknowledged, [id]: by } })),
      unacknowledge: (id) =>
        set((s) => {
          const next = { ...s.acknowledged };
          delete next[id];
          return { acknowledged: next };
        }),
      dismiss: (id) =>
        set((s) => ({ dismissed: { ...s.dismissed, [id]: true } })),
      isAcknowledged: (id) => !!get().acknowledged[id],
      isDismissed: (id) => !!get().dismissed[id],
      reset: () => set({ acknowledged: {}, dismissed: {} }),
    }),
    { name: 'peb-alerts-v1' },
  ),
);
