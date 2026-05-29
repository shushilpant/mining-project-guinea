// ============================================================
// dataService — single abstraction layer over the seed data.
// All UI components import from here, never from seed.ts directly.
// Swap this for real API calls in Phase II without touching UI code.
// ============================================================

import { generateSeedData } from '@/data/seed';
import type {
  Country,
  Operator,
  Agreement,
  Commitment,
  PerformanceRecord,
  RiskFlag,
  InfrastructureObligation,
  OperatorScorecard,
  CountrySummary,
  RiskThresholds,
  ComplianceStatus,
  BeneficialOwnerNode,
  ProtectedZone,
  ConcessionConflict,
  CommodityPrice,
  LocalContentRecord,
  DocumentAccessLog,
  EITIReportSection,
  Commodity,
} from '@/data/types';
import { DEFAULT_THRESHOLDS } from '@/data/types';

// Singleton — load once
export const DB = generateSeedData();

// ─── Countries ───────────────────────────────────────────────

export function getCountries(): Country[] {
  return DB.countries;
}

export function getCountryById(id: string): Country | undefined {
  return DB.countries.find(c => c.id === id);
}

// ─── Operators ───────────────────────────────────────────────

export function getOperators(countryId?: string): Operator[] {
  if (!countryId || countryId === 'ALL') return DB.operators;
  return DB.operators.filter(op => op.countryIds.includes(countryId));
}

export function getOperatorById(id: string): Operator | undefined {
  return DB.operators.find(op => op.id === id);
}

// ─── Agreements ──────────────────────────────────────────────

export function getAgreements(countryId?: string): Agreement[] {
  if (!countryId || countryId === 'ALL') return DB.agreements;
  return DB.agreements.filter(a => a.countryId === countryId);
}

export function getAgreementById(id: string): Agreement | undefined {
  return DB.agreements.find(a => a.id === id);
}

export function getAgreementsByOperator(operatorId: string): Agreement[] {
  return DB.agreements.filter(a => a.operatorId === operatorId);
}

// ─── Commitments ─────────────────────────────────────────────

export function getCommitments(agreementId?: string): Commitment[] {
  if (!agreementId) return DB.commitments;
  return DB.commitments.filter(c => c.agreementId === agreementId);
}

export function getCommitmentById(id: string): Commitment | undefined {
  return DB.commitments.find(c => c.id === id);
}

export function getCommitmentsForOperator(operatorId: string): Commitment[] {
  const agreementIds = getAgreementsByOperator(operatorId).map(a => a.id);
  return DB.commitments.filter(c => agreementIds.includes(c.agreementId));
}

export function getCommitmentsForCountry(countryId: string): Commitment[] {
  const agreementIds = getAgreements(countryId).map(a => a.id);
  return DB.commitments.filter(c => agreementIds.includes(c.agreementId));
}

// ─── Performance Records ─────────────────────────────────────

export function getPerformanceRecords(commitmentId: string): PerformanceRecord[] {
  return DB.performanceRecords
    .filter(p => p.commitmentId === commitmentId)
    .sort((a, b) => a.reportingPeriod.localeCompare(b.reportingPeriod));
}

export function getLatestPerformanceRecord(commitmentId: string): PerformanceRecord | undefined {
  const records = getPerformanceRecords(commitmentId);
  return records[records.length - 1];
}

// ─── Risk Flags ──────────────────────────────────────────────

export function getRiskFlags(countryId?: string, thresholds: RiskThresholds = DEFAULT_THRESHOLDS): RiskFlag[] {
  let flags = [...DB.riskFlags];

  // Compute dynamic flags from current data
  const dynamicFlags = computeDynamicFlags(thresholds);
  // Merge: only add dynamic flags whose id doesn't already exist in static set
  const existingIds = new Set(flags.map(f => f.id));
  for (const df of dynamicFlags) {
    if (!existingIds.has(df.id)) flags.push(df);
  }

  if (!countryId || countryId === 'ALL') return flags;

  // Filter by country via agreement → operator
  const countryAgreementIds = new Set(getAgreements(countryId).map(a => a.id));
  return flags.filter(f => countryAgreementIds.has(f.agreementId));
}

export function getRiskFlagsByOperator(operatorId: string): RiskFlag[] {
  return getRiskFlags().filter(f => f.operatorId === operatorId);
}

export function getRiskFlagById(id: string): RiskFlag | undefined {
  return getRiskFlags().find(f => f.id === id);
}

// ─── Infrastructure Obligations ──────────────────────────────

export function getInfrastructureObligations(countryId?: string): InfrastructureObligation[] {
  if (!countryId || countryId === 'ALL') return DB.infrastructureObligations;
  const agreementIds = new Set(getAgreements(countryId).map(a => a.id));
  return DB.infrastructureObligations.filter(io => agreementIds.has(io.agreementId));
}

