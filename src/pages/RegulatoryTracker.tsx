import { useMemo, useState } from 'react';
import { useCountry } from '@/context/CountryContext';
import { useStoreData } from '@/store/dataStore';
import {
  getRegulatoryChanges, getRegulatoryImpacts, getStabilizationConflicts,
  getAgreementById, shortOperatorName, formatCommodity,
} from '@/services/dataService';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { Gavel, FileCheck2, FilePlus2, ShieldAlert, AlertTriangle, CalendarClock } from 'lucide-react';
import type { RegulatoryChange } from '@/data/types';

const STATUS_STYLE: Record<RegulatoryChange['status'], { cls: string; dot: string; label: string }> = {
  enacted:      { cls: 'text-status-success bg-status-success/10 border-status-success/20', dot: '#10B981', label: 'Enacted' },
  proposed:     { cls: 'text-blue-500 bg-blue-500/10 border-blue-500/20',                   dot: '#3B82F6', label: 'Proposed' },
  under_review: { cls: 'text-status-warning bg-status-warning/10 border-status-warning/20', dot: '#D97706', label: 'Under Review' },
  withdrawn:    { cls: 'text-ink-4 bg-foreground/5 border-line-soft',                        dot: '#8AA396', label: 'Withdrawn' },
};

const SEVERITY_STYLE: Record<RegulatoryChange['impactSeverity'], string> = {
  high: 'text-status-danger bg-status-danger/10',
  medium: 'text-status-warning bg-status-warning/10',
  low: 'text-ink-4 bg-foreground/5',
};

const IMPACT_LABEL: Record<string, string> = {
  royalty_increase: 'Royalty increase',
  new_obligation: 'New obligation',
  stabilization_conflict: 'Stabilisation conflict',
  compliance_gap: 'Compliance gap',
};

const categoryLabel = (c: string) => (c === 'labor' ? 'labour' : c.replace(/_/g, ' '));
const TODAY = new Date('2026-05-31');

// Regulatory framework reference (verified primary-source facts) for Guinea.
interface FrameworkRow { label: string; values: Record<string, string>; }
const COMPARISON: FrameworkRow[] = [
  { label: 'Gold royalty',     values: { GIN: 'n/a (bauxite/iron)' } },
  { label: 'Other royalty',    values: { GIN: 'Bauxite 0.075% · Iron 3%' } },
  { label: 'Corporate tax',    values: { GIN: '30%' } },
  { label: 'State free-carry', values: { GIN: '15% (up to 35%)' } },
  { label: 'BO register',      values: { GIN: 'Drafted, pending' } },
];
const COMPARE_COUNTRIES = [
  { id: 'GIN', name: 'Guinea' },
];

