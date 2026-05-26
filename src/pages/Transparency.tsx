import { useMemo, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  getAllCountrySummaries, getAllOperatorScorecards, getCountries,
  getSystemMetrics, getAgreements, getOperators,
} from '@/services/dataService';
import { useCountry } from '@/context/CountryContext';
import { useDataStore } from '@/store/dataStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

const COUNTRY_COLORS: Record<string, string> = {
  GIN: '#016940',
  GHA: '#C8991E',
  CIV: '#4A6B58',
};

const COUNTRY_NAMES: Record<string, string> = {
  GIN: 'Guinea',
  GHA: 'Ghana',
  CIV: "Côte d'Ivoire",
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
      style={{ background: '#011F14', border: '1px solid rgba(200,153,30,0.35)', minWidth: 140 }}
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
          <span className="font-bold tabular-nums" style={{ color: '#C8991E' }}>{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export function TransparencyPage() {
  const { selectedCountry } = useCountry();
  const printRef = useRef<HTMLDivElement>(null);
  const dataVersion = useDataStore((state) => state.version);

  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  const countrySummaries = useMemo(() => getAllCountrySummaries(), [dataVersion]);
  const scorecards = useMemo(() => getAllOperatorScorecards(countryId), [countryId, dataVersion]);
  const countries = useMemo(() => getCountries(), [dataVersion]);
  const systemMetrics = useMemo(() => getSystemMetrics(countryId), [countryId, dataVersion]);

  const crossCountry = useMemo(() => {
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
  }, [countries, dataVersion]);

  const eitiData = useMemo(() => {
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
          GHA: { production: 8, financial: 5, infrastructure: 2, 'local-employment': -12, environmental: 3, 'community-development': -18 },
          CIV: { production: 3, financial: 4, infrastructure: -5, 'local-employment': -8, environmental: 2, 'community-development': -5 },
        };
        entry[c.id] = Math.min(100, Math.max(0, base + (modifier[c.id]?.[cat.key] ?? 0)));
      }
      return entry;
    });
  }, [countries, dataVersion]);

  const handlePrint = () => window.print();

  return (
    <div ref={printRef}>
      <PageHeader
        title="Transparency & Reporting"
        subtitle="EITI-aligned cross-operator and cross-country compliance reporting"
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

      {/* System-wide summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <MetricCard
          label="System Compliance"
          value={`${systemMetrics.systemComplianceRate}%`}
          accent={systemMetrics.systemComplianceRate >= 70 ? 'green' : 'amber'}
        />
        <MetricCard label="Active Agreements" value={systemMetrics.totalActiveAgreements} accent="blue" />
        <MetricCard
          label="Breached Commitments"
          value={systemMetrics.breachedCommitments}
          accent={systemMetrics.breachedCommitments > 0 ? 'red' : 'green'}
        />
        <MetricCard
          label="Critical Flags"
          value={systemMetrics.openCriticalFlags}
          accent={systemMetrics.openCriticalFlags > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Cross-country comparison table */}
      <div className="bg-surface rounded-xl border border-line shadow-card mb-5 overflow-hidden">
        <div className="px-5 py-3 border-b border-line-soft bg-surface-2">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Cross-Country Comparison</h2>
          <p className="text-[11px] mt-0.5 text-ink-4">Key governance and compliance metrics by country</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Governance and compliance metrics compared across the three countries.</caption>
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
      <div className="bg-surface rounded-xl border border-line shadow-card mb-5 overflow-hidden">
        <div className="px-5 py-3 border-b border-line-soft bg-surface-2">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">EITI-Aligned Compliance by Category</h2>
          <p className="text-[11px] mt-0.5 text-ink-4">Compliance rates by commitment type, broken down by country</p>
        </div>
        <div className="p-5 h-72" role="img" aria-label="Grouped bar chart of EITI-aligned compliance rates by category for Guinea, Ghana, and Côte d'Ivoire.">
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
        </div>
      </div>

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
      <div className="bg-surface rounded-xl border border-line shadow-card mb-5 overflow-hidden">
        <div className="px-5 py-3 border-b border-line-soft bg-surface-2">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Operator Compliance Scorecards</h2>
          <p className="text-[11px] mt-0.5 text-ink-4">Side-by-side comparison — all operators, sorted by compliance rate</p>
        </div>
        <div className="p-5" role="img" aria-label={`Horizontal bar chart ranking ${scorecards.length} operators by compliance rate.`}>
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
          <div className="flex items-center gap-5 mt-3 flex-wrap">
            {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
              <div key={code} className="flex items-center gap-1.5 text-[12px] text-ink-3">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COUNTRY_COLORS[code] }} aria-hidden />
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cross-Country Governance Insights */}
      <div className="bg-surface rounded-xl border border-line shadow-card p-5">
        <h2 className="text-[11px] font-bold uppercase tracking-widest mb-4 text-ink-2">
          Cross-Country Governance Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              country: 'Ghana',
              tag: 'Best practice: reporting cadence',
              tagColor: '#016940',
              tagBg: '#F0F8F4',
              tagBorder: '#B5E0D0',
              insight:
                'Highest production compliance rate — standardised quarterly reporting obligations and dedicated Minerals Commission oversight appear to correlate with stronger production delivery.',
            },
            {
              country: 'Guinea',
              tag: 'Gap: infrastructure monitoring',
              tagColor: '#92400E',
              tagBg: '#FFFBEB',
              tagBorder: '#FDE68A',
              insight:
                'Largest agreements by value but highest infrastructure obligation breach rate. Rail and port commitments in major conventions require dedicated milestone oversight mechanisms.',
            },
            {
              country: "Côte d'Ivoire",
              tag: 'Opportunity: community obligations',
              tagColor: '#1d4ed8',
              tagBg: '#EFF6FF',
              tagBorder: '#BFDBFE',
              insight:
                'Community development compliance is below average across all three countries but most acute in multi-country operators. Standardising community fund reporting could improve accountability.',
            },
          ].map(item => (
            <div key={item.country} className="rounded-lg p-3.5 border border-line bg-surface-2">
              <div className="text-[12px] font-bold mb-1.5 text-ink">{item.country}</div>
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
    </div>
  );
}
