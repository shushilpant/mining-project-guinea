import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  Download,
  Plus,
  History,
  Zap,
  FileText,
  Check,
  AlertCircle,
  Shield,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { mutationService } from '@/services/mutationService';
import { sanitizeRecords, sanitizeMatrix } from '@/lib/exportSafety';
import {
  validateImportFile,
  isForbiddenKey,
  clampCell,
  MAX_IMPORT_ROWS,
  MAX_HEADER_COLS,
} from '@/lib/importSafety';
import { useAuditStore, type AuditEntity } from '@/store/auditStore';
import { useRole } from '@/hooks/useRole';
import {
  useAISettingsStore,
  LOCAL_MODELS,
  POLLINATIONS_MODELS,
  OPENROUTER_MODELS,
  DEFAULT_LOCAL_BASE_URL,
  type AIProvider,
} from '@/store/aiSettingsStore';
import { testProvider } from '@/services/aiService';
import { DB, getRiskFlags, getOperators, getCountries } from '@/services/dataService';
import { useDataStore } from '@/store/dataStore';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import type {
  Agreement,
  Operator,
  Commitment,
  PerformanceRecord,
  Commodity,
  CommitmentType,
  ComplianceStatus,
  RiskFlagStatus,
  AgreementStatus,
} from '@/data/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const COMMODITIES: Commodity[] = [
  'bauxite', 'gold', 'iron ore', 'manganese', 'nickel', 'diamonds', 'chromite',
];
const COMPLIANCE_STATUSES: ComplianceStatus[] = ['on-track', 'at-risk', 'breached', 'met'];
const AGREEMENT_STATUSES: AgreementStatus[] = ['active', 'lapsed', 'under-review'];

type ImportType = 'agreements' | 'operators' | 'commitments' | 'performance';

const TEMPLATES: Record<ImportType, { headers: string[]; sample: Record<string, string | number> }> = {
  agreements: {
    headers: [
      'operatorId', 'countryId', 'commodity', 'licenseType', 'dateSigned',
      'expiryDate', 'status', 'royaltyRate', 'pricingStructure', 'contractValue',
      'description', 'concessionArea', 'lat', 'lng',
    ],
    sample: {
      operatorId: 'OP-001', countryId: 'GIN', commodity: 'bauxite',
      licenseType: 'Exploitation', dateSigned: '2020-01-15', expiryDate: '2030-01-15',
      status: 'active', royaltyRate: 8.5, pricingStructure: 'spot price',
      contractValue: 450, description: 'Guinea Bauxite Mining Agreement',
      concessionArea: 'Kindia Prefecture', lat: 10.45, lng: -11.23,
    },
  },
  operators: {
    headers: [
      'name', 'parentCompany', 'countryOfRegistration', 'countryIds',
      'riskScore', 'complianceStatus',
    ],
    sample: {
      name: 'West Africa Mining Corp', parentCompany: 'Global Resources Ltd',
      countryOfRegistration: 'Gibraltar', countryIds: 'GIN|GHA',
      riskScore: 25, complianceStatus: 'on-track',
    },
  },
  commitments: {
    headers: [
      'agreementId', 'type', 'description', 'targetValue', 'targetUnit', 'dueDate', 'status',
    ],
    sample: {
      agreementId: 'AGR-001', type: 'production',
      description: 'Annual ore production target', targetValue: 500000,
      targetUnit: 'tonnes', dueDate: '2025-12-31', status: 'on-track',
    },
  },
  performance: {
    headers: [
      'commitmentId', 'reportingPeriod', 'actualValue', 'actualUnit', 'dateRecorded', 'source',
    ],
    sample: {
      commitmentId: 'CMT-001', reportingPeriod: '2024-Q1', actualValue: 450000,
      actualUnit: 'tonnes', dateRecorded: '2024-04-15', source: 'Operator self-report',
    },
  },
};

