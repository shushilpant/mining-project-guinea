import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useCountry } from '@/context/CountryContext';
import { useStoreData } from '@/store/dataStore';
import { useRole } from '@/hooks/useRole';
import {
  getPublicDatasets, getPublicationLogs, generatePublicExport,
  getEITIReportReadiness, getCountries,
} from '@/services/dataService';
import { sanitizeRecords } from '@/lib/exportSafety';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { ChartPanel } from '@/components/shared/ChartPanel';
import { Globe2, Database, Download, Eye, EyeOff, Gauge, Lock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { PublicDataset } from '@/data/types';

const AXIS = '#8AA396';
const GRID = 'var(--border)';
const TOOLTIP_STYLE = { fontSize: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', color: 'var(--foreground)' } as const;

const CATEGORY_COLOR: Record<PublicDataset['category'], string> = {
  revenue: '#016940', licenses: '#1D6FB8', production: '#D97706', esg: '#10B981', local_content: '#8B5CF6',
};
const categoryLabel = (c: PublicDataset['category']) => c.replace('_', ' ');

const STATUS_STYLE: Record<string, string> = {
  published: 'text-status-success bg-status-success/10',
  draft: 'text-status-warning bg-status-warning/10',
  retracted: 'text-status-danger bg-status-danger/10',
};

type Format = 'CSV' | 'JSON' | 'Excel';

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function PublicPortalPage() {
  const { selectedCountry } = useCountry();
  const { isAdmin } = useRole();
  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  const datasets = useStoreData(() => getPublicDatasets(countryId), [countryId]);
  const logs = useStoreData(() => getPublicationLogs(), []);
  const countries = useStoreData(() => getCountries(), []);

  // Local publication overrides — the seed DB is immutable, so the
  // public/private toggle lives in component state for this session.
  const [publicOverride, setPublicOverride] = useState<Record<string, boolean>>({});
  const isPublic = (d: PublicDataset) => publicOverride[d.id] ?? d.isPublic;

  const [selectedId, setSelectedId] = useState<string>('');
  const [format, setFormat] = useState<Format>('CSV');
  const activeId = datasets.some(d => d.id === selectedId) ? selectedId : (datasets[0]?.id ?? '');
  const activeDataset = datasets.find(d => d.id === activeId);

  const preview = useMemo(
    () => (activeId ? generatePublicExport(activeId) : []),
    [activeId],
  );
  const previewCols = preview.length ? Object.keys(preview[0]) : [];

  const downloadStats = useMemo(
    () => [...datasets].filter(d => d.downloadCount > 0).sort((a, b) => b.downloadCount - a.downloadCount),
    [datasets],
  );

  const totalDownloads = useMemo(() => datasets.reduce((s, d) => s + d.downloadCount, 0), [datasets]);
  const publicCount = datasets.filter(isPublic).length;

  const readiness = useMemo(() => {
    const list = countryId ? countries.filter(c => c.id === countryId) : countries;
    return list.map(c => ({ country: c, ...getEITIReportReadiness(c.id) }));
  }, [countries, countryId]);

  const handleExport = () => {
    if (!activeDataset || preview.length === 0) return;
    const rows = generatePublicExport(activeDataset.id);
    const base = activeDataset.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    if (format === 'JSON') {
      triggerDownload(`${base}.json`, JSON.stringify(rows, null, 2), 'application/json');
    } else {
      const ws = XLSX.utils.json_to_sheet(sanitizeRecords(rows as Record<string, unknown>[]));
      if (format === 'CSV') {
        triggerDownload(`${base}.csv`, XLSX.utils.sheet_to_csv(ws), 'text/csv;charset=utf-8');
      } else {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, `${base}.xlsx`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Open Data Portal"
        subtitle="Publish open datasets and export clean data for public transparency."
        badge="M12 · Public Transparency & Data Export"
      />

      <ModuleIntro />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Datasets" value={datasets.length} sub="In current scope" icon={<Database size={16} />} accent="blue" hint="Total datasets available in the selected country scope." />
        <MetricCard label="Public Datasets" value={publicCount} sub={`${datasets.length - publicCount} private`} icon={<Globe2 size={16} />} accent="green" hint="Datasets currently open for public download. The rest are private/under review." />
        <MetricCard label="Total Downloads" value={totalDownloads.toLocaleString()} sub="All-time, this scope" icon={<Download size={16} />} accent="default" hint="Cumulative public downloads across datasets in scope." />
        <MetricCard label="Avg EITI Readiness" value={`${readiness.length ? Math.round(readiness.reduce((s, r) => s + r.readinessPercent, 0) / readiness.length) : 0}%`} sub="Public-reporting completeness" icon={<Gauge size={16} />} accent="amber" hint="Average EITI public-reporting readiness across countries in scope." />
      </div>

      {/* Dataset catalog */}
      <section className="glass-card">
        <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01]">
          <h2 className="text-[14px] font-bold tracking-wide text-foreground">Dataset Catalog</h2>
          <p className="text-[12px] text-ink-4 font-medium">{isAdmin ? 'Toggle a dataset public or private' : 'Open datasets available for download'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
          {datasets.map(d => {
            const pub = isPublic(d);
            const color = CATEGORY_COLOR[d.category];
            return (
              <div key={d.id} className="rounded-2xl border border-line-soft bg-surface-2 p-4 flex flex-col" style={{ borderLeftWidth: 3, borderLeftColor: color }}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded capitalize" style={{ color, background: `${color}1A` }}>{categoryLabel(d.category)}</span>
                  <button
                    onClick={() => isAdmin && setPublicOverride(o => ({ ...o, [d.id]: !pub }))}
                    disabled={!isAdmin}
                    aria-label={pub ? 'Set private' : 'Set public'}
                    title={isAdmin ? (pub ? 'Public — click to make private' : 'Private — click to make public') : (pub ? 'Public' : 'Private (admin only)')}
                    className={'flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md transition-colors ' + (pub ? 'text-status-success bg-status-success/10' : 'text-ink-4 bg-foreground/5') + (isAdmin ? ' hover:opacity-80 cursor-pointer' : ' cursor-default')}
                  >
                    {isAdmin ? (pub ? <Eye size={11} /> : <EyeOff size={11} />) : <Lock size={11} />}
                    {pub ? 'Public' : 'Private'}
                  </button>
                </div>
                <h3 className="mt-2.5 text-[13px] font-bold text-ink leading-snug">{d.name}</h3>
                <p className="mt-1 text-[11px] text-ink-4 leading-relaxed flex-1">{d.description}</p>
                <div className="mt-3 pt-3 border-t border-line-soft flex items-center justify-between text-[11px] text-ink-4 font-mono tabular-nums">
                  <span>{d.recordCount.toLocaleString()} rows · {d.format}</span>
                  <span>{new Date(d.lastPublished).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Export builder */}
        <section className="glass-card flex flex-col lg:col-span-3">
          <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01] flex items-center gap-2">
            <Download size={15} className="text-brand-600" />
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">Export Builder</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink-4">Dataset</span>
                <select value={activeId} onChange={(e) => setSelectedId(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-surface-2 border border-line-soft text-[13px] text-ink focus:outline-none focus:border-brand-600/40">
                  {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink-4">Format</span>
                <div className="mt-1 flex gap-1.5">
                  {(['CSV', 'JSON', 'Excel'] as Format[]).map(f => (
                    <button key={f} onClick={() => setFormat(f)} className={'flex-1 px-2 py-2 rounded-xl text-[12px] font-semibold transition-colors ' + (format === f ? 'bg-brand-600/15 text-brand-700 border border-brand-600/30' : 'text-ink-4 border border-line-soft hover:text-ink')}>{f}</button>
                  ))}
                </div>
              </label>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-ink-4 mb-1.5">Preview · first {Math.min(5, preview.length)} of {preview.length} rows</div>
              <div className="overflow-x-auto rounded-xl border border-line-soft">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-surface-2 border-b border-line-soft">
                      {previewCols.map(c => <th key={c} className="px-3 py-2 text-left font-bold uppercase tracking-wide text-ink-3 whitespace-nowrap">{c.replace(/_/g, ' ')}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {preview.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {previewCols.map(c => <td key={c} className="px-3 py-1.5 text-ink-3 font-mono whitespace-nowrap">{String((row as Record<string, unknown>)[c])}</td>)}
                      </tr>
                    ))}
                    {preview.length === 0 && <tr><td className="px-3 py-4 text-center text-ink-4">No exportable rows.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <button onClick={handleExport} disabled={preview.length === 0} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-[13px] font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Download size={15} /> Export {format}
            </button>
          </div>
        </section>

        {/* EITI readiness */}
        <section className="glass-card flex flex-col lg:col-span-2">
          <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01] flex items-center gap-2">
            <Gauge size={15} className="text-brand-600" />
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">EITI Readiness</h2>
          </div>
          <div className="p-5 space-y-4">
            {readiness.map(r => (
              <div key={r.country.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-bold text-foreground">{r.country.name}</span>
                  <span className="text-[14px] font-bold tabular-nums" style={{ color: r.readinessPercent >= 70 ? '#10B981' : r.readinessPercent >= 50 ? '#D97706' : '#DC2626' }}>{r.readinessPercent}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden bg-background border border-line-soft">
                  <div className="h-full rounded-full transition-all" style={{ width: `${r.readinessPercent}%`, background: r.readinessPercent >= 70 ? 'linear-gradient(90deg,#059669,#34d399)' : 'linear-gradient(90deg,#d97706,#fbbf24)' }} />
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-ink-4">
                  <span className="text-status-success">{r.complete} complete</span>
                  <span className="text-status-warning">{r.partial} partial</span>
                  <span className="text-status-danger">{r.missing} missing</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Download analytics */}
        <ChartPanel
          className="lg:col-span-3"
          title="Download Analytics"
          caption="Public download counts per dataset."
          howToRead="Taller bars are the most-downloaded open datasets — a signal of what the public and oversight bodies use most."
          accent="#1D6FB8"
          aiRegion="Download Analytics"
          ariaLabel="Bar chart of download counts per dataset."
          bodyClassName="p-5 h-[300px]"
        >
          {downloadStats.length === 0 ? (
            <div className="flex items-center justify-center h-full text-ink-4 text-sm">No downloads yet in this scope.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downloadStats} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: AXIS }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 9, fill: AXIS }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--secondary)' }} formatter={(v) => [`${Number(v).toLocaleString()}`, 'Downloads']} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="downloadCount" radius={[0, 3, 3, 0]}>
                  {downloadStats.map(d => <Cell key={d.id} fill={CATEGORY_COLOR[d.category]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        {/* Publication history */}
        <section className="glass-card flex flex-col lg:col-span-2">
          <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01]">
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">Publication History</h2>
            <p className="text-[12px] text-ink-4 font-medium">What was published, and when</p>
          </div>
          <ol className="divide-y divide-line-soft max-h-[320px] overflow-y-auto slim-scrollbar">
            {logs.map(l => {
              const ds = datasets.find(d => d.id === l.datasetId) ?? getPublicDatasets().find(d => d.id === l.datasetId);
              return (
                <li key={l.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold text-ink truncate">{ds?.name ?? l.datasetId}</span>
                    <span className={'shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ' + STATUS_STYLE[l.status]}>{l.status}</span>
                  </div>
                  <div className="text-[11px] text-ink-4 mt-0.5">{l.recordCount.toLocaleString()} rows · {l.publishedBy} · {new Date(l.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