export function getInfrastructureObligationsByAgreement(agreementId: string): InfrastructureObligation[] {
  return DB.infrastructureObligations.filter(io => io.agreementId === agreementId);
}

// ─── Scorecards ──────────────────────────────────────────────

export function getOperatorScorecard(operatorId: string): OperatorScorecard {
  const operator = getOperatorById(operatorId)!;
  const commitments = getCommitmentsForOperator(operatorId);
  const flags = getRiskFlagsByOperator(operatorId).filter(f => f.status !== 'resolved');

  const count = (s: ComplianceStatus) => commitments.filter(c => c.status === s).length;

  const met = count('met');
  const onTrack = count('on-track');
  const atRisk = count('at-risk');
  const breached = count('breached');
  const total = commitments.length;

  const complianceRate = total > 0
    ? Math.round(((met + onTrack) / total) * 100)
    : 100;

  return {
    operatorId,
    operatorName: operator.name,
    countryIds: operator.countryIds,
    totalCommitments: total,
    metCount: met,
    onTrackCount: onTrack,
    atRiskCount: atRisk,
    breachedCount: breached,
    complianceRate,
    openFlags: flags.length,
    criticalFlags: flags.filter(f => f.severity === 'critical').length,
  };
}

export function getAllOperatorScorecards(countryId?: string): OperatorScorecard[] {
  const operators = getOperators(countryId);
  return operators.map(op => getOperatorScorecard(op.id));
}

// ─── Country Summaries ───────────────────────────────────────

export function getCountrySummary(countryId: string): CountrySummary {
  const country = getCountryById(countryId)!;
  const agreements = getAgreements(countryId).filter(a => a.status === 'active');
  const operators = getOperators(countryId);
  const commitments = getCommitmentsForCountry(countryId);
  const flags = getRiskFlags(countryId).filter(f => f.status !== 'resolved');

  const met = commitments.filter(c => c.status === 'met' || c.status === 'on-track').length;
  const total = commitments.length;
  const complianceRate = total > 0 ? Math.round((met / total) * 100) : 100;

  const royaltyRates = agreements.map(a => a.royaltyRate);
  const avgRoyaltyRate = royaltyRates.length > 0
    ? Math.round((royaltyRates.reduce((a, b) => a + b, 0) / royaltyRates.length) * 10) / 10
    : 0;

  return {
    countryId,
    countryName: country.name,
    activeAgreements: agreements.length,
    totalOperators: operators.length,
    complianceRate,
    openCriticalFlags: flags.filter(f => f.severity === 'critical').length,
    avgRoyaltyRate,
  };
}

export function getAllCountrySummaries(): CountrySummary[] {
  return DB.countries.map(c => getCountrySummary(c.id));
}

// ─── System-wide metrics ─────────────────────────────────────

export function getSystemMetrics(countryId?: string) {
  const agreements = getAgreements(countryId);
  const operators = getOperators(countryId);
  const flags = getRiskFlags(countryId).filter(f => f.status !== 'resolved');

  const commitments = countryId && countryId !== 'ALL'
    ? getCommitmentsForCountry(countryId)
    : DB.commitments;

  const met = commitments.filter(c => c.status === 'met' || c.status === 'on-track').length;
  const total = commitments.length;
  const complianceRate = total > 0 ? Math.round((met / total) * 100) : 100;

  return {
    totalActiveAgreements: agreements.filter(a => a.status === 'active').length,
    totalOperators: operators.length,
    openCriticalFlags: flags.filter(f => f.severity === 'critical').length,
    openHighFlags: flags.filter(f => f.severity === 'high').length,
    openMediumFlags: flags.filter(f => f.severity === 'medium').length,
    openLowFlags: flags.filter(f => f.severity === 'low').length,
    systemComplianceRate: complianceRate,
    totalCommitments: total,
    breachedCommitments: commitments.filter(c => c.status === 'breached').length,
    atRiskCommitments: commitments.filter(c => c.status === 'at-risk').length,
  };
}

// ─── Trend data (compliance over time for chart) ─────────────

export function getComplianceTrend(countryId?: string): { period: string; rate: number }[] {
  // Synthetic trend built from performance record periods
  const periods = [
    '2022-Q3', '2022-Q4',
    '2023-Q1', '2023-Q2', '2023-Q3', '2023-Q4',
    '2024-Q1', '2024-Q2',
  ];

  // Use country-filtered data if specified
  const allCommitments = countryId && countryId !== 'ALL'
    ? getCommitmentsForCountry(countryId)
    : DB.commitments;

  const commitmentIds = new Set(allCommitments.map(c => c.id));
  const allRecords = DB.performanceRecords.filter(r => commitmentIds.has(r.commitmentId));

  return periods.map(period => {
    const periodRecords = allRecords.filter(r => r.reportingPeriod === period);
    if (periodRecords.length === 0) return { period, rate: 85 };

    // Compute compliance rate for this period based on how many commitments
    // were tracking at or above 75% of their target value
    const onTrackCount = periodRecords.filter(r => {
      const commitment = DB.commitments.find(c => c.id === r.commitmentId);
      if (!commitment) return false;
      if (commitment.targetValue === 0) return true;
      return r.actualValue / commitment.targetValue >= 0.75;
    }).length;

    return {
      period,
      rate: Math.round((onTrackCount / periodRecords.length) * 100),
    };
  });
}

