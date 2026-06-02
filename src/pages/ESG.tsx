import { useMemo } from 'react';
import { useCountry } from '@/context/CountryContext';
import { useStoreData } from '@/store/dataStore';
import {
  getESGMetrics, getESGSummary, getMineClosures, getLocalContentRecords,
  esgMetricScore, shortOperatorName,
} from '@/services/dataService';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { ChartPanel } from '@/components/shared/ChartPanel';
import { Leaf, Droplets, AlertCircle, CalendarClock, Users2, ShieldAlert } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, Legend,
} from 'recharts';
import type { ESGMetric } from '@/data/types';

const AXIS = '#8AA396';
const GRID = 'var(--border)';
const CAT_COLORS = { Environmental: '#10B981', Social: '#3B82F6', Governance: '#8B5CF6' };

const TOOLTIP_STYLE = { fontSize: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', color: 'var(--foreground)' } as const;

function scoreColor(s: number): string {
  if (s >= 80) return '#10B981';
  if (s >= 60) return '#D97706';
  return '#DC2626';
}

const PLAN_STYLE: Record<string, string> = {
  approved: 'text-status-success bg-status-success/10 border-status-success/20',
  pending: 'text-status-warning bg-status-warning/10 border-status-warning/20',
  overdue: 'text-status-danger bg-status-danger/10 border-status-danger/20',
};

const TODAY = new Date('2026-05-31');

export function ESGPage() {
  const { selectedCountry } = useCountry();
  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  const metrics = useStoreData(() => getESGMetrics(undefined, countryId), [countryId]);
  const summary = useStoreData(() => getESGSummary(countryId), [countryId]);
  const closures = useStoreData(() => getMineClosures(countryId), [countryId]);
  const fundRecords = useStoreData(
    () => getLocalContentRecords(undefined, countryId).filter(r => r.category === 'community_fund'),
    [countryId],
  );

  // Overall ESG score = mean of every metric's direction-aware attainment.
  const avgScore = useMemo(() => {
    if (metrics.length === 0) return 0;
    return Math.round(metrics.reduce((s, m) => s + esgMetricScore(m), 0) / metrics.length);
  }, [metrics]);

  const envAlerts = useMemo(
    () => metrics.filter(m => m.category === 'environmental' && esgMetricScore(m) < 75).length,
    [metrics],
  );
  const openGrievances = useMemo(
    () => metrics.filter(m => m.subcategory === 'community_grievance').reduce((s, m) => s + m.actualValue, 0),
    [metrics],
  );
  const nearingClosure = useMemo(
    () => closures.filter(c => {
      const yrs = (new Date(c.estimatedClosureDate).getTime() - TODAY.getTime()) / (365 * 86400000);
      return yrs <= 3 || c.closurePlanStatus === 'overdue';
    }).length,
    [closures],
  );

  // Radar: one spoke per operator that has metrics in all three pillars.
  const radarData = useMemo(() => {
    const byOp = new Map<string, ESGMetric[]>();
    metrics.forEach(m => {
      const arr = byOp.get(m.operatorId) ?? [];
      arr.push(m);
      byOp.set(m.operatorId, arr);
    });
    const catScore = (rows: ESGMetric[], cat: ESGMetric['category']) => {
      const c = rows.filter(r => r.category === cat);
      return c.length ? Math.round(c.reduce((s, r) => s + esgMetricScore(r), 0) / c.length) : null;
    };
    return [...byOp.entries()]
      .map(([opId, rows]) => ({
        operator: shortOperatorName(opId),
        Environmental: catScore(rows, 'environmental'),
        Social: catScore(rows, 'social'),
        Governance: catScore(rows, 'governance'),
      }))
      .filter(d => d.Environmental != null && d.Social != null && d.Governance != null);
  }, [metrics]);

  // Environmental score per operator for the bar panel.
  const envByOperator = useMemo(() => {
    const byOp = new Map<string, ESGMetric[]>();
    metrics.filter(m => m.category === 'environmental').forEach(m => {
      const arr = byOp.get(m.operatorId) ?? [];
      arr.push(m);
      byOp.set(m.operatorId, arr);
    });
    return [...byOp.entries()]
      .map(([opId, rows]) => ({
        operator: shortOperatorName(opId),
        score: Math.round(rows.reduce((s, r) => s + esgMetricScore(r), 0) / rows.length),
      }))
      .sort((a, b) => a.score - b.score);
  }, [metrics]);

  const grievanceLog = useMemo(
    () => metrics.filter(m => m.subcategory === 'community_grievance'),
    [metrics],
  );

  // Synthetic 6-quarter ESG trend, sloped by net improving-vs-declining count.
  const trendData = useMemo(() => {
    const net = metrics.filter(m => m.trend === 'improving').length - metrics.filter(m => m.trend === 'declining').length;
    const slope = Math.max(-10, Math.min(10, net));
    const periods = ['2024-Q3', '2024-Q4', '2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4'];
    return periods.map((period, i) => ({
      period,
      score: Math.max(0, Math.min(100, Math.round(avgScore - slope + (slope * i) / (periods.length - 1)))),
    }));
  }, [metrics, avgScore]);

  const closureRows = useMemo(
    () => [...closures].sort((a, b) => a.estimatedClosureDate.localeCompare(b.estimatedClosureDate)),
    [closures],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="ESG Tracker"
        subtitle="Track each company's environmental, social, and governance record."
        badge="M9 · Environmental, Social & Governance"
      />

      <ModuleIntro />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Avg ESG Score"
          value={metrics.length ? avgScore : '—'}
          sub={`E ${summary.environmental} · S ${summary.social} · G ${summary.governance}`}
          icon={<Leaf size={16} />}
          accent={avgScore >= 80 ? 'green' : avgScore >= 60 ? 'amber' : 'red'}
          hint="Overall environmental, social & governance score across all tracked metrics in scope (0–100, higher is better)."
        />
        <MetricCard
          label="Environmental Alerts"
          value={envAlerts}
          sub="Metrics below 75% attainment"
          icon={<Droplets size={16} />}
          accent={envAlerts > 0 ? 'red' : 'green'}
          hint="Environmental readings (water, carbon, tailings, rehab) that are falling short of their target."
        />
        <MetricCard
          label="Open Grievances"
          value={openGrievances}
          sub="Unresolved community complaints"
          icon={<AlertCircle size={16} />}
          accent={openGrievances > 0 ? 'red' : 'green'}
          hint="Total open community grievances logged against operators in scope."
        />
        <MetricCard
          label="Mines Nearing Closure"
          value={nearingClosure}
          sub={`${closures.length} closure plans tracked`}
          icon={<CalendarClock size={16} />}
          accent={nearingClosure > 0 ? 'amber' : 'green'}
          hint="Mines within ~3 years of closure, or with an overdue closure plan, where rehabilitation funding needs watching."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ChartPanel
          className="lg:col-span-3"
          title="ESG Scorecard by Operator"
          caption="Environmental, social and governance scores compared across operators."
          howToRead="Each spoke is a company. The three coloured shapes are the Environment, Social and Governance scores — the further a shape reaches toward the edge, the better that pillar scores."
          accent="#10B981"
          aiRegion="ESG Scorecard by Operator"
          ariaLabel="Radar chart of ESG pillar scores per operator."
          bodyClassName="p-5 h-[420px]"
        >
          {radarData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-ink-4 text-sm">No ESG data in this scope.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="68%" margin={{ top: 24, right: 64, bottom: 16, left: 64 }}>
                <PolarGrid stroke={GRID} />
                <PolarAngleAxis
                  dataKey="operator"
                  tick={{ fontSize: 10, fill: AXIS }}
                  tickSize={12}
                />
                <PolarRadiusAxis domain={[0, 100]} angle={90} tick={{ fontSize: 9, fill: AXIS }} tickCount={5} />
                <Radar name="Environmental" dataKey="Environmental" stroke={CAT_COLORS.Environmental} fill={CAT_COLORS.Environmental} fillOpacity={0.12} />
                <Radar name="Social" dataKey="Social" stroke={CAT_COLORS.Social} fill={CAT_COLORS.Social} fillOpacity={0.12} />
                <Radar name="Governance" dataKey="Governance" stroke={CAT_COLORS.Governance} fill={CAT_COLORS.Governance} fillOpacity={0.12} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} iconType="circle" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        <ChartPanel
          className="lg:col-span-2"
          title="Environmental Performance"
          caption="Average environmental attainment per operator (water, carbon, tailings, rehab)."
          howToRead="Each bar is a company's environmental score. Green is healthy (≥80), amber is watch (60–79), red means it is falling short (<60)."
          accent="#10B981"
          aiRegion="Environmental Performance"
          ariaLabel="Bar chart of environmental score by operator."
          bodyClassName="p-5 h-[340px]"
        >
          {envByOperator.length === 0 ? (
            <div className="flex items-center justify-center h-full text-ink-4 text-sm">No environmental data in this scope.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={envByOperator} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: AXIS }} tickLine={false} axisLine={false} />
                <YAxis dataKey="operator" type="category" width={84} tick={{ fontSize: 10, fill: AXIS }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--secondary)' }} formatter={(v) => [`${v}`, 'Env score']} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="score" radius={[0, 3, 3, 0]}>
                  {envByOperator.map(d => <Cell key={d.operator} fill={scoreColor(d.score)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social impact: community fund tracker + grievance log */}
        <section className="glass-card flex flex-col">
          <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01] flex items-center gap-3">
            <span className="w-1 h-5 rounded-full" style={{ background: '#3B82F6' }} aria-hidden />
            <div>
              <h2 className="text-[14px] font-bold tracking-wide text-foreground">Social Impact</h2>
              <p className="text-[12px] text-ink-4 font-medium">Community fund delivery and open grievances</p>
            </div>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700 flex items-center gap-1.5">
                <Users2 size={13} /> Community Development Fund (promised vs actual)
              </h3>
              {fundRecords.length === 0 ? (
                <p className="text-[12px] text-ink-4">No community-fund records in this scope.</p>
              ) : (
                <div className="space-y-3">
                  {fundRecords.map(r => {
                    const pct = r.promised > 0 ? Math.round((r.actual / r.promised) * 100) : 0;
                    return (
                      <div key={r.id}>
                        <div className="flex items-center justify-between text-[12px] mb-1">
                          <span className="font-semibold text-ink truncate">{shortOperatorName(r.operatorId)}</span>
                          <span className="font-mono text-ink-3 tabular-nums">{r.actual} / {r.promised} {r.unit}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-background border border-line-soft">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: pct >= 100 ? '#10B981' : pct >= 80 ? '#D97706' : '#DC2626' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700 flex items-center gap-1.5">
                <ShieldAlert size={13} /> Grievance Mechanism Log
              </h3>
              {grievanceLog.length === 0 ? (
                <p className="text-[12px] text-ink-4">No open grievances in this scope.</p>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {grievanceLog.map(m => (
                    <li key={m.id} className="py-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-ink truncate">{shortOperatorName(m.operatorId)}</div>
                        <div className="text-[11px] text-ink-4 truncate">{m.metricName}</div>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold px-2 py-1 rounded-md text-status-danger bg-status-danger/10">
                        {m.actualValue} open
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* ESG trend */}
        <ChartPanel
          title="ESG Score Trend"
          caption="How the overall ESG score has moved over recent quarters."
          howToRead="A rising line means environmental, social and governance performance is improving across the portfolio; a falling line means it is slipping."
          accent="#8B5CF6"
          aiRegion="ESG Score Trend"
          ariaLabel="Area chart of ESG score over quarters."
          bodyClassName="p-5 h-[300px]"
          takeaway={`Overall ESG score is ${avgScore}/100${trendData.length >= 2 ? ` — ${trendData[5].score - trendData[0].score >= 0 ? 'up' : 'down'} ${Math.abs(trendData[5].score - trendData[0].score)} points over the window` : ''}.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="esgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={GRID} vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}/100`, 'ESG score']} />
              <Area type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} fill="url(#esgGrad)" dot={{ r: 3, fill: 'var(--card)', stroke: '#8B5CF6', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* Mine closure & rehabilitation */}
      <section className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01] flex items-center gap-3">
          <span className="w-1 h-5 rounded-full" style={{ background: '#D97706' }} aria-hidden />
          <div>
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">Mine Closure & Rehabilitation</h2>
            <p className="text-[12px] text-ink-4 font-medium">Mines approaching end-of-life and their rehabilitation funding</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-soft bg-surface-2">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-3">Mine</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-3">Est. Closure</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-3 w-[210px]">Rehab Funded</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-ink-3">Env. Bond</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-ink-3">Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {closureRows.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-ink-4 text-[13px]">No closure plans in this scope.</td></tr>
              ) : (
                closureRows.map(c => {
                  const pct = c.rehabilitationProvisionUSD > 0
                    ? Math.round((c.rehabilitationSpentUSD / c.rehabilitationProvisionUSD) * 100)
                    : 0;
                  return (
                    <tr key={c.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-3 text-[12px] font-semibold text-ink">{c.mineName}</td>
                      <td className="px-4 py-3 text-[12px] text-ink-3 tabular-nums">{new Date(c.estimatedClosureDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full overflow-hidden bg-background border border-line-soft">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: pct >= 90 ? '#10B981' : pct >= 70 ? '#D97706' : '#DC2626' }} />
                          </div>
                          <span className="text-[11px] font-mono tabular-nums text-ink-3 w-9 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[12px] text-ink-3 tabular-nums">${(c.environmentalBondUSD / 1_000_000).toFixed(0)}m</td>
                      <td className="px-4 py-3 text-right">
                        <span className={'inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ' + PLAN_STYLE[c.closurePlanStatus]}>
                          {c.closurePlanStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
