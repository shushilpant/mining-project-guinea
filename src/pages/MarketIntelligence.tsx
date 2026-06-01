import { useMemo, useState } from 'react';
import { useCountry } from '@/context/CountryContext';
import { useStoreData } from '@/store/dataStore';
import {
  getCommodityMarketData, getAgreements, computeRevenueImpact, formatCommodity,
} from '@/services/dataService';
import { PageHeader } from '@/components/shared/PageHeader';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { ChartPanel } from '@/components/shared/ChartPanel';
import { InfoTip } from '@/components/shared/InfoTip';
import { TrendingUp, TrendingDown, SlidersHorizontal, Bell } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { Commodity, CommodityMarketData } from '@/data/types';

const AXIS = '#8AA396';
const GRID = 'var(--border)';
const UP = '#10B981';
const DOWN = '#DC2626';
const GOLD = '#C8991E';
const TOOLTIP_STYLE = { fontSize: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', color: 'var(--foreground)' } as const;

// Deterministic 12-point series ending near the current price, sloped by
// the 30-day change — enough for sparklines and the historical chart.
function priceSeries(d: CommodityMarketData): number[] {
  const n = 12;
  const start = d.currentPrice / (1 + d.change30d / 100);
  const seed = d.commodity.length;
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const base = start + (d.currentPrice - start) * t;
    const wiggle = Math.sin((i + seed) * 1.3) * d.currentPrice * 0.012;
    return Math.round((base + wiggle) * 100) / 100;
  });
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const w = 96, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / span) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function fmtPrice(d: CommodityMarketData): string {
  return d.currentPrice >= 100 ? d.currentPrice.toLocaleString() : d.currentPrice.toFixed(d.currentPrice >= 10 ? 1 : 2);
}

function ChangeChip({ value, label }: { value: number; label: string }) {
  const up = value >= 0;
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] font-bold uppercase tracking-wider text-ink-4">{label}</span>
      <span className="text-[11px] font-bold tabular-nums" style={{ color: up ? UP : DOWN }}>
        {up ? '+' : ''}{value.toFixed(1)}%
      </span>
    </div>
  );
}

// Price watchlist thresholds that feed the alert layer.
interface Threshold { commodity: Commodity; level: number; unit: string; direction: 'above' | 'below'; note: string; }
const THRESHOLDS: Threshold[] = [
  { commodity: 'gold',      level: 4500, unit: 'USD/oz', direction: 'above', note: 'Ghana 12% royalty ceiling' },
  { commodity: 'lithium',   level: 1500, unit: 'USD/t',  direction: 'below', note: 'Min spodumene royalty band' },
  { commodity: 'iron ore',  level: 100,  unit: 'USD/t',  direction: 'above', note: 'Simandou economics floor' },
  { commodity: 'manganese', level: 5.0,  unit: 'USD/dmtu', direction: 'above', note: 'Nsuta refinery viability' },
];

// Simple historical price correlation matrix (illustrative).
const CORR_COMMODITIES: Commodity[] = ['gold', 'bauxite', 'iron ore', 'manganese', 'lithium', 'diamonds'];
const CORR: Record<string, Record<string, number>> = {
  'gold':      { 'gold': 1,    'bauxite': 0.2,  'iron ore': 0.1,  'manganese': 0.0,  'lithium': -0.3, 'diamonds': 0.4 },
  'bauxite':   { 'gold': 0.2,  'bauxite': 1,    'iron ore': 0.6,  'manganese': 0.5,  'lithium': 0.1,  'diamonds': 0.1 },
  'iron ore':  { 'gold': 0.1,  'bauxite': 0.6,  'iron ore': 1,    'manganese': 0.7,  'lithium': 0.2,  'diamonds': 0.0 },
  'manganese': { 'gold': 0.0,  'bauxite': 0.5,  'iron ore': 0.7,  'manganese': 1,    'lithium': 0.3,  'diamonds': -0.1 },
  'lithium':   { 'gold': -0.3, 'bauxite': 0.1,  'iron ore': 0.2,  'manganese': 0.3,  'lithium': 1,    'diamonds': -0.2 },
  'diamonds':  { 'gold': 0.4,  'bauxite': 0.1,  'iron ore': 0.0,  'manganese': -0.1, 'lithium': -0.2, 'diamonds': 1 },
};
function corrColor(v: number): string {
  if (v >= 0.999) return 'var(--secondary)';
  const a = Math.min(0.85, Math.abs(v));
  return v >= 0 ? `rgba(16,185,129,${a})` : `rgba(220,38,38,${a})`;
}

