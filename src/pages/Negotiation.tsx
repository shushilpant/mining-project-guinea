import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, ReferenceLine, Cell,
} from 'recharts';
import {
  getAgreementsWithBenchmark, getRoyaltyBenchmarks, getAgreements,
  getOperatorById,
} from '@/services/dataService';
import { useCountry } from '@/context/CountryContext';
import { useStoreData } from '@/store/dataStore';
import { useRole } from '@/hooks/useRole';
import { mutationService } from '@/services/mutationService';
import { Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { ChartPanel } from '@/components/shared/ChartPanel';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn, formatMillions } from '@/lib/utils';
import type { Commodity } from '@/data/types';

// Commodity palette drawn exclusively from the government design
// Per-commodity legend colours. Distinct hue per mineral so the
// scatter and legend read unambiguously: bauxite blue, gold orange,
// iron purple, lithium grey, manganese green.
const COMMODITY_COLORS: Record<string, string> = {
  bauxite:    '#2563eb', // blue-600   — bauxite
  gold:       '#f97316', // orange-500 — gold
  'iron ore': '#7c3aed', // violet-600 — iron
  manganese:  '#16a34a', // green-600  — manganese
  nickel:     '#ce1126', // status-danger — Pan-African red (reserved)
  lithium:    '#6b7280', // gray-500   — lithium
  diamonds:   '#565c65', // ink-3      — institutional neutral
};

const COUNTRY_NAMES: Record<string, string> = { GIN: 'Guinea', GHA: 'Ghana', CIV: "Côte d'Ivoire" };