const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inputCls =
  'w-full border border-line rounded-lg px-3 py-2 text-sm text-ink-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-ink-2 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminPage() {
  const { isAdmin } = useRole();
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'create' | 'bulk' | 'audit' | 'ai'>(
    'import',
  );
  // Subscribe so tab content re-renders on data changes
  const refresh = useDataStore(s => s.version);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto mb-3 text-line-strong" size={48} />
          <p className="text-ink-2 font-medium">Admin access required</p>
          <p className="text-xs text-ink-4 mt-1">Sign in as an administrator to access this page</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'import' as const, label: 'Import Data', icon: Upload },
    { id: 'export' as const, label: 'Export Data', icon: Download },
    { id: 'create' as const, label: 'Create Records', icon: Plus },
    { id: 'bulk' as const, label: 'Bulk Actions', icon: Zap },
    { id: 'audit' as const, label: 'Audit Log', icon: History },
    { id: 'ai' as const, label: 'AI Assistant', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3.5">
          <span className="w-1 h-9 rounded-full shrink-0 mt-0.5 bg-gold-500" aria-hidden />
          <div>
            <h1 className="text-xl font-bold text-ink">Settings &amp; Data</h1>
            <p className="text-sm text-ink-3 mt-0.5">
              Manage the underlying data, rules, and the AI assistant.
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-200">
          Administrator Session
        </span>
      </div>

      <ModuleIntro />

      {/* Tab bar */}
      <div className="border-b border-line">
        <nav className="flex gap-0.5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-ink-3 hover:text-ink-2 hover:border-line-strong'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div key={refresh}>
        {activeTab === 'import' && <ImportTab />}
        {activeTab === 'export' && <ExportTab />}
        {activeTab === 'create' && <CreateTab />}
        {activeTab === 'bulk' && <BulkActionsTab />}
        {activeTab === 'audit' && <AuditLogTab />}
        {activeTab === 'ai' && <AISettingsTab />}
      </div>
    </div>
  );
}

// ─── Import Tab ───────────────────────────────────────────────────────────────

