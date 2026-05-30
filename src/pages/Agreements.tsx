import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAgreements, getAgreementById, getOperatorById, getCommitments,
  getInfrastructureObligationsByAgreement, getRiskFlagsByOperator,
  daysUntilExpiry, getDocumentAccessLogs
} from '@/services/dataService';
import { mutationService } from '@/services/mutationService';
import { useCountry } from '@/context/CountryContext';
import { useRole } from '@/hooks/useRole';
import { useDataStore, useStoreData } from '@/store/dataStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatusDropdown } from '@/components/shared/StatusDropdown';
import { EditModal } from '@/components/shared/EditModal';
import { MetricCard } from '@/components/shared/MetricCard';
import { formatDate, formatMillions, cn } from '@/lib/utils';
import { ArrowLeft, Search, AlertCircle, Pencil, Eye, Download, Share, FileBadge } from 'lucide-react';
import type { Agreement, AgreementStatus, ComplianceStatus, Commodity } from '@/data/types';

const COUNTRY_NAMES: Record<string, string> = { GIN: 'Guinea', GHA: 'Ghana', CIV: "Côte d'Ivoire" };

// ─── Shared edit form ─────────────────────────────────────────

type AgreementEditFormState = {
  description: string;
  royaltyRate: number;
  status: AgreementStatus;
  expiryDate: string;
};

function AgreementEditForm({
  form,
  onChange,
}: {
  form: AgreementEditFormState;
  onChange: (f: AgreementEditFormState) => void;
}) {
  const fieldClass =
    'w-full rounded-lg px-3 py-2 text-[13px] text-ink bg-surface border border-line outline-none ' +
    'transition-all focus:border-brand-600 focus:shadow-focus-ring';
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="agr-edit-desc" className="block text-xs font-medium text-ink-2 mb-1">Description</label>
        <input
          id="agr-edit-desc"
          type="text"
          value={form.description}
          onChange={e => onChange({ ...form, description: e.target.value })}
          data-focus-ring="custom"
          className={fieldClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="agr-edit-royalty" className="block text-xs font-medium text-ink-2 mb-1">Royalty Rate (%)</label>
          <input
            id="agr-edit-royalty"
            type="number"
            min={0}
            max={25}
            step={0.1}
            value={form.royaltyRate}
            onChange={e => onChange({ ...form, royaltyRate: Number(e.target.value) })}
            data-focus-ring="custom"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="agr-edit-status" className="block text-xs font-medium text-ink-2 mb-1">Status</label>
          <select
            id="agr-edit-status"
            value={form.status}
            onChange={e => onChange({ ...form, status: e.target.value as AgreementStatus })}
            data-focus-ring="custom"
            className={fieldClass}
          >
            <option value="active">Active</option>
            <option value="under-review">Under Review</option>
            <option value="lapsed">Lapsed</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="agr-edit-expiry" className="block text-xs font-medium text-ink-2 mb-1">Expiry Date</label>
        <input
          id="agr-edit-expiry"
          type="date"
          value={form.expiryDate}
          onChange={e => onChange({ ...form, expiryDate: e.target.value })}
          data-focus-ring="custom"
          className={fieldClass}
        />
      </div>
    </div>
  );
}

// ─── List view ───────────────────────────────────────────────

