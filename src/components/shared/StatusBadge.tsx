import { cn } from '@/lib/utils';
import type { ComplianceStatus, RiskSeverity, AgreementStatus } from '@/data/types';

const COMPLIANCE_STYLES: Record<ComplianceStatus, { cls: string; dot: string }> = {
  'met':      { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',   dot: '#10B981' },
  'on-track': { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',            dot: '#3B82F6' },
  'at-risk':  { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',          dot: '#F59E0B' },
  'breached': { cls: 'bg-red-500/10 text-red-400 border-red-500/20',                dot: '#EF4444' },
};

const COMPLIANCE_LABELS: Record<ComplianceStatus, string> = {
  'met':      'Met',
  'on-track': 'On Track',
  'at-risk':  'At Risk',
  'breached': 'Breached',
};

const SEVERITY_STYLES: Record<RiskSeverity, { cls: string; dot: string }> = {
  'low':      { cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',             dot: '#A1A1AA' },
  'medium':   { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',          dot: '#F59E0B' },
  'high':     { cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20',       dot: '#F97316' },
  'critical': { cls: 'bg-red-500/10 text-red-400 border-red-500/20',                dot: '#EF4444' },
};

const AGREEMENT_STYLES: Record<AgreementStatus, { cls: string; dot: string }> = {
  'active':       { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: '#10B981' },
  'lapsed':       { cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',          dot: '#A1A1AA' },
  'under-review': { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       dot: '#F59E0B' },
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
  let style: { cls: string; dot: string };
  let label: string;

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
      'inline-flex items-center gap-1.5 rounded-lg border font-bold tracking-wide backdrop-blur-sm',
      size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]',
      style.cls,
    )}>
      <span
        className="shrink-0 rounded-full shadow-glow"
        style={{
          width: size === 'sm' ? 6 : 8,
          height: size === 'sm' ? 6 : 8,
          background: style.dot,
          boxShadow: `0 0 8px ${style.dot}80`,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
