import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COMMODITY_META, fmtUsd, fmtDelta, topMovers, type Commodity } from '@/lib/revenueModel';

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-3">{label}</label>
        {hint && (
          <span className="group relative inline-flex">
            <Info size={11} className="text-ink-4 cursor-help" />
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-56 z-30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg border border-line bg-surface shadow-pop p-2.5 text-[11px] font-normal normal-case tracking-normal text-ink-2 leading-snug">
              {hint}
            </span>
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

interface SegOption { value: string; label: string; }
export function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: SegOption[] }) {
  return (
    <div className="flex rounded-lg border border-line bg-surface-2 p-0.5 gap-0.5">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 text-[11px] font-semibold px-2 py-1.5 rounded-md transition-colors',
            value === o.value ? 'bg-brand-600 text-white shadow-sm' : 'text-ink-3 hover:text-ink-2 hover:bg-surface',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PriceSlider({ commodity, value, onChange }: { commodity: Commodity; value: number; onChange: (v: number) => void }) {
  const meta = COMMODITY_META[commodity];
  const changed = value !== meta.defaultPrice;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11.5px] text-ink-2">{meta.label}</span>
        <span className={cn('font-mono text-[11.5px]', changed ? 'text-brand-700 font-semibold' : 'text-ink-3')}>
          ${value.toLocaleString()}<span className="text-ink-4">/{meta.unit}</span>
        </span>
      </div>
      <input
        type="range" min={meta.min} max={meta.max} step={meta.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600"
        aria-label={`${meta.label} price`}
      />
    </div>
  );
}

export function MoverRow({ m }: { m: ReturnType<typeof topMovers>[number] }) {
  const navigate = useNavigate();
  const up = m.deltaUsd > 0;
  return (
    <button
      type="button"
      onClick={() => navigate(`/agreements/${m.agreementId}`)}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface-2 transition-colors text-left"
    >
      <span className={cn('shrink-0 w-1.5 h-8 rounded-full', up ? 'bg-status-success' : 'bg-status-danger')} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-ink-4">{m.agreementId}</span>
          <span className="text-[12px] font-medium text-ink-2 truncate">{m.operatorName}</span>
        </div>
        <div className="text-[10.5px] text-ink-4">{fmtUsd(m.baselineUsd)} → {fmtUsd(m.scenarioUsd)}</div>
      </div>
      <span className={cn('font-mono text-[12px] font-semibold shrink-0', up ? 'text-status-success' : 'text-status-danger')}>
        {fmtDelta(m.deltaUsd)}
      </span>
    </button>
  );
}
