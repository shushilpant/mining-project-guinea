// ============================================================
// Module 6 — Fiscal Scenario Modelling ("What-If")
//
// The user sets hypothetical conditions (commodity prices, the
// production basis, the royalty regime, an operator exit) and the
// page projects the resulting annual state royalty take. The
// projection is fully deterministic and updates live — no AI is
// needed for the numbers. A separate, on-demand panel asks the
// Fiscal Scenario Analyst to interpret the computed figures for a
// Minister; that brief is grounded strictly in the same numbers.
// ============================================================

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Sparkles, Loader2, RefreshCw, Square, AlertTriangle, RotateCcw, Copy, Check,
  TrendingUp, SlidersHorizontal, Info,
} from 'lucide-react';
import { useCountry } from '@/context/CountryContext';
import { useDataStore } from '@/store/dataStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { CitedText } from '@/components/shared/CitedText';
import { cn } from '@/lib/utils';
import { getAgreements, getCommodityPrices } from '@/services/dataService';
import { useAISettingsStore, isProviderReady } from '@/store/aiSettingsStore';
import { streamChat } from '@/services/aiService';
import { aiCacheGet, aiCacheSet, fingerprint } from '@/lib/aiCache';
import { useAuditStore } from '@/store/auditStore';
import { splitActions, dispatchAction, type AIAction } from '@/lib/aiActions';
import { buildScenarioContext } from '@/lib/aiContext';
import { scenarioMemoMessages } from '@/lib/aiPrompts';
import {
  COMMODITY_META,
  annualProduction,
  commoditiesInScope,
  computeProjection,
  baselineScenario,
  defaultScenario,
  topMovers,
  fmtUsd,
  fmtDelta,
  scenarioFingerprintParts,
  type ScenarioInput,
  type Commodity,
} from '@/lib/revenueModel';

const COUNTRY_SHORT: Record<string, string> = {
  GIN: 'Guinea', GHA: 'Ghana', CIV: "Côte d'Ivoire",
};

const CACHE_TASK = 'scenario-memo';
const CACHE_TTL = 1000 * 60 * 60 * 12; // 12h

