import { cn } from '@/lib/utils';
import type { ComplianceStatus, RiskSeverity, AgreementStatus } from '@/data/types';

const COMPLIANCE_STYLES: Record<ComplianceStatus, { cls: string; dot: string }> = {
  'met':      { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',   dot: '#059669' },
  'on-track': { cls: 'bg-blue-50 text-blue-700 border-blue-200',            dot: '#2563eb' },
  'at-risk':  { cls: 'bg-amber-50 text-amber-800 border-amber-200',          dot: '#d97706' },
  'breached': { cls: 'bg-red-50 text-red-800 border-red-200',                dot: '#dc2626' },
};

const COMPLIANCE_LABELS: Record<ComplianceStatus, string> = {
  'met':      'Met',
  'on-track': 'On Track',
  'at-risk':  'At Risk',
  'breached': 'Breached',
};

const SEVERITY_STYLES: Record<RiskSeverity, { cls: string; dot: string }> = {
  'low':      { cls: 'bg-surface-2 text-ink-3 border-line-strong',          dot: '#8AA396' },
  'medium':   { cls: 'bg-amber-50 text-amber-800 border-amber-200',         dot: '#d97706' },
  'high':     { cls: 'bg-orange-50 text-orange-800 border-orange-200',      dot: '#ea580c' },
  'critical': { cls: 'bg-red-50 text-red-800 border-red-200',               dot: '#dc2626' },
};

const AGREEMENT_STYLES: Record<AgreementStatus, { cls: string; dot: string }> = {
  'active':       { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: '#059669' },
  'lapsed':       { cls: 'bg-surface-2 text-ink-3 border-line-strong',        dot: '#8AA396' },
  'under-review': { cls: 'bg-amber-50 text-amber-800 border-amber-200',        dot: '#d97706' },
};

const AGREEMENT_LABELS: Record<AgreementStatus, string> = {
  'active':       'Active',
  'lapsed':       'Lapsed',
  'under-review': 'Under Review',
};

interface Props {
  type: 'compliance' | 'severity' | 'agreement';
  value: ComplianceStatus | RiskSeverity | AgreementStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ type, value, size = 'md' }: Props) {
  let style = { cls: '', dot: '' };
  let label: string = value;

  if (type === 'compliance') {
    style = COMPLIANCE_STYLES[value as ComplianceStatus];
    label = COMPLIANCE_LABELS[value as ComplianceStatus];
  } else if (type === 'severity') {
    style = SEVERITY_STYLES[value as RiskSeverity];
    label = (value as string).charAt(0).toUpperCase() + (value as string).slice(1);
  } else {
    style = AGREEMENT_STYLES[value as AgreementStatus];
    label = AGREEMENT_LABELS[value as AgreementStatus];
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-md border font-semibold tracking-wide',
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
      style.cls,
    )}>
      <span
        className="shrink-0 rounded-full"
        style={{
          width: size === 'sm' ? 5 : 6,
          height: size === 'sm' ? 5 : 6,
          background: style.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