export function RegulatoryTrackerPage() {
  const { selectedCountry } = useCountry();
  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  const changes = useStoreData(() => getRegulatoryChanges(countryId), [countryId]);
  const conflicts = useStoreData(() => getStabilizationConflicts(countryId), [countryId]);

  const [selectedId, setSelectedId] = useState<string>('');
  const activeId = changes.some(c => c.id === selectedId) ? selectedId : (changes[0]?.id ?? '');
  const activeChange = changes.find(c => c.id === activeId);
  const activeImpacts = useStoreData(() => (activeId ? getRegulatoryImpacts(activeId) : []), [activeId]);

  const enacted = changes.filter(c => c.status === 'enacted').length;
  const proposed = changes.filter(c => c.status === 'proposed' || c.status === 'under_review').length;
  const highImpact = changes.filter(c => c.impactSeverity === 'high').length;

  const calendar = useMemo(
    () => changes
      .filter(c => new Date(c.effectiveDate) >= TODAY || c.status === 'proposed' || c.status === 'under_review')
      .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate)),
    [changes],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulatory Tracker"
        subtitle="Keep up with new mining laws, taxes, and rules in Guinea."
        badge="M13 · Legal & Regulatory Change Monitor"
      />

      <ModuleIntro />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Regulations" value={enacted} sub="Enacted & in force" icon={<FileCheck2 size={16} />} accent="green" hint="Regulatory changes already enacted and applying to agreements in scope." />
        <MetricCard label="Proposed Changes" value={proposed} sub="Proposed or under review" icon={<FilePlus2 size={16} />} accent="blue" hint="Upcoming changes not yet in force — worth tracking for early planning." />
        <MetricCard label="Stabilisation Conflicts" value={conflicts.length} sub="Clash with stability clauses" icon={<ShieldAlert size={16} />} accent={conflicts.length > 0 ? 'red' : 'green'} hint="New rules that may conflict with a contract's promise to keep fiscal terms fixed — likely dispute points." />
        <MetricCard label="High-Impact Changes" value={highImpact} sub="Severe financial/legal effect" icon={<AlertTriangle size={16} />} accent={highImpact > 0 ? 'amber' : 'green'} hint="Changes rated high-impact for their financial or legal consequences." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Regulatory timeline */}
        <section className="glass-card flex flex-col lg:col-span-3">
          <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01] flex items-center gap-2">
            <Gavel size={15} className="text-brand-600" />
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">Regulatory Timeline</h2>
          </div>
          <ol className="p-5 max-h-[560px] overflow-y-auto slim-scrollbar">
            {changes.length === 0 ? (
              <li className="py-8 text-center text-ink-4 text-[13px]">No regulatory changes in this scope.</li>
            ) : (
              changes.map((c, i) => {
                const st = STATUS_STYLE[c.status];
                const selected = c.id === activeId;
                return (
                  <li key={c.id} className="relative pl-7 pb-5 last:pb-0">
                    {i < changes.length - 1 && <span className="absolute left-[7px] top-4 bottom-0 w-px bg-line-strong" aria-hidden />}
                    <span className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-card" style={{ background: st.dot }} aria-hidden />
                    <button onClick={() => setSelectedId(c.id)} className={'w-full text-left rounded-xl p-3 transition-colors ' + (selected ? 'bg-brand-600/[0.06] border border-brand-600/20' : 'hover:bg-surface-2 border border-transparent')}>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={'text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ' + st.cls}>{st.label}</span>
                        <span className={'text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ' + SEVERITY_STYLE[c.impactSeverity]}>{c.impactSeverity} impact</span>
                        <span className="text-[10px] font-medium text-ink-4 capitalize">{categoryLabel(c.category)}</span>
                        {c.stabilizationConflict && <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded text-status-danger bg-status-danger/10">conflict</span>}
                      </div>
                      <div className="text-[13px] font-bold text-ink leading-snug">{c.title}</div>
                      <div className="text-[11px] text-ink-4 mt-0.5">{getCountryName(c.countryId)} · effective {new Date(c.effectiveDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} · {c.affectedAgreementIds.length} agreement{c.affectedAgreementIds.length === 1 ? '' : 's'}</div>
                    </button>
                  </li>
                );
              })
            )}
          </ol>
        </section>

        {/* Impact analysis for the selected regulation */}
        <section className="glass-card flex flex-col lg:col-span-2">
          <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01]">
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">Impact Analysis</h2>
            <p className="text-[12px] text-ink-4 font-medium truncate">{activeChange?.title ?? 'Select a regulation'}</p>
          </div>
          {activeChange ? (
            <div className="p-5 space-y-4">
              <p className="text-[12px] leading-relaxed text-ink-3">{activeChange.summary}</p>
              <div className="text-[11px] text-ink-4">Source: {activeChange.source}</div>

              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700 mb-2">Affected Agreements</h3>
                {activeImpacts.length === 0 ? (
                  <p className="text-[12px] text-ink-4">No specific agreement impacts recorded.</p>
                ) : (
                  <ul className="space-y-2">
                    {activeImpacts.map((im, idx) => {
                      const ag = getAgreementById(im.agreementId);
                      return (
                        <li key={idx} className="rounded-xl border border-line-soft bg-surface-2 p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[12px] font-semibold text-ink">{ag ? `${shortOperatorName(ag.operatorId)} · ${formatCommodity(ag.commodity)}` : im.agreementId}</span>
                            {im.estimatedFinancialImpactUSD != null && (
                              <span className="text-[12px] font-bold tabular-nums text-status-danger">${(im.estimatedFinancialImpactUSD / 1_000_000).toFixed(0)}m</span>
                            )}
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-foreground/5 text-ink-3">{IMPACT_LABEL[im.impactType] ?? im.impactType}</span>
                          <p className="text-[11px] leading-relaxed text-ink-4 mt-1.5">{im.description}</p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-ink-4 text-[13px]">No regulation selected.</div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Stabilisation conflict detector */}
        <section className="glass-card flex flex-col lg:col-span-2">
          <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01] flex items-center gap-2">
            <ShieldAlert size={15} className="text-status-danger" />
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">Stabilisation Conflict Detector</h2>
          </div>
          <div className="p-5 space-y-3">
            {conflicts.length === 0 ? (
              <p className="text-[12px] text-ink-4">No stabilisation conflicts detected in this scope.</p>
            ) : (
              conflicts.map(c => (
                <div key={c.id} className="rounded-xl border border-status-danger/20 bg-status-danger/[0.05] p-3.5">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={13} className="text-status-danger shrink-0" />
                    <span className="text-[12px] font-bold text-ink">{c.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-ink-3">{c.summary}</p>
                  <div className="text-[10px] text-ink-4 mt-1.5 font-mono">{getCountryName(c.countryId)} · {c.affectedAgreementIds.length} agreement(s)</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Country comparison */}
        <section className="glass-card flex flex-col lg:col-span-3 overflow-hidden">
          <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01]">
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">Regulatory Framework</h2>
            <p className="text-[12px] text-ink-4 font-medium">Royalties, tax, ownership and transparency at a glance</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft bg-surface-2">
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-3">Measure</th>
                  {COMPARE_COUNTRIES.map(c => (
                    <th key={c.id} className={'px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest ' + (countryId === c.id ? 'text-brand-700' : 'text-ink-3')}>
                      {c.name}{countryId === c.id ? ' ●' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {COMPARISON.map(row => (
                  <tr key={row.label} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 text-[12px] font-semibold text-ink">{row.label}</td>
                    {COMPARE_COUNTRIES.map(c => (
                      <td key={c.id} className={'px-4 py-3 text-[12px] ' + (countryId === c.id ? 'text-foreground font-semibold bg-brand-600/[0.04]' : 'text-ink-3')}>
                        {row.values[c.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Regulatory calendar */}
      <section className="glass-card">
        <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01] flex items-center gap-2">
          <CalendarClock size={15} className="text-brand-600" />
          <h2 className="text-[14px] font-bold tracking-wide text-foreground">Regulatory Calendar</h2>
          <span className="text-[12px] text-ink-4 font-medium">— upcoming effective dates & pending changes</span>
        </div>
        <div className="p-5">
          {calendar.length === 0 ? (
            <p className="text-[12px] text-ink-4">No upcoming regulatory dates in this scope.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {calendar.map(c => {
                const st = STATUS_STYLE[c.status];
                const future = new Date(c.effectiveDate) >= TODAY;
                return (
                  <div key={c.id} className="rounded-xl border border-line-soft bg-surface-2 p-3.5 flex items-start gap-3">
                    <div className="shrink-0 w-12 text-center">
                      <div className="text-[15px] font-black tabular-nums text-foreground leading-none">{new Date(c.effectiveDate).toLocaleDateString('en-GB', { day: '2-digit' })}</div>
                      <div className="text-[9px] font-bold uppercase tracking-wide text-ink-4 mt-0.5">{new Date(c.effectiveDate).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-ink leading-snug">{c.title}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={'text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ' + st.cls}>{st.label}</span>
                        <span className="text-[10px] text-ink-4">{future ? 'upcoming' : 'pending'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function getCountryName(id: string): string {
  return ({ GIN: 'Guinea', GHA: 'Ghana', CIV: "Côte d'Ivoire" } as Record<string, string>)[id] ?? id;
}