// ─── Negotiation benchmarking ─────────────────────────────────

export function getRoyaltyBenchmarks(commodity?: string, countryId?: string) {
  let agreements = getAgreements(countryId);
  if (commodity) agreements = agreements.filter(a => a.commodity === commodity);
  agreements = agreements.filter(a => a.status === 'active');

  if (agreements.length === 0) return null;

  const rates = agreements.map(a => a.royaltyRate);
  const sorted = [...rates].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
  const min = Math.min(...rates);
  const max = Math.max(...rates);

  return { median, avg, min, max, count: rates.length };
}

export function getAgreementsWithBenchmark(countryId?: string) {
  const agreements = getAgreements(countryId).filter(a => a.status === 'active');
  return agreements.map(a => {
    const peers = getAgreements().filter(
      p => p.commodity === a.commodity && p.status === 'active' && p.id !== a.id,
    );
    const peerRates = peers.map(p => p.royaltyRate);
    const peerMedian = peerRates.length > 0
      ? peerRates.sort((x, y) => x - y)[Math.floor(peerRates.length / 2)]
      : a.royaltyRate;
    const vsMedian = a.royaltyRate - peerMedian;

    return {
      ...a,
      peerMedianRoyalty: peerMedian,
      vsMedian,
      peerCount: peers.length,
    };
  });
}

// ─── Dynamic risk flag computation ───────────────────────────

function computeDynamicFlags(thresholds: RiskThresholds): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const today = new Date('2024-05-24');

  // Rule 1: production commitments below threshold for N periods
  for (const commitment of DB.commitments.filter(c => c.type === 'production')) {
    const records = DB.performanceRecords
      .filter(r => r.commitmentId === commitment.id)
      .sort((a, b) => a.reportingPeriod.localeCompare(b.reportingPeriod));

    if (records.length < thresholds.productionShortfallPeriods) continue;

    const recent = records.slice(-thresholds.productionShortfallPeriods);
    const allShort = recent.every(r => {
      if (commitment.targetValue === 0) return false;
      return (r.actualValue / commitment.targetValue) * 100 < thresholds.productionShortfallPercent;
    });

    if (allShort) {
      const existingFlagId = `DYN-PROD-${commitment.id}`;
      const agreement = DB.agreements.find(a => a.id === commitment.agreementId);
      if (!agreement) continue;
      const latest = recent[recent.length - 1];
      const actualPct = Math.round((latest.actualValue / commitment.targetValue) * 100);

      flags.push({
        id: existingFlagId,
        operatorId: agreement.operatorId,
        agreementId: commitment.agreementId,
        commitmentId: commitment.id,
        severity: actualPct < 60 ? 'high' : 'medium',
        category: 'Production Shortfall',
        description: `Production at ${actualPct}% of target for ${thresholds.productionShortfallPeriods}+ consecutive periods.`,
        triggeredDate: latest.dateRecorded,
        status: 'open',
        recommendedAction: 'Request production recovery plan and operational status update.',
        ruleTriggered: `Production below ${thresholds.productionShortfallPercent}% of target for ${thresholds.productionShortfallPeriods}+ consecutive periods`,
        evidenceDescription: `Latest actual: ${latest.actualValue.toLocaleString()} ${latest.actualUnit} vs target ${commitment.targetValue.toLocaleString()} ${commitment.targetUnit}.`,
      });
    }
  }

  // Rule 2: expiring agreements
  for (const agreement of DB.agreements.filter(a => a.status === 'active')) {
    const expiry = new Date(agreement.expiryDate);
    const daysToExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysToExpiry > 0 && daysToExpiry <= thresholds.agreementExpiryWarningDays) {
      const openCommitments = DB.commitments.filter(
        c => c.agreementId === agreement.id && (c.status === 'breached' || c.status === 'at-risk'),
      );
      if (openCommitments.length > 0) {
        flags.push({
          id: `DYN-EXPIRY-${agreement.id}`,
          operatorId: agreement.operatorId,
          agreementId: agreement.id,
          severity: 'medium',
          category: 'Agreement Expiry',
          description: `Agreement expires in ${daysToExpiry} days with ${openCommitments.length} unresolved obligation(s).`,
          triggeredDate: today.toISOString().split('T')[0],
          status: 'open',
          recommendedAction: 'Begin renewal process; condition renewal on resolution of open obligations.',
          ruleTriggered: `Agreement expiring within ${thresholds.agreementExpiryWarningDays} days with unmet commitments`,
          evidenceDescription: `Expiry: ${agreement.expiryDate}. Unresolved: ${openCommitments.map(c => c.description.slice(0, 40)).join('; ')}.`,
        });
      }
    }
  }

  return flags;
}

