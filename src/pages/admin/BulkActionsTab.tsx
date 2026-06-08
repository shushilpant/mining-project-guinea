import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { mutationService } from '@/services/mutationService';
import { DB, getRiskFlags } from '@/services/dataService';
import { useDataStore } from '@/store/dataStore';
import type { RiskFlagStatus, AgreementStatus } from '@/data/types';
import { AGREEMENT_STATUSES } from '@/pages/admin/shared';

export function BulkActionsTab() {
  useDataStore(s => s.version); // subscribe to data changes — re-render on mutation
  const allFlags = getRiskFlags();
  const allAgreements = DB.agreements;

  const [mode, setMode] = useState<'flags' | 'agreements'>('flags');
  const [sevFilter, setSevFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');
  const [agrStatusFilter, setAgrStatusFilter] = useState('all');
  const [selectedFlags, setSelectedFlags] = useState<Set<string>>(new Set());
  const [selectedAgrs, setSelectedAgrs] = useState<Set<string>>(new Set());
  const [bulkFlagStatus, setBulkFlagStatus] = useState<RiskFlagStatus>('acknowledged');
  const [bulkAgrStatus, setBulkAgrStatus] = useState<AgreementStatus>('under-review');
  const [successMsg, setSuccessMsg] = useState('');

  const filteredFlags = allFlags.filter(
    f =>
      (sevFilter === 'all' || f.severity === sevFilter) &&
      (statusFilter === 'all' || f.status === statusFilter),
  );
  const filteredAgrs = allAgreements.filter(
    a => agrStatusFilter === 'all' || a.status === agrStatusFilter,
  );

  const SEV_COLORS: Record<string, string> = {
    critical: 'text-red-700 bg-red-50',
    high: 'text-orange-700 bg-orange-50',
    medium: 'text-yellow-700 bg-yellow-50',
    low: 'text-ink-2 bg-surface-2',
  };

  const applyFlagBulk = () => {
    const count = mutationService.bulkUpdateRiskFlagStatus([...selectedFlags], bulkFlagStatus);
    setSuccessMsg(`${count} flag${count !== 1 ? 's' : ''} updated to "${bulkFlagStatus}".`);
    setSelectedFlags(new Set());
  };

  const applyAgrBulk = () => {
    const count = mutationService.bulkUpdateAgreementStatus([...selectedAgrs], bulkAgrStatus);
    setSuccessMsg(`${count} agreement${count !== 1 ? 's' : ''} status updated to "${bulkAgrStatus}".`);
    setSelectedAgrs(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(['flags', 'agreements'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setSuccessMsg(''); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${
              mode === m
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-line text-ink-2 hover:bg-surface-2'
            }`}
          >
            {m === 'flags' ? 'Risk Flags' : 'Agreements'}
          </button>
        ))}
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <CheckCircle2 size={14} /> {successMsg}
        </div>
      )}

      {mode === 'flags' && (
        <>
          {/* Flag filters */}
          <div className="bg-white border border-line rounded-xl p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-3">Severity:</span>
              {['all', 'critical', 'high', 'medium', 'low'].map(s => (
                <button
                  key={s}
                  onClick={() => setSevFilter(s)}
                  className={`px-2.5 py-1 text-xs rounded font-medium capitalize ${sevFilter === s ? 'bg-forest-800 text-white' : 'text-ink-3 hover:bg-surface-2'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 border-l border-line pl-4">
              <span className="text-xs font-medium text-ink-3">Status:</span>
              {['all', 'open', 'acknowledged', 'resolved'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 text-xs rounded font-medium capitalize ${statusFilter === s ? 'bg-forest-800 text-white' : 'text-ink-3 hover:bg-surface-2'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-ink-4">{filteredFlags.length} flags</span>
          </div>

          {/* Bulk action bar */}
          {selectedFlags.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
              <span className="text-sm font-semibold text-blue-800">
                {selectedFlags.size} selected
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-700">Set to:</span>
                <select
                  value={bulkFlagStatus}
                  onChange={e => setBulkFlagStatus(e.target.value as RiskFlagStatus)}
                  className="text-xs border border-blue-300 rounded px-2 py-1.5 bg-white text-ink-2"
                >
                  <option value="acknowledged">acknowledged</option>
                  <option value="resolved">resolved</option>
                  <option value="open">open</option>
                </select>
              </div>
              <button
                onClick={applyFlagBulk}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Apply
              </button>
              <button
                onClick={() => setSelectedFlags(new Set())}
                className="ml-auto text-xs text-blue-600 hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          {/* Flags table */}
          <div className="bg-white border border-line rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-line">
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={filteredFlags.length > 0 && selectedFlags.size === filteredFlags.length}
                      onChange={() =>
                        setSelectedFlags(prev =>
                          prev.size === filteredFlags.length
                            ? new Set()
                            : new Set(filteredFlags.map(f => f.id)),
                        )
                      }
                      className="w-4 h-4 accent-blue-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-2">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-2">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-2">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-2">Triggered</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-ink-4 text-sm">
                      No flags match the current filters
                    </td>
                  </tr>
                ) : (
                  filteredFlags.slice(0, 50).map(flag => (
                    <tr
                      key={flag.id}
                      className={`border-b border-line-soft hover:bg-surface-2 ${selectedFlags.has(flag.id) ? 'bg-blue-50/40' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedFlags.has(flag.id)}
                          onChange={() =>
                            setSelectedFlags(prev => {
                              const next = new Set(prev);
                              if (next.has(flag.id)) next.delete(flag.id); else next.add(flag.id);
                              return next;
                            })
                          }
                          className="w-4 h-4 accent-blue-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${SEV_COLORS[flag.severity] ?? ''}`}
                        >
                          {flag.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-2 max-w-xs truncate text-xs">
                        {flag.description}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs capitalize font-medium ${flag.status === 'open' ? 'text-red-600' : flag.status === 'acknowledged' ? 'text-amber-600' : 'text-green-600'}`}
                        >
                          {flag.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-3">
                        {flag.triggeredDate?.slice(0, 10)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {filteredFlags.length > 50 && (
              <div className="px-4 py-2 bg-surface-2 text-xs text-ink-3 border-t border-line">
                Showing 50 of {filteredFlags.length} flags
              </div>
            )}
          </div>
        </>
      )}

      {mode === 'agreements' && (
        <>
          {/* Agreement filters */}
          <div className="bg-white border border-line rounded-xl p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-3">Status:</span>
              {['all', 'active', 'lapsed', 'under-review'].map(s => (
                <button
                  key={s}
                  onClick={() => setAgrStatusFilter(s)}
                  className={`px-2.5 py-1 text-xs rounded font-medium capitalize ${agrStatusFilter === s ? 'bg-forest-800 text-white' : 'text-ink-3 hover:bg-surface-2'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-ink-4">{filteredAgrs.length} agreements</span>
          </div>

          {selectedAgrs.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
              <span className="text-sm font-semibold text-blue-800">
                {selectedAgrs.size} selected
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-700">Set status to:</span>
                <select
                  value={bulkAgrStatus}
                  onChange={e => setBulkAgrStatus(e.target.value as AgreementStatus)}
                  className="text-xs border border-blue-300 rounded px-2 py-1.5 bg-white text-ink-2"
                >
                  {AGREEMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button
                onClick={applyAgrBulk}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Apply
              </button>
              <button
                onClick={() => setSelectedAgrs(new Set())}
                className="ml-auto text-xs text-blue-600 hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          <div className="bg-white border border-line rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-line">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={filteredAgrs.length > 0 && selectedAgrs.size === filteredAgrs.length}
                      onChange={() =>
                        setSelectedAgrs(prev =>
                          prev.size === filteredAgrs.length
                            ? new Set()
                            : new Set(filteredAgrs.map(a => a.id)),
                        )
                      }
                      className="w-4 h-4 accent-blue-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-2">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-2">Commodity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-2">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-2">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-2">Royalty</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgrs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-ink-4 text-sm">
                      No agreements match the current filter
                    </td>
                  </tr>
                ) : (
                  filteredAgrs.slice(0, 50).map(agr => (
                    <tr
                      key={agr.id}
                      className={`border-b border-line-soft hover:bg-surface-2 ${selectedAgrs.has(agr.id) ? 'bg-blue-50/40' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedAgrs.has(agr.id)}
                          onChange={() =>
                            setSelectedAgrs(prev => {
                              const next = new Set(prev);
                              if (next.has(agr.id)) next.delete(agr.id); else next.add(agr.id);
                              return next;
                            })
                          }
                          className="w-4 h-4 accent-blue-600"
                        />
                      </td>
                      <td className="px-4 py-3 text-ink-2 max-w-xs truncate text-xs">
                        {agr.description}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-2 capitalize">{agr.commodity}</td>
                      <td className="px-4 py-3 text-xs text-ink-2">{agr.countryId}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs capitalize font-medium ${agr.status === 'active' ? 'text-green-600' : agr.status === 'lapsed' ? 'text-red-500' : 'text-amber-600'}`}
                        >
                          {agr.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-2">{agr.royaltyRate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
