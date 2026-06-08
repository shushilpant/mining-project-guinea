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
import type { PublicDataset } from '@/data/types';

const CATEGORY_COLOR: Record<PublicDataset['category'], string> = {
  revenue: '#016940', licenses: '#1D6FB8', production: '#D97706', esg: '#10B981', local_content: '#8B5CF6',
};
const categoryLabel = (c: PublicDataset['category']) => (c === 'licenses' ? 'licences' : c.replace('_', ' '));

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
  // Sorted descending, so the first entry is the busiest — used to scale the bars.
  const maxDownloads = downloadStats[0]?.downloadCount ?? 0;

  const totalDownloads = useMemo(() => datasets.reduce((s, d) => s + d.downloadCount, 0), [datasets]);
  const publicCount = datasets.filter(isPublic).length;

  const readiness = useMemo(() => {
    const list = countryId ? countries.filter(c => c.id === countryId) : countries;
    return list.map(c => ({ country: c, ...getEITIReportReadiness(c.id) }));
  }, [countries, countryId]);

  // Build and trigger a download for a single dataset in the given format.
  // Shared by the Export Builder and the per-dataset buttons in the catalogue.
  const downloadDataset = (dataset: PublicDataset, fmt: Format) => {
    const rows = generatePublicExport(dataset.id);
    if (rows.length === 0) return;
    const base = dataset.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    if (fmt === 'JSON') {
      triggerDownload(`${base}.json`, JSON.stringify(rows, null, 2), 'application/json');
    } else {
      const ws = XLSX.utils.json_to_sheet(sanitizeRecords(rows as Record<string, unknown>[]));
      if (fmt === 'CSV') {
        triggerDownload(`${base}.csv`, XLSX.utils.sheet_to_csv(ws), 'text/csv;charset=utf-8');
      } else {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, `${base}.xlsx`);
      }
    }
  };

  const handleExport = () => {
    if (!activeDataset || preview.length === 0) return;
    downloadDataset(activeDataset, format);
  };

  // Batch export: bundle every open dataset into a single Excel workbook,
  // one sheet per dataset. Private datasets are excluded by design.
  const downloadAllPublic = () => {
    const wb = XLSX.utils.book_new();
    const usedNames = new Set<string>();
    let sheets = 0;
    for (const d of datasets.filter(isPublic)) {
      const rows = generatePublicExport(d.id);
      if (rows.length === 0) continue;
      // Excel sheet names: max 31 chars, no : \ / ? * [ ], and must be unique.
      const safe = (d.name.replace(/[:\\/?*[\]]/g, ' ').trim() || 'Sheet').slice(0, 31);
      let name = safe;
      for (let i = 2; usedNames.has(name.toLowerCase()); i++) {
        const suffix = ` (${i})`;
        name = safe.slice(0, 31 - suffix.length) + suffix;
      }
      usedNames.add(name.toLowerCase());
      const ws = XLSX.utils.json_to_sheet(sanitizeRecords(rows as Record<string, unknown>[]));
      XLSX.utils.book_append_sheet(wb, ws, name);
      sheets++;
    }
    if (sheets === 0) return;
    XLSX.writeFile(wb, `open_data_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
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

      {/* Dataset catalogue */}
      <section className="glass-card">
        <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01]">
          <h2 className="text-[14px] font-bold tracking-wide text-foreground">Dataset Catalogue</h2>
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
                {pub ? (
                  <button
                    onClick={() => downloadDataset(d, 'CSV')}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600/10 text-brand-700 text-[12px] font-bold hover:bg-brand-600/20 transition-colors"
                    title={`Download ${d.name} as CSV`}
                  >
                    <Download size={13} /> Download CSV
                  </button>
                ) : (
                  <div className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-foreground/5 text-ink-4 text-[12px] font-semibold cursor-default" title="Private dataset — not available for public download">
                    <Lock size={13} /> Not public
                  </div>
                )}
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
          caption="Public download counts per dataset — download any open dataset directly."
          howToRead="Datasets are ranked by all-time public downloads. Use the download button on each open dataset to export it as CSV; private datasets are not available for public download."
          accent="#1D6FB8"
          aiRegion="Download Analytics"
          ariaLabel="Ranked list of datasets by download count, each with a download button."
          bodyClassName="p-5 h-[300px]"
          actions={
            publicCount > 0 ? (
              <button
                onClick={downloadAllPublic}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600/10 px-2.5 py-1.5 text-[11px] font-bold text-brand-700 transition-colors hover:bg-brand-600/20"
                title="Download every open dataset as a single Excel workbook (one sheet per dataset)"
              >
                <Download size={12} /> Download all ({publicCount})
              </button>
            ) : undefined
          }
        >
          {downloadStats.length === 0 ? (
            <div className="flex items-center justify-center h-full text-ink-4 text-sm">No downloads yet in this scope.</div>
          ) : (
            <ul className="h-full overflow-y-auto slim-scrollbar divide-y divide-line-soft">
              {downloadStats.map((d, i) => {
                const pub = isPublic(d);
                const color = CATEGORY_COLOR[d.category];
                const pct = maxDownloads > 0 ? Math.round((d.downloadCount / maxDownloads) * 100) : 0;
                return (
                  <li key={d.id} className="flex items-center gap-3 py-2.5">
                    <span className="shrink-0 w-5 text-right text-[11px] font-bold tabular-nums text-ink-4">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[12px] font-semibold text-ink">{d.name}</span>
                        <span className="shrink-0 text-[11px] font-mono tabular-nums text-ink-4">{d.downloadCount.toLocaleString()}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full border border-line-soft bg-background">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                    {pub ? (
                      <button
                        onClick={() => downloadDataset(d, 'CSV')}
                        className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-brand-700 transition-colors hover:bg-brand-600/20"
                        aria-label={`Download ${d.name} as CSV`}
                        title={`Download ${d.name} as CSV`}
                      >
                        <Download size={14} />
                      </button>
                    ) : (
                      <span
                        className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-ink-4"
                        title="Private dataset — not available for public download"
                      >
                        <Lock size={14} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
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
