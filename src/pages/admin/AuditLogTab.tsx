import { useState } from 'react';
import { History } from 'lucide-react';
import { useAuditStore, type AuditEntity } from '@/store/auditStore';

export function AuditLogTab() {
  const { entries, clear } = useAuditStore();
  const [entityFilter, setEntityFilter] = useState<AuditEntity | 'all'>('all');

  const filtered =
    entityFilter === 'all' ? entries : entries.filter(e => e.entity === entityFilter);

  const ACTION_COLORS: Record<string, string> = {
    create: 'text-green-700 bg-green-50',
    update: 'text-blue-700 bg-blue-50',
    import: 'text-purple-700 bg-purple-50',
    bulk_update: 'text-orange-700 bg-orange-50',
  };

  const ENTITY_FILTERS = [
    'all', 'agreement', 'operator', 'commitment', 'risk_flag', 'infrastructure', 'performance_record',
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-ink-3 mr-1">Filter:</span>
          {ENTITY_FILTERS.map(e => (
            <button
              key={e}
              onClick={() => setEntityFilter(e)}
              className={`px-2.5 py-1 text-xs rounded font-medium capitalize ${entityFilter === e ? 'bg-forest-800 text-white' : 'text-ink-3 hover:bg-surface-2'}`}
            >
              {e.replace('_', ' ')}
            </button>
          ))}
        </div>
        {entries.length > 0 && (
          <button
            onClick={clear}
            className="text-xs text-ink-4 hover:text-red-600 transition-colors"
          >
            Clear log
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-line rounded-xl p-14 text-center">
          <History size={36} className="mx-auto mb-3 text-line-strong" />
          <p className="text-ink-3 text-sm font-medium">No changes recorded this session</p>
          <p className="text-ink-4 text-xs mt-1">
            Admin actions — edits, imports, creates, bulk updates — will appear here
          </p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-surface-2 border-b border-line text-xs text-ink-3">
            {filtered.length} change{filtered.length !== 1 ? 's' : ''} this session
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface-2 border-b border-line">
                <th className="px-4 py-2.5 text-left font-semibold text-ink-2">Time</th>
                <th className="px-4 py-2.5 text-left font-semibold text-ink-2">Action</th>
                <th className="px-4 py-2.5 text-left font-semibold text-ink-2">Entity</th>
                <th className="px-4 py-2.5 text-left font-semibold text-ink-2">Record</th>
                <th className="px-4 py-2.5 text-left font-semibold text-ink-2">Field / Detail</th>
                <th className="px-4 py-2.5 text-left font-semibold text-ink-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id} className="border-b border-line-soft hover:bg-surface-2">
                  <td className="px-4 py-2.5 text-ink-3 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium capitalize ${ACTION_COLORS[entry.action] ?? 'text-ink-2 bg-surface-2'}`}
                    >
                      {entry.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-2 capitalize">
                    {entry.entity.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-2.5 text-ink-2 max-w-[180px] truncate">
                    {entry.entityLabel}
                  </td>
                  <td className="px-4 py-2.5 text-ink-3">
                    {entry.field ?? entry.details ?? (entry.count != null ? `${entry.count} records` : '')}
                  </td>
                  <td className="px-4 py-2.5">
                    {entry.oldValue !== undefined ? (
                      <span>
                        <span className="line-through text-red-400">{entry.oldValue}</span>
                        {' → '}
                        <span className="text-green-600 font-medium">{entry.newValue}</span>
                      </span>
                    ) : entry.newValue != null ? (
                      <span className="text-green-600 font-medium">{entry.newValue}</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