export function MarketIntelligencePage() {
  const { selectedCountry } = useCountry();
  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  const market = useStoreData(() => getCommodityMarketData(), []);
  // Commodities actually mined in the selected scope drive the focus.
  const inScope = useStoreData(() => {
    const set = new Set(getAgreements(countryId).filter(a => a.status === 'active').map(a => a.commodity));
    return set;
  }, [countryId]);

  const focusCommodities = useMemo(
    () => market.filter(d => inScope.size === 0 || inScope.has(d.commodity)),
    [market, inScope],
  );
  const focusList = focusCommodities.length ? focusCommodities : market;

  const [selected, setSelected] = useState<Commodity>('gold');
  const activeCommodity: Commodity = focusList.some(d => d.commodity === selected) ? selected : focusList[0].commodity;
  const selectedData = market.find(d => d.commodity === activeCommodity)!;

  const [pricePct, setPricePct] = useState(10);
  const impact = useStoreData(
    () => computeRevenueImpact(activeCommodity, pricePct, countryId),
    [activeCommodity, pricePct, countryId],
  );

  const history = useMemo(() => {
    const series = priceSeries(selectedData);
    return series.map((price, i) => ({ label: `M${i - 11 === 0 ? 'now' : i - 11}`, price }));
  }, [selectedData]);

  const scopeImpacts = useMemo(
    () => focusList.map(d => computeRevenueImpact(d.commodity, pricePct, countryId)),
    [focusList, pricePct, countryId],
  );

  const fmtUSD = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1e9) return `$${(v / 1e9).toFixed(2)}bn`;
    if (abs >= 1e6) return `$${(v / 1e6).toFixed(1)}m`;
    return `$${Math.round(v).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Market Intelligence"
        subtitle="See live mineral prices and what they mean for government revenue."
        badge="M10 · Commodity Pricing & Revenue Impact"
      />

      <ModuleIntro />

      {/* Live commodity prices */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4" data-ai-region="Live Commodity Prices">
        {market.map(d => {
          const focused = inScope.size === 0 || inScope.has(d.commodity);
          return (
            <div
              key={d.commodity}
              className={'relative rounded-2xl bg-card border shadow-card p-4 transition-all ' + (focused ? 'border-line-soft' : 'border-line-soft opacity-60')}
              style={{ borderLeftWidth: 3, borderLeftColor: d.change24h >= 0 ? UP : DOWN }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3">{formatCommodity(d.commodity)}</span>
                {d.change24h >= 0 ? <TrendingUp size={14} style={{ color: UP }} /> : <TrendingDown size={14} style={{ color: DOWN }} />}
              </div>
              <div className="mt-1 text-[20px] font-bold tabular-nums tracking-tight text-foreground leading-none">{fmtPrice(d)}</div>
              <div className="text-[10px] text-ink-4 mb-2">{d.priceUnit}</div>
              <div className="mb-2"><Sparkline data={priceSeries(d)} color={d.change30d >= 0 ? UP : DOWN} /></div>
              <div className="flex items-center justify-between border-t border-line-soft pt-2">
                <ChangeChip value={d.change24h} label="24h" />
                <ChangeChip value={d.change7d} label="7d" />
                <ChangeChip value={d.change30d} label="30d" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Historical price chart with commodity selector */}
        <ChartPanel
          className="lg:col-span-3"
          title="Historical Price Trend"
          caption="Indicative 12-month price path for the selected commodity."
          howToRead="Use the buttons to switch commodity. The line shows how the price has moved over the past year toward today's level."
          accent={GOLD}
          aiRegion="Historical Price Trend"
          ariaLabel="Line chart of historical commodity price."
          bodyClassName="p-5 h-[320px]"
          actions={
            <div className="flex flex-wrap gap-1">
              {focusList.map(d => (
                <button
                  key={d.commodity}
                  onClick={() => setSelected(d.commodity)}
                  className={
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ' +
                    (d.commodity === activeCommodity ? 'bg-brand-600/15 text-brand-700 border border-brand-600/30' : 'text-ink-4 border border-line-soft hover:text-ink')
                  }
                >
                  {formatCommodity(d.commodity)}
                </button>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 12, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: AXIS }} tickLine={false} axisLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: AXIS }} tickLine={false} axisLine={false} width={52} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${Number(v).toLocaleString()} ${selectedData.priceUnit}`, formatCommodity(activeCommodity)]} />
              <Line type="monotone" dataKey="price" stroke={GOLD} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        {/* Revenue impact simulator */}
        <section className="glass-card flex flex-col lg:col-span-2" data-ai-region="Revenue Impact Simulator">
          <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01] flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-brand-600" />
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">Revenue Impact Simulator</h2>
            <InfoTip title="How this works" body="Drag the slider to model a price change for the selected commodity. The projected government royalty revenue scales with the price move, across active agreements in the current country scope." label="How the simulator works" />
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-ink">{formatCommodity(activeCommodity)} price change</span>
              <span className="font-bold tabular-nums text-[16px]" style={{ color: pricePct >= 0 ? UP : DOWN }}>{pricePct >= 0 ? '+' : ''}{pricePct}%</span>
            </div>
            <input
              type="range" min={-30} max={30} step={1} value={pricePct}
              onChange={(e) => setPricePct(Number(e.target.value))}
              className="w-full" aria-label="Price change percentage"
            />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-surface-2 border border-line-soft p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wide text-ink-4">Baseline</div>
                <div className="text-[14px] font-bold tabular-nums text-foreground mt-0.5">{fmtUSD(impact.currentRevenue)}</div>
              </div>
              <div className="rounded-xl bg-surface-2 border border-line-soft p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wide text-ink-4">Projected</div>
                <div className="text-[14px] font-bold tabular-nums text-foreground mt-0.5">{fmtUSD(impact.projectedRevenue)}</div>
              </div>
              <div className="rounded-xl p-2.5 border" style={{ background: `${impact.impactUSD >= 0 ? UP : DOWN}14`, borderColor: `${impact.impactUSD >= 0 ? UP : DOWN}33` }}>
                <div className="text-[9px] font-bold uppercase tracking-wide text-ink-4">Impact</div>
                <div className="text-[14px] font-bold tabular-nums mt-0.5" style={{ color: impact.impactUSD >= 0 ? UP : DOWN }}>{impact.impactUSD >= 0 ? '+' : ''}{fmtUSD(impact.impactUSD)}</div>
              </div>
            </div>
            <div className="pt-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-4 mb-2">Annual royalty impact by commodity (scope)</div>
              <div className="space-y-1.5">
                {scopeImpacts.map(s => (
                  <div key={s.commodity} className="flex items-center justify-between text-[12px]">
                    <span className="text-ink-3">{formatCommodity(s.commodity)}</span>
                    <span className="font-mono tabular-nums font-semibold" style={{ color: s.impactUSD >= 0 ? UP : DOWN }}>
                      {s.impactUSD >= 0 ? '+' : ''}{fmtUSD(s.impactUSD)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Price alert thresholds */}
        <section className="glass-card flex flex-col lg:col-span-2">
          <div className="px-6 py-4 border-b border-line-soft bg-foreground/[0.01] flex items-center gap-2">
            <Bell size={15} className="text-brand-600" />
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">Price Alert Thresholds</h2>
          </div>
          <div className="p-5 space-y-3">
            {THRESHOLDS.map(t => {
              const d = market.find(m => m.commodity === t.commodity);
              if (!d) return null;
              const crossed = t.direction === 'above' ? d.currentPrice >= t.level : d.currentPrice <= t.level;
              return (
                <div key={t.commodity} className="flex items-center justify-between rounded-xl border border-line-soft bg-surface-2 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-ink">{formatCommodity(t.commodity)} {t.direction} {t.level.toLocaleString()} <span className="font-normal text-ink-4">{t.unit}</span></div>
                    <div className="text-[11px] text-ink-4 truncate">{t.note}</div>
                  </div>
                  <span className={'shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md ' + (crossed ? 'text-status-danger bg-status-danger/10' : 'text-status-success bg-status-success/10')}>
                    {crossed ? 'Crossed' : 'OK'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Correlation matrix */}
        <ChartPanel
          className="lg:col-span-3"
          title="Price Correlation Matrix"
          caption="How commodity prices have historically moved together."
          howToRead="Green cells mean two commodities tend to rise and fall together; red means they move in opposite directions. Stronger colour means a stronger relationship."
          accent="#3B82F6"
          aiRegion="Price Correlation Matrix"
          bodyClassName="p-5 overflow-x-auto"
        >
          <table className="text-[11px] border-collapse mx-auto">
            <thead>
              <tr>
                <th className="p-1.5" />
                {CORR_COMMODITIES.map(c => (
                  <th key={c} className="p-1.5 text-ink-4 font-semibold text-center capitalize" style={{ minWidth: 56 }}>{c === 'iron ore' ? 'iron' : c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CORR_COMMODITIES.map(row => (
                <tr key={row}>
                  <td className="p-1.5 text-ink-4 font-semibold capitalize whitespace-nowrap">{row === 'iron ore' ? 'iron' : row}</td>
                  {CORR_COMMODITIES.map(col => {
                    const v = CORR[row][col];
                    return (
                      <td key={col} className="p-0.5">
                        <div className="h-9 rounded-md flex items-center justify-center font-bold tabular-nums" style={{ background: corrColor(v), color: Math.abs(v) > 0.5 ? '#fff' : 'var(--ink-3)' }} title={`${row} vs ${col}: ${v}`}>
                          {v === 1 ? '–' : v.toFixed(1)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </ChartPanel>
      </div>
    </div>
  );
}
