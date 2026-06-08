// ============================================================
// statusStyles — the single source of truth for the status,
// severity, agreement, and alert-priority palettes used across
// every module. Pages and shared components import from here
// instead of re-hardcoding the same hex values and sort maps.
//
// Colours match what StatusBadge has always rendered; centralising
// them does not change any pixels (CSS hex is case-insensitive).
// ============================================================
import type {
  ComplianceStatus, RiskSeverity, AgreementStatus, AlertPriority,
} from '@/data/types';

/* ── Compliance status ─────────────────────────────── */
export const COMPLIANCE_COLOR: Record<ComplianceStatus, string> = {
  'met':      '#10B981', // Emerald 500
  'on-track': '#3B82F6', // Blue 500
  'at-risk':  '#F59E0B', // Amber 500
  'breached': '#EF4444', // Red 500
};

export const COMPLIANCE_LABEL: Record<ComplianceStatus, string> = {
  'met':      'Met',
  'on-track': 'On Track',
  'at-risk':  'At Risk',
  'breached': 'Breached',
};

/** Badge utility classes (bg / text / border) per compliance status. */
export const COMPLIANCE_BADGE: Record<ComplianceStatus, string> = {
  'met':      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'on-track': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'at-risk':  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'breached': 'bg-red-500/10 text-red-400 border-red-500/20',
};

/** Lower number = more urgent; for sorting commitment lists (breached first). */
export const COMPLIANCE_URGENCY: Record<ComplianceStatus, number> = {
  breached: 0, 'at-risk': 1, 'on-track': 2, met: 3,
};

/* ── Risk severity ─────────────────────────────────── */
export const SEVERITY_COLOR: Record<RiskSeverity, string> = {
  low:      '#A1A1AA', // Zinc 400
  medium:   '#F59E0B', // Amber 500
  high:     '#F97316', // Orange 500
  critical: '#EF4444', // Red 500
};

export const SEVERITY_BADGE: Record<RiskSeverity, string> = {
  low:      'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  medium:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high:     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

/** Lower number = more severe; for sorting risk flags (critical first). */
export const SEVERITY_ORDER: Record<RiskSeverity, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

/* ── Agreement status ──────────────────────────────── */
export const AGREEMENT_COLOR: Record<AgreementStatus, string> = {
  'active':       '#10B981',
  'lapsed':       '#A1A1AA',
  'under-review': '#F59E0B',
};

export const AGREEMENT_BADGE: Record<AgreementStatus, string> = {
  'active':       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'lapsed':       'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  'under-review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export const AGREEMENT_LABEL: Record<AgreementStatus, string> = {
  'active':       'Active',
  'lapsed':       'Lapsed',
  'under-review': 'Under Review',
};

/* ── Alert priority (distinct from severity) ───────── */
export const ALERT_PRIORITY_COLOR: Record<AlertPriority, string> = {
  critical: '#DC2626',
  high:     '#EA580C',
  medium:   '#D97706',
  low:      '#6B7280',
};
