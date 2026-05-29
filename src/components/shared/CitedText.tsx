// ============================================================
// CitedText — render an AI-generated string with live entity
// chips for any cited id (operator, agreement, risk flag,
// commitment, infrastructure obligation).
//
// The prompt contract instructs the model to cite IDs in
// brackets, e.g. "[OP-06]" or "[AGR-014]". We scan the output,
// replace those tokens inline with an EntityChip — hoverable
// preview card + click-to-navigate. This turns the AI brief
// from a slab of text into a navigation surface integrated
// with the rest of the app.
// ============================================================

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getOperatorById, getAgreementById, getRiskFlagById, getCommitmentById,
  getInfrastructureObligations, daysUntilExpiry,
} from '@/services/dataService';
import type {
  Operator, Agreement, RiskFlag, Commitment, InfrastructureObligation,
} from '@/data/types';

const ID_PATTERN = /\[((?:OP|AGR|RISK|DYN|COM|INF)-[A-Z0-9-]+)\]/g;
const BOLD_PATTERN = /\*\*(.+?)\*\*/g;

/** Convert **bold** markdown within a plain string into React nodes. */
function parseBold(text: string, keyPrefix: string): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(BOLD_PATTERN.source, 'g');
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<strong key={`${keyPrefix}b${i++}`}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

interface ChipResolution {
  kind: 'operator' | 'agreement' | 'risk' | 'commitment' | 'infrastructure';
  href: string;
  label: string;
  preview: ReactNode;
  accent: 'brand' | 'amber' | 'red' | 'neutral';
}

function resolveId(id: string): ChipResolution | null {
  if (id.startsWith('OP-')) {
    const op = getOperatorById(id);
    if (op) return makeOperatorPreview(op);
  } else if (id.startsWith('AGR-')) {
    const ag = getAgreementById(id);
    if (ag) return makeAgreementPreview(ag);
  } else if (id.startsWith('RISK-') || id.startsWith('DYN-')) {
    const f = getRiskFlagById(id);
    if (f) return makeFlagPreview(f);
  } else if (id.startsWith('COM-')) {
    const c = getCommitmentById(id);
    if (c) return makeCommitmentPreview(c);
  } else if (id.startsWith('INF-')) {
    const io = getInfrastructureObligations().find(x => x.id === id);
    if (io) return makeInfrastructurePreview(io);
  }
  return null;
}

function makeOperatorPreview(op: Operator): ChipResolution {
  const opaque = op.ultimateBeneficialOwners.some(u => u.isOpaque);
  const accent: ChipResolution['accent'] = op.riskScore >= 70 ? 'red' : op.riskScore >= 40 ? 'amber' : 'brand';
  return {
    kind: 'operator',
    href: `/performance/${op.id}`,
    label: op.name,
    accent,
    preview: (
      <div className="text-[12px] leading-relaxed">
        <div className="font-semibold text-ink mb-0.5">{op.name}</div>
        <div className="text-ink-3 text-[11px]">{op.parentCompany} · {op.countryOfRegistration}</div>
        <div className="mt-1.5 text-ink-2">Risk score <span className="font-mono font-semibold">{op.riskScore}</span> · {op.complianceStatus}</div>
        {opaque && <div className="mt-1 text-[11px] text-amber-700">Opaque UBO</div>}
        {op.ownershipChanged && <div className="mt-0.5 text-[11px] text-amber-700">Ownership changed</div>}
      </div>
    ),
  };
}

function makeAgreementPreview(ag: Agreement): ChipResolution {
  const days = daysUntilExpiry(ag.expiryDate);
  const accent: ChipResolution['accent'] = days < 0 ? 'red' : days < 90 ? 'amber' : 'brand';
  return {
    kind: 'agreement',
    href: `/agreements/${ag.id}`,
    label: ag.id,
    accent,
    preview: (
      <div className="text-[12px] leading-relaxed">
        <div className="font-semibold text-ink mb-0.5">{ag.id} <span className="text-ink-4 font-normal">· {ag.commodity}</span></div>
        <div className="text-ink-3 text-[11px]">{ag.concesssionArea}</div>
        <div className="mt-1.5 text-ink-2">Royalty <span className="font-mono font-semibold">{ag.royaltyRate}%</span> · ${ag.contractValue}M</div>
        <div className="mt-0.5 text-[11px] text-ink-3">
          {days < 0 ? <span className="text-status-danger">Expired</span> : `Expires in ${days}d`}
        </div>
      </div>
    ),
  };
}

function makeFlagPreview(f: RiskFlag): ChipResolution {
  const accent: ChipResolution['accent'] =
    f.severity === 'critical' || f.severity === 'high' ? 'red'
    : f.severity === 'medium' ? 'amber' : 'neutral';
  return {
    kind: 'risk',
    href: `/risk/${f.id}`,
    label: f.id,
    accent,
    preview: (
      <div className="text-[12px] leading-relaxed">
        <div className="font-semibold text-ink mb-0.5">{f.id}</div>
        <div className="text-[11px] uppercase tracking-wide font-bold text-ink-3">{f.severity} · {f.category}</div>
        <div className="mt-1.5 text-ink-2">{f.description.length > 140 ? f.description.slice(0, 140) + '…' : f.description}</div>
        <div className="mt-1 text-[11px] text-ink-3">Status: {f.status}</div>
      </div>
    ),
  };
}

