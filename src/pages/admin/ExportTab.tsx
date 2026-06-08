import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, CheckCircle2 } from 'lucide-react';
import { sanitizeRecords, sanitizeMatrix } from '@/lib/exportSafety';
import { DB, getRiskFlags } from '@/services/dataService';

export function ExportTab() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(['agreements', 'operators', 'risk_flags']),
  );
  const [exported, setExported] = useState(false);

  const toggle = (key: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  const DATASETS = [
    {
      key: 'agreements',
      label: 'Agreements',
      count: DB.agreements.length,
      fn: () =>
        DB.agreements.map(a => ({ ...a, coordinates: a.coordinates.join(', ') })),
    },
    {
      key: 'operators',
      label: 'Operators',
      count: DB.operators.length,
      fn: () =>
        DB.operators.map(op => ({
          ...op,
          countryIds: op.countryIds.join('|'),
          ultimateBeneficialOwners: JSON.stringify(op.ultimateBeneficialOwners),
        })),
    },
    {
      key: 'commitments',
      label: 'Commitments',
      count: DB.commitments.length,
      fn: () => DB.commitments,
    },
    {
      key: 'performance',
      label: 'Performance Records',
      count: DB.performanceRecords.length,
      fn: () => DB.performanceRecords,
    },
    {
      key: 'risk_flags',
      label: 'Risk Flags',
      count: getRiskFlags().length,
      fn: () => getRiskFlags(),
    },
    {
      key: 'infrastructure',
      label: 'Infrastructure Obligations',
      count: DB.infrastructureObligations.length,
      fn: () => DB.infrastructureObligations,
    },
  ];

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    DATASETS.filter(d => selected.has(d.key)).forEach(dataset => {
      const data = dataset.fn() as Record<string, unknown>[];
      if (data.length === 0) {
        const ws = XLSX.utils.aoa_to_sheet(sanitizeMatrix([['No data']]));
        XLSX.utils.book_append_sheet(wb, ws, dataset.label.slice(0, 31));
      } else {
        const ws = XLSX.utils.json_to_sheet(sanitizeRecords(data));
        XLSX.utils.book_append_sheet(wb, ws, dataset.label.slice(0, 31));
      }
    });
    const filename = `peb0526_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-line rounded-xl p-5">
        <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-4">
          Select datasets to export
        </p>
        <div className="space-y-2">
          {DATASETS.map(d => (
            <label
              key={d.key}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 cursor-pointer border border-line-soft transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.has(d.key)}
                onChange={() => toggle(d.key)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-sm font-medium text-ink-2 flex-1">{d.label}</span>
              <span className="text-xs text-ink-4 bg-surface-2 px-2 py-0.5 rounded-full">
                {d.count} records
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-surface-2 border border-line rounded-xl p-4 flex items-center justify-between">
        <div className="text-sm text-ink-2">
          {selected.size} dataset{selected.size !== 1 ? 's' : ''} selected — each will be a
          separate sheet in the Excel workbook
        </div>
        <button
          onClick={handleExport}
          disabled={selected.size === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {exported ? <CheckCircle2 size={15} /> : <Download size={15} />}
          {exported ? 'Downloaded!' : 'Export to Excel'}
        </button>
      </div>
    </div>
  );
}
