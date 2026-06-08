import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { mutationService } from '@/services/mutationService';
import { getOperators, getCountries } from '@/services/dataService';
import type { Commodity, ComplianceStatus, AgreementStatus } from '@/data/types';
import { Field } from '@/pages/admin/Field';
import { inputCls, COMMODITIES, COMPLIANCE_STATUSES, AGREEMENT_STATUSES } from '@/pages/admin/shared';

export function CreateTab() {
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
        <Field label="Licence Type">
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
