import { cn } from '@/lib/utils';
import type { ComplianceStatus, RiskSeverity, AgreementStatus } from '@/data/types';
import {
  COMPLIANCE_BADGE, COMPLIANCE_COLOR, COMPLIANCE_LABEL,
  SEVERITY_BADGE, SEVERITY_COLOR,
  AGREEMENT_BADGE, AGREEMENT_COLOR, AGREEMENT_LABEL,
} from '@/lib/statusStyles';

interface Props {
  type: 'compliance' | 'severity' | 'agreement';
  value: ComplianceStatus | RiskSeverity | AgreementStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ type, value, size = 'md' }: Props) {
  let cls: string;
  let dot: string;
  let label: string;

  if (type === 'compliance') {
    const v = value as ComplianceStatus;
    cls = COMPLIANCE_BADGE[v];
    dot = COMPLIANCE_COLOR[v];
    label = COMPLIANCE_LABEL[v];
  } else if (type === 'severity') {
    const v = value as RiskSeverity;
    cls = SEVERITY_BADGE[v];
    dot = SEVERITY_COLOR[v];
    label = (value as string).charAt(0).toUpperCase() + (value as string).slice(1);
  } else {
    const v = value as AgreementStatus;
    cls = AGREEMENT_BADGE[v];
    dot = AGREEMENT_COLOR[v];
    label = AGREEMENT_LABEL[v];
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-lg border font-bold tracking-wide backdrop-blur-sm',
      size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]',
      cls,
    )}>
      <span
        className="shrink-0 rounded-full shadow-glow"
        style={{
          width: size === 'sm' ? 6 : 8,
          height: size === 'sm' ? 6 : 8,
          background: dot,
          boxShadow: `0 0 8px ${dot}80`,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
