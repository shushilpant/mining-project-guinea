import { useMemo } from 'react';
import { getLocalContentRecords, getOperatorById } from '@/services/dataService';
import { useCountry } from '@/context/CountryContext';
import { useStoreData } from '@/store/dataStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { ChartPanel } from '@/components/shared/ChartPanel';
import { Users, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { LocalContentRecord } from '@/data/types';

type Category = LocalContentRecord['category'];

const CATEGORY_LABELS: Record<Category, string> = {
  employment: 'Local Employment',
  procurement: 'Local Procurement',
  infrastructure: 'Infrastructure',
  training: 'Skills & Training',
  community_fund: 'Community Fund',
};

const CATEGORY_ORDER: Category[] = ['employment', 'procurement', 'infrastructure', 'training', 'community_fund'];

// Compliance thresholds → palette (matches the app's forest/amber/red scale).
const GOOD = '#006b3f';
const WARN = '#D97706';
const BAD = '#DC2626';
function complianceColor(pct: number): string {
  if (pct >= 100) return GOOD;
  if (pct >= 80) return WARN;
  return BAD;
}

export function LocalContentPage() {
  const { selectedCountry } = useCountry();
  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;

  // Filter by COUNTRY (second arg). The first arg is operatorId — leave undefined.
  const records = useStoreData(
    () => getLocalContentRecords(undefined, countryId),
    [countryId],
  );

  // Per-category aggregation: promised vs actual and a compliance ratio.
  const byCategory = useMemo(() => {
    return CATEGORY_ORDER.map(cat => {
      const catRecords = records.filter(r => r.category === cat);
      const promised = catRecords.reduce((s, r) => s + r.promised, 0);
      const actual = catRecords.reduce((s, r) => s + r.actual, 0);
      const compliance = promised > 0 ? Math.round((actual / promised) * 100) : 0;
      return { category: cat, label: CATEGORY_LABELS[cat], compliance, count: catRecords.length };
    }).filter(c => c.count > 0);
  }, [records]);

  // Per-record rows for the audit table, worst compliance first.
  const rows = useMemo(() => {
    return records
      .map(r => {
        const compliance = r.promised > 0 ? Math.round((r.actual / r.promised) * 100) : 100;
        return { ...r, compliance, met: r.actual >= r.promised };
      })
      .sort((a, b) => a.compliance - b.compliance);
  }, [records]);

  const operatorsReporting = useMemo(() => new Set(records.map(r => r.operatorId)).size, [records]);
  const shortfalls = rows.filter(r => !r.met).length;
  // Units differ across categories, so a raw promised/actual sum is meaningless.
  // Report the mean of per-commitment compliance ratios instead.
  const overallCompliance = useMemo(() => {
    if (records.length === 0) return 0;
    const sum = records.reduce((s, r) => s + (r.promised > 0 ? r.actual / r.promised : 1), 0);
    return Math.round((sum / records.length) * 100);
  }, [records]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Local Benefits Tracker"
        subtitle="Are companies hiring locally and investing as they promised?"
        badge="M8 · Local Content Auditing"
      />

      <ModuleIntro />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Overall Commitment Delivery"
          value={`${overallCompliance}%`}
          sub="Mean of per-commitment delivery ratios"
          icon={<CheckCircle2 size={16} />}
          accent={overallCompliance >= 100 ? 'green' : overallCompliance >= 80 ? 'amber' : 'red'}
          hint="On average, how much of each local-benefit promise (jobs, spending, training) has actually been delivered. 100% means promises are being fully met."
        />
        <MetricCard
          label="Operators Reporting"
          value={operatorsReporting}
          sub={`${records.length} tracked commitments`}
          icon={<Building2 size={16} />}
          accent="blue"
          hint="How many companies have local-content data being tracked in this scope."
        />
        <MetricCard
          label="Commitments in Shortfall"
          value={shortfalls}
          sub="Delivery below contractual promise"
          icon={<AlertCircle size={16} />}
          accent={shortfalls > 0 ? 'red' : 'green'}
          hint="The number of local-benefit promises where actual delivery is below what was contractually promised."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPanel
          title="Delivery by Commitment Category"
          caption="Actual delivery as a percentage of what was promised, per category."
          howToRead="Each bar is a category of local benefit. A bar reaching 100% means the promise was fully delivered; shorter bars (amber/red) show a shortfall in that area."
          aiRegion="Delivery by Commitment Category"
          ariaLabel="Horizontal bar chart of delivery percentage by local-content commitment category."
          bodyClassName="p-5 h-64"
        >
            {byCategory.length === 0 ? (
              <div className="flex items-center justify-center h-full text-ink-4 text-sm">No local-content commitments in this scope.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBF0E6" horizontal={false} />
                  <XAxis type="number" domain={[0, 120]} unit="%" tick={{ fontSize: 10, fill: '#7A9A88' }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="label" type="category" width={110} tick={{ fontSize: 10, fill: '#7A9A88' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#F5F8F2' }}
                    formatter={(v) => [`${v}%`, 'Delivery']}
                    contentStyle={{ fontSize: 12, border: '1px solid #D2DACC', borderRadius: 6, background: 'white' }}
                  />
                  <Bar dataKey="compliance" radius={[0, 3, 3, 0]}>
                    {byCategory.map(c => (
                      <Cell key={c.category} fill={complianceColor(c.compliance)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </ChartPanel>

        <div className="bg-surface rounded-xl border border-line shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-line-soft bg-surface-2 flex items-center gap-2">
            <Users size={14} className="text-brand-600" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Commitment Audit Ledger</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft bg-surface-2">
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-3">Operator</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-3">Category</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-ink-3">Promised</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-ink-3">Actual</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-ink-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {rows.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-ink-4 text-[13px]">No commitments tracked in this scope.</td></tr>
                ) : (
                  rows.map(r => {
                    const op = getOperatorById(r.operatorId);
                    return (
                      <tr key={r.id} className="hover:bg-surface-2 transition-colors">
                        <td className="px-4 py-3 text-[12px] font-semibold text-ink">{op?.name ?? r.operatorId}</td>
                        <td className="px-4 py-3 text-[12px] text-ink-3">{CATEGORY_LABELS[r.category]}</td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-ink-3">{r.promised.toLocaleString()} {r.unit}</td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-ink">{r.actual.toLocaleString()} {r.unit}</td>
                        <td className="px-4 py-3 text-right">
                          {r.met ? (
                            <span className="inline-flex items-center gap-1.5 text-status-success bg-status-success/10 px-2.5 py-1 rounded-md text-[11px] font-bold">
                              <CheckCircle2 size={13} /> {r.compliance}%
                            </span>
                          ) : (
                            <span className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold',
                              r.compliance >= 80 ? 'text-status-warning bg-status-warning/10' : 'text-status-danger bg-status-danger/10',
                            )}>
                              <AlertCircle size={13} /> {r.compliance}%
                            </span>
                          )}
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
