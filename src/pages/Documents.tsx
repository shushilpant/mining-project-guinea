import { useMemo, useState } from 'react';
import { useCountry } from '@/context/CountryContext';
import { useStoreData } from '@/store/dataStore';
import { searchDocuments, getAgreementById, shortOperatorName } from '@/services/dataService';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { ChartPanel } from '@/components/shared/ChartPanel';
import { Search, Grid3x3, List, FileText, FileStack, Tag, Clock, FolderSearch } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ManagedDocument, ExtractedClause } from '@/data/types';

const TOOLTIP_STYLE = { fontSize: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', color: 'var(--foreground)' } as const;

type DocType = ManagedDocument['documentType'];
type ClauseType = ExtractedClause['clauseType'];

const DOC_TYPE_META: Record<DocType, { label: string; color: string }> = {
  agreement:    { label: 'Agreement',    color: '#016940' },
  amendment:    { label: 'Amendment',    color: '#1D6FB8' },
  audit_report: { label: 'Audit Report', color: '#D97706' },
  esg_report:   { label: 'ESG Report',   color: '#10B981' },
  closure_plan: { label: 'Closure Plan', color: '#EA580C' },
  regulatory:   { label: 'Regulatory',   color: '#8B5CF6' },
};

const CLAUSE_TYPES: ClauseType[] = ['royalty', 'stabilization', 'dispute_resolution', 'local_content', 'environmental', 'termination', 'force_majeure'];
const clauseLabel = (t: ClauseType) => t.replace(/_/g, ' ');

function confidenceColor(c: number): string {
  if (c >= 0.9) return '#10B981';
  if (c >= 0.8) return '#D97706';
  return '#DC2626';
}

export function DocumentsPage() {
  const { selectedCountry } = useCountry();
  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [clauseFilter, setClauseFilter] = useState<ClauseType | 'all'>('all');

  const docs = useStoreData(() => {
    let d = searchDocuments(query);
    if (countryId) d = d.filter(x => x.countryId === countryId);
    return d;
  }, [query, countryId]);

  const clauses = useMemo(() => {
    const all = docs.flatMap(d => d.extractedClauses.map(c => ({ clause: c, doc: d })));
    return all.filter(({ clause }) => clauseFilter === 'all' || clause.clauseType === clauseFilter);
  }, [docs, clauseFilter]);

  const timeline = useMemo(
    () => [...docs].sort((a, b) => b.lastModified.localeCompare(a.lastModified)).slice(0, 8),
    [docs],
  );

  const typeDistribution = useMemo(() => {
    const counts = new Map<DocType, number>();
    docs.forEach(d => counts.set(d.documentType, (counts.get(d.documentType) ?? 0) + 1));
    return [...counts.entries()].map(([type, value]) => ({ type, value, label: DOC_TYPE_META[type].label, color: DOC_TYPE_META[type].color }));
  }, [docs]);

  const totalClauses = useMemo(() => docs.reduce((s, d) => s + d.extractedClauses.length, 0), [docs]);
  const latestUpload = useMemo(
    () => docs.reduce<string>((latest, d) => (d.uploadDate > latest ? d.uploadDate : latest), '0000-00-00'),
    [docs],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Vault"
        subtitle="Every contract and report in one searchable, version-tracked library."
        badge="M11 · Contract Document Management"
      />

      <ModuleIntro />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Documents" value={docs.length} sub="In current scope" icon={<FileStack size={16} />} accent="blue" hint="How many documents match the current search and country scope." />
        <MetricCard label="Extracted Clauses" value={totalClauses} sub="Across all documents" icon={<Tag size={16} />} accent="green" hint="Total contract clauses automatically extracted and indexed from the documents in scope." />
        <MetricCard label="Document Types" value={typeDistribution.length} sub="Distinct categories" icon={<FolderSearch size={16} />} accent="default" hint="Number of distinct document categories present (agreements, audits, ESG reports, etc.)." />
        <MetricCard label="Latest Upload" value={latestUpload === '0000-00-00' ? '—' : new Date(latestUpload).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} sub="Most recent addition" icon={<Clock size={16} />} accent="amber" hint="The date of the most recently uploaded document in scope." />
      </div>

      {/* Search + view toggle */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, tags, and clause text…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-2 border border-line-soft text-[13px] text-ink placeholder:text-ink-4 focus:outline-none focus:border-brand-600/40"
            aria-label="Search documents"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-line-soft p-1 bg-surface-2 shrink-0">
          <button onClick={() => setView('grid')} aria-label="Grid view" className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ' + (view === 'grid' ? 'bg-brand-600/15 text-brand-700' : 'text-ink-4 hover:text-ink')}>
            <Grid3x3 size={14} /> Grid
          </button>
          <button onClick={() => setView('list')} aria-label="List view" className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ' + (view === 'list' ? 'bg-brand-600/15 text-brand-700' : 'text-ink-4 hover:text-ink')}>
            <List size={14} /> List
          </button>
        </div>
      </div>

      {/* Document grid / list */}
      {docs.length === 0 ? (
        <div className="glass-card p-12 text-center text-ink-4 text-[13px]">No documents match “{query}” in this scope.</div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {docs.map(d => <DocCard key={d.id} doc={d} />)}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-soft bg-surface-2">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-3">Title</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-3">Type</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-3">Agreement</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-ink-3">Version</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-ink-3">Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {docs.map(d => {
                const meta = DOC_TYPE_META[d.documentType];
                return (
                  <tr key={d.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 text-[12px] font-semibold text-ink">{d.title}</td>
                    <td className="px-4 py-3"><span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded" style={{ color: meta.color, background: `${meta.color}1A` }}>{meta.label}</span></td>
                    <td className="px-4 py-3 text-[12px] text-ink-3 font-mono">{d.agreementId ?? '—'}</td>
                    <td className="px-4 py-3 text-center text-[12px] text-ink-3 font-mono">{d.version}</td>
                    <td className="px-4 py-3 text-right text-[12px] text-ink-4 tabular-nums">{new Date(d.lastModified).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Clause explorer */}
        <section className="glass-card flex flex-col lg:col-span-3">
          <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01]">
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">Clause Explorer</h2>
            <p className="text-[12px] text-ink-4 font-medium">Filter extracted clauses by type across all contracts in scope</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button onClick={() => setClauseFilter('all')} className={'px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors ' + (clauseFilter === 'all' ? 'bg-brand-600/15 text-brand-700 border border-brand-600/30' : 'text-ink-4 border border-line-soft hover:text-ink')}>all</button>
              {CLAUSE_TYPES.map(t => (
                <button key={t} onClick={() => setClauseFilter(t)} className={'px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors ' + (clauseFilter === t ? 'bg-brand-600/15 text-brand-700 border border-brand-600/30' : 'text-ink-4 border border-line-soft hover:text-ink')}>{clauseLabel(t)}</button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-line-soft flex-1 min-h-[420px] max-h-[68vh] overflow-y-auto slim-scrollbar">
            {clauses.length === 0 ? (
              <div className="px-6 py-10 text-center text-ink-4 text-[13px]">No clauses of this type in scope.</div>
            ) : (
              clauses.map(({ clause, doc }) => (
                <div key={clause.id} className="px-6 py-3.5">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-brand-700 capitalize">{clauseLabel(clause.clauseType)}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="h-1.5 w-16 rounded-full overflow-hidden bg-background border border-line-soft">
                        <div className="h-full rounded-full" style={{ width: `${clause.confidence * 100}%`, background: confidenceColor(clause.confidence) }} />
                      </div>
                      <span className="text-[10px] font-mono text-ink-4 tabular-nums">{Math.round(clause.confidence * 100)}%</span>
                    </div>
                  </div>
                  <p className="text-[12px] leading-relaxed text-ink-2">{clause.clauseText}</p>
                  <div className="text-[11px] text-ink-4 mt-1">{doc.title} · p.{clause.pageNumber}</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Upload stats + timeline */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ChartPanel
            title="Document Types"
            caption="Distribution of documents by category."
            accent="#8B5CF6"
            aiRegion="Document Types"
            ariaLabel="Pie chart of document type distribution."
            bodyClassName="p-5"
          >
            {typeDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-[180px] text-ink-4 text-sm">No documents.</div>
            ) : (
              <div className="flex items-center gap-4">
                <div style={{ width: 150, height: 150 }} className="shrink-0">
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie data={typeDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={3} strokeWidth={0}>
                        {typeDistribution.map(d => <Cell key={d.type} fill={d.color} />)}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, _n, p) => [`${v}`, (p?.payload as { label?: string })?.label ?? '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                  {typeDistribution.map(d => (
                    <div key={d.type} className="flex items-center justify-between text-[12px]">
                      <span className="flex items-center gap-2 text-ink-2"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />{d.label}</span>
                      <span className="font-bold tabular-nums text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartPanel>

          <section className="glass-card flex flex-col">
            <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01]">
              <h2 className="text-[14px] font-bold tracking-wide text-foreground">Document Timeline</h2>
              <p className="text-[12px] text-ink-4 font-medium">Most recently modified, newest first</p>
            </div>
            <ol className="p-5 space-y-0">
              {timeline.map((d, i) => (
                <li key={d.id} className="relative pl-6 pb-4 last:pb-0">
                  {i < timeline.length - 1 && <span className="absolute left-[5px] top-3 bottom-0 w-px bg-line-strong" aria-hidden />}
                  <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full" style={{ background: DOC_TYPE_META[d.documentType].color }} aria-hidden />
                  <div className="text-[12px] font-semibold text-ink leading-snug">{d.title}</div>
                  <div className="text-[11px] text-ink-4 mt-0.5">{d.version} · {new Date(d.lastModified).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function DocCard({ doc }: { doc: ManagedDocument }) {
  const meta = DOC_TYPE_META[doc.documentType];
  const agreement = doc.agreementId ? getAgreementById(doc.agreementId) : undefined;
  return (
    <div className="glass-card p-5 card-hover flex flex-col" style={{ borderLeftWidth: 3, borderLeftColor: meta.color }}>
      <div className="flex items-start justify-between gap-2">
        <FileText size={18} className="shrink-0 mt-0.5" style={{ color: meta.color }} />
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded" style={{ color: meta.color, background: `${meta.color}1A` }}>{meta.label}</span>
      </div>
      <h3 className="mt-2.5 text-[13px] font-bold text-ink leading-snug">{doc.title}</h3>
      <div className="mt-1 text-[11px] text-ink-4">
        {agreement ? `${shortOperatorName(agreement.operatorId)} · ${doc.agreementId}` : doc.countryId}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {doc.tags.slice(0, 3).map(t => (
          <span key={t} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-2 text-ink-4 border border-line-soft">{t}</span>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-line-soft flex items-center justify-between text-[11px] text-ink-4 font-mono tabular-nums">
        <span>{doc.version} · {doc.fileSize}</span>
        <span>{doc.extractedClauses.length} clause{doc.extractedClauses.length === 1 ? '' : 's'}</span>
      </div>
    </div>
  );
}
