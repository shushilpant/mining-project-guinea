import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileText, AlertCircle, Check, CheckCircle2 } from 'lucide-react';
import { mutationService } from '@/services/mutationService';
import { sanitizeRecords } from '@/lib/exportSafety';
import {
  validateImportFile,
  isForbiddenKey,
  clampCell,
  MAX_IMPORT_ROWS,
  MAX_HEADER_COLS,
} from '@/lib/importSafety';
import type {
  Agreement,
  Operator,
  Commitment,
  PerformanceRecord,
  Commodity,
  CommitmentType,
  ComplianceStatus,
  AgreementStatus,
} from '@/data/types';

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
      name: 'Guinea Mining Corp', parentCompany: 'Global Resources Ltd',
      countryOfRegistration: 'Gibraltar', countryIds: 'GIN',
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

export function ImportTab() {
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
