import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import type { LucideIcon } from 'lucide-react';
import {
  FileText, Users, AlertTriangle, TrendingUp, Shield,
  Calendar, Activity, ChevronRight, Clock, ArrowUpRight,
  AlertOctagon, AlertCircle, ShieldAlert, FileBarChart2,
} from 'lucide-react';
import { useCountry } from '@/context/CountryContext';
import { useStoreData } from '@/store/dataStore';
import {
  getSystemMetrics, getRiskFlags, getComplianceTrend,
  getAllCountrySummaries, getOperatorById, getAgreementById,
  getCommitments,
} from '@/services/dataService';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CountryMap } from '@/components/shared/CountryMap';
import { MorningBriefStrip } from '@/components/shared/MorningBriefStrip';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { ChartPanel } from '@/components/shared/ChartPanel';
import { InfoTip } from '@/components/shared/InfoTip';
import { formatDate } from '@/lib/utils';
import type { RiskFlag } from '@/data/types';

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const COMPLIANCE_COLORS = {
  met:       '#10B981', // Emerald 500
  'on-track':'#3B82F6', // Blue 500
  'at-risk': '#F59E0B', // Amber 500
  breached:  '#EF4444', // Red 500
};

type ActivityType = 'alert' | 'update' | 'info';
interface ActivityEvent {
  id: string;
  Icon: LucideIcon;
  text: string;
  time: string;
  type: ActivityType;
}

const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  alert:  'Alert',
  update: 'Update',
  info:   'Info',
};

function buildActivityFeed(countryId?: string): ActivityEvent[] {
  const flags = getRiskFlags(countryId)
    .filter(f => f.status !== 'resolved')
    .sort((a, b) => b.triggeredDate.localeCompare(a.triggeredDate))
    .slice(0, 3);

  const commitments = getCommitments()
    .filter(c => c.status === 'breached' || c.status === 'at-risk')
    .slice(0, 2);

  const events: ActivityEvent[] = [];

  flags.forEach(f => {
    const op = getOperatorById(f.operatorId);
    events.push({
      id: `flag-${f.id}`,
      Icon: f.severity === 'critical' ? AlertOctagon : AlertTriangle,
      text: `${f.severity === 'critical' ? 'Critical' : 'High'} flag raised — ${op?.name ?? 'Unknown'}: ${f.category}`,
      time: formatDate(f.triggeredDate),
      type: f.severity === 'critical' ? 'alert' : 'update',
    });
  });

  commitments.forEach(c => {
    events.push({
      id: `cmt-${c.id}`,
      Icon: c.status === 'breached' ? ShieldAlert : AlertCircle,
      text: `Commitment ${c.status === 'breached' ? 'breached' : 'at risk'}: ${c.description.slice(0, 60)}…`,
      time: 'Recent',
      type: c.status === 'breached' ? 'alert' : 'update',
    });
  });

  events.push({
    id: 'sys-1',
    Icon: FileBarChart2,
    text: 'Compliance trend report auto-generated — Q2 2024',
    time: '2024-06-01',
    type: 'info',
  });

  return events.slice(0, 5);
}

const STATUS_URGENCY: Record<string, number> = { breached: 0, 'at-risk': 1, 'on-track': 2, met: 3 };

function buildUpcomingDeadlines(countryId?: string) {
  const today = new Date();

  return getCommitments()
    .filter(c => c.status !== 'met')
    .map(c => {
      const ag = getAgreementById(c.agreementId);
      const daysLeft = Math.ceil((new Date(c.dueDate).getTime() - today.getTime()) / 86400000);
      const op = ag ? getOperatorById(ag.operatorId) : undefined;
      return { ...c, daysLeft, operatorName: op?.name ?? '—', countryId: ag?.countryId };
    })
    .filter(c => !countryId || c.countryId === countryId)
    .sort((a, b) => {
      const urgencyDiff = STATUS_URGENCY[a.status] - STATUS_URGENCY[b.status];
      if (urgencyDiff !== 0) return urgencyDiff;
      return a.daysLeft - b.daysLeft;
    })
    .slice(0, 6);
}

const ComplianceTip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-4 py-3 rounded-xl shadow-pop text-sm backdrop-blur-xl relative overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
      <div className="font-mono text-[11px] mb-1.5 text-ink-4 relative z-10">{label}</div>
      <div className="font-bold text-[22px] tabular-nums text-primary relative z-10 tracking-tight leading-none mb-1">
        {payload[0].value}%
      </div>
      <div className="text-[11px] text-ink-3 relative z-10 font-medium">Compliance Rate</div>
    </div>
  );
};

