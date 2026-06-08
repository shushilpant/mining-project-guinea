// Shared design tokens, config maps, and helpers for the Activity Log views.
import {
  FileInput, Users, GitCommit, AlertTriangle, Database, TrendingUp, Shield, Settings,
} from 'lucide-react';
import type { AuditAction, AuditEntity, ReviewStatus } from '@/store/auditStore';

export const FOREST = '#062b1d'; // forest-900 — deep Sahel green
export const GOLD   = '#d68a18'; // gold-600   — Saharan saffron
export const GREEN  = '#006b3f'; // brand-600  — Ghana flag green

// ─── Config maps ──────────────────────────────────────────────────────────────

export const ACTION_CFG: Record<AuditAction, { label: string; color: string; bg: string }> = {
  create:          { label: 'Create',       color: '#16a34a', bg: '#f0fdf4' },
  update:          { label: 'Update',       color: '#2563eb', bg: '#eff6ff' },
  import:          { label: 'Import',       color: '#7c3aed', bg: '#f5f3ff' },
  bulk_update:     { label: 'Bulk Update',  color: '#d97706', bg: '#fffbeb' },
  login:           { label: 'Login',        color: '#0891b2', bg: '#ecfeff' },
  logout:          { label: 'Logout',       color: '#64748b', bg: '#f8fafc' },
  export:          { label: 'Export',       color: '#059669', bg: '#ecfdf5' },
  settings_change: { label: 'Settings',     color: '#9333ea', bg: '#faf5ff' },
};

export const ENTITY_LABEL: Record<AuditEntity, string> = {
  agreement:          'Agreement',
  operator:           'Operator',
  commitment:         'Commitment',
  risk_flag:          'Risk Flag',
  infrastructure:     'Infrastructure',
  performance_record: 'Performance',
  session:            'Session',
  settings:           'Settings',
};

export const ENTITY_ICON: Record<AuditEntity, React.ElementType> = {
  agreement:          FileInput,
  operator:           Users,
  commitment:         GitCommit,
  risk_flag:          AlertTriangle,
  infrastructure:     Database,
  performance_record: TrendingUp,
  session:            Shield,
  settings:           Settings,
};

export const REVIEW_CFG: Record<ReviewStatus, { label: string; color: string; bg: string; border: string }> = {
  unreviewed: { label: 'Unreviewed', color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
  reviewed:   { label: 'Reviewed',   color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  flagged:    { label: 'Flagged',    color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  escalated:  { label: 'Escalated', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
};

export function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export function elapsed(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
