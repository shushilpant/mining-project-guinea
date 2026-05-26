import { DB, getRiskFlags } from './dataService';
import { useDataStore } from '@/store/dataStore';
import { useAuditStore } from '@/store/auditStore';
import type {
  Agreement,
  Commitment,
  RiskFlag,
  Operator,
  InfrastructureObligation,
  PerformanceRecord,
  ComplianceStatus,
  RiskFlagStatus,
  AgreementStatus,
} from '@/data/types';

const notifyChange = () => useDataStore.getState().refresh();

const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const mutationService = {
  // ─── Updates ──────────────────────────────────────────────────────────────

  updateAgreement(id: string, partial: Partial<Agreement>) {
    const idx = DB.agreements.findIndex(a => a.id === id);
    if (idx !== -1) {
      const before = { ...DB.agreements[idx] };
      DB.agreements[idx] = { ...before, ...partial };
      const fields = Object.keys(partial);
      useAuditStore.getState().log({
        action: 'update',
        entity: 'agreement',
        entityId: id,
        entityLabel: before.description || id,
        field: fields.join(', '),
        oldValue: fields.map(f => String((before as Record<string, unknown>)[f] ?? '')).join(', '),
        newValue: fields.map(f => String((partial as Record<string, unknown>)[f] ?? '')).join(', '),
      });
      notifyChange();
      return DB.agreements[idx];
    }
  },

  updateCommitmentStatus(id: string, newStatus: ComplianceStatus) {
    const idx = DB.commitments.findIndex(c => c.id === id);
    if (idx !== -1) {
      const old = DB.commitments[idx].status;
      DB.commitments[idx].status = newStatus;
      useAuditStore.getState().log({
        action: 'update',
        entity: 'commitment',
        entityId: id,
        entityLabel: DB.commitments[idx].description,
        field: 'status',
        oldValue: old,
        newValue: newStatus,
      });
      notifyChange();
      return DB.commitments[idx];
    }
  },

  updateCommitment(id: string, partial: Partial<Commitment>) {
    const idx = DB.commitments.findIndex(c => c.id === id);
    if (idx !== -1) {
      DB.commitments[idx] = { ...DB.commitments[idx], ...partial };
      notifyChange();
      return DB.commitments[idx];
    }
  },

  updateRiskFlagStatus(id: string, newStatus: RiskFlagStatus) {
    const idx = DB.riskFlags.findIndex(f => f.id === id);
    if (idx !== -1) {
      const old = DB.riskFlags[idx].status;
      DB.riskFlags[idx].status = newStatus;
      useAuditStore.getState().log({
        action: 'update',
        entity: 'risk_flag',
        entityId: id,
        entityLabel: DB.riskFlags[idx].description,
        field: 'status',
        oldValue: old,
        newValue: newStatus,
      });
      notifyChange();
      return DB.riskFlags[idx];
    }
    const dynamicFlags = getRiskFlags();
    const dynamicFlag = dynamicFlags.find((f: RiskFlag) => f.id === id);
    if (dynamicFlag) {
      dynamicFlag.status = newStatus;
      DB.riskFlags.push(dynamicFlag);
      notifyChange();
      return dynamicFlag;
    }
  },

  updateOperator(id: string, partial: Partial<Operator>) {
    const idx = DB.operators.findIndex(op => op.id === id);
    if (idx !== -1) {
      const before = { ...DB.operators[idx] };
      DB.operators[idx] = { ...before, ...partial };
      const fields = Object.keys(partial);
      useAuditStore.getState().log({
        action: 'update',
        entity: 'operator',
        entityId: id,
        entityLabel: before.name,
        field: fields.join(', '),
        oldValue: fields.map(f => String((before as Record<string, unknown>)[f] ?? '')).join(', '),
        newValue: fields.map(f => String((partial as Record<string, unknown>)[f] ?? '')).join(', '),
      });
      notifyChange();
      return DB.operators[idx];
    }
  },

  updateInfrastructureProgress(id: string, progress: number) {
    const idx = DB.infrastructureObligations.findIndex(io => io.id === id);
    if (idx !== -1) {
      const old = DB.infrastructureObligations[idx].actualProgress;
      DB.infrastructureObligations[idx].actualProgress = progress;
      if (progress >= 100) {
        DB.infrastructureObligations[idx].status = 'met';
      }
      useAuditStore.getState().log({
        action: 'update',
        entity: 'infrastructure',
        entityId: id,
        entityLabel: DB.infrastructureObligations[idx].projectName,
        field: 'actualProgress',
        oldValue: String(old),
        newValue: String(progress),
      });
      notifyChange();
      return DB.infrastructureObligations[idx];
    }
  },

  // ─── Creates ──────────────────────────────────────────────────────────────

  createAgreement(data: Omit<Agreement, 'id'>) {
    const record: Agreement = { id: genId('agr'), ...data };
    DB.agreements.push(record);
    useAuditStore.getState().log({
      action: 'create',
      entity: 'agreement',
      entityId: record.id,
      entityLabel: record.description || record.id,
      details: `${record.commodity} — ${record.countryId}`,
    });
    notifyChange();
    return record;
  },

  createOperator(data: Omit<Operator, 'id'>) {
    const record: Operator = { id: genId('op'), ...data };
    DB.operators.push(record);
    useAuditStore.getState().log({
      action: 'create',
      entity: 'operator',
      entityId: record.id,
      entityLabel: record.name,
      details: `Registered in ${record.countryOfRegistration}`,
    });
    notifyChange();
    return record;
  },

  // ─── Bulk Operations ──────────────────────────────────────────────────────

  bulkUpdateRiskFlagStatus(ids: string[], newStatus: RiskFlagStatus) {
    let updated = 0;
    const dynamicFlags = getRiskFlags();
    ids.forEach(id => {
      const idx = DB.riskFlags.findIndex(f => f.id === id);
      if (idx !== -1) {
        DB.riskFlags[idx].status = newStatus;
        updated++;
        return;
      }
      const dynamic = dynamicFlags.find((f: RiskFlag) => f.id === id);
      if (dynamic) {
        dynamic.status = newStatus;
        DB.riskFlags.push(dynamic);
        updated++;
      }
    });
    useAuditStore.getState().log({
      action: 'bulk_update',
      entity: 'risk_flag',
      entityId: 'bulk',
      entityLabel: `${updated} risk flags`,
      field: 'status',
      newValue: newStatus,
      count: updated,
    });
    notifyChange();
    return updated;
  },

  bulkUpdateAgreementStatus(ids: string[], newStatus: AgreementStatus) {
    let updated = 0;
    ids.forEach(id => {
      const idx = DB.agreements.findIndex(a => a.id === id);
      if (idx !== -1) {
        DB.agreements[idx].status = newStatus;
        updated++;
      }
    });
    useAuditStore.getState().log({
      action: 'bulk_update',
      entity: 'agreement',
      entityId: 'bulk',
      entityLabel: `${updated} agreements`,
      field: 'status',
      newValue: newStatus,
      count: updated,
    });
    notifyChange();
    return updated;
  },

  // ─── Batch Import ─────────────────────────────────────────────────────────

  importBatch(records: {
    agreements?: Agreement[];
    operators?: Operator[];
    commitments?: Commitment[];
    performanceRecords?: PerformanceRecord[];
    infrastructureObligations?: InfrastructureObligation[];
  }) {
    let total = 0;
    if (records.agreements?.length) {
      DB.agreements.push(...records.agreements);
      total += records.agreements.length;
    }
    if (records.operators?.length) {
      DB.operators.push(...records.operators);
      total += records.operators.length;
    }
    if (records.commitments?.length) {
      DB.commitments.push(...records.commitments);
      total += records.commitments.length;
    }
    if (records.performanceRecords?.length) {
      DB.performanceRecords.push(...records.performanceRecords);
      total += records.performanceRecords.length;
    }
    if (records.infrastructureObligations?.length) {
      DB.infrastructureObligations.push(...records.infrastructureObligations);
      total += records.infrastructureObligations.length;
    }
    useAuditStore.getState().log({
      action: 'import',
      entity: 'agreement',
      entityId: 'batch',
      entityLabel: 'Excel / CSV Import',
      details: `Imported ${total} records`,
      count: total,
    });
    notifyChange();
    return total;
  },
};
