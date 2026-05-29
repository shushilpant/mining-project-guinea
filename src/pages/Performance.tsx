import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDataStore } from '@/store/dataStore';
import { useRole } from '@/hooks/useRole';
import { EditModal } from '@/components/shared/EditModal';
import { StatusDropdown } from '@/components/shared/StatusDropdown';
import { mutationService } from '@/services/mutationService';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  AreaChart, Area,
} from 'recharts';
import {
  getAllOperatorScorecards, getOperatorScorecard, getOperatorById,
  getCommitmentsForOperator, getPerformanceRecords, getAgreementsByOperator,
  getOperators, getCommitmentsForCountry, getAgreements,
} from '@/services/dataService';
import { useCountry } from '@/context/CountryContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MetricCard } from '@/components/shared/MetricCard';
import { ArrowLeft, Search, Pencil } from 'lucide-react';
import type { CommitmentType, ComplianceStatus } from '@/data/types';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<CommitmentType, string> = {
  'production': 'Production',
  'infrastructure': 'Infrastructure',
  'local-employment': 'Local Employment',
  'environmental': 'Environmental',
  'community-development': 'Community Dev.',
  'financial': 'Financial',
};

const COUNTRY_NAMES: Record<string, string> = { GIN: 'Guinea', GHA: 'Ghana', CIV: "Côte d'Ivoire" };

// Gov palette for radar/bars
const GOV_RADAR_STROKE = '#006b3f'; // brand-600 — Ghana flag green
const GOV_RADAR_FILL   = '#006b3f';

// ─── Scorecards list ─────────────────────────────────────────