// ─── Helper utilities ─────────────────────────────────────────

export function formatCommodity(c: string): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export function daysUntilExpiry(expiryDate: string): number {
  const today = new Date('2024-05-24');
  const expiry = new Date(expiryDate);
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getLastRefreshed(countryId?: string): string {
  if (countryId === 'GIN' || countryId === 'GHA' || countryId === 'CIV') {
    return '24 May 2024 — 08:15 GMT / 02:15 CST (simulated)';
  }
  return '24 May 2024 — 09:15 WAT / 02:15 CST (simulated)';
}

// ─── New Feature Accessors ───────────────────────────────────

export function getBeneficialOwnerTree(operatorId: string): BeneficialOwnerNode[] {
  return DB.beneficialOwnerTrees.filter(n => n.operatorId === operatorId);
}

export function getPEPExposure(countryId?: string) {
  const operators = getOperators(countryId);
  return operators.map(op => {
    const tree = DB.beneficialOwnerTrees.filter(n => n.operatorId === op.id);
    const pepCount = tree.filter(n => n.isPEP).length;
    const opaqueEntities = tree.filter(n => n.isOpaque).length;
    return { operatorId: op.id, pepCount, opaqueEntities };
  });
}

export function getProtectedZones(countryId?: string): ProtectedZone[] {
  if (!countryId || countryId === 'ALL') return DB.protectedZones;
  return DB.protectedZones.filter(z => z.countryId === countryId);
}

export function getConcessionConflicts(countryId?: string): ConcessionConflict[] {
  const agreements = getAgreements(countryId);
  const ids = new Set(agreements.map(a => a.id));
  return DB.concessionConflicts.filter(c => ids.has(c.agreementId));
}

export function getCommodityPrices(commodity: Commodity): CommodityPrice[] {
  return DB.commodityPrices.filter(p => p.commodity === commodity);
}

export function getLocalContentRecords(operatorId?: string, countryId?: string): LocalContentRecord[] {
  let records = DB.localContentRecords;
  if (operatorId) {
    records = records.filter(r => r.operatorId === operatorId);
  }
  if (countryId && countryId !== 'ALL') {
    const operators = new Set(getOperators(countryId).map(o => o.id));
    records = records.filter(r => operators.has(r.operatorId));
  }
  return records;
}

export function getLocalContentSummary(operatorId: string) {
  const records = getLocalContentRecords(operatorId);
  const categories = ['employment', 'procurement', 'infrastructure', 'training', 'community_fund'];
  
  return categories.map(cat => {
    const catRecords = records.filter(r => r.category === cat);
    const promisedTotal = catRecords.reduce((sum, r) => sum + r.promised, 0);
    const actualTotal = catRecords.reduce((sum, r) => sum + r.actual, 0);
    const compliancePercent = promisedTotal > 0 ? Math.round((actualTotal / promisedTotal) * 100) : 100;
    
    return { category: cat, promisedTotal, actualTotal, compliancePercent };
  });
}

export function getDocumentAccessLogs(filters?: { agreementId?: string; userId?: string; action?: string }): DocumentAccessLog[] {
  let logs = DB.documentAccessLogs;
  if (filters?.agreementId) logs = logs.filter(l => l.agreementId === filters.agreementId);
  if (filters?.userId) logs = logs.filter(l => l.userId === filters.userId);
  if (filters?.action) logs = logs.filter(l => l.action === filters.action);
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getEITIReportSections(countryId: string): EITIReportSection[] {
  if (!countryId || countryId === 'ALL') return DB.eitiReportSections;
  return DB.eitiReportSections.filter(s => s.countryId === countryId);
}

export function getEITIReportReadiness(countryId: string) {
  const sections = getEITIReportSections(countryId);
  const totalSections = sections.length;
  const complete = sections.filter(s => s.status === 'complete').length;
  const partial = sections.filter(s => s.status === 'partial').length;
  const missing = sections.filter(s => s.status === 'missing').length;
  const readinessPercent = totalSections > 0 ? Math.round(((complete + (partial * 0.5)) / totalSections) * 100) : 0;
  
  return { totalSections, complete, partial, missing, readinessPercent };
}

export { DEFAULT_THRESHOLDS };
export type { RiskThresholds };
