import { useState, useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/components/shared/MetricCard';
import { ChartPanel } from '@/components/shared/ChartPanel';
import { COMMODITY_META, annualProduction, fmtUsd, fmtDelta, type Commodity } from '@/lib/revenueModel';
import { getCommodityPrices } from '@/services/dataService';
import type { Agreement } from '@/data/types';
import { Field } from '@/pages/scenarios/inputs';

export function StressTestPanel({ scopeAgreements }: { scopeAgreements: Agreement[] }) {
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity>('gold');
  const [priceMultiplier, setPriceMultiplier] = useState<number>(1);
  const [selectedAgreementIds, setSelectedAgreementIds] = useState<string[]>([]);

  const meta = COMMODITY_META[selectedCommodity];
  const historicalPrices = useMemo(() => getCommodityPrices(selectedCommodity), [selectedCommodity]);
  const currentPrice = historicalPrices[historicalPrices.length - 1]?.pricePerUnit ?? meta.defaultPrice;
  const stressedPrice = currentPrice * priceMultiplier;
  
  const relevantAgreements = useMemo(() => scopeAgreements.filter(a => a.commodity === selectedCommodity), [scopeAgreements, selectedCommodity]);

  // Reset the selection to "all" whenever the relevant set changes (commodity or
  // country switch). Adjusting state during render avoids a setState-in-effect.
  const relevantKey = relevantAgreements.map(a => a.id).join(',');
  const [trackedKey, setTrackedKey] = useState<string | null>(null);
  if (trackedKey !== relevantKey) {
    setTrackedKey(relevantKey);
    setSelectedAgreementIds(relevantAgreements.map(a => a.id));
  }

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
          <ChartPanel
            title="Historical Price Ticker"
            caption="The commodity's price over the last 24 months."
            howToRead="The line traces the commodity price month by month. A jagged line means a volatile price — useful context when you decide how hard to stress-test it."
            aiRegion="Historical Price Ticker"
            actions={
              <div className="font-mono font-bold text-[18px] text-ink tracking-tight">
                ${currentPrice.toLocaleString()} <span className="text-[10px] text-ink-4 uppercase align-top ml-1">USD</span>
              </div>
            }
            ariaLabel="Area chart of the commodity's price over the last 24 months."
            bodyClassName="h-32 p-3"
          >
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
          </ChartPanel>
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
