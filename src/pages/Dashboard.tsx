import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  FileText, Users, AlertTriangle, TrendingUp, Shield,
  Calendar, Activity, ChevronRight, Clock, ArrowUpRight,
} from 'lucide-react';
import { useCountry } from '@/context/CountryContext';
import { useDataStore } from '@/store/dataStore';
import {
  getSystemMetrics, getRiskFlags, getComplianceTrend,
  getAllCountrySummaries, getOperatorById, getAgreementById,
  getCommitments,
} from '@/services/dataService';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CountryMap } from '@/components/shared/CountryMap';
import { formatDate } from '@/lib/utils';
import type { RiskFlag } from '@/data/types';

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const COMPLIANCE_COLORS = {
  met:       '#059669',
  'on-track':'#2563eb',
  'at-risk': '#d97706',
  breached:  '#dc2626',
};

function buildActivityFeed(countryId?: string): { id: string; icon: string; text: string; time: string; type: 'alert' | 'update' | 'info' }[] {
  const flags = getRiskFlags(countryId)
    .filter(f => f.status !== 'resolved')
    .sort((a, b) => b.triggeredDate.localeCompare(a.triggeredDate))
    .slice(0, 3);

  const commitments = getCommitments()
    .filter(c => c.status === 'breached' || c.status === 'at-risk')
    .slice(0, 2);

  const events: { id: string; icon: string; text: string; time: string; type: 'alert' | 'update' | 'info' }[] = [];

  flags.forEach(f => {
    const op = getOperatorById(f.operatorId);
    events.push({
      id: `flag-${f.id}`,
      icon: f.severity === 'critical' ? '🚨' : '⚠️',
      text: `${f.severity === 'critical' ? 'Critical' : 'High'} flag raised — ${op?.name ?? 'Unknown'}: ${f.category}`,
      time: formatDate(f.triggeredDate),
      type: f.severity === 'critical' ? 'alert' : 'update',
    });
  });

  commitments.forEach(c => {
    events.push({
      id: `cmt-${c.id}`,
      icon: c.status === 'breached' ? '🔴' : '🟡',
      text: `Commitment ${c.status === 'breached' ? 'breached' : 'at risk'}: ${c.description.slice(0, 60)}…`,
      time: 'Recent',
      type: c.status === 'breached' ? 'alert' : 'update',
    });
  });

  events.push({
    id: 'sys-1',
    icon: '📊',
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
      className="px-3.5 py-2.5 rounded-xl shadow-xl text-xs"
      style={{
        background: 'rgba(1,31,20,0.92)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(200,153,30,0.35)',
        color: '#fff',
      }}
    >
      <div className="font-mono text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</div>
      <div className="font-bold text-[18px] tabular-nums" style={{ color: '#C8991E', letterSpacing: '-0.02em' }}>
        {payload[0].value}%
      </div>
      <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Compliance Rate</div>
    </div>
  );
};

/* ── Shared panel wrapper ─────────────────────────── */
function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-surface rounded-2xl overflow-hidden border border-line shadow-card ${className}`}>
      {children}
    </section>
  );
}

function PanelHeader({
  title, subtitle, actions, accent = '#016940'
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="px-5 py-3.5 flex items-center justify-between bg-surface-2 border-b border-line">
      <div className="flex items-center gap-2.5">
        <span className="w-0.5 h-4 rounded-full" style={{ background: accent }} aria-hidden />
        <div>
          <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">{title}</h2>
          {subtitle && <p className="text-[11px] mt-0.5 text-ink-4">{subtitle}</p>}
        </div>
      </div>
      {actions}
    </div>
  );
}

export function Dashboard() {
  const { selectedCountry } = useCountry();
  const navigate = useNavigate();
  const dataVersion = useDataStore((state) => state.version);

  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  const metrics         = useMemo(() => getSystemMetrics(countryId),         [countryId, dataVersion]);
  const trendData       = useMemo(() => getComplianceTrend(countryId),       [countryId, dataVersion]);
  const countrySummaries = useMemo(() => getAllCountrySummaries(),            [dataVersion]);
  const activity        = useMemo(() => buildActivityFeed(countryId),        [countryId, dataVersion]);
  const deadlines       = useMemo(() => buildUpcomingDeadlines(countryId),   [countryId, dataVersion]);

  const topFlags = useMemo(() =>
    getRiskFlags(countryId)
      .filter(f => f.status !== 'resolved')
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
      .slice(0, 8),
    [countryId, dataVersion]
  );

  const complianceDist = useMemo(() => {
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
  }, [countryId, dataVersion]);

  const totalCommitmentsCount = complianceDist.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-5">

      {/* ── Metric cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Active Agreements"
          value={metrics.totalActiveAgreements}
          icon={<FileText size={16} />}
          accent="blue"
          onClick={() => navigate('/agreements')}
        />
        <MetricCard
          label="Operators Monitored"
          value={metrics.totalOperators}
          icon={<Users size={16} />}
          accent="default"
          onClick={() => navigate('/performance')}
        />
        <MetricCard
          label="Compliance Rate"
          value={`${metrics.systemComplianceRate}%`}
          sub={`${metrics.totalCommitments} commitments tracked`}
          icon={<Shield size={16} />}
          accent={metrics.systemComplianceRate >= 70 ? 'green' : 'amber'}
        />
        <MetricCard
          label="Critical Flags"
          value={metrics.openCriticalFlags}
          sub={`${metrics.openHighFlags} high severity open`}
          icon={<AlertTriangle size={16} />}
          accent={metrics.openCriticalFlags > 0 ? 'red' : 'green'}
          onClick={() => navigate('/risk')}
        />
        <MetricCard
          label="Breached Commitments"
          value={metrics.breachedCommitments}
          sub={`${metrics.atRiskCommitments} at-risk`}
          icon={<TrendingUp size={16} />}
          accent={metrics.breachedCommitments > 0 ? 'amber' : 'green'}
          onClick={() => navigate('/performance')}
        />
      </div>

      {/* ── Map + Trend chart ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Panel className="lg:col-span-3">
          <PanelHeader
            title="Operator & Mine Locations"
            subtitle="Colour indicates operator compliance status"
          />
          <div className="h-72">
            <CountryMap countryId={countryId} />
          </div>
          <div
            className="px-4 py-2 flex items-center gap-4 flex-wrap"
            style={{ borderTop: '1px solid rgba(210,218,204,0.6)', background: 'rgba(245,248,242,0.8)' }}
          >
            {[
              { label: 'Met',      color: '#059669' },
              { label: 'On Track', color: '#2563eb' },
              { label: 'At Risk',  color: '#f59e0b' },
              { label: 'Breached', color: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-[11px] font-medium" style={{ color: '#5A7A6A' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelHeader
            title="System Compliance Trend"
            subtitle="% commitments on-track or met by period"
            accent="#C8991E"
          />
          <div
            className="p-4 h-72"
            role="img"
            aria-label={`Compliance trend over ${trendData.length} periods, ranging ${Math.min(...trendData.map(d => d.rate))}% to ${Math.max(...trendData.map(d => d.rate))}%.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#016940" stopOpacity={0.32} />
                    <stop offset="85%" stopColor="#016940" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBF0E6" vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 10, fill: '#8FA88A' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => v.replace('-', '\n')}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#8FA88A' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[50, 100]}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip content={<ComplianceTip />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#016940"
                  strokeWidth={2.5}
                  fill="url(#compGrad)"
                  dot={{ r: 3.5, fill: '#016940', strokeWidth: 0 }}
                  activeDot={{ r: 5.5, fill: '#fff', stroke: '#016940', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* ── Donut + Country Overview + Risk Flags ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Left: Donut + Country Overview */}
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Commitment Status Distribution"
            subtitle={`Breakdown of ${totalCommitmentsCount} active commitments`}
            accent="#C8991E"
          />
          <div className="p-5 flex items-center gap-5">
            <div
              className="relative shrink-0"
              style={{ width: 120, height: 120 }}
              role="img"
              aria-label={`Commitment status: ${complianceDist.map(d => `${d.value} ${d.name}`).join(', ')}. ${metrics.systemComplianceRate}% compliant overall.`}
            >
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={complianceDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={54}
                    paddingAngle={3}
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
                <span className="text-[19px] font-bold tabular-nums" style={{ color: '#012C1D', letterSpacing: '-0.03em' }}>
                  {metrics.systemComplianceRate}%
                </span>
                <span className="text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: '#8FA88A' }}>
                  Compliant
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {complianceDist.map(d => (
                <div key={d.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                    <span className="text-[12px]" style={{ color: '#4A6B58' }}>{d.name}</span>
                  </div>
                  <span className="text-[12px] font-bold tabular-nums" style={{ color: '#012C1D' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Country overview */}
          <div style={{ borderTop: '1px solid rgba(210,218,204,0.7)' }}>
            <PanelHeader title="Country Overview" />
            <div className="divide-y" style={{ borderColor: 'rgba(210,218,204,0.5)' }}>
              {countrySummaries.map(cs => (
                <div key={cs.countryId} className="px-5 py-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-semibold" style={{ color: '#012C1D' }}>{cs.countryName}</span>
                    <span
                      className="text-[13px] font-bold tabular-nums"
                      style={{ color: cs.complianceRate >= 70 ? '#059669' : '#D97706', letterSpacing: '-0.01em' }}
                    >
                      {cs.complianceRate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] mb-2" style={{ color: '#7A9A88' }}>
                    <span>{cs.activeAgreements} agreements</span>
                    <span>·</span>
                    <span>{cs.totalOperators} operators</span>
                    {cs.openCriticalFlags > 0 && (
                      <span
                        className="font-bold px-1.5 py-0.5 rounded-md"
                        style={{ color: '#DC2626', background: 'rgba(220,38,38,0.08)' }}
                      >
                        {cs.openCriticalFlags} critical
                      </span>
                    )}
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden bg-canvas"
                    role="progressbar"
                    aria-valuenow={cs.complianceRate}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${cs.countryName} compliance rate`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${cs.complianceRate}%`,
                        background: cs.complianceRate >= 70 ? '#047857' : '#B45309',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Right: Priority Risk Flags */}
        <Panel className="lg:col-span-3">
          <PanelHeader
            title="Priority Risk Flags"
            subtitle="Sorted by severity — click to investigate"
            accent="#DC2626"
            actions={
              <button
                onClick={() => navigate('/risk')}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg text-brand-600 bg-brand-600/[0.07] border border-brand-600/15 transition-colors hover:bg-brand-600/[0.14]"
              >
                View all <ArrowUpRight size={12} />
              </button>
            }
          />
          <div className="divide-y max-h-[420px] overflow-y-auto" style={{ borderColor: 'rgba(210,218,204,0.5)' }}>
            {topFlags.length === 0 && (
              <div role="status" className="px-5 py-10 text-center text-sm text-ink-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Upcoming deadlines */}
        <Panel className="lg:col-span-3">
          <PanelHeader
            title="Active Commitment Tracking"
            subtitle="Breached & at-risk first · Click to view scorecard"
            accent="#D97706"
            actions={<Calendar size={13} style={{ color: '#8FA88A' }} />}
          />
          <div className="divide-y" style={{ borderColor: 'rgba(210,218,204,0.5)' }}>
            {deadlines.length === 0 ? (
              <div role="status" className="px-5 py-8 text-center text-sm text-ink-4">
                No active commitments
              </div>
            ) : (
              deadlines.map((d) => {
                const isOverdue = d.daysLeft < 0;
                const pillColor  = d.status === 'breached' ? '#DC2626' : d.status === 'at-risk' ? '#D97706' : '#2563eb';
                const pillBg     = d.status === 'breached' ? '#FEF2F2' : d.status === 'at-risk' ? '#FFFBEB' : '#EFF6FF';
                const pillBorder = d.status === 'breached' ? '#FECACA' : d.status === 'at-risk' ? '#FDE68A' : '#BFDBFE';
                return (
                <div key={d.id} className="px-5 py-3.5 flex items-center gap-4">
                  {/* Days pill */}
                  <div
                    className="shrink-0 w-14 text-center rounded-xl py-1.5"
                    style={{ background: pillBg, border: `1.5px solid ${pillBorder}` }}
                  >
                    <div
                      className="text-[13px] font-bold tabular-nums leading-none"
                      style={{ color: pillColor, letterSpacing: '-0.02em' }}
                    >
                      {isOverdue ? `+${Math.abs(d.daysLeft)}` : d.daysLeft}
                    </div>
                    <div
                      className="text-[8px] uppercase tracking-[0.12em] font-bold mt-0.5"
                      style={{ color: pillColor }}
                    >
                      {isOverdue ? 'overdue' : 'days'}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-medium leading-snug" style={{ color: '#012C1D' }}>
                      {d.description.length > 64 ? d.description.slice(0, 64) + '…' : d.description}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px]" style={{ color: '#8FA88A' }}>
                      <span>{d.operatorName}</span>
                      <span>·</span>
                      <span className="capitalize">{d.type.replace('-', ' ')}</span>
                      <span>·</span>
                      <span>{new Date(d.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <StatusBadge type="compliance" value={d.status} size="sm" />
                </div>
                );
              })
            )}
          </div>
          <div
            className="px-5 py-2.5 flex items-center"
            style={{ borderTop: '1px solid rgba(210,218,204,0.6)', background: 'rgba(245,248,242,0.8)' }}
          >
            <button
              onClick={() => navigate('/performance')}
              className="group flex items-center gap-1 text-[11px] font-semibold text-brand-600"
            >
              View all commitments
              <ChevronRight size={11} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </Panel>

        {/* Activity Feed */}
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Recent Activity"
            subtitle="Latest system events"
            actions={<Activity size={13} style={{ color: '#8FA88A' }} />}
          />
          <div className="divide-y" style={{ borderColor: 'rgba(210,218,204,0.5)' }}>
            {activity.map((ev, i) => (
              <div key={ev.id} className="px-5 py-3.5" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-[12px]"
                      style={{
                        background:
                          ev.type === 'alert'  ? 'rgba(220,38,38,0.09)'  :
                          ev.type === 'update' ? 'rgba(217,119,6,0.09)'  :
                                                 'rgba(1,105,64,0.09)',
                        border:
                          ev.type === 'alert'  ? '1px solid rgba(220,38,38,0.15)'  :
                          ev.type === 'update' ? '1px solid rgba(217,119,6,0.15)'  :
                                                 '1px solid rgba(1,105,64,0.15)',
                      }}
                    >
                      {ev.icon}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] leading-snug" style={{ color: '#2D5240' }}>
                      {ev.text}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock size={9} style={{ color: '#B8C8BE' }} />
                      <span className="text-[10px] font-mono" style={{ color: '#B8C8BE' }}>{ev.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="px-5 py-2.5"
            style={{ borderTop: '1px solid rgba(210,218,204,0.6)', background: 'rgba(245,248,242,0.8)' }}
          >
            <span className="text-[10px]" style={{ color: '#B8C8BE' }}>
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
      className="w-full text-left px-5 py-3.5 pl-5 hover:pl-[22px] bg-surface hover:bg-surface-2 transition-[padding,background-color] duration-150 group"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <StatusBadge type="severity" value={flag.severity} size="sm" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] leading-snug line-clamp-2 text-ink">{flag.description}</div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-4">
            <span>{operator?.name}</span>
            <span aria-hidden>·</span>
            <span>{agreement?.countryId}</span>
            <span aria-hidden>·</span>
            <span>{flag.category}</span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-brand-600">
          <span className="text-[10px] font-semibold">View</span>
          <ArrowUpRight size={11} />
        </div>
      </div>
    </button>
  );
}
