import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getRiskFlags, getRiskFlagById, getOperatorById, getAgreementById, getCommitmentById,
} from '@/services/dataService';
import { useCountry } from '@/context/CountryContext';
import { useDataStore } from '@/store/dataStore';
import { useSettingsStore } from '@/store/settingsStore';
import { mutationService } from '@/services/mutationService';
import { useRole } from '@/hooks/useRole';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatusDropdown } from '@/components/shared/StatusDropdown';
import { MetricCard } from '@/components/shared/MetricCard';
import { RulePill } from '@/components/shared/RulePill';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { RiskSeverity, RiskFlagStatus } from '@/data/types';

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const SEVERITY_DOT: Record<string, string> = {
  critical: '#DC2626',
  high:     '#D97706',
  medium:   '#7A9A88',
  low:      '#99AB94',
};

// ─── Risk register list ──────────────────────────────────────

export function RiskPage() {
  const { selectedCountry } = useCountry();
  const navigate = useNavigate();

  const { isAdmin } = useRole();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<RiskSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RiskFlagStatus | 'active'>('active');
  const [showThresholds, setShowThresholds] = useState(false);
  const dataVersion = useDataStore((state) => state.version);
  const { riskThresholds: thresholds, updateThresholds, resetThresholds } = useSettingsStore();

  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;
  const allFlags = useMemo(() => getRiskFlags(countryId, thresholds), [countryId, thresholds, dataVersion]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allFlags
      .filter(f => {
        const matchStatus = statusFilter === 'active' ? f.status !== 'resolved' : f.status === statusFilter;
        const matchSeverity = severityFilter === 'all' || f.severity === severityFilter;
        const op = getOperatorById(f.operatorId);
        const matchSearch =
          !q ||
          f.description.toLowerCase().includes(q) ||
          op?.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q);
        return matchStatus && matchSeverity && matchSearch;
      })
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [allFlags, statusFilter, severityFilter, search]);

  const openFlags = allFlags.filter(f => f.status !== 'resolved');
  const critical = openFlags.filter(f => f.severity === 'critical').length;
  const high = openFlags.filter(f => f.severity === 'high').length;
  const medium = openFlags.filter(f => f.severity === 'medium').length;

  return (
    <div>
      <PageHeader
        title="Breach & Risk Detection"
        subtitle="Rule-based early-warning system — every flag traces to a rule and evidence"
        actions={
          <button
            onClick={() => setShowThresholds(v => !v)}
            aria-pressed={showThresholds}
            className={
              'flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors ' +
              (showThresholds
                ? 'bg-brand-600 text-white border-transparent'
                : 'bg-surface text-ink-3 border-line hover:bg-surface-2 hover:text-ink')
            }
          >
            <SlidersHorizontal size={13} />
            Tune thresholds
          </button>
        }
      />

      {/* Configurable thresholds */}
      {showThresholds && (
        <div
          className="rounded mb-4 p-4"
          style={{ background: 'white', border: '1px solid #D2DACC', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div
            className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: '#4A6B58' }}
          >
            Risk Detection Thresholds
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ThresholdSlider
              label="Production shortfall %"
              description="Flag if production falls below this % of target"
              value={thresholds.productionShortfallPercent}
              min={50} max={95}
              onChange={v => updateThresholds({ productionShortfallPercent: v })}
            />
            <ThresholdSlider
              label="Consecutive periods"
              description="Shortfall must persist for N periods before flagging"
              value={thresholds.productionShortfallPeriods}
              min={1} max={6}
              onChange={v => updateThresholds({ productionShortfallPeriods: v })}
            />
            <ThresholdSlider
              label="Expiry warning (days)"
              description="Flag agreements expiring within N days"
              value={thresholds.agreementExpiryWarningDays}
              min={30} max={365}
              onChange={v => updateThresholds({ agreementExpiryWarningDays: v })}
            />
            <ThresholdSlider
              label="Performance drop %"
              description="Sudden drop threshold to trigger anomaly flag"
              value={thresholds.performanceDropPercent}
              min={10} max={50}
              onChange={v => updateThresholds({ performanceDropPercent: v })}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => resetThresholds()}
              className="text-[11px] hover:underline"
              style={{ color: '#7A9A88' }}
            >
              Reset to defaults
            </button>
            {isAdmin && (
              <span
                className="text-[11px] px-2.5 py-1 rounded border font-medium"
                style={{ color: '#016940', background: '#F0F8F4', borderColor: '#B5E0D0' }}
              >
                Changes applied system-wide
              </span>
            )}
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <MetricCard label="Critical" value={critical} accent="red" />
        <MetricCard label="High Severity" value={high} accent="amber" />
        <MetricCard label="Medium Severity" value={medium} accent="amber" />
        <MetricCard label="Total Open" value={openFlags.length} accent="default" />
      </div>

      {/* Flag list */}
      <div
        className="bg-white rounded"
        style={{ border: '1px solid #D2DACC', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {/* Filter bar */}
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-line-soft bg-surface-2">
          <div className="flex items-center gap-2 flex-1 min-w-40 rounded-lg border border-line bg-surface px-3 py-1.5 focus-within:border-brand-600 focus-within:shadow-focus-ring transition-all">
            <Search size={13} className="text-ink-4 shrink-0" aria-hidden />
            <label htmlFor="risk-search" className="sr-only">Search risk flags</label>
            <input
              id="risk-search"
              type="search"
              placeholder="Search by flag description, operator, or category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-focus-ring="custom"
              className="text-[13px] outline-none w-full bg-transparent text-ink placeholder:text-ink-4"
            />
          </div>
          <label htmlFor="risk-sev" className="sr-only">Filter by severity</label>
          <select
            id="risk-sev"
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value as RiskSeverity | 'all')}
            className="text-[12px] rounded-lg px-2.5 py-1.5 border border-line bg-surface text-ink-3 outline-none focus:border-brand-600 focus:shadow-focus-ring transition-all"
            data-focus-ring="custom"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <label htmlFor="risk-status" className="sr-only">Filter by status</label>
          <select
            id="risk-status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as RiskFlagStatus | 'active')}
            className="text-[12px] rounded-lg px-2.5 py-1.5 border border-line bg-surface text-ink-3 outline-none focus:border-brand-600 focus:shadow-focus-ring transition-all"
            data-focus-ring="custom"
          >
            <option value="active">Open + Acknowledged</option>
            <option value="open">Open only</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
          <span className="text-[11px] font-mono text-ink-4" aria-live="polite">
            {filtered.length} flags
          </span>
        </div>

        {/* Flag rows */}
        <div className="divide-y divide-line-soft">
          {filtered.length === 0 && (
            <div role="status" className="px-4 py-10 text-center text-[13px] text-ink-4">
              No flags match current filters.
            </div>
          )}
          {filtered.map(flag => {
            const op = getOperatorById(flag.operatorId);
            const ag = getAgreementById(flag.agreementId);
            return (
              <div key={flag.id} className="flex items-start gap-3 px-4 py-4 bg-surface hover:bg-surface-2 transition-colors">
                {/* Severity dot */}
                <span
                  className="shrink-0 w-2 h-2 rounded-full mt-1.5"
                  style={{ background: SEVERITY_DOT[flag.severity] }}
                  aria-hidden
                />
                <div className="shrink-0 mt-0.5">
                  <StatusBadge type="severity" value={flag.severity} size="sm" />
                </div>
                {/* Clickable content */}
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left rounded-md focus-visible:shadow-focus-ring"
                  onClick={() => navigate(`/risk/${flag.id}`)}
                  aria-label={`View detail for ${flag.severity} flag: ${flag.description}`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-ink-3">{flag.category}</span>
                  </div>
                  <div className="text-[13px] leading-snug text-ink">{flag.description}</div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] flex-wrap text-ink-4">
                    <span>{op?.name}</span>
                    <span aria-hidden>·</span>
                    <span>{ag?.concesssionArea}</span>
                    <span aria-hidden>·</span>
                    <span>Flagged {formatDate(flag.triggeredDate)}</span>
                  </div>
                </button>
                {/* Status dropdown */}
                <div className="shrink-0 mt-0.5">
                  <StatusDropdown
                    type="risk-flag"
                    value={flag.status}
                    size="sm"
                    onChange={val => mutationService.updateRiskFlagStatus(flag.id, val as RiskFlagStatus)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Flag detail view ────────────────────────────────────────

export function RiskFlagDetailPage() {
  const { flagId } = useParams<{ flagId: string }>();
  const navigate = useNavigate();
  const dataVersion = useDataStore((state) => state.version);

  const flag = useMemo(() => (flagId ? getRiskFlagById(flagId) : undefined), [flagId, dataVersion]);
  if (!flag) {
    return (
      <div role="status" className="bg-surface rounded-xl border border-line shadow-card p-10 text-center">
        <p className="text-[14px] font-semibold text-ink">Flag not found</p>
        <p className="text-[12px] mt-1 text-ink-3">This risk flag may have been resolved or removed.</p>
        <button
          onClick={() => navigate('/risk')}
          className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:underline"
        >
          <ArrowLeft size={13} /> Back to Risk Register
        </button>
      </div>
    );
  }

  const operator = getOperatorById(flag.operatorId);
  const agreement = getAgreementById(flag.agreementId);
  const commitment = flag.commitmentId ? getCommitmentById(flag.commitmentId) : undefined;

  return (
    <div>
      <button
        onClick={() => navigate('/risk')}
        className="flex items-center gap-1.5 text-[13px] font-medium mb-4 text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to Risk Register
      </button>

      {/* Flag header card */}
      <div
        className="bg-white rounded p-5 mb-4"
        style={{ border: '1px solid #D2DACC', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="shrink-0">
            <StatusBadge type="severity" value={flag.severity} />
          </div>
          <div>
            <div
              className="flex items-center gap-2 text-[11px] mb-0.5"
              style={{ color: '#8FA88A' }}
            >
              <span className="font-bold uppercase tracking-wide">{flag.category}</span>
              <span>·</span>
              <StatusDropdown
                type="risk-flag"
                value={flag.status}
                onChange={val => mutationService.updateRiskFlagStatus(flag.id, val as RiskFlagStatus)}
              />
            </div>
            <h1 className="text-[15px] font-semibold leading-snug" style={{ color: '#012C1D' }}>
              {flag.description}
            </h1>
          </div>
        </div>

        {/* Rule + evidence explainability box */}
        <RulePill rule={flag.ruleTriggered} evidence={flag.evidenceDescription} />

        {/* Recommended action */}
        <div
          className="mt-3 rounded p-3 text-[13px]"
          style={{ background: '#F0F8F4', border: '1px solid #B5E0D0' }}
        >
          <span className="font-semibold" style={{ color: '#012C1D' }}>Recommended action: </span>
          <span style={{ color: '#2D5240' }}>{flag.recommendedAction}</span>
        </div>
      </div>

      {/* Linked records */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {operator && (
          <div
            className="bg-white rounded p-4"
            style={{ border: '1px solid #D2DACC', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: '#8FA88A' }}
            >
              Operator
            </div>
            <div className="text-[13px] font-semibold mb-1" style={{ color: '#012C1D' }}>
              {operator.name}
            </div>
            <div className="text-[12px] mb-3" style={{ color: '#7A9A88' }}>
              {operator.parentCompany} · {operator.countryOfRegistration}
            </div>
            <button
              onClick={() => navigate(`/performance/${operator.id}`)}
              className="text-[12px] font-semibold hover:underline"
              style={{ color: '#016940' }}
            >
              View operator scorecard →
            </button>
          </div>
        )}

        {agreement && (
          <div
            className="bg-white rounded p-4"
            style={{ border: '1px solid #D2DACC', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: '#8FA88A' }}
            >
              Agreement
            </div>
            <div className="text-[13px] font-semibold mb-1" style={{ color: '#012C1D' }}>
              {agreement.id}
            </div>
            <div className="text-[12px] mb-1" style={{ color: '#7A9A88' }}>
              {agreement.concesssionArea}
            </div>
            <div className="text-[12px] mb-3" style={{ color: '#7A9A88' }}>
              {agreement.royaltyRate}% royalty · {agreement.commodity}
            </div>
            <button
              onClick={() => navigate(`/agreements/${agreement.id}`)}
              className="text-[12px] font-semibold hover:underline"
              style={{ color: '#016940' }}
            >
              View agreement detail →
            </button>
          </div>
        )}

        {commitment && (
          <div
            className="bg-white rounded p-4"
            style={{ border: '1px solid #D2DACC', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: '#8FA88A' }}
            >
              Commitment
            </div>
            <div className="text-[13px] font-medium mb-2 leading-snug" style={{ color: '#012C1D' }}>
              {commitment.description}
            </div>
            <div className="text-[12px] mb-1" style={{ color: '#7A9A88' }}>
              Target: {commitment.targetValue.toLocaleString()} {commitment.targetUnit}
            </div>
            <div className="mt-2">
              <StatusBadge type="compliance" value={commitment.status} size="sm" />
            </div>
          </div>
        )}
      </div>

      <div
        className="mt-4 text-[11px] rounded px-4 py-3"
        style={{ background: '#F5F8F2', border: '1px solid #D2DACC', color: '#7A9A88' }}
      >
        Flag ID: <span className="font-mono">{flag.id}</span> · Triggered:{' '}
        {formatDate(flag.triggeredDate)} · Generated by the automated risk detection engine. The
        rule and evidence above provide the full audit basis for this determination.
      </div>
    </div>
  );
}

// ─── Threshold slider ─────────────────────────────────────────

function ThresholdSlider({
  label,
  description,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-1">
        <span className="font-medium" style={{ color: '#2D5240' }}>{label}</span>
        <span className="font-bold tabular-nums" style={{ color: '#012C1D' }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: '#016940' }}
      />
      <div className="text-[11px] mt-0.5 leading-tight" style={{ color: '#8FA88A' }}>
        {description}
      </div>
    </div>
  );
}