export function ScenariosPage() {
  const { selectedCountry } = useCountry();
  const dataVersion = useDataStore(s => s.version);

  // Scenario state. Reset scope when the global country selector changes
  // (React "adjust state on prop change" pattern).
  const [scenario, setScenario] = useState<ScenarioInput>(() => defaultScenario(selectedCountry));
  const [activeTab, setActiveTab] = useState<'macro' | 'stress'>('macro');
  const [prevCountry, setPrevCountry] = useState(selectedCountry);
  if (prevCountry !== selectedCountry) {
    setPrevCountry(selectedCountry);
    setScenario(defaultScenario(selectedCountry));
  }

  const patch = useCallback((p: Partial<ScenarioInput>) => setScenario(s => ({ ...s, ...p })), []);
  const setPrice = useCallback((c: Commodity, v: number) =>
    setScenario(s => ({ ...s, prices: { ...s.prices, [c]: v } })), []);
  const toggleExclude = useCallback((id: string) =>
    setScenario(s => ({
      ...s,
      excludedAgreementIds: s.excludedAgreementIds.includes(id)
        ? s.excludedAgreementIds.filter(x => x !== id)
        : [...s.excludedAgreementIds, id],
    })), []);

  // Deterministic projection — recomputed live on any input change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const baseline   = useMemo(() => computeProjection(baselineScenario(selectedCountry)), [selectedCountry, dataVersion]);
  const projection = useMemo(() => computeProjection(scenario), [scenario, dataVersion]);
  const movers     = useMemo(() => topMovers(baseline, projection, 6), [baseline, projection]);

  const scopeCommodities = useMemo(() => commoditiesInScope(selectedCountry), [selectedCountry, dataVersion]);
  const scopeAgreements  = useMemo(
    () => getAgreements(selectedCountry === 'ALL' ? undefined : selectedCountry)
      .filter(a => a.status === 'active'),
    [selectedCountry, dataVersion],
  );

  const delta = projection.totalRoyaltyUsd - baseline.totalRoyaltyUsd;
  const pct = baseline.totalRoyaltyUsd > 0 ? (delta / baseline.totalRoyaltyUsd) * 100 : 0;
  const dirty = JSON.stringify(scenarioFingerprintParts(scenario))
    !== JSON.stringify(scenarioFingerprintParts(baselineScenario(selectedCountry)));

  const chartData = useMemo(() => {
    const cids = selectedCountry === 'ALL' ? ['GIN', 'GHA', 'CIV'] : [selectedCountry];
    return cids
      .filter(cid => (baseline.byCountry[cid] ?? 0) > 0 || (projection.byCountry[cid] ?? 0) > 0)
      .map(cid => ({
        country: COUNTRY_SHORT[cid] ?? cid,
        Baseline: Math.round(baseline.byCountry[cid] ?? 0),
        Scenario: Math.round(projection.byCountry[cid] ?? 0),
      }));
  }, [baseline, projection, selectedCountry]);

  const commodityRows = useMemo(() => {
    const keys = Object.keys({ ...baseline.byCommodity, ...projection.byCommodity }) as Commodity[];
    return keys
      .map(c => ({
        commodity: c,
        baseline: baseline.byCommodity[c] ?? 0,
        scenario: projection.byCommodity[c] ?? 0,
      }))
      .sort((a, b) => b.scenario - a.scenario);
  }, [baseline, projection]);

  const maxCommodity = Math.max(1, ...commodityRows.map(r => Math.max(r.baseline, r.scenario)));

  return (
    <div data-ai-region="fiscal-scenario-modelling">
      <PageHeader
        title="Module 6 — Fiscal Scenario Modelling"
        subtitle="Project state royalty take under hypothetical price, production and royalty-regime conditions · grounded in live agreement data · ACCI §6.6"
        actions={
          <button
            onClick={() => setScenario(defaultScenario(selectedCountry))}
            disabled={!dirty}
            className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border border-line bg-surface text-ink-3 transition-colors hover:bg-surface-2 hover:border-line-strong hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={13} />
            Reset to baseline
          </button>
        }
      />
      
      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="flex border-b border-line mb-5">
        <button
          onClick={() => setActiveTab('macro')}
          className={'px-5 py-3 text-[13px] font-bold uppercase tracking-widest border-b-2 transition-colors ' + (activeTab === 'macro' ? 'border-primary text-primary' : 'border-transparent text-ink-4 hover:text-ink-2')}
        >
          Macro Scenario Modeller
        </button>
        <button
          onClick={() => setActiveTab('stress')}
          className={'px-5 py-3 text-[13px] font-bold uppercase tracking-widest border-b-2 transition-colors ' + (activeTab === 'stress' ? 'border-amber-600 text-amber-600' : 'border-transparent text-ink-4 hover:text-ink-2')}
        >
          Commodity Stress Testing
        </button>
      </div>

      {activeTab === 'macro' && (
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start fade-in">
        {/* ── Inputs column ─────────────────────────────── */}
        <div className="bg-surface rounded-xl border border-line shadow-card lg:sticky lg:top-4">
          <div className="px-4 py-3 border-b border-line-soft bg-surface-2 flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-brand-600" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Hypothetical conditions</h2>
          </div>

          <div className="p-4 space-y-5">
            {/* Production basis */}
            <Field label="Production basis" hint="Run-rate uses the last 4 reported quarters; capacity uses committed annual targets (brings ramping projects like Simandou into scope).">
              <Segmented
                value={scenario.basis}
                onChange={(v) => patch({ basis: v as ScenarioInput['basis'] })}
                options={[
                  { value: 'current', label: 'Current run-rate' },
                  { value: 'capacity', label: 'Committed capacity' },
                ]}
              />
            </Field>

            {/* Royalty regime */}
            <Field label="Royalty regime" hint="Contracted honours each agreement's signed rate (and stability clauses). Reform applies the 2025 statutory sliding scales to gold & lithium.">
              <Segmented
                value={scenario.regime}
                onChange={(v) => patch({ regime: v as ScenarioInput['regime'] })}
                options={[
                  { value: 'contractual', label: 'As contracted' },
                  { value: 'reform', label: '2025 reform' },
                ]}
              />
            </Field>

            {/* Commodity prices */}
            <Field label="Commodity prices" hint="Defaults are anchored to figures cited in the dataset and are assumptions, not live quotes.">
              <div className="space-y-3.5">
                {scopeCommodities
                  .filter(c => COMMODITY_META[c].defaultPrice > 0)
                  .map(c => (
                    <PriceSlider
                      key={c}
                      commodity={c}
                      value={scenario.prices[c] ?? COMMODITY_META[c].defaultPrice}
                      onChange={(v) => setPrice(c, v)}
                    />
                  ))}
              </div>
            </Field>

            {/* Production adjustment */}
            <Field label={`Production adjustment · ${scenario.productionAdjustmentPct > 0 ? '+' : ''}${scenario.productionAdjustmentPct}%`} hint="A uniform shock applied to every operator's output — e.g. a supply disruption or expansion.">
              <input
                type="range" min={-50} max={50} step={5}
                value={scenario.productionAdjustmentPct}
                onChange={(e) => patch({ productionAdjustmentPct: Number(e.target.value) })}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-[9px] font-mono text-ink-4 mt-0.5"><span>−50%</span><span>0</span><span>+50%</span></div>
            </Field>

            {/* Royalty uplift */}
            <Field label={`Manual royalty uplift · ${scenario.royaltyUpliftPp > 0 ? '+' : ''}${scenario.royaltyUpliftPp} pp`} hint="Add or subtract percentage points from every effective rate — pressure-test a flat renegotiation.">
              <input
                type="range" min={-3} max={6} step={0.5}
                value={scenario.royaltyUpliftPp}
                onChange={(e) => patch({ royaltyUpliftPp: Number(e.target.value) })}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-[9px] font-mono text-ink-4 mt-0.5"><span>−3pp</span><span>0</span><span>+6pp</span></div>
            </Field>

            {/* Exclusions / operator exit */}
            <Field label="Model an exit" hint="Exclude an agreement to model a revocation, lapsed lease, or sale collapse — the projection shows the royalty forgone.">
              <div className="rounded-lg border border-line max-h-52 overflow-y-auto divide-y divide-line-soft">
                {scopeAgreements
                  .slice()
                  .sort((a, b) => (COMMODITY_META[a.commodity].defaultPrice > 0 ? 0 : 1) - (COMMODITY_META[b.commodity].defaultPrice > 0 ? 0 : 1))
                  .map(a => {
                    const on = scenario.excludedAgreementIds.includes(a.id);
                    const row = baseline.rows.find(r => r.agreementId === a.id);
                    return (
                      <label
                        key={a.id}
                        className={cn(
                          'flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer text-[11px] transition-colors',
                          on ? 'bg-red-50' : 'hover:bg-surface-2',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleExclude(a.id)}
                          className="accent-status-danger shrink-0"
                        />
                        <span className="font-mono text-ink-4 shrink-0">{a.id}</span>
                        <span className="text-ink-2 truncate flex-1">{row?.operatorName ?? a.operatorId}</span>
                        <span className="font-mono text-ink-3 shrink-0">{fmtUsd(row?.royaltyUsd ?? 0)}</span>
                      </label>
                    );
                  })}
              </div>
            </Field>
          </div>
        </div>

        {/* ── Outputs column ────────────────────────────── */}
        <div className="space-y-5 min-w-0">
          {/* Headline metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              label="Projected royalty take"
              value={`${fmtUsd(projection.totalRoyaltyUsd)}/yr`}
              accent="green"
              sub="Ad-valorem / extraction only"
            />
            <MetricCard
              label="Change vs baseline"
              value={`${fmtDelta(delta)}/yr`}
              accent={delta > 0 ? 'green' : delta < 0 ? 'red' : 'default'}
              sub={`${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% of baseline`}
            />
            <MetricCard
              label="Baseline take"
              value={`${fmtUsd(baseline.totalRoyaltyUsd)}/yr`}
              accent="blue"
              sub="Today's prices · current rates"
            />
          </div>

          {/* By-country chart */}
          <div className="bg-surface rounded-xl border border-line shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-line-soft bg-surface-2 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Royalty take by country</h2>
                <p className="text-[11px] mt-0.5 text-ink-4">Baseline vs scenario · annual state ad-valorem take</p>
              </div>
              <TrendingUp size={15} className="text-ink-4 shrink-0" />
            </div>
            <div className="p-5 h-64" role="img" aria-label="Grouped bar chart comparing baseline and scenario royalty take by country.">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBF0E6" vertical={false} />
                  <XAxis dataKey="country" tick={{ fontSize: 11, fill: '#7A9A88' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#7A9A88' }} tickLine={false} axisLine={false} tickFormatter={(v) => fmtUsd(v)} width={56} />
                  <Tooltip
                    formatter={(value) => fmtUsd(Number(value))}
                    contentStyle={{ fontSize: 12, border: '1px solid #D2DACC', borderRadius: 6, background: 'white' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#4A6B58' }} />
                  <Bar dataKey="Baseline" fill="#B9C7BD" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Scenario" fill="#006b3f" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* By-commodity + top movers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Commodity breakdown */}
            <div className="bg-surface rounded-xl border border-line shadow-card overflow-hidden">
              <div className="px-5 py-3 border-b border-line-soft bg-surface-2">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">By commodity</h2>
              </div>
              <div className="p-4 space-y-3">
                {commodityRows.length === 0 && <p className="text-[12px] text-ink-4">No producing agreements in scope.</p>}
                {commodityRows.map(r => (
                  <div key={r.commodity}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="text-ink-2 capitalize">{COMMODITY_META[r.commodity]?.label ?? r.commodity}</span>
                      <span className="font-mono text-ink-3">{fmtUsd(r.scenario)}<span className="text-ink-4"> /yr</span></span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-canvas">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${(r.scenario / maxCommodity) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top movers */}
            <div className="bg-surface rounded-xl border border-line shadow-card overflow-hidden">
              <div className="px-5 py-3 border-b border-line-soft bg-surface-2">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Largest swings</h2>
              </div>
              <div className="p-2">
                {movers.length === 0 && <p className="text-[12px] text-ink-4 p-3">No change from baseline yet — adjust a condition on the left.</p>}
                {movers.map(m => (
                  <MoverRow key={m.agreementId} m={m} />
                ))}
              </div>
            </div>
          </div>

          {/* AI interpretation */}
          <ScenarioAnalysisPanel
            scenario={scenario}
            baseline={baseline}
            projection={projection}
          />

          {/* Methodology note */}
          <div className="flex items-start gap-2 px-1 text-[11px] text-ink-4 leading-relaxed">
            <Info size={12} className="shrink-0 mt-0.5" />
            <p>
              Projection models <span className="font-semibold text-ink-3">state royalty take only</span> (ad-valorem / extraction tax) ·
              production from reported quarterly actuals or committed targets · prices are assumptions anchored to dataset references.
              Income tax, state free-carry dividends, and the local development fund are out of scope. Figures are advisory — confirm against source data before decisions.
            </p>
          </div>
        </div>
      </div>
      )}

      {/* ── Commodity Stress Testing ────────────────────────── */}
      {activeTab === 'stress' && (
      <div className="space-y-5 fade-in">
        <StressTestPanel countryId={selectedCountry} scopeAgreements={scopeAgreements} />
      </div>
      )}
    </div>
  );
}

// ─── Mover row ───────────────────────────────────────────────

function MoverRow({ m }: { m: ReturnType<typeof topMovers>[number] }) {
  const navigate = useNavigate();
  const up = m.deltaUsd > 0;
  return (
    <button
      type="button"
      onClick={() => navigate(`/agreements/${m.agreementId}`)}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface-2 transition-colors text-left"
    >
      <span className={cn('shrink-0 w-1.5 h-8 rounded-full', up ? 'bg-status-success' : 'bg-status-danger')} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-ink-4">{m.agreementId}</span>
          <span className="text-[12px] font-medium text-ink-2 truncate">{m.operatorName}</span>
        </div>
        <div className="text-[10.5px] text-ink-4">{fmtUsd(m.baselineUsd)} → {fmtUsd(m.scenarioUsd)}</div>
      </div>
      <span className={cn('font-mono text-[12px] font-semibold shrink-0', up ? 'text-status-success' : 'text-status-danger')}>
        {fmtDelta(m.deltaUsd)}
      </span>
    </button>
  );
}

// ─── Inputs helpers ──────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-3">{label}</label>
        {hint && (
          <span className="group relative inline-flex">
            <Info size={11} className="text-ink-4 cursor-help" />
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-56 z-30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg border border-line bg-surface shadow-pop p-2.5 text-[11px] font-normal normal-case tracking-normal text-ink-2 leading-snug">
              {hint}
            </span>
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

interface SegOption { value: string; label: string; }
function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: SegOption[] }) {
  return (
    <div className="flex rounded-lg border border-line bg-surface-2 p-0.5 gap-0.5">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 text-[11px] font-semibold px-2 py-1.5 rounded-md transition-colors',
            value === o.value ? 'bg-brand-600 text-white shadow-sm' : 'text-ink-3 hover:text-ink-2 hover:bg-surface',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PriceSlider({ commodity, value, onChange }: { commodity: Commodity; value: number; onChange: (v: number) => void }) {
  const meta = COMMODITY_META[commodity];
  const changed = value !== meta.defaultPrice;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11.5px] text-ink-2">{meta.label}</span>
        <span className={cn('font-mono text-[11.5px]', changed ? 'text-brand-700 font-semibold' : 'text-ink-3')}>
          ${value.toLocaleString()}<span className="text-ink-4">/{meta.unit}</span>
        </span>
      </div>
      <input
        type="range" min={meta.min} max={meta.max} step={meta.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600"
        aria-label={`${meta.label} price`}
      />
    </div>
  );
}

// ─── AI interpretation panel ─────────────────────────────────

interface PanelProps {
  scenario: ScenarioInput;
  baseline: ReturnType<typeof computeProjection>;
  projection: ReturnType<typeof computeProjection>;
}

function ScenarioAnalysisPanel({ scenario, baseline, projection }: PanelProps) {
  const ai = useAISettingsStore();
  const ready = ai.enabled && isProviderReady(ai);
  const navigate = useNavigate();

  const cacheKey = useMemo(
    () => fingerprint(ai.model, ...scenarioFingerprintParts(scenario)),
    [ai.model, scenario],
  );

  const [content, setContent]   = useState<string>(() => aiCacheGet(CACHE_TASK, cacheKey) ?? '');
  const [genKey, setGenKey]     = useState<string>(() => (aiCacheGet(CACHE_TASK, cacheKey) ? cacheKey : ''));
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // When the scenario changes, re-pull any cached brief for the new inputs.
  const [prevKey, setPrevKey] = useState(cacheKey);
  if (prevKey !== cacheKey) {
    setPrevKey(cacheKey);
    const hit = aiCacheGet(CACHE_TASK, cacheKey);
    setContent(hit ?? '');
    setGenKey(hit ? cacheKey : '');
    setError(null);
  }

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(() => {
    if (busy || !ready) return;
    setContent('');
    setError(null);
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const pack = buildScenarioContext(scenario, baseline, projection);
    let full = '';
    streamChat(
      {
        provider: ai.provider,
        model: ai.model,
        apiKey: ai.openRouterKey || undefined,
        localBaseUrl: ai.localBaseUrl || undefined,
        messages: scenarioMemoMessages(pack),
        signal: ctrl.signal,
        temperature: 0.25,
      },
      {
        onDelta: (chunk) => { full += chunk; setContent(prev => prev + chunk); },
        onDone: () => {
          if (full.trim().length > 0) {
            aiCacheSet(CACHE_TASK, cacheKey, full, CACHE_TTL);
            setGenKey(cacheKey);
            useAuditStore.getState().log({
              action: 'settings_change', entity: 'settings',
              entityId: 'ai-scenario-memo',
              entityLabel: 'AI fiscal scenario interpretation',
              details: `${ai.provider} / ${ai.model} · ${full.length} chars`,
              user: 'AI Analyst',
            });
          }
          setBusy(false); abortRef.current = null;
        },
        onError: (err) => { setError(err.message); setBusy(false); abortRef.current = null; },
      },
    ).catch(() => {});
  }, [ai, busy, ready, scenario, baseline, projection, cacheKey]);

  const stop = () => { abortRef.current?.abort(); abortRef.current = null; setBusy(false); };

  const { prose, actions } = useMemo(() => splitActions(content), [content]);
  // CitedText renders **bold** but not Markdown headings — turn the memo's
  // "## Section" lines into bold so the headings show cleanly without hashes.
  const displayProse = useMemo(() => prose.replace(/^\s{0,3}#{1,6}\s+(.+?)\s*$/gm, '**$1**'), [prose]);
  const hasContent = prose.trim().length > 0;
  // Brief was generated for an earlier set of inputs (cache miss for current key).
  const stale = hasContent && genKey !== cacheKey;

  const copy = async () => {
    try { await navigator.clipboard.writeText(prose); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  };

  return (
    <section className="rounded-xl border border-line bg-surface shadow-card overflow-hidden" aria-label="AI fiscal interpretation">
      <header
        className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-line-soft"
        style={{ background: 'linear-gradient(90deg, rgba(1,105,64,0.06) 0%, rgba(200,153,30,0.05) 100%)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={13} className="text-brand-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-2 truncate">Ministerial interpretation</div>
            <div className="text-[10.5px] text-ink-4 truncate">The Fiscal Scenario Analyst reads the projected figures above — fiscal impact, exposure, recommended posture.</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasContent && !busy && (
            <button type="button" onClick={copy} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md border border-line text-ink-3 hover:text-ink hover:bg-surface-2" title="Copy">
              {copied ? <Check size={11} /> : <Copy size={11} />}
            </button>
          )}
          {busy ? (
            <button type="button" onClick={stop} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md bg-status-danger text-white hover:opacity-90">
              <Square size={11} /> Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={run}
              disabled={!ready}
              className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {hasContent ? <RefreshCw size={11} /> : <Sparkles size={11} />}
              {hasContent ? (stale ? 'Re-analyse' : 'Re-analyse') : 'Analyse scenario'}
            </button>
          )}
        </div>
      </header>

      <div className="px-4 py-3">
        {!ready && (
          <div className="rounded-lg border border-line bg-surface-2 p-3 flex items-start gap-2">
            <AlertTriangle size={13} className="text-status-warning shrink-0 mt-0.5" />
            <div className="text-[12px] text-ink-2 leading-snug">
              {ai.enabled
                ? <>An API key is required for the selected provider. <button onClick={() => navigate('/admin')} className="text-brand-600 font-semibold underline">Configure in Admin</button>.</>
                : <>The AI Analyst is disabled. <button onClick={() => navigate('/admin')} className="text-brand-600 font-semibold underline">Enable in Admin</button>.</>}
            </div>
          </div>
        )}

        {ready && !hasContent && !busy && !error && (
          <div className="text-[12px] text-ink-3 leading-relaxed">
            Press <span className="font-semibold text-ink-2">Analyse scenario</span> to have the analyst interpret the current projection —
            what drives the change, where it lands, the stability-clause and arbitration exposure, and what to model next. Every figure it cites is taken from the deterministic projection above.
          </div>
        )}

        {busy && !hasContent && (
          <div className="flex items-center gap-2 text-[12px] text-ink-3"><Loader2 size={13} className="animate-spin text-brand-600" /> Interpreting projection…</div>
        )}

        {error && (
          <div className="rounded-lg border border-status-danger/40 bg-status-danger/[0.06] p-3 flex items-start gap-2">
            <AlertTriangle size={13} className="text-status-danger shrink-0 mt-0.5" />
            <div className="text-[12px] text-status-danger leading-snug min-w-0 break-words">{error}</div>
          </div>
        )}

        {stale && !busy && (
          <div className="mb-2 inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-800">
            <AlertTriangle size={11} /> Conditions changed since this analysis — re-analyse to refresh.
          </div>
        )}

        {hasContent && (
          <div className={cn('text-[13px] leading-relaxed text-ink break-words', stale && 'opacity-60')}>
            <CitedText text={displayProse} />
            {busy && <span className="ai-caret inline-block w-1 h-3.5 ml-0.5 align-middle bg-brand-600" aria-hidden />}
          </div>
        )}

        {actions.length > 0 && !busy && (
          <ScenarioActionStrip actions={actions} navigate={navigate} />
        )}

        {hasContent && (
          <div className="mt-3 pt-2 border-t border-line-soft text-[10px] font-mono text-ink-4 flex items-center justify-between flex-wrap gap-1">
            <span>Model: {ai.model} · Provider: {ai.provider}</span>
            <span>Interprets the deterministic projection — figures are not model-generated</span>
          </div>
        )}
      </div>
    </section>
  );
}

function ScenarioActionStrip({ actions, navigate }: { actions: AIAction[]; navigate: (to: string) => void }) {
  const [pending, setPending] = useState<number | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);

  const onClick = async (a: AIAction, idx: number) => {
    setPending(idx);
    const result = await dispatchAction(a, { source: 'ai.scenario', navigate });
    setPending(null);
    setToast(result);
    if (result.ok) setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="mt-3 pt-3 border-t border-line-soft">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2 text-ink-3">Suggested actions</div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onClick(a, i)}
            disabled={pending !== null}
            title={a.hint ?? a.label}
            className="text-[11px] font-medium flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-line bg-surface-2 text-ink-2 hover:border-brand-600 hover:bg-brand-50 hover:text-brand-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            <Sparkles size={10} className="text-brand-600" />
            {a.label}
            {pending === i && <Loader2 size={11} className="animate-spin ml-0.5" />}
          </button>
        ))}
      </div>
      {toast && (
        <div role="status" className={cn(
          'mt-2 inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md border',
          toast.ok ? 'border-status-success/40 bg-status-success/[0.08] text-status-success' : 'border-status-danger/40 bg-status-danger/[0.08] text-status-danger',
        )}>
          {toast.ok ? <Check size={11} /> : <AlertTriangle size={11} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

// ─── Stress Test Panel ───────────────────────────────────────

import { AreaChart, Area } from 'recharts';

function StressTestPanel({ countryId, scopeAgreements }: { countryId: string; scopeAgreements: any[] }) {
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity>('gold');
  const [priceMultiplier, setPriceMultiplier] = useState<number>(1);
  const [selectedAgreementIds, setSelectedAgreementIds] = useState<string[]>([]);

  const meta = COMMODITY_META[selectedCommodity];
  const historicalPrices = useMemo(() => getCommodityPrices(selectedCommodity), [selectedCommodity]);
  const currentPrice = historicalPrices[historicalPrices.length - 1]?.pricePerUnit ?? meta.defaultPrice;
  const stressedPrice = currentPrice * priceMultiplier;
  
  const relevantAgreements = useMemo(() => scopeAgreements.filter(a => a.commodity === selectedCommodity), [scopeAgreements, selectedCommodity]);
  
  // Auto-select all if empty
  useEffect(() => {
    setSelectedAgreementIds(relevantAgreements.map(a => a.id));
  }, [relevantAgreements]);

  const toggleAgreement = (id: string) => {
    setSelectedAgreementIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
      <div className="bg-surface rounded-xl border border-line shadow-card lg:sticky lg:top-4">
        <div className="px-4 py-3 border-b border-line-soft bg-surface-2 flex items-center gap-2">
          <AlertTriangle size={14} className="text-[#D97706]" />
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Stress Parameters</h2>
        </div>
        
        <div className="p-4 space-y-5">
          <Field label="Commodity">
            <select
              value={selectedCommodity}
              onChange={e => setSelectedCommodity(e.target.value as Commodity)}
              className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {(Object.keys(COMMODITY_META) as Commodity[]).map(c => (
                <option key={c} value={c}>{COMMODITY_META[c].label}</option>
              ))}
            </select>
          </Field>
          
          <Field label="Price Shock Slider" hint="Adjust the current price from -50% to +100%">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-ink-3">Multiplier</span>
              <span className="font-bold font-mono text-[13px] text-ink">{priceMultiplier.toFixed(2)}x</span>
            </div>
            <input
              type="range" min={0.5} max={2.0} step={0.05}
              value={priceMultiplier}
              onChange={e => setPriceMultiplier(Number(e.target.value))}
              className="w-full accent-[#D97706]"
            />
            <div className="flex justify-between text-[9px] font-mono text-ink-4 mt-0.5">
              <span>-50%</span><span>Current</span><span>+100%</span>
            </div>
          </Field>
          
          <Field label="Affected Agreements">
            <div className="rounded-lg border border-line max-h-52 overflow-y-auto divide-y divide-line-soft">
              {relevantAgreements.length === 0 ? (
                <div className="p-3 text-[11px] text-ink-4">No {selectedCommodity} agreements in this region.</div>
              ) : (
                relevantAgreements.map(a => {
                  const on = selectedAgreementIds.includes(a.id);
                  return (
                    <label key={a.id} className={cn("flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer text-[11px] transition-colors", on ? "bg-surface-2" : "opacity-60 hover:bg-surface-2")}>
                      <input type="checkbox" checked={on} onChange={() => toggleAgreement(a.id)} className="accent-primary shrink-0" />
                      <span className="font-mono text-ink-4 shrink-0">{a.id}</span>
                      <span className="text-ink-2 truncate flex-1">{a.concesssionArea}</span>
                    </label>
                  );
                })
              )}
            </div>
          </Field>
        </div>
      </div>
      
      <div className="space-y-5 min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            label="Current Price (Base)"
            value={`$${currentPrice.toLocaleString()}`}
            sub={`USD / ${meta.unit}`}
            accent="default"
          />
          <MetricCard
            label="Stressed Price"
            value={`$${stressedPrice.toLocaleString()}`}
            sub={`${priceMultiplier > 1 ? '+' : ''}${Math.round((priceMultiplier - 1) * 100)}% shock`}
            accent={priceMultiplier < 1 ? "red" : priceMultiplier > 1 ? "green" : "default"}
          />
        </div>
        
        {historicalPrices.length > 0 && (
          <div className="bg-surface rounded-xl border border-line shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-line-soft bg-surface-2 flex items-center justify-between">
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Historical Price Ticker</h2>
                <p className="text-[11px] mt-0.5 text-ink-4">Synthetic 24-month LME data</p>
              </div>
              <div className="font-mono font-bold text-[18px] text-ink tracking-tight">
                ${currentPrice.toLocaleString()} <span className="text-[10px] text-ink-4 uppercase align-top ml-1">USD</span>
              </div>
            </div>
            <div className="h-32 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalPrices}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ fontSize: 12, border: '1px solid #D2DACC', borderRadius: 4, background: 'white' }}
                    labelStyle={{ color: '#7A9A88', fontSize: 10, marginBottom: 4 }}
                  />
                  <Area type="monotone" dataKey="pricePerUnit" stroke="#D97706" fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        <div className="bg-surface rounded-xl border border-line shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-line-soft bg-surface-2">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Revenue Impact</h2>
            <p className="text-[11px] mt-0.5 text-ink-4">Projected state share under stressed conditions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft bg-surface-2">
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-ink-3">Agreement</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-ink-3">Base Gov Share</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-ink-3">Stressed Gov Share</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-ink-3">Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {selectedAgreementIds.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-ink-4 text-[13px]">Select agreements to view impact.</td></tr>
                ) : (
                  selectedAgreementIds.map(id => {
                    const ag = relevantAgreements.find(a => a.id === id);
                    if (!ag) return null;
                    // Grounded: annual run-rate production × price × royalty rate.
                    const production = annualProduction(id, 'current');
                    const rate = (ag.royaltyRate ?? 0) / 100;
                    const base = production * currentPrice * rate;
                    const stressed = production * stressedPrice * rate;
                    const delta = stressed - base;

                    return (
                      <tr key={id} className="hover:bg-surface-2 transition-colors">
                        <td className="px-4 py-3 font-mono text-[12px] text-ink">{id}</td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-ink-3">{fmtUsd(base)}</td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-ink">{fmtUsd(stressed)}</td>
                        <td className={cn("px-4 py-3 text-right font-mono font-bold text-[12px]", delta < 0 ? "text-status-danger" : delta > 0 ? "text-status-success" : "text-ink-3")}>
                          {fmtDelta(delta)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
