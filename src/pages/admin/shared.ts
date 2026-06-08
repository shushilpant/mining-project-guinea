// Shared constants used across the Admin tabs.
import type { Commodity, ComplianceStatus, AgreementStatus } from '@/data/types';

export const COMMODITIES: Commodity[] = [
  'bauxite', 'gold', 'iron ore', 'manganese', 'nickel', 'diamonds', 'chromite',
];
export const COMPLIANCE_STATUSES: ComplianceStatus[] = ['on-track', 'at-risk', 'breached', 'met'];
export const AGREEMENT_STATUSES: AgreementStatus[] = ['active', 'lapsed', 'under-review'];

export const inputCls =
  'w-full border border-line rounded-lg px-3 py-2 text-sm text-ink-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
