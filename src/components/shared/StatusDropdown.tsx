import { type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { StatusBadge } from './StatusBadge';
import type { ComplianceStatus, AgreementStatus, RiskFlagStatus } from '@/data/types';

interface BaseProps {
  size?: 'sm' | 'md';
  onChange?: (val: string) => void;
}

interface ComplianceProps extends BaseProps {
  type: 'compliance';
  value: ComplianceStatus;
}

interface AgreementProps extends BaseProps {
  type: 'agreement';
  value: AgreementStatus;
}

interface RiskFlagProps extends BaseProps {
  type: 'risk-flag';
  value: RiskFlagStatus;
}

type Props = ComplianceProps | AgreementProps | RiskFlagProps;

const COMPLIANCE_STYLES: Record<ComplianceStatus, string> = {
  'met': 'bg-emerald-50 text-emerald-700 border-emerald-200/60 shadow-sm',
  'on-track': 'bg-blue-50 text-blue-700 border-blue-200/60 shadow-sm',
  'at-risk': 'bg-amber-50 text-amber-700 border-amber-200/60 shadow-sm',
  'breached': 'bg-red-50 text-red-700 border-red-200/60 shadow-sm',
};

const COMPLIANCE_LABELS: Record<ComplianceStatus, string> = {
  'met': 'Met',
  'on-track': 'On Track',
  'at-risk': 'At Risk',
  'breached': 'Breached',
};

const AGREEMENT_STYLES: Record<AgreementStatus, string> = {
  'active': 'bg-emerald-50 text-emerald-700 border-emerald-200/60 shadow-sm',
  'lapsed': 'bg-surface-2 text-ink-2 border-line/60 shadow-sm',
  'under-review': 'bg-amber-50 text-amber-700 border-amber-200/60 shadow-sm',
};

const AGREEMENT_LABELS: Record<AgreementStatus, string> = {
  'active': 'Active',
  'lapsed': 'Lapsed',
  'under-review': 'Under Review',
};

const FLAG_STYLES: Record<RiskFlagStatus, string> = {
  'open': 'bg-red-50 text-red-700 border-red-200/60 shadow-sm',
  'acknowledged': 'bg-amber-50 text-amber-700 border-amber-200/60 shadow-sm',
  'resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200/60 shadow-sm',
};

export function StatusDropdown(props: Props) {
  const { isAdmin } = useRole();
  const { type, value, size = 'md', onChange } = props;

  // If viewer or no onChange provided, fallback to standard badge or a span with flag styles
  if (!isAdmin || !onChange) {
    if (type === 'risk-flag') {
       return (
         <span className={cn(
           'inline-flex items-center rounded-full border font-semibold tracking-wide backdrop-blur-sm px-2.5 py-0.5 text-xs',
           FLAG_STYLES[value]
         )}>
           {value.charAt(0).toUpperCase() + value.slice(1)}
         </span>
       );
    }
    return <StatusBadge type={type} value={value} size={size} />;
  }

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  let style = '';
  let options: { value: string; label: string }[] = [];

  if (type === 'compliance') {
    style = COMPLIANCE_STYLES[value as ComplianceStatus];
    options = (Object.keys(COMPLIANCE_LABELS) as ComplianceStatus[]).map(k => ({ value: k, label: COMPLIANCE_LABELS[k] }));
  } else if (type === 'agreement') {
    style = AGREEMENT_STYLES[value as AgreementStatus];
    options = (Object.keys(AGREEMENT_LABELS) as AgreementStatus[]).map(k => ({ value: k, label: AGREEMENT_LABELS[k] }));
  } else if (type === 'risk-flag') {
    style = FLAG_STYLES[value as RiskFlagStatus];
    options = (Object.keys(FLAG_STYLES) as RiskFlagStatus[]).map(k => ({ value: k, label: k.charAt(0).toUpperCase() + k.slice(1) }));
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className={cn(
        'inline-flex items-center rounded-full border font-semibold tracking-wide cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-7 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
        size === 'sm' ? 'px-3.5 py-0.5 text-[10px] text-center' : 'px-3.5 py-0.5 text-xs text-center',
        style
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.2rem center',
        backgroundSize: '0.8em',
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="bg-white text-ink">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