function ImportTab() {
  const [importType, setImportType] = useState<ImportType>('agreements');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setRows([]);
    setHeaders([]);
    setErrors([]);
    setSuccess('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadTemplate = () => {
    const tpl = TEMPLATES[importType];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sanitizeRecords([tpl.sample]), { header: tpl.headers });
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `peb0526_template_${importType}.xlsx`);
  };

  const parseFile = (file: File) => {
    reset();
    const fileError = validateImportFile(file);
    if (fileError) {
      setErrors([fileError]);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setErrors(['Could not read the file. Please try again.']);
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        // dense:true avoids building a sparse object keyed by cell address;
        // sheetRows caps how many rows the parser will even materialize.
        const wb = XLSX.read(data, { type: 'array', dense: true, sheetRows: MAX_IMPORT_ROWS + 1 });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
        if (raw.length < 2) {
          setErrors(['File contains no data rows.']);
          return;
        }
        // Drop prototype-pollution header keys and bound column/row counts before
        // they are ever used to build objects.
        const hdrs = (raw[0] as unknown[])
          .slice(0, MAX_HEADER_COLS)
          .map(h => String(h ?? '').trim())
          .filter(h => !isForbiddenKey(h));
        const dataRows = raw
          .slice(1, MAX_IMPORT_ROWS + 1)
          .filter(row => (row as unknown[]).some(cell => cell !== '' && cell != null))
          .map(row =>
            Object.fromEntries(
              hdrs.map((h, i) => [h, clampCell((row as unknown[])[i] ?? '')]),
            ),
          );
        setHeaders(hdrs);
        setRows(dataRows);
      } catch {
        setErrors(['Failed to parse file. Ensure it is a valid .xlsx, .xls, or .csv.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirm = () => {
    const tpl = TEMPLATES[importType];
    const missing = tpl.headers.filter(h => !headers.includes(h));
    if (missing.length > 0) {
      setErrors([`Missing required columns: ${missing.join(', ')}`]);
      return;
    }
    if (rows.length === 0) {
      setErrors(['No data rows found.']);
      return;
    }

    if (importType === 'agreements') {
      const records: Agreement[] = rows.map(r => ({
        id: genId('agr'),
        operatorId: String(r.operatorId ?? ''),
        countryId: String(r.countryId ?? ''),
        commodity: String(r.commodity ?? 'gold') as Commodity,
        licenseType: String(r.licenseType ?? ''),
        dateSigned: String(r.dateSigned ?? ''),
        expiryDate: String(r.expiryDate ?? ''),
        status: String(r.status ?? 'active') as AgreementStatus,
        royaltyRate: Number(r.royaltyRate) || 0,
        pricingStructure: String(r.pricingStructure ?? ''),
        contractValue: Number(r.contractValue) || 0,
        description: String(r.description ?? ''),
        concesssionArea: String(r.concessionArea ?? ''),
        coordinates: [Number(r.lat) || 0, Number(r.lng) || 0],
      }));
      mutationService.importBatch({ agreements: records });
      setSuccess(`${records.length} agreement${records.length !== 1 ? 's' : ''} imported.`);
    } else if (importType === 'operators') {
      const records: Operator[] = rows.map(r => ({
        id: genId('op'),
        name: String(r.name ?? ''),
        parentCompany: String(r.parentCompany ?? ''),
        countryOfRegistration: String(r.countryOfRegistration ?? ''),
        countryIds: String(r.countryIds ?? '').split('|').filter(Boolean),
        riskScore: Number(r.riskScore) || 0,
        complianceStatus: String(r.complianceStatus ?? 'on-track') as ComplianceStatus,
        ultimateBeneficialOwners: [],
        ownershipChanged: false,
      }));
      mutationService.importBatch({ operators: records });
      setSuccess(`${records.length} operator${records.length !== 1 ? 's' : ''} imported.`);
    } else if (importType === 'commitments') {
      const records: Commitment[] = rows.map(r => ({
        id: genId('cmt'),
        agreementId: String(r.agreementId ?? ''),
        type: String(r.type ?? 'production') as CommitmentType,
        description: String(r.description ?? ''),
        targetValue: Number(r.targetValue) || 0,
        targetUnit: String(r.targetUnit ?? ''),
        dueDate: String(r.dueDate ?? ''),
        status: String(r.status ?? 'on-track') as ComplianceStatus,
      }));
      mutationService.importBatch({ commitments: records });
      setSuccess(`${records.length} commitment${records.length !== 1 ? 's' : ''} imported.`);
    } else {
      const records: PerformanceRecord[] = rows.map(r => ({
        id: genId('pr'),
        commitmentId: String(r.commitmentId ?? ''),
        reportingPeriod: String(r.reportingPeriod ?? ''),
        actualValue: Number(r.actualValue) || 0,
        actualUnit: String(r.actualUnit ?? ''),
        dateRecorded: String(r.dateRecorded ?? ''),
        source: String(r.source ?? ''),
      }));
      mutationService.importBatch({ performanceRecords: records });
      setSuccess(`${records.length} performance record${records.length !== 1 ? 's' : ''} imported.`);
    }

    setRows([]);
    setHeaders([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const TYPE_LABELS: Record<ImportType, string> = {
    agreements: 'Agreements',
    operators: 'Operators',
    commitments: 'Commitments',
    performance: 'Performance Records',
  };

  return (
    <div className="space-y-5">
      {/* Step 1 */}
      <div className="bg-white border border-line rounded-xl p-5">
        <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-3">
          Step 1 — Select data type
        </p>
        <div className="grid grid-cols-4 gap-3">
          {(Object.keys(TYPE_LABELS) as ImportType[]).map(type => (
            <button
              key={type}
              onClick={() => { setImportType(type); reset(); }}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                importType === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-line text-ink-2 hover:border-line-strong hover:bg-surface-2'
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-white border border-line rounded-xl p-5">
        <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-1">
          Step 2 — Download template (optional)
        </p>
        <p className="text-xs text-ink-3 mb-3">
          Get a pre-formatted Excel template with the correct column headers and a sample row.
        </p>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-ink-2 bg-surface-2 hover:bg-line rounded-lg transition-colors"
        >
          <FileText size={14} />
          Download template — {TYPE_LABELS[importType].toLowerCase()}.xlsx
        </button>
        <p className="mt-3 text-xs text-ink-3">
          <span className="font-medium text-ink-2">Required columns: </span>
          {TEMPLATES[importType].headers.join(', ')}
        </p>
      </div>

      {/* Step 3 */}
      <div className="bg-white border border-line rounded-xl p-5">
        <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-3">
          Step 3 — Upload your file
        </p>
        <div
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) parseFile(f); }}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-line-strong rounded-xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/20 transition-colors cursor-pointer"
        >
          <Upload size={28} className="mx-auto mb-2 text-ink-4" />
          <p className="text-sm font-medium text-ink-2">
            Drop your file here, or click to browse
          </p>
          <p className="text-xs text-ink-4 mt-1">Accepts .xlsx, .xls, .csv</p>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) parseFile(f); }}
          />
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-1">
            <AlertCircle size={14} /> Import errors
          </div>
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-600">{err}</p>
          ))}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700 text-sm font-medium">
          <CheckCircle2 size={15} />
          {success} Data is now available in the system.
        </div>
      )}

      {/* Step 4: Preview */}
      {rows.length > 0 && (
        <div className="bg-white border border-line rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider">
                Step 4 — Preview & confirm
              </p>
              <p className="text-sm text-ink-2 mt-0.5">
                {rows.length} row{rows.length !== 1 ? 's' : ''} parsed from file
                {rows.length > 10 && ` — showing first 10`}
              </p>
            </div>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Check size={14} />
              Confirm import ({rows.length} rows)
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-surface-2">
                  {headers.map(h => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left font-semibold text-ink-2 border-b border-line whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-line-soft hover:bg-surface-2">
                    {headers.map(h => (
                      <td
                        key={h}
                        className="px-3 py-2 text-ink-2 whitespace-nowrap max-w-[160px] truncate"
                      >
                        {String(row[h] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 && (
            <p className="text-xs text-ink-4 mt-2">
              + {rows.length - 10} more rows not shown in preview
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Export Tab ───────────────────────────────────────────────────────────────

function ExportTab() {
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

// ─── Create Records Tab ───────────────────────────────────────────────────────

function CreateTab() {
  const [mode, setMode] = useState<'agreement' | 'operator'>('agreement');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['agreement', 'operator'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${
              mode === m
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-line text-ink-2 hover:bg-surface-2'
            }`}
          >
            New {m}
          </button>
        ))}
      </div>
      {mode === 'agreement' ? <NewAgreementForm /> : <NewOperatorForm />}
    </div>
  );
}

function NewAgreementForm() {
  const operators = getOperators();
  const countries = getCountries();
  type F = {
    operatorId: string; countryId: string; commodity: Commodity; licenseType: string;
    dateSigned: string; expiryDate: string; status: AgreementStatus; royaltyRate: string;
    pricingStructure: string; contractValue: string; description: string;
    concessionArea: string; lat: string; lng: string;
  };
  const [f, setF] = useState<F>({
    operatorId: operators[0]?.id ?? '',
    countryId: 'GIN',
    commodity: 'gold',
    licenseType: 'Exploitation',
    dateSigned: '',
    expiryDate: '',
    status: 'active',
    royaltyRate: '5',
    pricingStructure: 'spot price',
    contractValue: '100',
    description: '',
    concessionArea: '',
    lat: '',
    lng: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const set = (k: keyof F, v: string) => setF(prev => ({ ...prev, [k]: v }));

  const handleSubmit = () => {
    if (!f.operatorId || !f.countryId || !f.description || !f.dateSigned || !f.expiryDate) {
      setError('Operator, country, description, and both dates are required.');
      return;
    }
    const created = mutationService.createAgreement({
      operatorId: f.operatorId,
      countryId: f.countryId,
      commodity: f.commodity,
      licenseType: f.licenseType,
      dateSigned: f.dateSigned,
      expiryDate: f.expiryDate,
      status: f.status,
      royaltyRate: parseFloat(f.royaltyRate) || 0,
      pricingStructure: f.pricingStructure,
      contractValue: parseFloat(f.contractValue) || 0,
      description: f.description,
      concesssionArea: f.concessionArea,
      coordinates: [parseFloat(f.lat) || 0, parseFloat(f.lng) || 0],
    });
    setSuccess(`Created: ${created.description} (${created.id})`);
    setError('');
    // Reset description and dates to prevent accidental re-submit
    setF(prev => ({ ...prev, description: '', dateSigned: '', expiryDate: '', lat: '', lng: '' }));
  };

  return (
    <div className="bg-white border border-line rounded-xl p-6">
      <h3 className="text-sm font-semibold text-ink-2 mb-5">New Mining Agreement</h3>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Operator *">
          <select value={f.operatorId} onChange={e => set('operatorId', e.target.value)} className={inputCls}>
            {operators.map(op => (
              <option key={op.id} value={op.id}>{op.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Country *">
          <select value={f.countryId} onChange={e => set('countryId', e.target.value)} className={inputCls}>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Commodity *">
          <select value={f.commodity} onChange={e => set('commodity', e.target.value as Commodity)} className={inputCls}>
            {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="License Type">
          <input
            value={f.licenseType}
            onChange={e => set('licenseType', e.target.value)}
            placeholder="e.g. Exploitation, Exploration"
            className={inputCls}
          />
        </Field>
        <Field label="Date Signed *">
          <input type="date" value={f.dateSigned} onChange={e => set('dateSigned', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Expiry Date *">
          <input type="date" value={f.expiryDate} onChange={e => set('expiryDate', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Status">
          <select value={f.status} onChange={e => set('status', e.target.value as AgreementStatus)} className={inputCls}>
            {AGREEMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Royalty Rate (%)">
          <input
            type="number" min={0} max={100} step={0.1}
            value={f.royaltyRate}
            onChange={e => set('royaltyRate', e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Pricing Structure">
          <input
            value={f.pricingStructure}
            onChange={e => set('pricingStructure', e.target.value)}
            placeholder="e.g. spot price, fixed"
            className={inputCls}
          />
        </Field>
        <Field label="Contract Value (USD M)">
          <input
            type="number" min={0}
            value={f.contractValue}
            onChange={e => set('contractValue', e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Description *" className="col-span-2">
          <input
            value={f.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Short descriptive title for this agreement"
            className={inputCls}
          />
        </Field>
        <Field label="Concession Area">
          <input
            value={f.concessionArea}
            onChange={e => set('concessionArea', e.target.value)}
            placeholder="Location name or region"
            className={inputCls}
          />
        </Field>
        <Field label="Mine Coordinates (lat, lng)">
          <div className="flex gap-2">
            <input
              type="number" step="any"
              value={f.lat}
              onChange={e => set('lat', e.target.value)}
              placeholder="Latitude"
              className={inputCls}
            />
            <input
              type="number" step="any"
              value={f.lng}
              onChange={e => set('lng', e.target.value)}
              placeholder="Longitude"
              className={inputCls}
            />
          </div>
        </Field>
      </div>
      {error && (
        <p className="text-red-600 text-xs mt-3 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      {success && (
        <p className="text-green-600 text-xs mt-3 flex items-center gap-1">
          <CheckCircle2 size={12} /> {success}
        </p>
      )}
      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Create Agreement
        </button>
      </div>
    </div>
  );
}

function NewOperatorForm() {
  const countries = getCountries();
  type F = {
    name: string; parentCompany: string; countryOfRegistration: string;
    countryIds: string[]; riskScore: number; complianceStatus: ComplianceStatus;
  };
  const [f, setF] = useState<F>({
    name: '',
    parentCompany: '',
    countryOfRegistration: '',
    countryIds: ['GIN'],
    riskScore: 25,
    complianceStatus: 'on-track',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const toggleCountry = (id: string) =>
    setF(prev => ({
      ...prev,
      countryIds: prev.countryIds.includes(id)
        ? prev.countryIds.filter(c => c !== id)
        : [...prev.countryIds, id],
    }));

  const handleSubmit = () => {
    if (!f.name.trim() || !f.countryOfRegistration.trim()) {
      setError('Operator name and country of registration are required.');
      return;
    }
    const created = mutationService.createOperator({
      name: f.name.trim(),
      parentCompany: f.parentCompany.trim(),
      countryOfRegistration: f.countryOfRegistration.trim(),
      countryIds: f.countryIds,
      riskScore: f.riskScore,
      complianceStatus: f.complianceStatus,
      ultimateBeneficialOwners: [],
      ownershipChanged: false,
    });
    setSuccess(`Created: ${created.name} (${created.id})`);
    setError('');
    setF(prev => ({ ...prev, name: '', parentCompany: '', countryOfRegistration: '' }));
  };

  return (
    <div className="bg-white border border-line rounded-xl p-6">
      <h3 className="text-sm font-semibold text-ink-2 mb-5">New Operator</h3>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Operator Name *">
          <input
            value={f.name}
            onChange={e => setF(p => ({ ...p, name: e.target.value }))}
            placeholder="Legal company name"
            className={inputCls}
          />
        </Field>
        <Field label="Parent / Holding Company">
          <input
            value={f.parentCompany}
            onChange={e => setF(p => ({ ...p, parentCompany: e.target.value }))}
            placeholder="Ultimate parent entity"
            className={inputCls}
          />
        </Field>
        <Field label="Country of Registration *">
          <input
            value={f.countryOfRegistration}
            onChange={e => setF(p => ({ ...p, countryOfRegistration: e.target.value }))}
            placeholder="e.g. Gibraltar, Mauritius, Cayman Islands"
            className={inputCls}
          />
        </Field>
        <Field label="Compliance Status">
          <select
            value={f.complianceStatus}
            onChange={e => setF(p => ({ ...p, complianceStatus: e.target.value as ComplianceStatus }))}
            className={inputCls}
          >
            {COMPLIANCE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label={`Risk Score — ${f.riskScore} / 100`}>
          <input
            type="range" min={0} max={100} step={1}
            value={f.riskScore}
            onChange={e => setF(p => ({ ...p, riskScore: Number(e.target.value) }))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-ink-4 mt-1">
            <span>0 Low</span><span>50 Moderate</span><span>100 High</span>
          </div>
        </Field>
        <Field label="Active Countries">
          <div className="flex flex-wrap gap-3 pt-1">
            {countries.map(c => (
              <label key={c.id} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={f.countryIds.includes(c.id)}
                  onChange={() => toggleCountry(c.id)}
                  className="w-3.5 h-3.5 accent-blue-600"
                />
                <span className="text-sm text-ink-2">{c.name}</span>
              </label>
            ))}
          </div>
        </Field>
      </div>
      {error && (
        <p className="text-red-600 text-xs mt-3 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      {success && (
        <p className="text-green-600 text-xs mt-3 flex items-center gap-1">
          <CheckCircle2 size={12} /> {success}
        </p>
      )}
      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Create Operator
        </button>
      </div>
    </div>
  );
}

// ─── Bulk Actions Tab ─────────────────────────────────────────────────────────

function BulkActionsTab() {
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

// ─── Audit Log Tab ────────────────────────────────────────────────────────────

function AuditLogTab() {
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

// ─── AI Assistant Settings Tab ────────────────────────────────────────────────

function AISettingsTab() {
  const {
    provider, model, openRouterKey, localBaseUrl, enabled,
    setProvider, setModel, setOpenRouterKey, setLocalBaseUrl, setEnabled, reset,
  } = useAISettingsStore();

  const [showKey, setShowKey]       = useState(false);
  const [testing, setTesting]       = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; message: string }>(null);

  const modelOptions =
    provider === 'local'        ? LOCAL_MODELS :
    provider === 'pollinations' ? POLLINATIONS_MODELS :
                                  OPENROUTER_MODELS;

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testProvider(provider, model, openRouterKey || undefined, localBaseUrl || undefined);
    if (res.ok) setTestResult({ ok: true,  message: `Connected. Sample reply: "${res.sample}"` });
    else        setTestResult({ ok: false, message: res.error });
    setTesting(false);
  };

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="bg-white border border-line rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 border border-line flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-brand-700" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink">ACCI Compliance Analyst</h3>
            <p className="text-xs text-ink-3 mt-1 leading-relaxed">
              An open-source AI model grounded in the live compliance data you are viewing.
              Defaults to a <span className="font-semibold text-ink-2">local LLM</span> (Qwen 3.6
              40B Opus-Deckard via LM Studio) so no compliance data ever leaves your machine.
              Hosted providers (Pollinations, OpenRouter) remain available as fallbacks for
              demos and machines without a local runtime.
            </p>
            <p className="text-[11px] text-ink-4 mt-2">
              Compliance data leaves the browser only when you invoke the AI. The local
              provider keeps it inside your machine; the hosted providers send it to their
              respective endpoints over HTTPS.
            </p>
          </div>
        </div>
      </div>

      {/* Enable toggle */}
      <div className="bg-white border border-line rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">AI Assistant enabled</p>
          <p className="text-xs text-ink-3 mt-0.5">
            When off, the AI Analyst button in the header is disabled.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={e => setEnabled(e.target.checked)}
          />
          <div className="w-11 h-6 bg-line-strong rounded-full peer peer-checked:bg-brand-600 transition-colors" />
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
        </label>
      </div>

      {/* Provider */}
      <div className="bg-white border border-line rounded-xl p-5">
        <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-3">Provider</p>
        <div className="grid grid-cols-3 gap-3">
          <ProviderCard
            id="local"
            label="Local LLM"
            sub="Ollama / LM Studio · on-device · recommended"
            active={provider === 'local'}
            onClick={() => { setProvider('local'); setTestResult(null); }}
          />
          <ProviderCard
            id="pollinations"
            label="Pollinations"
            sub="Hosted · keyless · anonymous"
            active={provider === 'pollinations'}
            onClick={() => { setProvider('pollinations'); setTestResult(null); }}
          />
          <ProviderCard
            id="openrouter"
            label="OpenRouter"
            sub="Hosted · open-weight · key required"
            active={provider === 'openrouter'}
            onClick={() => { setProvider('openrouter'); setTestResult(null); }}
          />
        </div>
      </div>

      {/* Local LLM base URL */}
      {provider === 'local' && (
        <div className="bg-white border border-line rounded-xl p-5">
          <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-3">
            Local server URL
          </p>
          <input
            type="text"
            value={localBaseUrl}
            onChange={e => { setLocalBaseUrl(e.target.value); setTestResult(null); }}
            placeholder={DEFAULT_LOCAL_BASE_URL}
            className={`${inputCls} font-mono text-xs`}
            spellCheck={false}
          />
          <div className="mt-3 rounded-lg bg-surface-2 border border-line-soft p-3 text-[11px] text-ink-3 leading-relaxed">
            <p className="font-semibold text-ink-2 mb-1">Quick start</p>
            <p>
              Load the model in <span className="font-mono">LM Studio</span> from{' '}
              <span className="font-mono">~/.lmstudio/models/</span> and start the local server.
              Alternatively, use <span className="font-mono">ollama</span>:
            </p>
            <pre className="mt-1.5 font-mono text-[11px] bg-white border border-line-soft rounded px-2 py-1.5 overflow-x-auto">
              ollama pull {model || 'qwen2.5:7b'}{'\n'}
              ollama serve
            </pre>
            <p className="mt-2">
              LM Studio listens on <span className="font-mono">http://localhost:1234</span> by
              default and exposes the OpenAI-compatible endpoint at{' '}
              <span className="font-mono">/v1</span>. Ollama uses{' '}
              <span className="font-mono">http://localhost:11434/v1</span>. If using LM Studio, you can use <span className="font-mono">/api/local-ai/v1</span> (this proxies to port 1234 to bypass CORS issues).
            </p>
            <p className="mt-2 text-ink-4">
              If the connection test fails with a CORS error, restart Ollama with{' '}
              <span className="font-mono">OLLAMA_ORIGINS=*</span> in its environment.
            </p>
          </div>
        </div>
      )}

      {/* Model */}
      <div className="bg-white border border-line rounded-xl p-5">
        <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-3">Model</p>
        <select
          value={modelOptions.some(m => m.id === model) ? model : '__custom'}
          onChange={e => {
            const v = e.target.value;
            if (v === '__custom') return;
            setModel(v);
            setTestResult(null);
          }}
          className={inputCls}
        >
          {modelOptions.map(m => (
            <option key={m.id} value={m.id}>{m.label} — {m.hint}</option>
          ))}
          <option value="__custom">Custom (enter model id below)</option>
        </select>
        <input
          type="text"
          value={model}
          onChange={e => { setModel(e.target.value); setTestResult(null); }}
          placeholder="e.g. meta-llama/llama-3.3-70b-instruct:free"
          className={`${inputCls} mt-2 font-mono text-xs`}
        />
        <p className="text-[11px] text-ink-4 mt-2">
          The model id is sent verbatim to the provider's chat-completions endpoint.
        </p>
      </div>

      {/* API Key */}
      {provider === 'openrouter' && (
        <div className="bg-white border border-line rounded-xl p-5">
          <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-3">
            OpenRouter API key
          </p>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={openRouterKey}
              onChange={e => { setOpenRouterKey(e.target.value); setTestResult(null); }}
              placeholder="sk-or-v1-…"
              className={`${inputCls} font-mono text-xs`}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={() => setShowKey(v => !v)}
              className="px-3 py-2 text-xs rounded-lg border border-line text-ink-3 hover:bg-surface-2"
              aria-label={showKey ? 'Hide key' : 'Show key'}
              type="button"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p className="text-[11px] text-ink-4 mt-2">
            Get a free key at <span className="font-mono">openrouter.ai/keys</span>. Stored in this browser only.
          </p>
        </div>
      )}

      {/* Test connection */}
      <div className="bg-surface-2 border border-line rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-ink-2 min-w-0">
          <p className="font-medium">Test connection</p>
          <p className="text-xs text-ink-4 mt-0.5">
            Sends a single short prompt to confirm the provider responds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-line text-ink-3 hover:bg-white"
            type="button"
          >
            Reset defaults
          </button>
          <button
            onClick={runTest}
            disabled={
              testing ||
              (provider === 'openrouter' && !openRouterKey.trim()) ||
              (provider === 'local' && !localBaseUrl.trim())
            }
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            type="button"
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {testing ? 'Testing…' : 'Test connection'}
          </button>
        </div>
      </div>

      {testResult && (
        <div
          className={
            'rounded-xl p-4 flex items-start gap-2 text-sm border ' +
            (testResult.ok
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700')
          }
        >
          {testResult.ok
            ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
          <span className="min-w-0 break-words">{testResult.message}</span>
        </div>
      )}
    </div>
  );
}

function ProviderCard({
  id, label, sub, active, onClick,
}: {
  id: AIProvider; label: string; sub: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-provider={id}
      className={
        'text-left p-3.5 rounded-lg border transition-colors ' +
        (active
          ? 'border-blue-500 bg-blue-50'
          : 'border-line bg-white hover:border-line-strong hover:bg-surface-2')
      }
    >
      <div className={'text-sm font-semibold ' + (active ? 'text-blue-700' : 'text-ink-2')}>{label}</div>
      <div className="text-xs text-ink-4 mt-0.5">{sub}</div>
    </button>
  );
}