export function AgreementsPage() {
  const { selectedCountry } = useCountry();
  const navigate = useNavigate();
  const { isAdmin } = useRole();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgreementStatus | 'all'>('all');
  const [commodityFilter, setCommodityFilter] = useState<Commodity | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AgreementEditFormState>({
    description: '',
    royaltyRate: 0,
    status: 'active',
    expiryDate: '',
  });

  const countryId = selectedCountry === 'ALL' ? undefined : selectedCountry;
  const agreements = useStoreData(() => getAgreements(countryId), [countryId]);

  const commodities = useMemo(() => {
    const set = new Set(agreements.map(a => a.commodity));
    return Array.from(set).sort();
  }, [agreements]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return agreements.filter(a => {
      const op = getOperatorById(a.operatorId);
      const matchesSearch =
        !q ||
        a.id.toLowerCase().includes(q) ||
        op?.name.toLowerCase().includes(q) ||
        a.commodity.toLowerCase().includes(q) ||
        a.concesssionArea.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesCommodity = commodityFilter === 'all' || a.commodity === commodityFilter;
      return matchesSearch && matchesStatus && matchesCommodity;
    });
  }, [agreements, search, statusFilter, commodityFilter]);

  const active = agreements.filter(a => a.status === 'active').length;
  const underReview = agreements.filter(a => a.status === 'under-review').length;
  const expiringWithin90 = agreements.filter(
    a => a.status === 'active' && daysUntilExpiry(a.expiryDate) < 90 && daysUntilExpiry(a.expiryDate) > 0,
  ).length;

  const openEdit = (a: Agreement) => {
    setEditForm({ description: a.description, royaltyRate: a.royaltyRate, status: a.status, expiryDate: a.expiryDate });
    setEditingId(a.id);
  };

  const saveEdit = () => {
    if (editingId) {
      mutationService.updateAgreement(editingId, { ...editForm });
      setEditingId(null);
    }
  };

  const colHeaders = isAdmin
    ? ['ID', 'Operator', 'Country', 'Commodity', 'Royalty', 'Value', 'Signed', 'Expires', 'Status', '', '']
    : ['ID', 'Operator', 'Country', 'Commodity', 'Royalty', 'Value', 'Signed', 'Expires', 'Status', ''];

  return (
    <div>
      <PageHeader
        title="Mining Agreements"
        subtitle="Every contract the government has with mining companies, in one place."
        badge="M1 · Contract & Agreement Intelligence"
      />

      <ModuleIntro />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Agreements" value={agreements.length} accent="blue" hint="Every mining contract in the selected scope, regardless of status." />
        <MetricCard label="Active" value={active} accent="green" hint="Contracts currently in force." />
        <MetricCard label="Under Review" value={underReview} accent="amber" hint="Contracts being re-examined — for renewal, renegotiation, or a compliance question." />
        <MetricCard label="Expiring < 90 Days" value={expiringWithin90} accent={expiringWithin90 > 0 ? 'amber' : 'default'} hint="Contracts whose term ends within the next 90 days — plan renewals or renegotiation now." />
      </div>

      <div className="bg-surface rounded-xl border border-line shadow-card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-line-soft bg-surface-2">
          <div className="flex items-center gap-2 flex-1 min-w-48 rounded-lg border border-line bg-surface px-3 py-1.5 focus-within:border-brand-600 focus-within:shadow-focus-ring transition-all">
            <Search size={13} className="text-ink-4 shrink-0" aria-hidden />
            <label htmlFor="agr-search" className="sr-only">Search agreements</label>
            <input
              id="agr-search"
              type="search"
              placeholder="Search operator, location, ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-focus-ring="custom"
              className="text-[13px] outline-none w-full bg-transparent text-ink placeholder:text-ink-4"
            />
          </div>
          <label htmlFor="agr-status" className="sr-only">Filter by status</label>
          <select
            id="agr-status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as AgreementStatus | 'all')}
            className="text-[12px] rounded-lg px-2.5 py-1.5 border border-line bg-surface text-ink-3 outline-none focus:border-brand-600 focus:shadow-focus-ring transition-all"
            data-focus-ring="custom"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="under-review">Under Review</option>
            <option value="lapsed">Lapsed</option>
          </select>
          <label htmlFor="agr-commodity" className="sr-only">Filter by commodity</label>
          <select
            id="agr-commodity"
            value={commodityFilter}
            onChange={e => setCommodityFilter(e.target.value as Commodity | 'all')}
            className="text-[12px] rounded-lg px-2.5 py-1.5 border border-line bg-surface text-ink-3 outline-none focus:border-brand-600 focus:shadow-focus-ring transition-all"
            data-focus-ring="custom"
          >
            <option value="all">All Commodities</option>
            {commodities.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <span className="text-[11px] font-mono text-ink-4" aria-live="polite">{filtered.length} agreements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Concession and licensing agreements. Activate the View action in any row to open its detail page.
            </caption>
            <thead>
              <tr className="border-b border-line-soft bg-surface-2">
                {colHeaders.map((h, i) => (
                  <th
                    key={i}
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
                  <td colSpan={colHeaders.length} className="px-4 py-12 text-center text-[13px] text-ink-4">
                    No agreements match the current filters.
                  </td>
                </tr>
              )}
              {filtered.map((a) => {
                const op = getOperatorById(a.operatorId)!;
                const days = daysUntilExpiry(a.expiryDate);
                const isExpiringSoon = a.status === 'active' && days < 90 && days > 0;
                return (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/agreements/${a.id}`)}
                    className="cursor-pointer border-b border-line-soft transition-colors [&:nth-child(even)]:bg-surface-2 hover:bg-brand-600/[0.06]"
                    data-ai-entity={`agreement:${a.id}`}
                    data-ai-label={a.id}
                    data-ai-sub={`${op.name} · ${a.commodity} · ${a.royaltyRate}%`}
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-ink-4">{a.id}</td>
                    <td className="px-4 py-3 font-semibold text-[13px] whitespace-nowrap text-ink">{op.name}</td>
                    <td className="px-4 py-3 text-[13px] text-ink-3">{COUNTRY_NAMES[a.countryId]}</td>
                    <td className="px-4 py-3 capitalize text-[13px] text-ink-3">{a.commodity}</td>
                    <td className="px-4 py-3 tabular-nums text-[13px] text-ink-2">{a.royaltyRate}%</td>
                    <td className="px-4 py-3 tabular-nums text-[13px] text-ink-2">{formatMillions(a.contractValue * 1_000_000)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-[12px] text-ink-3">{formatDate(a.dateSigned)}</td>
                    <td className={cn('px-4 py-3 whitespace-nowrap text-[12px]', isExpiringSoon ? 'text-status-warning font-semibold' : 'text-ink-3')}>
                      {isExpiringSoon && <AlertCircle size={11} className="inline mr-1" aria-hidden />}
                      {formatDate(a.expiryDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge type="agreement" value={a.status} size="sm" />
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3" onClick={e => { e.stopPropagation(); openEdit(a); }}>
                        <button
                          aria-label={`Edit agreement ${a.id}`}
                          className="flex items-center gap-1 text-[11px] rounded px-1.5 py-0.5 text-ink-4 transition-colors hover:text-brand-600 hover:bg-brand-600/[0.08]"
                        >
                          <Pencil size={10} /> Edit
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/agreements/${a.id}`); }}
                        aria-label={`View agreement ${a.id}`}
                        className="text-[12px] font-semibold text-brand-600 hover:underline rounded"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <EditModal
        isOpen={editingId !== null}
        onOpenChange={open => { if (!open) setEditingId(null); }}
        title="Edit Agreement"
        onSave={saveEdit}
      >
        <AgreementEditForm form={editForm} onChange={setEditForm} />
      </EditModal>
    </div>
  );
}

// ─── Detail view ─────────────────────────────────────────────

export function AgreementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const _version = useDataStore(state => state.version);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<AgreementEditFormState>({
    description: '',
    royaltyRate: 0,
    status: 'active',
    expiryDate: '',
  });

  // Conditional return must come after all hooks
  const agreement = id ? getAgreementById(id) : undefined;
  void _version;

  if (!agreement) {
    return (
      <div role="status" className="bg-surface rounded-xl border border-line shadow-card p-10 text-center">
        <p className="text-[14px] font-semibold text-ink">Agreement not found</p>
        <p className="text-[12px] mt-1 text-ink-3">This agreement may have been removed from the registry.</p>
        <button
          onClick={() => navigate('/agreements')}
          className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:underline"
        >
          <ArrowLeft size={13} /> Back to Agreements
        </button>
      </div>
    );
  }

  const operator = getOperatorById(agreement.operatorId)!;
  const commitments = getCommitments(agreement.id);
  const infraObligations = getInfrastructureObligationsByAgreement(agreement.id);
  const operatorFlags = getRiskFlagsByOperator(agreement.operatorId)
    .filter(f => f.agreementId === agreement.id && f.status !== 'resolved');
    
  const accessLogs = getDocumentAccessLogs({ agreementId: agreement.id });

  const days = daysUntilExpiry(agreement.expiryDate);
  const isExpiringSoon = agreement.status === 'active' && days < 90 && days > 0;

  const byType = commitments.reduce<Record<string, typeof commitments>>((acc, c) => {
    acc[c.type] = [...(acc[c.type] || []), c];
    return acc;
  }, {});

  const STATUS_DOT: Record<string, string> = {
    met: '#059669',
    'on-track': '#16a34a',
    'at-risk': '#D97706',
    breached: '#DC2626',
  };

  const openEdit = () => {
    setEditForm({
      description: agreement.description,
      royaltyRate: agreement.royaltyRate,
      status: agreement.status,
      expiryDate: agreement.expiryDate,
    });
    setEditOpen(true);
  };

  return (
    <div>
      <button
        onClick={() => navigate('/agreements')}
        className="flex items-center gap-1.5 text-[13px] font-medium mb-4 text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to Agreements
      </button>

      {/* Header */}
      <div className="bg-surface rounded-xl border border-line shadow-card p-5 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] font-mono mb-1 text-ink-4">{agreement.id}</div>
            <h1 className="text-[16px] font-bold text-ink">{agreement.description}</h1>
            <div className="text-[13px] mt-0.5 text-ink-3">{agreement.concesssionArea}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge type="agreement" value={agreement.status} />
            {isExpiringSoon && (
              <span className="text-[12px] font-semibold rounded-md px-2 py-0.5 text-amber-800 bg-amber-50 border border-amber-200">
                Expires in {days} days
              </span>
            )}
            {isAdmin && (
              <button
                onClick={openEdit}
                className="flex items-center gap-1.5 text-[12px] rounded-lg px-2.5 py-1 text-ink-3 bg-surface-2 border border-line transition-colors hover:text-brand-600 hover:bg-brand-50 hover:border-brand-200"
              >
                <Pencil size={11} /> Edit Agreement
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-5 pt-5 border-t border-line-soft">
          {[
            { label: 'Operator', value: operator.name },
            { label: 'Commodity', value: agreement.commodity, capitalize: true },
            { label: 'Royalty Rate', value: `${agreement.royaltyRate}%` },
            { label: 'Contract Value', value: formatMillions(agreement.contractValue * 1_000_000) },
            { label: 'License Type', value: agreement.licenseType },
            { label: 'Pricing Structure', value: agreement.pricingStructure },
            { label: 'Signed', value: formatDate(agreement.dateSigned) },
            { label: 'Expiry', value: formatDate(agreement.expiryDate), amber: isExpiringSoon },
          ].map(f => (
            <div key={f.label}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-ink-4">{f.label}</div>
              <div className={cn('text-[13px] font-semibold', f.capitalize ? 'capitalize' : '', f.amber ? 'text-status-warning' : 'text-ink')}>
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open flags banner */}
      {operatorFlags.length > 0 && (
        <div role="alert" className="rounded-xl p-4 mb-4 bg-red-50 border border-red-200">
          <div className="text-[13px] font-semibold mb-2 text-status-danger">
            {operatorFlags.length} open risk flag{operatorFlags.length > 1 ? 's' : ''} on this agreement
          </div>
          {operatorFlags.map(f => (
            <div key={f.id} className="flex items-start gap-2 text-[12px] mb-1 text-ink-2">
              <StatusBadge type="severity" value={f.severity} size="sm" />
              <span>{f.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Commitments by type */}
      <div className="bg-surface rounded-xl border border-line shadow-card mb-4 overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between border-b border-line-soft bg-surface-2">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">
            Commitments &amp; Obligations
          </h2>
          {isAdmin && (
            <span className="text-[11px] text-ink-4">Admins can change status via dropdown</span>
          )}
        </div>
        {Object.entries(byType).map(([type, cmts]) => (
          <div key={type} className="border-b border-line-soft last:border-b-0">
            <div className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest capitalize bg-surface-2 text-ink-3">
              {type.replace('-', ' ')}
            </div>
            {cmts.map(cmt => (
              <div key={cmt.id} className="px-5 py-3 flex items-start gap-3 bg-surface hover:bg-surface-2 transition-colors">
                <span
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ background: STATUS_DOT[cmt.status] ?? '#8AA396' }}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-ink-2">{cmt.description}</div>
                  <div className="text-[11px] mt-0.5 text-ink-4">
                    Target: {cmt.targetValue.toLocaleString()} {cmt.targetUnit}
                    · Due: {formatDate(cmt.dueDate)}
                  </div>
                </div>
                <StatusDropdown
                  type="compliance"
                  value={cmt.status}
                  size="sm"
                  onChange={isAdmin
                    ? newStatus => mutationService.updateCommitmentStatus(cmt.id, newStatus as ComplianceStatus)
                    : undefined}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Infrastructure obligations */}
      {infraObligations.length > 0 && (
        <div className="bg-surface rounded-xl border border-line shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-line-soft bg-surface-2">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">
              Infrastructure Obligations
            </h2>
          </div>
          <div className="divide-y divide-line-soft">
            {infraObligations.map(io => {
              const pct = Math.min(io.actualProgress, 100);
              const barColor = io.actualProgress >= 100 ? '#047857' : io.status === 'at-risk' ? '#B45309' : '#B91C1C';
              return (
              <div key={io.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="text-[13px] font-semibold text-ink">{io.projectName}</div>
                  <StatusBadge type="compliance" value={io.status} size="sm" />
                </div>
                <div className="text-[12px] mb-2.5 text-ink-3">
                  Type: {io.projectType} · Due: {formatDate(io.committedCompletionDate)}
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden bg-line-soft"
                    role="progressbar"
                    aria-valuenow={io.actualProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${io.projectName} completion progress`}
                  >
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <span className="text-[12px] font-bold tabular-nums w-10 text-right text-ink">
                    {io.actualProgress}%
                  </span>
                </div>
                {isAdmin && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <label htmlFor={`progress-${io.id}`} className="text-[11px] shrink-0 text-ink-3">Update progress:</label>
                    <input
                      id={`progress-${io.id}`}
                      type="range"
                      min={0}
                      max={100}
                      value={io.actualProgress}
                      onChange={e => mutationService.updateInfrastructureProgress(io.id, Number(e.target.value))}
                      className="flex-1 accent-brand-600"
                    />
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Virtual Data Room Audit Trail */}
      <div className="bg-surface rounded-xl border border-line shadow-card overflow-hidden mt-4">
        <div className="px-5 py-3 border-b border-line-soft bg-surface-2 flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-2">Immutable Document Audit Trail (VDR)</h2>
            <p className="text-[11px] mt-0.5 text-ink-4">Track internal and external data room access to contract documents.</p>
          </div>
          <FileBadge size={16} className="text-brand-600" />
        </div>
        
        <div className="divide-y divide-line-soft">
          {accessLogs.length === 0 ? (
            <div className="p-8 text-center text-ink-4 text-[13px]">No access logs found for this agreement.</div>
          ) : (
            accessLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-surface-2 transition-colors flex items-center gap-4">
                <div className="shrink-0 p-2 rounded-lg bg-surface-2 border border-line">
                  {log.action === 'viewed' && <Eye size={14} className="text-brand-600" />}
                  {log.action === 'downloaded' && <Download size={14} className="text-status-warning" />}
                  {log.action === 'modified' && <Pencil size={14} className="text-primary" />}
                  {log.action === 'uploaded' && <Share size={14} className="text-ink-4" />}
                  {log.action === 'deleted' && <AlertCircle size={14} className="text-status-danger" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-ink flex items-center gap-2">
                    {log.documentName}
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm bg-line-soft text-ink-3">
                      {log.documentVersion}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-4 mt-0.5 flex gap-2">
                    <span>{log.userName} · {log.userRole}</span>
                    <span aria-hidden>·</span>
                    <span>{formatDate(log.timestamp)}</span>
                    <span aria-hidden>·</span>
                    <span className="font-mono text-[9px]">{log.ipAddress}</span>
                  </div>
                </div>
                
                <div className="shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink-4 mb-0.5 text-right">Verification Hash</div>
                  <div className="text-[11px] font-mono text-ink-2 bg-surface-2 px-2 py-0.5 rounded border border-line-soft">
                    {log.hash}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Edit modal */}
      <EditModal
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Agreement"
        onSave={() => { mutationService.updateAgreement(agreement.id, { ...editForm }); setEditOpen(false); }}
      >
        <AgreementEditForm form={editForm} onChange={setEditForm} />
      </EditModal>
    </div>
  );
}

export type { Agreement };
