import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuditAction =
  | 'create'
  | 'update'
  | 'import'
  | 'bulk_update'
  | 'login'
  | 'logout'
  | 'export'
  | 'settings_change';

export type AuditEntity =
  | 'agreement'
  | 'operator'
  | 'commitment'
  | 'risk_flag'
  | 'infrastructure'
  | 'performance_record'
  | 'session'
  | 'settings';

export type ReviewStatus = 'unreviewed' | 'reviewed' | 'flagged' | 'escalated';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityLabel: string;
  user?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
  count?: number;
  // Review workflow
  reviewStatus: ReviewStatus;
  reviewNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  isAnomaly?: boolean;
  anomalyReason?: string;
}

interface AuditState {
  entries: AuditEntry[];
  sessionStart: string;
  log: (entry: Omit<AuditEntry, 'id' | 'timestamp' | 'reviewStatus'>) => void;
  clear: () => void;
  clearAll: () => void;
  setSessionStart: (ts: string) => void;
  markReviewed: (id: string, note?: string, reviewer?: string) => void;
  flagEntry: (id: string, reason: string) => void;
  escalateEntry: (id: string, reason?: string) => void;
  markUnreviewed: (id: string) => void;
  bulkMarkReviewed: (ids: string[], reviewer?: string) => void;
  seedIfEmpty: () => void;
}

function isOffHours(iso: string): boolean {
  const h = new Date(iso).getHours();
  return h < 6 || h >= 22;
}

function makeSeedTimestamp(hoursAgo: number, minutesAgo = 0): string {
  const d = new Date();
  d.setTime(d.getTime() - (hoursAgo * 3600 + minutesAgo * 60) * 1000);
  return d.toISOString();
}