/* ── Shared panel wrapper ─────────────────────────── */
function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`glass-card flex flex-col ${className}`}>
      {children}
    </section>
  );
}

function PanelHeader({
  title, subtitle, actions, accent = '#10B981', howToRead,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  accent?: string;
  howToRead?: string;
}) {
  return (
    <div className="px-6 py-5 flex items-center justify-between border-b border-line-soft bg-foreground/[0.01]">
      <div className="flex items-center gap-3">
        <span className="w-1 h-5 rounded-full shadow-glow" style={{ background: accent }} aria-hidden />
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">{title}</h2>
            {howToRead && <InfoTip title="How to read this" body={howToRead} label={`How to read: ${title}`} />}
          </div>
          {subtitle && <p className="text-[12px] mt-0.5 text-ink-4 font-medium">{subtitle}</p>}
        </div>
      </div>
      {actions}
    </div>
  );
}

export function Dashboard() {
  const { selectedCountry } = useCountry();
  const navigate = useNavigate();

  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  const metrics         = useStoreData(() => getSystemMetrics(countryId),         [countryId]);
  const trendData       = useStoreData(() => getComplianceTrend(countryId),       [countryId]);
  const countrySummaries = useStoreData(() => getAllCountrySummaries(),            []);
  const activity        = useStoreData(() => buildActivityFeed(countryId),        [countryId]);
  const deadlines       = useStoreData(() => buildUpcomingDeadlines(countryId),   [countryId]);

  const topFlags = useStoreData(() =>
    getRiskFlags(countryId)
      .filter(f => f.status !== 'resolved')
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
      .slice(0, 8),
    [countryId]
  );

  const complianceDist = useStoreData(() => {
    const all = getCommitments();
    const filtered = countryId
      ? all.filter(c => {
          const ag = getAgreementById(c.agreementId);
          return ag?.countryId === countryId;
        })
      : all;
    const counts = { met: 0, 'on-track': 0, 'at-risk': 0, breached: 0 };
    filtered.forEach(c => { counts[c.status] = (counts[c.status] ?? 0) + 1; });
    return [
      { name: 'Met',      value: counts.met,         color: COMPLIANCE_COLORS.met },
      { name: 'On-Track', value: counts['on-track'],  color: COMPLIANCE_COLORS['on-track'] },
      { name: 'At Risk',  value: counts['at-risk'],   color: COMPLIANCE_COLORS['at-risk'] },
      { name: 'Breached', value: counts.breached,     color: COMPLIANCE_COLORS.breached },
    ].filter(d => d.value > 0);
  }, [countryId]);

  const totalCommitmentsCount = complianceDist.reduce((s, d) => s + d.value, 0);

  // Plain-English takeaway for the trend chart: direction over the window shown.
  const trendDelta = trendData.length >= 2
    ? Math.round(trendData[trendData.length - 1].rate - trendData[0].rate)
    : 0;
  const trendWord = trendDelta > 0 ? 'up' : trendDelta < 0 ? 'down' : 'flat';

  return (
    <div className="space-y-6">

      <ModuleIntro />

      {/* ── AI Morning Brief — proactive 3-line situational read ─── */}
      <MorningBriefStrip />

      {/* ── Metric cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5" data-ai-region="executive-kpis">
        <div data-ai-entity="metric:active-agreements" data-ai-label="Active agreements" data-ai-sub={`${metrics.totalActiveAgreements} active in scope`}>
          <MetricCard
            label="Active Agreements"
            value={metrics.totalActiveAgreements}
            icon={<FileText size={18} />}
            accent="blue"
            onClick={() => navigate('/agreements')}
            hint="How many mining contracts are currently in force in the selected scope. Click to see them all."
          />
        </div>
        <div data-ai-entity="metric:operators" data-ai-label="Operators monitored" data-ai-sub={`${metrics.totalOperators} operators in scope`}>
          <MetricCard
            label="Operators Monitored"
            value={metrics.totalOperators}
            icon={<Users size={18} />}
            accent="default"
            onClick={() => navigate('/performance')}
            hint="The number of mining companies currently being tracked for compliance."
          />
        </div>
        <div data-ai-entity="metric:compliance-rate" data-ai-label="System compliance rate" data-ai-sub={`${metrics.systemComplianceRate}% across ${metrics.totalCommitments} commitments`}>
          <MetricCard
            label="Compliance Rate"
            value={`${metrics.systemComplianceRate}%`}
            sub={`${metrics.totalCommitments} commitments tracked`}
            icon={<Shield size={18} />}
            accent={metrics.systemComplianceRate >= 70 ? 'green' : 'amber'}
            onClick={() => navigate('/performance')}
            hint="The share of all promises (commitments) that companies are currently keeping. Higher is better; below 70% shows amber."
          />
        </div>
        <div data-ai-entity="metric:critical-flags" data-ai-label="Critical flags" data-ai-sub={`${metrics.openCriticalFlags} critical · ${metrics.openHighFlags} high`}>
          <MetricCard
            label="Critical Flags"
            value={metrics.openCriticalFlags}
            sub={`${metrics.openHighFlags} high severity`}
            icon={<AlertTriangle size={18} />}
            accent={metrics.openCriticalFlags > 0 ? 'red' : 'green'}
            onClick={() => navigate('/risk')}
            hint="Open risk alerts at the most serious level that need attention now. Click to investigate them."
          />
        </div>
        <div data-ai-entity="metric:breached-commitments" data-ai-label="Breached commitments" data-ai-sub={`${metrics.breachedCommitments} breached · ${metrics.atRiskCommitments} at-risk`}>
          <MetricCard
            label="Breached Commitments"
            value={metrics.breachedCommitments}
            sub={`${metrics.atRiskCommitments} at-risk`}
            icon={<TrendingUp size={18} />}
            accent={metrics.breachedCommitments > 0 ? 'amber' : 'green'}
            onClick={() => navigate('/performance')}
            hint="Promises that have already been broken. The sub-figure shows how many more are slipping (at-risk)."
          />
        </div>
      </div>

      {/* ── Map + Trend chart ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Panel className="lg:col-span-3">
          <PanelHeader
            title="Operator & Mine Locations"
            subtitle="Colour indicates operator compliance status"
            howToRead="Each pin is a mine. Its colour shows how well that company is keeping its commitments — green is healthy, red means breaches. Use the legend below."
          />
          <div className="flex-1 min-h-[300px] relative">
            <CountryMap countryId={countryId} />
          </div>
          <div className="px-6 py-3 flex items-center gap-5 flex-wrap border-t border-line-soft bg-surface">
            {[
              { label: 'Met',      color: '#10B981' },
              { label: 'On Track', color: '#3B82F6' },
              { label: 'At Risk',  color: '#F59E0B' },
              { label: 'Breached', color: '#EF4444' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}80` }} />
                <span className="text-[12px] font-medium text-ink-3">{s.label}</span>
              </div>
            ))}
          </div>
        </Panel>

        <ChartPanel
          className="lg:col-span-2"
          title="System Compliance Trend"
          caption="How the share of kept promises has moved over recent periods."
          howToRead="Each point is one period. A rising line means companies are keeping more of their commitments over time; a falling line means compliance is slipping."
          accent="#F59E0B"
          ariaLabel={`Compliance trend over ${trendData.length} periods.`}
          bodyClassName="p-5 min-h-[300px]"
          aiRegion="System Compliance Trend"
          takeaway={`Compliance is at ${metrics.systemComplianceRate}% — ${trendWord === 'flat' ? 'broadly flat' : `${trendWord} ${Math.abs(trendDelta)} point${Math.abs(trendDelta) === 1 ? '' : 's'}`} over the period shown.`}
        >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: '#71717A', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => v.replace('-', '\n')}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#71717A', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[50, 100]}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip content={<ComplianceTip />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#compGrad)"
                  dot={{ r: 4, fill: 'var(--card)', stroke: '#10B981', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: 'var(--card)', stroke: '#10B981', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* ── Donut + Country Overview + Risk Flags ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Left: Donut + Country Overview */}
        <div className="lg:col-span-2 flex flex-col gap-5">
        <ChartPanel
          title="Commitment Distribution"
          caption={`How the ${totalCommitmentsCount} active commitments split across statuses.`}
          howToRead="The ring shows the mix of commitment statuses. The big number in the middle is the overall compliance rate — the share that are met or on-track."
          accent="#3B82F6"
          aiRegion="Commitment Distribution"
          bodyClassName="p-6"
        >
          <div className="flex items-center gap-6">
            <div
              className="relative shrink-0 drop-shadow-md"
              style={{ width: 140, height: 140 }}
            >
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={complianceDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    cornerRadius={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {complianceDist.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[24px] font-bold tabular-nums text-foreground tracking-tight leading-none mb-1">
                  {metrics.systemComplianceRate}%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-4">
                  Compliant
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {complianceDist.map(d => (
                <div key={d.name} className="flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-[3px] shrink-0" style={{ background: d.color, boxShadow: `0 0 10px ${d.color}80` }} />
                    <span className="text-[13px] font-medium text-ink-2 group-hover:text-foreground transition-colors">{d.name}</span>
                  </div>
                  <span className="text-[13px] font-bold tabular-nums text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartPanel>

        {/* Country overview */}
        <Panel>
          <PanelHeader
            title="Country Overview"
            accent="#8B5CF6"
            howToRead="A quick compliance read per country: the percentage of commitments kept, plus how many agreements, operators, and critical alerts each one has."
          />
          <div className="divide-y divide-line-soft">
              {countrySummaries.map(cs => (
                <div key={cs.countryId} className="px-6 py-4 hover:bg-foreground/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-bold text-foreground tracking-wide">{cs.countryName}</span>
                    <span
                      className="text-[15px] font-bold tabular-nums"
                      style={{ color: cs.complianceRate >= 70 ? '#10B981' : '#F59E0B' }}
                    >
                      {cs.complianceRate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] font-medium mb-3 text-ink-4">
                    <span>{cs.activeAgreements} agreements</span>
                    <span className="w-1 h-1 rounded-full bg-ink-4 opacity-50" />
                    <span>{cs.totalOperators} operators</span>
                    {cs.openCriticalFlags > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-ink-4 opacity-50" />
                        <span className="font-bold px-2 py-0.5 rounded-lg text-destructive bg-destructive/10 border border-destructive/20">
                          {cs.openCriticalFlags} critical
                        </span>
                      </>
                    )}
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden bg-background border border-line-soft shadow-inner"
                    role="progressbar"
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700 shadow-glow"
                      style={{
                        width: `${cs.complianceRate}%`,
                        background: cs.complianceRate >= 70 ? 'linear-gradient(90deg, #059669, #34d399)' : 'linear-gradient(90deg, #d97706, #fbbf24)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
        </Panel>
        </div>

        {/* Right: Priority Risk Flags */}
        <Panel className="lg:col-span-3">
          <PanelHeader
            title="Priority Risk Flags"
            subtitle="Sorted by severity — click to investigate"
            accent="#EF4444"
            howToRead="The most serious open alerts first. Each row names the company and the issue; click one to see the rule and evidence behind it."
            actions={
              <button
                onClick={() => navigate('/risk')}
                className="group flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-1.5 rounded-xl text-foreground bg-foreground/5 border border-foreground/10 transition-all hover:bg-foreground/10 hover:border-foreground/20"
              >
                View all <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            }
          />
          <div className="divide-y divide-line-soft max-h-[500px] overflow-y-auto slim-scrollbar">
            {topFlags.length === 0 && (
              <div role="status" className="px-6 py-12 text-center text-[13px] text-ink-4 font-medium">
                No open flags
              </div>
            )}
            {topFlags.map((flag, i) => (
              <RiskFlagRow
                key={flag.id}
                flag={flag}
                index={i}
                onClick={() => navigate(`/risk/${flag.id}`)}
              />
            ))}
          </div>
        </Panel>
      </div>

      {/* ── Upcoming Deadlines + Activity Feed ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Upcoming deadlines */}
        <Panel className="lg:col-span-3">
          <PanelHeader
            title="Active Commitment Tracking"
            subtitle="Breached & at-risk first · Click to view scorecard"
            accent="#F59E0B"
            howToRead="Promises with a deadline, most urgent first. The coloured pill shows days remaining — a red “+N” means it is already overdue."
            actions={<Calendar size={16} className="text-ink-4" />}
          />
          <div className="divide-y divide-line-soft">
            {deadlines.length === 0 ? (
              <div role="status" className="px-6 py-10 text-center text-[13px] text-ink-4 font-medium">
                No active commitments
              </div>
            ) : (
              deadlines.map((d) => {
                const isOverdue = d.daysLeft < 0;
                const pillColor  = d.status === 'breached' ? '#EF4444' : d.status === 'at-risk' ? '#F59E0B' : '#3B82F6';
                const pillBg     = d.status === 'breached' ? 'rgba(239, 68, 68, 0.1)' : d.status === 'at-risk' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)';
                const pillBorder = d.status === 'breached' ? 'rgba(239, 68, 68, 0.2)' : d.status === 'at-risk' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)';
                return (
                <div key={d.id} className="px-6 py-4 flex items-center gap-5 hover:bg-foreground/[0.02] transition-colors cursor-pointer card-hover">
                  {/* Days pill */}
                  <div
                    className="shrink-0 w-16 text-center rounded-2xl py-2 shadow-sm"
                    style={{ background: pillBg, border: `1px solid ${pillBorder}` }}
                  >
                    <div
                      className="text-[16px] font-black tabular-nums leading-none tracking-tight"
                      style={{ color: pillColor }}
                    >
                      {isOverdue ? `+${Math.abs(d.daysLeft)}` : d.daysLeft}
                    </div>
                    <div
                      className="text-[9px] uppercase tracking-[0.1em] font-bold mt-1"
                      style={{ color: pillColor }}
                    >
                      {isOverdue ? 'overdue' : 'days'}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold leading-snug truncate text-foreground" title={d.description}>
                      {d.description}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[12px] font-medium text-ink-4 min-w-0">
                      <span className="truncate min-w-0">{d.operatorName}</span>
                      <span className="shrink-0 ml-auto flex items-center gap-2">
                        <span className="capitalize">{d.type.replace('-', ' ')}</span>
                        <span className="w-1 h-1 rounded-full bg-ink-4 opacity-50" />
                        <span className="whitespace-nowrap tabular-nums text-ink-3">{new Date(d.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 w-28 flex justify-end">
                    <StatusBadge type="compliance" value={d.status} />
                  </div>
                </div>
                );
              })
            )}
          </div>
          <div className="px-6 py-3.5 flex items-center border-t border-line-soft bg-surface">
            <button
              onClick={() => navigate('/performance')}
              className="group flex items-center gap-1.5 text-[12px] font-bold text-primary hover:text-emerald-400 transition-colors"
            >
              View all commitments
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </Panel>

        {/* Activity Feed */}
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Recent Activity"
            subtitle="Latest system events"
            howToRead="A live feed of the latest changes and alerts across the platform, newest at the top."
            actions={<Activity size={16} className="text-ink-4" />}
          />
          <ol className="divide-y divide-line-soft flex-1">
            {activity.map((ev, i) => {
              const tint =
                ev.type === 'alert'  ? { bg: 'rgba(239, 68, 68, 0.1)',  bd: 'rgba(239, 68, 68, 0.2)',  fg: '#EF4444' } :
                ev.type === 'update' ? { bg: 'rgba(245, 158, 11, 0.1)', bd: 'rgba(245, 158, 11, 0.2)', fg: '#F59E0B' } :
                                       { bg: 'rgba(16, 185, 129, 0.1)', bd: 'rgba(16, 185, 129, 0.2)', fg: '#10B981' };
              return (
                <li key={ev.id} className="px-6 py-4 fade-in-up hover:bg-foreground/[0.02] transition-colors" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-start gap-4">
                    <div
                      className="shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ background: tint.bg, border: `1px solid ${tint.bd}`, color: tint.fg }}
                      aria-hidden
                    >
                      <ev.Icon size={16} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-snug text-foreground">{ev.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.1em]"
                          style={{ color: tint.fg }}
                        >
                          {ACTIVITY_TYPE_LABEL[ev.type]}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-ink-4 opacity-50" aria-hidden />
                        <Clock size={10} className="text-ink-4" aria-hidden />
                        <time className="text-[11px] font-mono font-medium tabular-nums text-ink-4">{ev.time}</time>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="px-6 py-3 border-t border-line-soft bg-surface">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-4">
              Activity derived from live compliance data
            </span>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function RiskFlagRow({ flag, index, onClick }: { flag: RiskFlag; index: number; onClick: () => void }) {
  const operator  = getOperatorById(flag.operatorId);
  const agreement = getAgreementById(flag.agreementId);

  return (
    <button
      onClick={onClick}
      aria-label={`Investigate ${flag.severity} risk flag for ${operator?.name ?? 'operator'}: ${flag.category}`}
      className="w-full text-left px-6 py-4 flex items-start gap-4 hover:bg-foreground/[0.02] transition-all duration-300 group"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="shrink-0 mt-1">
        <StatusBadge type="severity" value={flag.severity} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium leading-relaxed line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {flag.description}
        </div>
        <div className="flex items-center gap-2.5 mt-2 text-[11px] font-medium text-ink-4">
          <span>{operator?.name}</span>
          <span className="w-1 h-1 rounded-full bg-ink-4 opacity-50" aria-hidden />
          <span>{agreement?.countryId}</span>
          <span className="w-1 h-1 rounded-full bg-ink-4 opacity-50" aria-hidden />
          <span>{flag.category}</span>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 text-primary">
        <span className="text-[11px] font-bold">Investigate</span>
        <ArrowUpRight size={13} strokeWidth={2.5} />
      </div>
    </button>
  );
}