function makeCommitmentPreview(c: Commitment): ChipResolution {
  const accent: ChipResolution['accent'] =
    c.status === 'breached' ? 'red' : c.status === 'at-risk' ? 'amber' : 'brand';
  return {
    kind: 'commitment',
    href: `/agreements/${c.agreementId}`,
    label: c.id,
    accent,
    preview: (
      <div className="text-[12px] leading-relaxed">
        <div className="font-semibold text-ink mb-0.5">{c.id} <span className="text-ink-4 font-normal">· {c.type}</span></div>
        <div className="text-ink-2">{c.description.length > 140 ? c.description.slice(0, 140) + '…' : c.description}</div>
        <div className="mt-1 text-[11px] text-ink-3">Target <span className="font-mono">{c.targetValue} {c.targetUnit}</span> by {c.dueDate} · {c.status}</div>
      </div>
    ),
  };
}

function makeInfrastructurePreview(io: InfrastructureObligation): ChipResolution {
  const accent: ChipResolution['accent'] =
    io.status === 'breached' ? 'red' : io.status === 'at-risk' ? 'amber' : 'brand';
  return {
    kind: 'infrastructure',
    href: `/agreements/${io.agreementId}`,
    label: io.id,
    accent,
    preview: (
      <div className="text-[12px] leading-relaxed">
        <div className="font-semibold text-ink mb-0.5">{io.projectName}</div>
        <div className="text-[11px] uppercase tracking-wide font-bold text-ink-3">{io.projectType}</div>
        <div className="mt-1.5 text-ink-2">Progress <span className="font-mono font-semibold">{io.actualProgress}%</span> · due {io.committedCompletionDate}</div>
        <div className="mt-0.5 text-[11px] text-ink-3">Status: {io.status}</div>
      </div>
    ),
  };
}

const ACCENT_CLASS: Record<ChipResolution['accent'], string> = {
  brand:   'border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100',
  amber:   'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
  red:     'border-red-200   bg-red-50   text-red-800   hover:bg-red-100',
  neutral: 'border-line      bg-surface-2 text-ink-2     hover:bg-surface',
};

export interface CitedTextProps {
  text: string;
  /**
   * Called when the user clicks an entity chip *before* the navigation
   * fires. Use this to (e.g.) close a slide-over so navigation isn't
   * blocked by an outside-click handler.
   */
  onEntityClick?: (id: string) => void;
  /**
   * Optional callback invoked with the set of entity IDs found in this
   * text on mount. Useful for triggering a row-highlight animation in
   * the surrounding page when an AI brief streams in.
   */
  onCitations?: (ids: string[]) => void;
  className?: string;
}

export function CitedText({ text, onEntityClick, onCitations, className }: CitedTextProps) {
  useEffect(() => {
    if (!onCitations) return;
    const ids = new Set<string>();
    const re = new RegExp(ID_PATTERN.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) ids.add(m[1]);
    if (ids.size > 0) onCitations(Array.from(ids));
  }, [text, onCitations]);

  const parts: ReactNode[] = [];
  let lastIdx = 0;
  let key = 0;
  const re = new RegExp(ID_PATTERN.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(<span key={`t${key++}`}>{parseBold(text.slice(lastIdx, m.index), `t${key}`)}</span>);
    const id = m[1];
    const resolution = resolveId(id);
    if (resolution) {
      parts.push(
        <EntityChip key={`c${key++}`} id={id} resolution={resolution} onClick={onEntityClick} />,
      );
    } else {
      parts.push(<span key={`u${key++}`} className="font-mono text-[11px] text-ink-4">[{id}]</span>);
    }
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) parts.push(<span key={`t${key++}`}>{parseBold(text.slice(lastIdx), `t${key}`)}</span>);

  return (
    <span className={className} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {parts}
    </span>
  );
}

interface EntityChipProps {
  id: string;
  resolution: ChipResolution;
  onClick?: (id: string) => void;
}

function EntityChip({ id, resolution, onClick }: EntityChipProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<number | null>(null);

  const openSoon = () => {
    if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpen(true);
  };
  const closeSoon = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onClick?.(id);
    navigate(resolution.href);
  };

  return (
    <span
      ref={ref}
      className="relative inline-block align-baseline"
      onMouseEnter={openSoon}
      onMouseLeave={closeSoon}
      onFocus={openSoon}
      onBlur={closeSoon}
    >
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e); } }}
        className={
          'inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md border font-mono text-[11px] font-semibold transition-colors leading-tight ' +
          ACCENT_CLASS[resolution.accent]
        }
        aria-label={`${resolution.kind} ${resolution.label}`}
        title={`${resolution.kind}: ${resolution.label}`}
      >
        {resolution.label}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full mt-1 z-50 w-[260px] rounded-lg border border-line bg-surface shadow-pop p-3"
          style={{ pointerEvents: 'auto' }}
          onMouseEnter={openSoon}
          onMouseLeave={closeSoon}
        >
          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-4 mb-1">
            {resolution.kind} · {id}
          </div>
          {resolution.preview}
          <div className="mt-2 pt-2 border-t border-line-soft text-[10px] text-brand-700 font-semibold">
            Click to open →
          </div>
        </span>
      )}
    </span>
  );
}