function buildSeedEntries(): AuditEntry[] {
  const seed = (
    id: string,
    hoursAgo: number,
    minutesAgo: number,
    partial: Omit<AuditEntry, 'id' | 'timestamp' | 'reviewStatus'>,
    anomaly?: string,
  ): AuditEntry => ({
    id,
    timestamp: makeSeedTimestamp(hoursAgo, minutesAgo),
    reviewStatus: 'unreviewed',
    isAnomaly: !!anomaly,
    anomalyReason: anomaly,
    ...partial,
  });

  return [
    seed('seed-001', 23, 10, {
      action: 'login', entity: 'session',
      entityId: 'session-001', entityLabel: 'Admin Session',
      user: 'admin@peblink.io', details: 'Authenticated via SSO',
    }),

    seed('seed-002', 22, 30, {
      action: 'import', entity: 'performance_record',
      entityId: 'batch-Q1-2025', entityLabel: 'Q1 2025 Performance Import',
      user: 'admin@peblink.io', count: 47,
      details: 'Bulk Q1 2025 production figures — 15 operators, 3 countries',
    }, 'Large bulk import affecting 47 records'),

    seed('seed-003', 20, 15, {
      action: 'update', entity: 'agreement',
      entityId: 'AGR-006', entityLabel: 'GAC/EGA — Boffa Bauxite Convention',
      user: 'admin@peblink.io', field: 'status',
      oldValue: 'active', newValue: 'lapsed',
      details: 'Licence revoked August 2025 by CNRD government — EGA failed alumina refinery delivery',
    }),

    seed('seed-004', 19, 5, {
      action: 'create', entity: 'risk_flag',
      entityId: 'RF-AUTO-001', entityLabel: 'UC Rusal Guinea — Sanctions Exposure',
      user: 'risk-engine@peblink.io',
      details: 'CRITICAL: Post-2022 sanctions context creates operational and financing risk across Friguia/Kindia/Boké operations',
    }),

    seed('seed-005', 18, 20, {
      action: 'update', entity: 'commitment',
      entityId: 'CMT-023', entityLabel: 'EGA Alumina Refinery — Construction',
      user: 'admin@peblink.io', field: 'status',
      oldValue: 'at-risk', newValue: 'breached',
      details: 'Never delivered — target was 100% complete by 2020-12-31',
    }),

    seed('seed-006', 17, 45, {
      action: 'update', entity: 'operator',
      entityId: 'OP-06', entityLabel: 'Nimba Mining Company (fmr GAC/EGA)',
      user: 'admin@peblink.io', field: 'complianceStatus',
      oldValue: 'at-risk', newValue: 'breached',
    }),

    seed('seed-007', 17, 10, {
      action: 'export', entity: 'agreement',
      entityId: 'export-001', entityLabel: 'Full Agreement Portfolio Export',
      user: 'admin@peblink.io', count: 20,
      details: 'XLSX export — 20 agreements across Guinea, Ghana, Côte d\'Ivoire',
    }),

    // Off-hours anomaly: 2:30am system settings change
    seed('seed-008', 14, 28, {
      action: 'settings_change', entity: 'settings',
      entityId: 'settings-001', entityLabel: 'Risk Threshold Settings',
      user: 'admin@peblink.io', field: 'productionShortfallPercent',
      oldValue: '80', newValue: '75',
    }, 'Settings modified outside business hours (02:30 local)'),

    // Off-hours anomaly: 4:15am bulk update
    seed('seed-009', 12, 43, {
      action: 'bulk_update', entity: 'commitment',
      entityId: 'batch-status-002', entityLabel: 'Commitment Status Bulk Update',
      user: 'validator@peblink.io', count: 8,
      details: 'Batch status sync — commitments CMT-023 through CMT-026 (AGR-006 revoked)',
    }, 'Bulk update of 8 records performed outside business hours (04:15 local)'),

    seed('seed-010', 10, 5, {
      action: 'login', entity: 'session',
      entityId: 'session-002', entityLabel: 'Validator Session',
      user: 'validator@peblink.io', details: 'Authenticated via SSO',
    }),

    seed('seed-011', 9, 20, {
      action: 'update', entity: 'risk_flag',
      entityId: 'RF-AUTO-001', entityLabel: 'UC Rusal Guinea — Sanctions Exposure',
      user: 'validator@peblink.io', field: 'status',
      oldValue: 'open', newValue: 'acknowledged',
    }),

    seed('seed-012', 8, 15, {
      action: 'create', entity: 'risk_flag',
      entityId: 'RF-AUTO-002', entityLabel: 'Barrick Tongon — Ownership Transfer Risk',
      user: 'risk-engine@peblink.io',
      details: 'HIGH: Sale to Atlantic Group/Zijin under negotiation — change-of-control clause in Mining Convention requires Ministerial approval; community consultation obligations triggered',
    }),

    seed('seed-013', 7, 30, {
      action: 'update', entity: 'agreement',
      entityId: 'AGR-018', entityLabel: 'Barrick Gold — Convention Minière (Tongon)',
      user: 'validator@peblink.io', field: 'status',
      oldValue: 'active', newValue: 'under-review',
      details: 'Placed under review pending ownership transfer to Zijin Mining',
    }),

    seed('seed-014', 6, 0, {
      action: 'bulk_update', entity: 'performance_record',
      entityId: 'batch-Q4-2024', entityLabel: 'Q4 2024 Performance Data',
      user: 'admin@peblink.io', count: 12,
      details: 'Q4 2024 production actuals loaded — Newmont, AngloGold, Perseus, Gold Fields, Endeavour',
    }),

    seed('seed-015', 5, 10, {
      action: 'update', entity: 'commitment',
      entityId: 'CMT-069', entityLabel: 'Barrick Tongon — Gold Production Target',
      user: 'admin@peblink.io', field: 'status',
      oldValue: 'on-track', newValue: 'at-risk',
      details: '148 koz in 2024 vs 200 koz target — 27% shortfall year-on-year',
    }),

    seed('seed-016', 4, 30, {
      action: 'update', entity: 'commitment',
      entityId: 'CMT-052', entityLabel: 'Ghana Manganese — $450m Refinery Construction',
      user: 'admin@peblink.io', field: 'status',
      oldValue: 'at-risk', newValue: 'breached',
      details: 'Sod-cutting milestone planned November 2024 was missed; no revised schedule received',
    }),

    seed('seed-017', 3, 40, {
      action: 'create', entity: 'risk_flag',
      entityId: 'RF-AUTO-003', entityLabel: 'Atlantic Lithium Ewoyaa — Workforce Reduction',
      user: 'risk-engine@peblink.io',
      details: 'MEDIUM: 100 of 167 staff laid off following Parliamentary lease withdrawal December 2025; lease ratified March 2026 — rehiring obligation compliance risk',
    }),

    seed('seed-018', 3, 0, {
      action: 'export', entity: 'agreement',
      entityId: 'export-002', entityLabel: 'Ghana Agreement Portfolio Export',
      user: 'validator@peblink.io', count: 7,
      details: 'XLSX export — 7 Ghana agreements for Minerals Commission review',
    }),

    seed('seed-019', 2, 15, {
      action: 'update', entity: 'operator',
      entityId: 'OP-14', entityLabel: 'Barrick Gold / Tongon SA',
      user: 'admin@peblink.io', field: 'riskScore',
      oldValue: '42', newValue: '55',
      details: 'Risk score revised upward: ownership transfer uncertainty + production decline',
    }),

    seed('seed-020', 1, 45, {
      action: 'create', entity: 'commitment',
      entityId: 'CMT-NEW-001', entityLabel: 'Ewoyaa — ESIA Update (Post-Ratification)',
      user: 'admin@peblink.io',
      details: 'New commitment added following March 2026 lease ratification — ESIA update due 2026-09-30',
    }),

    seed('seed-021', 1, 5, {
      action: 'update', entity: 'risk_flag',
      entityId: 'RF-AUTO-004', entityLabel: 'Rusal Friguia — Rehabilitation Escrow',
      user: 'validator@peblink.io', field: 'status',
      oldValue: 'open', newValue: 'acknowledged',
      details: 'CMT-011 Article 142 rehabilitation escrow report overdue; operator notified',
    }),

    seed('seed-022', 0, 45, {
      action: 'login', entity: 'session',
      entityId: 'session-003', entityLabel: 'Admin Session',
      user: 'admin@peblink.io', details: 'Authenticated via SSO',
    }),

    seed('seed-023', 0, 30, {
      action: 'update', entity: 'agreement',
      entityId: 'AGR-009', entityLabel: 'Gold Fields Ghana — Tarkwa Mining Lease',
      user: 'admin@peblink.io', field: 'description',
      details: 'Added note: Damang mining lease expired April 2025, not renewed — investor-state dispute risk flagged',
    }),

    seed('seed-024', 0, 15, {
      action: 'create', entity: 'risk_flag',
      entityId: 'RF-AUTO-005', entityLabel: 'Gold Fields — Damang Lease Non-Renewal',
      user: 'risk-engine@peblink.io',
      details: 'HIGH: Damang lease expired April 2025 and was NOT renewed by Ghana government — potential investor-state dispute resolution proceedings',
    }),
  ];
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      entries: [],
      sessionStart: new Date().toISOString(),

      setSessionStart: (ts) => set({ sessionStart: ts }),

      log: (entry) => {
        const timestamp = new Date().toISOString();
        const offHours = isOffHours(timestamp);
        const bulkAnomaly = entry.count != null && entry.count > 5;
        let anomalyReason: string | undefined;
        if (offHours && (entry.action === 'settings_change' || entry.action === 'bulk_update')) {
          anomalyReason = `${entry.action === 'bulk_update' ? 'Bulk update' : 'Settings change'} performed outside business hours`;
        } else if (bulkAnomaly) {
          anomalyReason = `Large bulk operation affecting ${entry.count} records`;
        }

        set((state) => ({
          entries: [
            {
              ...entry,
              id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp,
              reviewStatus: 'unreviewed',
              isAnomaly: !!anomalyReason,
              anomalyReason,
            },
            ...state.entries.slice(0, 499),
          ],
        }));
      },

      markReviewed: (id, note, reviewer = 'admin') =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id
              ? { ...e, reviewStatus: 'reviewed', reviewNote: note, reviewedAt: new Date().toISOString(), reviewedBy: reviewer }
              : e,
          ),
        })),

      flagEntry: (id, reason) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id
              ? { ...e, reviewStatus: 'flagged', reviewNote: reason }
              : e,
          ),
        })),

      escalateEntry: (id, reason) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id
              ? { ...e, reviewStatus: 'escalated', reviewNote: reason ?? e.reviewNote }
              : e,
          ),
        })),

      markUnreviewed: (id) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id
              ? { ...e, reviewStatus: 'unreviewed', reviewNote: undefined, reviewedAt: undefined, reviewedBy: undefined }
              : e,
          ),
        })),

      bulkMarkReviewed: (ids, reviewer = 'admin') =>
        set((state) => ({
          entries: state.entries.map((e) =>
            ids.includes(e.id) && e.reviewStatus === 'unreviewed'
              ? { ...e, reviewStatus: 'reviewed', reviewedAt: new Date().toISOString(), reviewedBy: reviewer }
              : e,
          ),
        })),

      clear: () => set({ entries: [] }),
      clearAll: () => set({ entries: [], sessionStart: new Date().toISOString() }),

      seedIfEmpty: () => {
        if (get().entries.length === 0) {
          set({ entries: buildSeedEntries() });
        }
      },
    }),
    {
      name: 'peb-audit-log',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as { entries?: AuditEntry[] };
        if (version < 2 && state.entries) {
          state.entries = state.entries.map((e) => ({
            ...e,
            reviewStatus: e.reviewStatus ?? 'unreviewed',
          }));
        }
        return state as AuditState;
      },
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);