export function PerformancePage() {
  const { selectedCountry } = useCountry();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const dataVersion = useDataStore(state => state.version);
  const { isAdmin } = useRole();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ id: string; riskScore: number; complianceStatus: string } | null>(null);

  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;
  const scorecards = useMemo(() => getAllOperatorScorecards(countryId), [countryId, dataVersion]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return scorecards.filter(s => !q || s.operatorName.toLowerCase().includes(q));
  }, [scorecards, search]);

  const commitments = useMemo(() => {
    void getAgreements;
    if (countryId) return getCommitmentsForCountry(countryId);
    return (['GIN', 'GHA', 'CIV'] as const).flatMap(c => getCommitmentsForCountry(c));
  }, [countryId, dataVersion]);
  void commitments;

  const typeBreakdown = useMemo(() => {
    const all = countryId
      ? getCommitmentsForCountry(countryId)
      : (['GIN', 'GHA', 'CIV'] as const).flatMap(c => getCommitmentsForCountry(c));

    const types: CommitmentType[] = [
      'production', 'infrastructure', 'local-employment',
      'environmental', 'community-development', 'financial',
    ];
    return types.map(t => {
      const cmts = all.filter(c => c.type === t);
      const good = cmts.filter(c => c.status === 'met' || c.status === 'on-track').length;
      return {
        type: TYPE_LABELS[t],
        total: cmts.length,
        compliant: good,
        rate: cmts.length > 0 ? Math.round((good / cmts.length) * 100) : 100,
      };
    }).filter(t => t.total > 0);
  }, [countryId, dataVersion]);

  const avgCompliance = filtered.length > 0
    ? Math.round(filtered.reduce((s, sc) => s + sc.complianceRate, 0) / filtered.length)
    : 0;

  return (
    <div>
      <PageHeader
        title="Module 3 — Performance & Compliance Monitoring"
        subtitle="Real-time, exception-based monitoring of contractual obligations against operational data streams · ACCI §6.3"
      />

      {/* Commitment type breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {/* Progress bars */}
        <div className="bg-surface rounded-xl border border-line shadow-card p-4 lg:col-span-1">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3 text-ink-3">
            Compliance by Commitment Type
          </div>
          <div className="space-y-3">
            {typeBreakdown.map(t => (
              <div key={t.type}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-ink-3">{t.type}</span>
                  <span className={cn('font-semibold tabular-nums', t.rate >= 70 ? 'text-status-success' : 'text-status-warning')}>
                    {t.rate}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden bg-canvas"
                  role="progressbar"
                  aria-valuenow={t.rate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${t.type} compliance rate`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${t.rate}%`, background: t.rate >= 70 ? '#047857' : '#B45309' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div className="bg-surface rounded-xl border border-line shadow-card p-4 lg:col-span-2">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2 text-ink-3">
            Compliance Radar — All Commitment Types
          </div>
          <div role="img" aria-label={`Compliance radar across commitment types: ${typeBreakdown.map(t => `${t.type} ${t.rate}%`).join(', ')}.`}>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={typeBreakdown}>
              <defs>
                <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOV_RADAR_FILL} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={GOV_RADAR_FILL} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <PolarGrid stroke="#E8EDDC" />
              <PolarAngleAxis
                dataKey="type"
                tick={{ fontSize: 10, fill: '#7A9A88' }}
              />
              <Radar
                name="Compliance"
                dataKey="rate"
                stroke={GOV_RADAR_STROKE}
                strokeWidth={2}
                fill="url(#radarFill)"
              />
            </RadarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operator scorecards table */}
      <div className="bg-surface rounded-xl border border-line shadow-card overflow-hidden">
        {/* Search bar */}
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-line-soft bg-surface-2">
          <div className="flex items-center gap-2 flex-1 min-w-40 rounded-lg border border-line bg-surface px-3 py-1.5 focus-within:border-brand-600 focus-within:shadow-focus-ring transition-all">
            <Search size={13} className="text-ink-4 shrink-0" aria-hidden />
            <label htmlFor="perf-search" className="sr-only">Search operators</label>
            <input
              id="perf-search"
              type="search"
              placeholder="Search operator…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-focus-ring="custom"
              className="text-[13px] outline-none w-full bg-transparent text-ink placeholder:text-ink-4"
            />
          </div>
          <span className="text-[11px] font-mono text-ink-4" aria-live="polite">
            {filtered.length} operators · avg compliance {avgCompliance}%
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Operator compliance scorecards, sorted by compliance rate ascending. Activate View in a row to open the operator detail.
            </caption>
            <thead>
              <tr className="border-b border-line-soft bg-surface-2">
                {['Operator', 'Countries', 'Commitments', 'Met / On-Track', 'At-Risk', 'Breached', 'Compliance', 'Open Flags', ''].map(h => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-ink-3"
                  >
                    {h || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-ink-4">
                    No operators match your search.
                  </td>
                </tr>
              )}
              {filtered
                .sort((a, b) => a.complianceRate - b.complianceRate)
                .map((sc) => {
                  const op = getOperatorById(sc.operatorId)!;
                  return (
                    <tr
                      key={sc.operatorId}
                      className="cursor-pointer border-b border-line-soft transition-colors [&:nth-child(even)]:bg-surface-2 hover:bg-brand-600/[0.06]"
                      onClick={() => navigate(`/performance/${sc.operatorId}`)}
                      data-ai-entity={`operator:${sc.operatorId}`}
                      data-ai-label={sc.operatorName}
                      data-ai-sub={`${op.parentCompany} · compliance ${sc.complianceRate}% · ${sc.openFlags} open flags`}
                    >
                      <td className="px-4 py-3 font-semibold text-ink">{sc.operatorName}</td>
                      <td className="px-4 py-3 text-[12px] text-ink-3">
                        {op.countryIds.map(c => COUNTRY_NAMES[c]).join(', ')}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[13px] text-ink-3">{sc.totalCommitments}</td>
                      <td className="px-4 py-3 tabular-nums text-[13px] font-medium text-status-success">{sc.metCount + sc.onTrackCount}</td>
                      <td className="px-4 py-3 tabular-nums text-[13px] font-medium text-status-warning">{sc.atRiskCount}</td>
                      <td className="px-4 py-3 tabular-nums text-[13px] font-medium text-status-danger">{sc.breachedCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-1.5 w-16 rounded-full overflow-hidden bg-line-soft"
                            role="progressbar"
                            aria-valuenow={sc.complianceRate}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${sc.operatorName} compliance rate`}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${sc.complianceRate}%`, background: sc.complianceRate >= 70 ? '#047857' : '#B45309' }}
                            />
                          </div>
                          <span className={cn('text-[13px] font-bold tabular-nums', sc.complianceRate >= 70 ? 'text-status-success' : 'text-status-warning')}>
                            {sc.complianceRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[12px]">
                        {sc.openFlags > 0 ? (
                          <span className={cn('font-semibold', sc.criticalFlags > 0 ? 'text-status-danger' : 'text-status-warning')}>
                            {sc.openFlags} ({sc.criticalFlags} critical)
                          </span>
                        ) : (
                          <span className="text-line-strong">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/performance/${sc.operatorId}`); }}
                            aria-label={`View ${sc.operatorName} scorecard`}
                            className="text-[12px] font-semibold text-brand-600 hover:underline rounded"
                          >
                            View →
                          </button>
                          {isAdmin && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setEditForm({ id: op.id, riskScore: op.riskScore, complianceStatus: op.complianceStatus });
                                setIsEditing(true);
                              }}
                              aria-label={`Edit ${sc.operatorName}`}
                              className="flex items-center gap-1 text-[11px] rounded px-1.5 py-0.5 text-ink-4 transition-colors hover:text-brand-600 hover:bg-brand-600/[0.08]"
                            >
                              <Pencil size={10} /> Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <EditModal
        isOpen={isEditing}
        onOpenChange={open => { if (!open) { setIsEditing(false); setEditForm(null); } }}
        onSave={() => {
          if (editForm) {
            mutationService.updateOperator(editForm.id, {
              riskScore: editForm.riskScore,
              complianceStatus: editForm.complianceStatus as ComplianceStatus,
            });
          }
          setIsEditing(false);
          setEditForm(null);
        }}
        title="Edit Operator"
      >
        {editForm && (
          <div className="space-y-4">
            <div>
              <label htmlFor="op-edit-risk" className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-ink-2">
                Risk Score (0–100)
              </label>
              <input
                id="op-edit-risk"
                type="number"
                min="0"
                max="100"
                data-focus-ring="custom"
                className="w-full px-3 py-2 rounded-lg text-[13px] text-ink bg-surface border border-line outline-none transition-all focus:border-brand-600 focus:shadow-focus-ring"
                value={editForm.riskScore}
                onChange={e => setEditForm({ ...editForm, riskScore: Number(e.target.value) })}
              />
            </div>
            <div>
              <label htmlFor="op-edit-status" className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-ink-2">
                Compliance Status
              </label>
              <select
                id="op-edit-status"
                data-focus-ring="custom"
                className="w-full px-3 py-2 rounded-lg text-[13px] text-ink bg-surface border border-line outline-none transition-all focus:border-brand-600 focus:shadow-focus-ring"
                value={editForm.complianceStatus}
                onChange={e => setEditForm({ ...editForm, complianceStatus: e.target.value })}
              >
                <option value="met">Met</option>
                <option value="on-track">On Track</option>
                <option value="at-risk">At Risk</option>
                <option value="breached">Breached</option>
              </select>
            </div>
          </div>
        )}
      </EditModal>
    </div>
  );
}

// ─── Operator detail scorecard ────────────────────────────────

export function OperatorDetailPage() {
  const { operatorId } = useParams<{ operatorId: string }>();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<CommitmentType | 'all'>('all');
  const dataVersion = useDataStore(state => state.version);
  void dataVersion;

  const operator = operatorId ? getOperatorById(operatorId) : undefined;
  if (!operator) {
    return (
      <div role="status" className="bg-surface rounded-xl border border-line shadow-card p-10 text-center">
        <p className="text-[14px] font-semibold text-ink">Operator not found</p>
        <p className="text-[12px] mt-1 text-ink-3">This operator may have been removed from the registry.</p>
        <button
          onClick={() => navigate('/performance')}
          className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:underline"
        >
          <ArrowLeft size={13} /> Back to Performance
        </button>
      </div>
    );
  }

  const scorecard = getOperatorScorecard(operator.id);
  const allCommitments = getCommitmentsForOperator(operator.id);
  const agreements = getAgreementsByOperator(operator.id);
  const operators = getOperators();
  void operators;

  const filtered = selectedType === 'all'
    ? allCommitments
    : allCommitments.filter(c => c.type === selectedType);

  const types = Array.from(new Set(allCommitments.map(c => c.type))) as CommitmentType[];

  return (
    <div>
      <button
        onClick={() => navigate('/performance')}
        className="flex items-center gap-1.5 text-[13px] font-medium mb-4 text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to Performance
      </button>

      {/* Operator header */}
      <div
        className="bg-surface rounded-xl border border-line shadow-card p-5 mb-4"
        data-ai-entity={`operator:${operator.id}`}
        data-ai-label={operator.name}
        data-ai-sub={`${operator.parentCompany} · ${operator.countryOfRegistration}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[17px] font-bold text-ink">{operator.name}</h1>
            <div className="text-[13px] mt-0.5 text-ink-3">
              {operator.parentCompany} · {operator.countryOfRegistration}
            </div>
            {operator.ownershipChanged && (
              <div className="mt-2 text-[12px] px-2.5 py-1.5 rounded-md text-amber-800 bg-amber-50 border border-amber-200">
                Ownership change flagged: {operator.ownershipChangedNote}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-[28px] font-bold tabular-nums text-ink">{scorecard.complianceRate}%</div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-ink-4">Compliance Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-line-soft">
          <MetricCard label="Total Commitments" value={scorecard.totalCommitments} accent="default" />
          <MetricCard label="Met / On-Track" value={scorecard.metCount + scorecard.onTrackCount} accent="green" />
          <MetricCard label="At Risk" value={scorecard.atRiskCount} accent="amber" />
          <MetricCard label="Breached" value={scorecard.breachedCount} accent={scorecard.breachedCount > 0 ? 'red' : 'default'} />
        </div>

        {/* Beneficial ownership */}
        <div className="mt-4 pt-4 border-t border-line-soft">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2 text-ink-3">
            Beneficial Ownership Structure
          </div>
          <div className="flex flex-wrap gap-2">
            {operator.ultimateBeneficialOwners.map((ubo, i) => (
              <div
                key={i}
                className={cn(
                  'text-[12px] px-2.5 py-1 rounded-md border',
                  ubo.isOpaque ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-surface-2 border-line text-ink-3',
                )}
              >
                {ubo.name} ({ubo.jurisdiction}) — {ubo.ownershipPercent}%
                {ubo.isOpaque && ' ⚠ Opaque'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active agreements */}
      <div className="bg-surface rounded-xl border border-line shadow-card mb-4 overflow-hidden">
        <div className="px-5 py-3 border-b border-line-soft bg-surface-2">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Active Agreements</h2>
        </div>
        <div className="divide-y divide-line-soft">
          {agreements.map(a => (
            <button
              key={a.id}
              onClick={() => navigate(`/agreements/${a.id}`)}
              className="w-full text-left px-5 py-3 flex items-center justify-between gap-2 bg-surface hover:bg-surface-2 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-[13px] text-ink-2">{a.description}</div>
                <div className="text-[11px] mt-0.5 text-ink-4">
                  {a.concesssionArea} · {a.royaltyRate}% royalty
                </div>
              </div>
              <StatusBadge type="agreement" value={a.status} size="sm" />
            </button>
          ))}
        </div>
      </div>

      {/* Commitments with type filter */}
      <div className="bg-surface rounded-xl border border-line shadow-card overflow-hidden">
        <div className="px-5 py-3 flex items-center gap-3 flex-wrap border-b border-line-soft bg-surface-2">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Commitments</h2>
          <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Filter commitments by type">
            <button
              onClick={() => setSelectedType('all')}
              aria-pressed={selectedType === 'all'}
              className={cn(
                'text-[11px] px-2.5 py-0.5 rounded-md font-medium transition-colors',
                selectedType === 'all' ? 'bg-brand-600 text-white' : 'bg-surface-2 text-ink-3 hover:bg-line',
              )}
            >
              All
            </button>
            {types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                aria-pressed={selectedType === t}
                className={cn(
                  'text-[11px] px-2.5 py-0.5 rounded-md capitalize font-medium transition-colors',
                  selectedType === t ? 'bg-brand-600 text-white' : 'bg-surface-2 text-ink-3 hover:bg-line',
                )}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-line-soft">
          {filtered.map(cmt => {
            const records = getPerformanceRecords(cmt.id);
            const latest = records[records.length - 1];
            const pct =
              latest && cmt.targetValue > 0
                ? Math.round((latest.actualValue / cmt.targetValue) * 100)
                : null;

            return (
              <div
                key={cmt.id}
                className="px-5 py-4"
                data-ai-entity={`commitment:${cmt.id}`}
                data-ai-label={cmt.id}
                data-ai-sub={`${cmt.type} · target ${cmt.targetValue} ${cmt.targetUnit}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-ink-2">{cmt.description}</div>
                    <div className="text-[11px] mt-0.5 text-ink-4">
                      Target: {cmt.targetValue.toLocaleString()} {cmt.targetUnit}
                      {latest &&
                        ` · Latest: ${latest.actualValue.toLocaleString()} ${latest.actualUnit} (${latest.reportingPeriod})`}
                    </div>
                  </div>
                  <StatusDropdown
                    type="compliance"
                    value={cmt.status}
                    size="sm"
                    onChange={val => mutationService.updateCommitmentStatus(cmt.id, val as ComplianceStatus)}
                  />
                </div>

                {/* Trend sparkline */}
                {records.length >= 3 && (
                  <div className="mt-2 flex items-center gap-3">
                    {pct !== null && (
                      <span className={cn('text-[12px] font-semibold tabular-nums', pct >= 75 ? 'text-status-success' : 'text-status-danger')}>
                        {pct}% of target
                      </span>
                    )}
                    <div className="flex-1 h-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={records.map(r => ({
                            period: r.reportingPeriod.replace('-', '\n'),
                            value: r.actualValue,
                          }))}
                        >
                          <defs>
                            <linearGradient id={`sparkGrad-${cmt.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#006b3f" stopOpacity={0.2} />
                              <stop offset="100%" stopColor="#006b3f" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#006b3f"
                            strokeWidth={1.5}
                            fill={`url(#sparkGrad-${cmt.id})`}
                            dot={false}
                          />
                          <XAxis dataKey="period" hide />
                          <YAxis hide />
                          <Tooltip
                            formatter={(v: unknown) => [Number(v).toLocaleString(), 'Actual']}
                            contentStyle={{
                              fontSize: 11,
                              border: '1px solid #D2DACC',
                              borderRadius: 4,
                              background: 'white',
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
