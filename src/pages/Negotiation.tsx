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
import { useDataStore } from '@/store/dataStore';
import { useRole } from '@/hooks/useRole';
import { mutationService } from '@/services/mutationService';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn, formatMillions, formatDate } from '@/lib/utils';
import type { Commodity } from '@/data/types';

const COMMODITY_COLORS: Record<string, string> = {
  bauxite: '#1d4ed8',
  gold: '#d97706',
  'iron ore': '#7c3aed',
  manganese: '#059669',
  nickel: '#dc2626',
  lithium: '#9ca3af',
  diamonds: '#0891b2',
};

const COUNTRY_NAMES: Record<string, string> = { GIN: 'Guinea', GHA: 'Ghana', CIV: "Côte d'Ivoire" };

export function NegotiationPage() {
  const { selectedCountry } = useCountry();
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | 'all'>('all');
  const dataVersion = useDataStore(state => state.version);
  const { isAdmin } = useRole();

  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  const allAgreements = useMemo(() => getAgreements(countryId).filter(a => a.status === 'active'), [countryId, dataVersion]);
  const benchmarkedAgreements = useMemo(() => getAgreementsWithBenchmark(countryId), [countryId, dataVersion]);

  const commodities = useMemo(() => {
    return Array.from(new Set(allAgreements.map(a => a.commodity))).sort();
  }, [allAgreements]);

  const filteredBenchmarked = useMemo(() => {
    if (selectedCommodity === 'all') return benchmarkedAgreements;
    return benchmarkedAgreements.filter(a => a.commodity === selectedCommodity);
  }, [benchmarkedAgreements, selectedCommodity]);

  const benchmarkStats = useMemo(() => {
    const commodity = selectedCommodity === 'all' ? undefined : selectedCommodity;
    return getRoyaltyBenchmarks(commodity, countryId);
  }, [selectedCommodity, countryId, dataVersion]);

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
        title="Negotiation Intelligence"
        subtitle="Benchmarking contract terms — royalty rates, deal values, and historical trends"
      />

      {/* Benchmark stats */}
      {benchmarkStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Median Royalty" value={`${benchmarkStats.median}%`} accent="blue" sub={`${benchmarkStats.count} agreements`} />
          <MetricCard label="Average Royalty" value={`${benchmarkStats.avg.toFixed(1)}%`} accent="default" />
          <MetricCard label="Lowest Rate" value={`${benchmarkStats.min}%`} accent="amber" sub="Worth reviewing" />
          <MetricCard label="Highest Rate" value={`${benchmarkStats.max}%`} accent="green" sub="Best achieved" />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedCommodity('all')}
          className={cn('text-sm px-3 py-1.5 rounded border', selectedCommodity === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-line text-ink-2')}
        >
          All Commodities
        </button>
        {commodities.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCommodity(c)}
            className={cn('text-sm px-3 py-1.5 rounded border capitalize', selectedCommodity === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-line text-ink-2')}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Royalty rate vs contract value scatter */}
        <div className="bg-white rounded border border-line shadow-sm p-4">
          <div className="text-sm font-semibold text-ink mb-1">Royalty Rate vs Contract Value</div>
          <div className="text-xs text-ink-4 mb-3">Each dot is an active agreement — hover for details</div>
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
                    <div className="bg-white border border-line rounded p-2 text-xs shadow">
                      <div className="font-medium">{d.operator}</div>
                      <div className="text-ink-3">{d.country} · {d.commodity}</div>
                      <div>{d.x}% royalty · {formatMillions(d.y * 1_000_000)}</div>
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
        </div>

        {/* Historical trend */}
        <div className="bg-white rounded border border-line shadow-sm p-4">
          <div className="text-sm font-semibold text-ink mb-1">Average Royalty Rate — Historical Trend</div>
          <div className="text-xs text-ink-4 mb-3">By year of agreement signing — are terms improving?</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={historicalTrend} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[3, 8]} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: unknown) => [`${v}%`, 'Avg Royalty']} />
              <ReferenceLine y={benchmarkStats?.median ?? 5} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Median', position: 'right', style: { fontSize: 10, fill: '#94a3b8' } }} />
              <Line type="monotone" dataKey="avgRate" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 4, fill: '#1d4ed8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agreement benchmarking table */}
      <div className="bg-white rounded border border-line shadow-sm">
        <div className="px-5 py-3 border-b border-line-soft">
          <h2 className="text-sm font-semibold text-ink">Individual Agreement Benchmarking</h2>
          <p className="text-xs text-ink-4 mt-0.5">Each agreement compared to peer agreements of the same commodity type</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left">
                {['Agreement', 'Operator', 'Country', 'Commodity', 'This Rate', 'Peer Median', 'vs Median', 'Value', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-xs font-medium text-ink-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {filteredBenchmarked.map(a => {
                const op = getOperatorById(a.operatorId);
                const isBelow = a.vsMedian < -0.5;
                const isAbove = a.vsMedian > 0.5;

                return (
                  <tr key={a.id} className="hover:bg-surface-2">
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
                            className="w-16 px-1.5 py-0.5 border border-line-strong rounded text-sm text-ink focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                      <span className={cn('text-sm font-semibold tabular-nums', isBelow ? 'text-red-600' : isAbove ? 'text-emerald-600' : 'text-ink-3')}>
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

        {/* Negotiation guidance */}
        <div className="px-5 py-4 border-t border-line-soft bg-blue-50 rounded-b">
          <div className="text-xs font-medium text-blue-800 mb-1">Negotiation positioning note</div>
          <div className="text-xs text-blue-700">
            Agreements marked in red (below peer median) represent potential revenue leakage.
            When entering renewal negotiations, use peer-median benchmarks as the floor —
            not the target. Higher-value contracts typically warrant rates at or above median.
            The historical trend shows whether the state's negotiating position has improved over time.
          </div>
        </div>
      </div>
    </div>
  );
}
