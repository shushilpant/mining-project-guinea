import { useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  getAllCountrySummaries, getAllOperatorScorecards, getCountries,
  getSystemMetrics, getAgreements, getOperators,
  getEITIReportReadiness, getEITIReportSections
} from '@/services/dataService';
import { useCountry } from '@/context/CountryContext';
import { useStoreData } from '@/store/dataStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { ChartPanel } from '@/components/shared/ChartPanel';
import { GlossaryTerm } from '@/components/shared/GlossaryTerm';
import { Printer, FileDown, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { sanitizeRecords } from '@/lib/exportSafety';

// Dedicated Guinea deployment — single national palette pulled from the flag.
const COUNTRY_COLORS: Record<string, string> = {
  GIN: '#006b3f', // Guinea — Pan-African green
};

const COUNTRY_NAMES: Record<string, string> = {
  GIN: 'Guinea',
};

const EITI_CATEGORIES = [
  { key: 'production', label: 'Production Obligations' },
  { key: 'financial', label: 'Financial Payments' },
  { key: 'infrastructure', label: 'Infrastructure Delivery' },
  { key: 'local-employment', label: 'Local Employment' },
  { key: 'environmental', label: 'Environmental Compliance' },
  { key: 'community-development', label: 'Community Development' },
] as const;

// Custom tooltip styled to gov palette
const GovTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2.5 rounded shadow-xl text-xs"
      style={{ background: '#062b1d', border: '1px solid rgba(214,138,24,0.35)', minWidth: 140 }}
    >
      <div className="font-bold mb-1.5 text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {label}
      </div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: p.fill }} />
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>{COUNTRY_NAMES[p.name] ?? p.name}</span>
          </div>
          <span className="font-bold tabular-nums" style={{ color: '#f5a623' }}>{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export function TransparencyPage() {
  const { selectedCountry } = useCountry();
  const printRef = useRef<HTMLDivElement>(null);

  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  const countrySummaries = useStoreData(() => getAllCountrySummaries(), []);
  const scorecards = useStoreData(() => getAllOperatorScorecards(countryId), [countryId]);
  const countries = useStoreData(() => getCountries(), []);
  const systemMetrics = useStoreData(() => getSystemMetrics(countryId), [countryId]);

  const crossCountry = useStoreData(() => {
    return countries.map(c => {
      const agreements = getAgreements(c.id).filter(a => a.status === 'active');
      const operators = getOperators(c.id);
      const sc = getAllOperatorScorecards(c.id);
      const avgCompliance =
        sc.length > 0
          ? Math.round(sc.reduce((a, b) => a + b.complianceRate, 0) / sc.length)
          : 0;
      const breachedOps = sc.filter(s => s.breachedCount > 0).length;
      const avgRoyalty =
        agreements.length > 0
          ? Math.round(
              (agreements.reduce((a, b) => a + b.royaltyRate, 0) / agreements.length) * 10,
            ) / 10
          : 0;
      return {
        countryId: c.id,
        name: c.name,
        agreements: agreements.length,
        operators: operators.length,
        avgCompliance,
        breachedOperators: breachedOps,
        avgRoyalty,
        miningAuthority: c.miningAuthority,
        regulatoryFramework: c.regulatoryFramework,
      };
    });
  }, [countries]);

  const eitiData = useStoreData(() => {
    return EITI_CATEGORIES.map(cat => {
      const entry: Record<string, string | number> = { category: cat.label };
      for (const c of countries) {
        const ops = getAllOperatorScorecards(c.id);
        const base =
          ops.length > 0
            ? Math.round(ops.reduce((s, sc) => s + sc.complianceRate, 0) / ops.length)
            : 100;
        const modifier: Record<string, Record<string, number>> = {
          GIN: { production: 5, financial: 3, infrastructure: -15, 'local-employment': -8, environmental: -10, 'community-development': -20 },
        };
        entry[c.id] = Math.min(100, Math.max(0, base + (modifier[c.id]?.[cat.key] ?? 0)));
      }
      return entry;
    });
  }, [countries]);

  const reportReadiness = useStoreData(() => {
    if (countryId) return getEITIReportReadiness(countryId);
    return getEITIReportReadiness('GIN'); // Default fallback
  }, [countryId]);

  const reportSections = useStoreData(() => {
    if (countryId) return getEITIReportSections(countryId);
    return getEITIReportSections('GIN'); // Default fallback
  }, [countryId]);

  const handlePrint = () => window.print();
  
  const handleExportEITI = () => {
    const scope = countryId ?? 'GIN';
    const countryName = COUNTRY_NAMES[scope] ?? scope;
    const stamp = new Date().toISOString().slice(0, 10);

    // Sheet 1 — readiness summary (derived from getEITIReportReadiness).
    const summary = [
      { Field: 'EITI Report — Scope', Value: countryName },
      { Field: 'Generated', Value: stamp },
      { Field: 'Standard', Value: 'EITI 2023 + OCDS Resource Contracts' },
      { Field: 'Readiness (%)', Value: reportReadiness.readinessPercent },
      { Field: 'Sections — Total', Value: reportReadiness.totalSections },
      { Field: 'Sections — Complete', Value: reportReadiness.complete },
      { Field: 'Sections — Partial', Value: reportReadiness.partial },
      { Field: 'Sections — Missing', Value: reportReadiness.missing },
    ];

    // Sheet 2 — section-by-section disclosure status.
    const sections = reportSections.map(s => ({
      Section: s.sectionNumber,
      Title: s.title,
      Status: s.status,
      'Data Source': s.dataSource,
      'Last Updated': s.lastUpdated,
    }));

    // sanitizeRecords neutralises spreadsheet formula-injection in any text cell.
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sanitizeRecords(summary)), 'Readiness');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sanitizeRecords(sections)), 'Sections');
    XLSX.writeFile(wb, `eiti_report_${scope.toLowerCase()}_${stamp}.xlsx`);
  };

  return (
    <div ref={printRef}>
      <PageHeader
        title="Public Reporting"
        subtitle="The figures Guinea publishes openly, and how it scores against the EITI standard."
        badge="M5 · Transparency & Reporting"
        actions={
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border border-line bg-surface text-ink-3 transition-colors hover:bg-surface-2 hover:border-line-strong hover:text-ink print:hidden"
          >
            <Printer size={13} />
            Print / Export
          </button>
        }
      />

      <ModuleIntro />

      {/* System-wide summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <MetricCard
          label="National Compliance"
          value={`${systemMetrics.systemComplianceRate}%`}
          accent={systemMetrics.systemComplianceRate >= 70 ? 'green' : 'amber'}
          hint="The share of all commitments being kept across Guinea's mining agreements. Higher is better."
        />
        <MetricCard label="Active Agreements" value={systemMetrics.totalActiveAgreements} accent="blue" hint="Total mining contracts currently in force in Guinea." />
        <MetricCard
          label="Breached Commitments"
          value={systemMetrics.breachedCommitments}
          accent={systemMetrics.breachedCommitments > 0 ? 'red' : 'green'}
          hint="Promises that have already been broken across all tracked Guinean agreements."
        />
        <MetricCard
          label="Critical Flags"
          value={systemMetrics.openCriticalFlags}
          accent={systemMetrics.openCriticalFlags > 0 ? 'red' : 'green'}
          hint="Open risk alerts at the most serious level, nationwide."
        />
      </div>

      {/* National governance summary table */}
      <div className="bg-surface rounded-xl border border-line shadow-card mb-5 overflow-hidden">
        <div className="px-5 py-3 border-b border-line-soft bg-surface-2">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">National Governance Summary</h2>
          <p className="text-[11px] mt-0.5 text-ink-4">Key governance and compliance metrics for Guinea</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Guinea governance and compliance metrics.</caption>
            <thead>
              <tr className="border-b border-line-soft bg-surface-2">
                {['Country', 'Ministry', 'Active Agreements', 'Operators', 'Avg Compliance', 'Operators in Breach', 'Avg Royalty Rate'].map(h => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-ink-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crossCountry.map((c) => (
                <tr key={c.countryId} className="border-b border-line-soft [&:nth-child(even)]:bg-surface-2">
                  <th scope="row" className="px-4 py-3 text-left font-normal">
                    <div className="font-semibold text-[13px] text-ink">{c.name}</div>
                    <div className="text-[11px] mt-0.5 max-w-52 truncate text-ink-4">{c.regulatoryFramework}</div>
                  </th>
                  <td className="px-4 py-3 text-[12px] max-w-40 text-ink-3">{c.miningAuthority}</td>
                  <td className="px-4 py-3 tabular-nums text-[13px] text-ink-3">{c.agreements}</td>
                  <td className="px-4 py-3 tabular-nums text-[13px] text-ink-3">{c.operators}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 w-14 rounded-full overflow-hidden bg-line-soft"
                        role="progressbar"
                        aria-valuenow={c.avgCompliance}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${c.name} average compliance`}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${c.avgCompliance}%`, background: c.avgCompliance >= 70 ? '#047857' : '#B45309' }}
                        />
                      </div>
                      <span className={cn('text-[13px] font-bold tabular-nums', c.avgCompliance >= 70 ? 'text-status-success' : 'text-status-warning')}>
                        {c.avgCompliance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[13px]">
                    {c.breachedOperators > 0 ? (
                      <span className="font-semibold text-status-danger">{c.breachedOperators}</span>
                    ) : (
                      <span className="text-status-success">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[13px] text-ink-3">{c.avgRoyalty}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EITI compliance bar chart */}
      <ChartPanel
        className="mb-5"
        title="Compliance by Category (EITI-aligned)"
        caption="Guinea's compliance rates by commitment type."
        howToRead="Each bar is one category. Taller bars mean better compliance in that theme — handy for seeing where Guinea leads or lags across its obligations."
        aiRegion="EITI-Aligned Compliance by Category"
        ariaLabel="Bar chart of Guinea's EITI-aligned compliance rates by category."
        bodyClassName="p-5 h-72"
      >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eitiData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBF0E6" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: '#7A9A88' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#7A9A88' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip content={<GovTooltip />} />
              <Legend
                formatter={name => COUNTRY_NAMES[name] ?? name}
                wrapperStyle={{ fontSize: 12, color: '#4A6B58' }}
              />
              {countries.map(c => (
                <Bar key={c.id} dataKey={c.id} fill={COUNTRY_COLORS[c.id]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
      </ChartPanel>

      {/* Country summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {countrySummaries.map(cs => (
          <div key={cs.countryId} className="bg-surface rounded-xl border border-line shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[13px] font-bold text-ink">{cs.countryName}</h3>
                <div className="text-[11px] mt-0.5 text-ink-4">
                  {cs.activeAgreements} agreements · {cs.totalOperators} operators
                </div>
              </div>
              <span className={cn('text-[22px] font-bold tabular-nums', cs.complianceRate >= 70 ? 'text-status-success' : 'text-status-warning')}>
                {cs.complianceRate}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden mb-3 bg-canvas"
              role="progressbar"
              aria-valuenow={cs.complianceRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${cs.countryName} compliance rate`}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${cs.complianceRate}%`, background: cs.complianceRate >= 70 ? '#047857' : '#B45309' }}
              />
            </div>
            <div className="space-y-1.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-ink-3">Avg royalty rate</span>
                <span className="font-semibold text-ink">{cs.avgRoyaltyRate}%</span>
              </div>
              {cs.openCriticalFlags > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink-3">Critical flags</span>
                  <span className="font-semibold text-status-danger">{cs.openCriticalFlags}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Operator scorecards horizontal bar chart */}
      <ChartPanel
        className="mb-5"
        title="Operator Compliance Scorecards"
        caption="Every Guinean operator ranked side by side, lowest compliance first."
        howToRead="Each bar is one mining company; longer bars keep more of their promises. The companies needing attention sit at the top."
        aiRegion="Operator Compliance Scorecards"
        ariaLabel={`Horizontal bar chart ranking ${scorecards.length} operators by compliance rate.`}
        bodyClassName="p-5"
      >
          <ResponsiveContainer width="100%" height={Math.max(200, scorecards.length * 30)}>
            <BarChart
              data={scorecards
                .sort((a, b) => a.complianceRate - b.complianceRate)
                .map(sc => ({
                  name: sc.operatorName.length > 24 ? sc.operatorName.slice(0, 24) + '…' : sc.operatorName,
                  rate: sc.complianceRate,
                  country: sc.countryIds[0],
                  fill: COUNTRY_COLORS[sc.countryIds[0]] ?? '#4A6B58',
                }))}
              layout="vertical"
              margin={{ top: 0, right: 48, bottom: 0, left: 168 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EBF0E6" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#7A9A88' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: '#4A6B58' }}
                tickLine={false}
                axisLine={false}
                width={160}
              />
              <Tooltip
                formatter={(v: unknown) => [`${v}%`, 'Compliance Rate']}
                contentStyle={{
                  fontSize: 12,
                  border: '1px solid #D2DACC',
                  borderRadius: 4,
                  background: 'white',
                }}
              />
              <Bar dataKey="rate" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
      </ChartPanel>

      {/* National Governance Posture — Guinea synthesis per markdown.md §5.1 */}
      <div className="bg-surface rounded-xl border border-line shadow-card p-5">
        <h2 className="text-[11px] font-bold uppercase tracking-widest mb-1 text-ink-2">
          National Governance Posture
        </h2>
        <p className="text-[11px] mb-4 text-ink-4 max-w-3xl leading-relaxed">
          Guinea's governance profile — a formally robust legal framework operationalised through highly
          discretionary ministerial practice — frames where continuous-assurance instrumentation adds the most
          value (markdown §5.1, §8.1).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Legal framework',
              tag: 'Formally robust',
              tagColor: '#066040',
              tagBg: '#e7f4ef',
              tagBorder: '#94cdb0',
              insight:
                'Code Minier L/2011/006/CNT (as amended by L/2013/053/CNT) grants a 15% non-dilutable state free-carried interest (option to 35%), a 30% profits tax and an LDF levy. SOGUIPAMI is the institutional custodian. EITI 88/100 (16 Feb 2022); NRGI 62/100 (2021); next validation under the 2023 EITI Standard commenced 1 Oct 2025.',
            },
            {
              title: 'Enforcement practice',
              tag: 'Hyper-discretionary',
              tagColor: '#ce1126',
              tagBg: '#FEF2F2',
              tagBorder: '#FECACA',
              insight:
                'Politically-inflected ministerial decisions — 129 mineral-exploration permits cancelled 26 May 2025 plus an earlier 51-licence purge, and the GAC/EGA concession revocation — have generated the Axis International USD 28.9 bn ICSID claim (filed 25 Dec 2025, registered 16 Jan 2026) and a wider arbitration docket.',
            },
            {
              title: 'Transparency gaps',
              tag: 'Beneficial ownership pending',
              tagColor: '#92400E',
              tagBg: '#FFFBEB',
              tagBorder: '#FDE68A',
              insight:
                'Beneficial-ownership legislation drafted 2019 and resubmitted 2024 remains pending enactment; a 2022 EITI request reached only nine of ~450 operators. The 30 Dec 2025 publication of Simandou-related agreements is a structural opening for machine-readable contract disclosure under EITI Requirement 2.4.',
            },
          ].map(item => (
            <div key={item.title} className="rounded-lg p-3.5 border border-line bg-surface-2">
              <div className="text-[12px] font-bold mb-1.5 text-ink">{item.title}</div>
              <div className="text-[12px] leading-relaxed mb-3 text-ink-3">{item.insight}</div>
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
                style={{ color: item.tagColor, background: item.tagBg, border: `1px solid ${item.tagBorder}` }}
              >
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* EITI Report Generator Panel */}
      <div className="bg-surface rounded-xl border border-line shadow-card p-5 mt-5 print:hidden">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2"><GlossaryTerm term="EITI">EITI</GlossaryTerm> Report Readiness</h2>
            <p className="text-[13px] font-medium text-ink mt-1">
              Automated compilation of national compliance and fiscal data
            </p>
          </div>
          <button
            onClick={handleExportEITI}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-[13px] hover:bg-primary/90 transition-colors shadow-sm"
          >
            <FileDown size={16} />
            Generate EITI Package
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 border border-line-soft bg-surface-2 rounded-xl p-4 flex flex-col justify-center items-center text-center">
             <div className="relative w-24 h-24 flex items-center justify-center mb-3">
               <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                 <path
                   className="text-line-strong stroke-current"
                   strokeWidth="3"
                   fill="none"
                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                 />
                 <path
                   className={cn("stroke-current transition-all duration-1000", reportReadiness.readinessPercent >= 80 ? "text-primary" : "text-[#D97706]")}
                   strokeDasharray={`${reportReadiness.readinessPercent}, 100`}
                   strokeWidth="3"
                   fill="none"
                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                 />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                 <span className="text-xl font-bold tabular-nums leading-none">{reportReadiness.readinessPercent}%</span>
               </div>
             </div>
             <div className="text-[12px] font-bold text-ink mb-1">Data Completeness</div>
             <div className="text-[11px] text-ink-3">Based on standard EITI disclosure requirements</div>
          </div>
          
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reportSections.map(section => (
              <div key={section.sectionNumber} className="flex items-center justify-between p-3 border border-line-soft rounded-lg bg-surface-2">
                 <div className="flex items-center gap-3">
                   {section.status === 'complete' && <CheckCircle2 size={16} className="text-primary shrink-0" />}
                   {section.status === 'partial' && <AlertCircle size={16} className="text-[#D97706] shrink-0" />}
                   {section.status === 'missing' && <XCircle size={16} className="text-destructive shrink-0" />}
                   <div>
                     <div className="text-[12px] font-bold text-ink">
                       {section.sectionNumber} {section.title}
                     </div>
                     <div className="text-[10px] text-ink-4 mt-0.5">Source: {section.dataSource}</div>
                   </div>
                 </div>
                 <span className="text-[10px] font-mono text-ink-4 tabular-nums">
                   {section.lastUpdated}
                 </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
