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

import { useMemo, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { RotateCcw, TrendingUp, SlidersHorizontal, Info } from 'lucide-react';
import { useCountry } from '@/context/CountryContext';
import { useStoreData } from '@/store/dataStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { ChartPanel } from '@/components/shared/ChartPanel';
import { cn } from '@/lib/utils';
import { getAgreements } from '@/services/dataService';
import {
  COMMODITY_META,
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
import { MoverRow, Field, Segmented, PriceSlider } from '@/pages/scenarios/inputs';
import { ScenarioAnalysisPanel } from '@/pages/scenarios/ScenarioAnalysisPanel';
import { StressTestPanel } from '@/pages/scenarios/StressTestPanel';

const COUNTRY_SHORT: Record<string, string> = {
  GIN: 'Guinea', GHA: 'Ghana', CIV: "Côte d'Ivoire",
};

export function ScenariosPage() {
  const { selectedCountry } = useCountry();

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
  const baseline   = useStoreData(() => computeProjection(baselineScenario(selectedCountry)), [selectedCountry]);
  const projection = useStoreData(() => computeProjection(scenario), [scenario]);
  const movers     = useMemo(() => topMovers(baseline, projection, 6), [baseline, projection]);

  const scopeCommodities = useStoreData(() => commoditiesInScope(selectedCountry), [selectedCountry]);
  const scopeAgreements  = useStoreData(
    () => getAgreements(selectedCountry === 'ALL' ? undefined : selectedCountry)
      .filter(a => a.status === 'active'),
    [selectedCountry],
  );

  const delta = projection.totalRoyaltyUsd - baseline.totalRoyaltyUsd;
  const pct = baseline.totalRoyaltyUsd > 0 ? (delta / baseline.totalRoyaltyUsd) * 100 : 0;
  const dirty = JSON.stringify(scenarioFingerprintParts(scenario))
    !== JSON.stringify(scenarioFingerprintParts(baselineScenario(selectedCountry)));

  const chartData = useMemo(() => {
    const cids = selectedCountry === 'ALL' ? ['GIN'] : [selectedCountry];
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
        title="What-If Planner"
        subtitle="Test how revenue changes if prices, taxes, or operators change."
        badge="M6 · Fiscal Scenario Modelling"
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

      <ModuleIntro />

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
          <ChartPanel
            title="Royalty Take by Country"
            caption="Today's baseline next to your scenario — annual government royalty income."
            howToRead="Grey bars are today's revenue (the baseline); green bars are your what-if scenario. Where green is taller than grey, your changes would raise government income for that country."
            aiRegion="Royalty take by country"
            actions={<TrendingUp size={15} className="text-ink-4 shrink-0" />}
            ariaLabel="Grouped bar chart comparing baseline and scenario royalty take by country."
            bodyClassName="p-5 h-64"
          >
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
          </ChartPanel>

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
        <StressTestPanel scopeAgreements={scopeAgreements} />
      </div>
      )}
    </div>
  );
}