export function NegotiationPage() {
  const { selectedCountry } = useCountry();
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | 'all'>('all');
  const { isAdmin } = useRole();

  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  const allAgreements = useStoreData(() => getAgreements(countryId).filter(a => a.status === 'active'), [countryId]);
  const benchmarkedAgreements = useStoreData(() => getAgreementsWithBenchmark(countryId), [countryId]);

  const commodities = useMemo(() => {
    return Array.from(new Set(allAgreements.map(a => a.commodity))).sort();
  }, [allAgreements]);

  const filteredBenchmarked = useMemo(() => {
    if (selectedCommodity === 'all') return benchmarkedAgreements;
    return benchmarkedAgreements.filter(a => a.commodity === selectedCommodity);
  }, [benchmarkedAgreements, selectedCommodity]);

  const benchmarkStats = useStoreData(() => {
    const commodity = selectedCommodity === 'all' ? undefined : selectedCommodity;
    return getRoyaltyBenchmarks(commodity, countryId);
  }, [selectedCommodity, countryId]);

  // Historical trend: royalty rates by year signed
  const historicalTrend = useMemo(() => {
    const byYear: Record<number, { rates: number[]; count: number }> = {};
    for (const a of allAgreements) {
      const year = new Date(a.dateSigned).getFullYear();
      if (!byYear[year]) byYear[year] = { rates: [], count: 0 };
      byYear[year].rates.push(a.royaltyRate);
      byYear[year].count++;
    }
    return Object.entries(byYear)
      .map(([year, data]) => ({
        year: Number(year),
        avgRate: Math.round((data.rates.reduce((a, b) => a + b, 0) / data.rates.length) * 10) / 10,
        count: data.count,
      }))
      .sort((a, b) => a.year - b.year);
  }, [allAgreements]);

  // Scatter chart data: royalty rate vs contract value
  const scatterData = useMemo(() => {
    return filteredBenchmarked.map(a => ({
      x: a.royaltyRate,
      y: a.contractValue,
      id: a.id,
      commodity: a.commodity,
      operator: getOperatorById(a.operatorId)?.name ?? 'Unknown',
      country: COUNTRY_NAMES[a.countryId],
    }));
  }, [filteredBenchmarked]);

  return (
    <div>
      <PageHeader
        title="Deal Benchmarking"
        subtitle="Check whether our royalty deals are fair compared with similar ones."
        badge="M2 · Negotiation Intelligence"
      />

      <ModuleIntro />

      {/* Benchmark stats */}
      {benchmarkStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Median Royalty" value={`${benchmarkStats.median}%`} accent="blue" sub={`${benchmarkStats.count} agreements`} hint="The middle royalty rate across these agreements — half pay more, half pay less. A useful 'typical' figure." />
          <MetricCard label="Average Royalty" value={`${benchmarkStats.avg.toFixed(1)}%`} accent="default" hint="The simple average royalty rate across the agreements in scope." />
          <MetricCard label="Lowest Rate" value={`${benchmarkStats.min}%`} accent="amber" sub="Worth reviewing" hint="The lowest royalty rate found — often the best candidate to renegotiate upward." />
          <MetricCard label="Highest Rate" value={`${benchmarkStats.max}%`} accent="green" sub="Best achieved" hint="The highest royalty rate achieved — a reference for what is possible." />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap" role="group" aria-label="Filter benchmarking by commodity">
        <button
          onClick={() => setSelectedCommodity('all')}
          aria-pressed={selectedCommodity === 'all'}
          className={cn('text-sm px-3 py-1.5 rounded-lg border transition-colors', selectedCommodity === 'all' ? 'bg-brand-600 text-white border-brand-600' : 'bg-surface border-line text-ink-2 hover:bg-surface-2')}
        >
          All Commodities
        </button>
        {commodities.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCommodity(c)}
            aria-pressed={selectedCommodity === c}
            className={cn('text-sm px-3 py-1.5 rounded-lg border capitalize transition-colors', selectedCommodity === c ? 'bg-brand-600 text-white border-brand-600' : 'bg-surface border-line text-ink-2 hover:bg-surface-2')}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Royalty rate vs contract value scatter */}
        <ChartPanel
          title="Royalty Rate vs Contract Value"
          caption="Each dot is an active agreement — hover for details."
          howToRead="Left–right is the royalty rate the government gets; up–down is the contract's value. Dots low and to the left are big-value deals paying little — the ones most worth a second look. Colour shows the mineral."
          aiRegion="Royalty Rate vs Contract Value"
          ariaLabel="Scatter plot of royalty rate against contract value for active agreements."
          bodyClassName="p-4"
        >
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 4, right: 8, bottom: 8, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="x"
                name="Royalty Rate"
                tick={{ fontSize: 10 }}
                tickFormatter={v => `${v}%`}
                label={{ value: 'Royalty Rate (%)', position: 'insideBottom', offset: -4, style: { fontSize: 10, fill: '#94a3b8' } }}
              />
              <YAxis
                dataKey="y"
                name="Contract Value"
                tick={{ fontSize: 10 }}
                tickFormatter={v => `$${v}M`}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-surface border border-line rounded-lg p-2.5 text-xs shadow-card">
                      <div className="font-medium text-ink">{d.operator}</div>
                      <div className="text-ink-3">{d.country} · {d.commodity}</div>
                      <div className="text-ink-2">{d.x}% royalty · {formatMillions(d.y * 1_000_000)}</div>
                    </div>
                  );
                }}
              />
              <Scatter data={scatterData}>
                {scatterData.map((d, i) => (
                  <Cell key={i} fill={COMMODITY_COLORS[d.commodity] ?? '#94a3b8'} opacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-2">
            {commodities.map(c => (
              <div key={c} className="flex items-center gap-1 text-xs text-ink-3 capitalize">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COMMODITY_COLORS[c] }} />
                {c}
              </div>
            ))}
          </div>
        </ChartPanel>

        {/* Historical trend */}
        <ChartPanel
          title="Average Royalty Rate — Historical Trend"
          caption="By year of signing — are the terms we agree improving?"
          howToRead="The line is the average royalty rate by the year deals were signed. A rising line means newer agreements secure better terms. The dashed line marks the median for comparison."
          aiRegion="Average Royalty Rate Historical Trend"
          ariaLabel="Line chart of average royalty rate by year of agreement signing."
          bodyClassName="p-4"
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={historicalTrend} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBF0E6" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#7A9A88' }} />
              <YAxis tick={{ fontSize: 10, fill: '#7A9A88' }} domain={[3, 9]} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: unknown) => [`${v}%`, 'Avg Royalty']} contentStyle={{ background: '#ffffff', border: '1px solid #dfe1e2', borderRadius: 6, fontSize: 12 }} />
              <ReferenceLine y={benchmarkStats?.median ?? 5} stroke="#71767a" strokeDasharray="4 4" label={{ value: 'Median', position: 'right', style: { fontSize: 10, fill: '#71767a' } }} />
              <Line type="monotone" dataKey="avgRate" stroke="#006b3f" strokeWidth={2} dot={{ r: 4, fill: '#006b3f' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* Agreement benchmarking table */}
      <div className="bg-surface rounded-xl border border-line shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-line-soft bg-surface-2">
          <h2 className="text-sm font-semibold text-ink">Individual Agreement Benchmarking</h2>
          <p className="text-xs text-ink-4 mt-0.5">Each agreement compared to peer agreements of the same commodity type — Negotiation Vulnerability Index (ACCI §6.2)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-soft bg-surface-2 text-left">
                {['Agreement', 'Operator', 'Country', 'Commodity', 'This Rate', 'Peer Median', 'vs Median', 'Value', 'Status'].map(h => (
                  <th key={h} scope="col" className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-ink-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {filteredBenchmarked.map(a => {
                const op = getOperatorById(a.operatorId);
                const isBelow = a.vsMedian < -0.5;
                const isAbove = a.vsMedian > 0.5;

                return (
                  <tr
                    key={a.id}
                    className="hover:bg-surface-2"
                    data-ai-entity={`agreement:${a.id}`}
                    data-ai-label={a.id}
                    data-ai-sub={`${op?.name ?? a.operatorId} · ${a.commodity} · royalty ${a.royaltyRate}% (peer ${a.peerMedianRoyalty}%)`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-ink-4">{a.id}</div>
                      <div className="text-xs text-ink-2 mt-0.5 max-w-48 truncate">{a.concesssionArea}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-ink">{op?.name}</td>
                    <td className="px-4 py-3 text-ink-2">{COUNTRY_NAMES[a.countryId]}</td>
                    <td className="px-4 py-3 capitalize text-ink-2">{a.commodity}</td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {isAdmin ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            defaultValue={a.royaltyRate}
                            step="0.1"
                            data-focus-ring="custom"
                            className="w-16 px-1.5 py-0.5 border border-line-strong rounded text-sm text-ink outline-none focus:border-brand-600 focus:shadow-focus-ring"
                            onBlur={(e) => {
                              const newVal = parseFloat(e.target.value);
                              if (!isNaN(newVal) && newVal !== a.royaltyRate) {
                                mutationService.updateAgreement(a.id, { royaltyRate: newVal });
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                          />
                          <span className="text-ink-3">%</span>
                        </div>
                      ) : (
                        `${a.royaltyRate}%`
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink-3">{a.peerMedianRoyalty}%</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-sm font-semibold tabular-nums', isBelow ? 'text-status-danger' : isAbove ? 'text-status-success' : 'text-ink-3')}>
                        {a.vsMedian > 0 ? '+' : ''}{a.vsMedian.toFixed(1)}pp
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink-2">{formatMillions(a.contractValue * 1_000_000)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge type="agreement" value={a.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* AI Negotiation Memo — right-click any row above to draft a state-side brief */}
        <div className="px-5 py-3 border-t border-line-soft bg-surface-2 flex items-start gap-2">
          <Sparkles size={12} className="text-brand-600 shrink-0 mt-0.5" />
          <div className="text-[11px] text-ink-3 leading-relaxed">
            <span className="font-semibold text-ink-2">Tip:</span> right-click any agreement row above to
            generate an AI negotiation memo grounded in that agreement's peer benchmarks — floors, asks,
            counter-arguments, and talking points. Or right-click anywhere on the page for a section-level read.
          </div>
        </div>

        {/* Negotiation guidance — mirrors markdown.md §6.2 + §8 sector context */}
        <div className="px-5 py-4 border-t border-line-soft bg-brand-50">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-1">
            Negotiation positioning note
          </div>
          <div className="text-xs leading-relaxed text-brand-800">
            Agreements below peer median represent potential revenue leakage. In renewal negotiations,
            use peer-median benchmarks as the floor — not the target — and calibrate against the IGF
            MPF, NRGI RGI 2021 country scores and the IMF DIGNAR-type scenarios in IMF Country Report
            24/131. Ghana&apos;s Royalty Regulations 2025 (5–12% sliding) and Côte d&apos;Ivoire&apos;s
            2025 Finance Act 8% above USD 2,000/oz establish the contemporary regional floor; the
            EITI Guinea June 2025 Simandou fiscal-modelling study (USD 700 m – USD 1.7 bn/yr pre-2035,
            rising to USD 2.7 bn/yr thereafter) anchors the iron-ore benchmark.
          </div>
        </div>
      </div>
    </div>
  );
}
