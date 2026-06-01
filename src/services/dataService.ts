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
  ESGMetric,
  MineClosure,
  CommodityMarketData,
  RevenueImpactScenario,
  ManagedDocument,
  ExtractedClause,
  SystemAlert,
  PublicDataset,
  PublicationLog,
  RegulatoryChange,
  RegulatoryImpact,
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
  const flags = [...DB.riskFlags];

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

// Compact operator labels for dense charts/tables where the full
// registered name is too long. Falls back to the full name.
const OPERATOR_SHORT: Record<string, string> = {
  'OP-01': 'CBG', 'OP-02': 'SMB-Winning', 'OP-03': 'Rusal', 'OP-04': 'SimFer',
  'OP-05': 'WCS', 'OP-06': 'GAC / Nimba', 'OP-07': 'Newmont', 'OP-08': 'Gold Fields',
  'OP-09': 'AngloGold', 'OP-10': 'Atlantic Li', 'OP-11': 'GMC Nsuta', 'OP-12': 'Endeavour',
  'OP-13': 'Perseus', 'OP-14': 'Barrick', 'OP-15': 'Allied Gold',
};

export function shortOperatorName(id: string): string {
  return OPERATOR_SHORT[id] ?? getOperatorById(id)?.name ?? id;
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

// ─── ESG Tracking (M9) ───────────────────────────────────────

// Subcategories where a *lower* reading is better (water, carbon,
// grievances, incidents). Everything else is higher-is-better
// (funded provisions, local jobs, disclosure, safety compliance).
export const ESG_LOWER_IS_BETTER = new Set<string>([
  'water_usage', 'water_turbidity', 'carbon_emissions', 'energy_intensity',
  'community_grievance', 'safety_incidents',
]);

/** Direction-aware 0–100 attainment score for a single ESG metric. */
export function esgMetricScore(metric: ESGMetric): number {
  const { targetValue, actualValue, subcategory } = metric;
  if (ESG_LOWER_IS_BETTER.has(subcategory)) {
    if (actualValue <= 0) return 100;
    // target 0 with a positive reading → scale off a small epsilon so
    // "should be zero" metrics (grievances, fatalities) still degrade.
    const denom = targetValue > 0 ? targetValue : 1;
    return Math.max(0, Math.min(100, Math.round((denom / actualValue) * 100)));
  }
  if (targetValue <= 0) return actualValue >= 0 ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round((actualValue / targetValue) * 100)));
}

export function getESGMetrics(operatorId?: string, countryId?: string): ESGMetric[] {
  let metrics = DB.esgMetrics;
  if (operatorId) metrics = metrics.filter(m => m.operatorId === operatorId);
  if (countryId && countryId !== 'ALL') {
    const opIds = new Set(getOperators(countryId).map(o => o.id));
    metrics = metrics.filter(m => opIds.has(m.operatorId));
  }
  return metrics;
}

export function getESGSummary(countryId?: string): { environmental: number; social: number; governance: number } {
  const metrics = getESGMetrics(undefined, countryId);
  const avg = (cat: ESGMetric['category']) => {
    const rows = metrics.filter(m => m.category === cat);
    if (rows.length === 0) return 0;
    return Math.round(rows.reduce((s, m) => s + esgMetricScore(m), 0) / rows.length);
  };
  return { environmental: avg('environmental'), social: avg('social'), governance: avg('governance') };
}

export function getMineClosures(countryId?: string): MineClosure[] {
  if (!countryId || countryId === 'ALL') return DB.mineClosures;
  const agreementIds = new Set(getAgreements(countryId).map(a => a.id));
  return DB.mineClosures.filter(m => agreementIds.has(m.agreementId));
}

// ─── Market Intelligence (M10) ───────────────────────────────

export function getCommodityMarketData(): CommodityMarketData[] {
  return DB.commodityMarketData;
}

export function getCommodityMarketDataByCommodity(commodity: Commodity): CommodityMarketData | undefined {
  return DB.commodityMarketData.find(d => d.commodity === commodity);
}

/**
 * Estimate the government-revenue sensitivity of a commodity to a price move.
 * Baseline royalty take ≈ Σ(contractValue × royaltyRate%) over active
 * agreements of that commodity; ad-valorem revenue scales ~linearly with price.
 */
export function computeRevenueImpact(commodity: Commodity, priceChangePct: number, countryId?: string): RevenueImpactScenario {
  const agreements = getAgreements(countryId).filter(a => a.commodity === commodity && a.status === 'active');
  const currentRevenue = agreements.reduce(
    (sum, a) => sum + a.contractValue * 1_000_000 * (a.royaltyRate / 100),
    0,
  );
  const projectedRevenue = currentRevenue * (1 + priceChangePct / 100);
  return {
    commodity,
    priceChangePercent: priceChangePct,
    currentRevenue,
    projectedRevenue,
    impactUSD: projectedRevenue - currentRevenue,
  };
}

// ─── Document Management (M11) ───────────────────────────────

export function getManagedDocuments(filters?: { countryId?: string; type?: string; operatorId?: string }): ManagedDocument[] {
  let docs = DB.managedDocuments;
  if (filters?.countryId && filters.countryId !== 'ALL') docs = docs.filter(d => d.countryId === filters.countryId);
  if (filters?.type) docs = docs.filter(d => d.documentType === filters.type);
  if (filters?.operatorId) docs = docs.filter(d => d.operatorId === filters.operatorId);
  return docs;
}

export function searchDocuments(query: string): ManagedDocument[] {
  const q = query.trim().toLowerCase();
  if (!q) return DB.managedDocuments;
  return DB.managedDocuments.filter(d =>
    d.title.toLowerCase().includes(q) ||
    d.tags.some(t => t.toLowerCase().includes(q)) ||
    d.documentType.toLowerCase().includes(q) ||
    d.extractedClauses.some(c =>
      c.clauseText.toLowerCase().includes(q) || c.clauseType.toLowerCase().includes(q),
    ),
  );
}

export function getExtractedClauses(documentId?: string, clauseType?: string): ExtractedClause[] {
  const clauses = DB.managedDocuments.flatMap(d => d.extractedClauses);
  return clauses.filter(c =>
    (!documentId || c.documentId === documentId) &&
    (!clauseType || c.clauseType === clauseType),
  );
}

// ─── Automated Alerts ────────────────────────────────────────

export function getSystemAlerts(filters?: { category?: string; priority?: string; acknowledged?: boolean }): SystemAlert[] {
  let alerts = DB.systemAlerts;
  if (filters?.category) alerts = alerts.filter(a => a.category === filters.category);
  if (filters?.priority) alerts = alerts.filter(a => a.priority === filters.priority);
  if (filters?.acknowledged !== undefined) alerts = alerts.filter(a => a.acknowledged === filters.acknowledged);
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...alerts].sort((a, b) => order[a.priority] - order[b.priority]);
}

export function getAlertCount(): { total: number; critical: number; unacknowledged: number } {
  const alerts = DB.systemAlerts;
  return {
    total: alerts.length,
    critical: alerts.filter(a => a.priority === 'critical').length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length,
  };
}

// ─── Public Portal / Open Data (M12) ─────────────────────────

export function getPublicDatasets(countryId?: string): PublicDataset[] {
  if (!countryId || countryId === 'ALL') return DB.publicDatasets;
  return DB.publicDatasets.filter(d => d.countryId === countryId);
}

export function getPublicationLogs(datasetId?: string): PublicationLog[] {
  const logs = datasetId ? DB.publicationLogs.filter(l => l.datasetId === datasetId) : DB.publicationLogs;
  return [...logs].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

/**
 * Build a representative open-data export from live records for a dataset.
 * Returns rows in a format-neutral shape; the caller encodes to CSV/JSON/Excel.
 */
export function generatePublicExport(datasetId: string): object[] {
  const ds = DB.publicDatasets.find(d => d.id === datasetId);
  if (!ds) return [];
  const country = ds.countryId;

  switch (ds.category) {
    case 'revenue':
      return getAgreements(country)
        .filter(a => a.status === 'active')
        .map(a => ({
          operator: getOperatorById(a.operatorId)?.name ?? a.operatorId,
          commodity: a.commodity,
          royalty_rate_pct: a.royaltyRate,
          estimated_royalty_usd: Math.round(a.contractValue * 1_000_000 * (a.royaltyRate / 100)),
          period: '2026-Q1',
        }));
    case 'licenses':
      return getAgreements(country).map(a => ({
        licence_id: a.id,
        operator: getOperatorById(a.operatorId)?.name ?? a.operatorId,
        commodity: a.commodity,
        licence_type: a.licenseType,
        status: a.status,
        expiry: a.expiryDate,
      }));
    case 'production':
      return getAgreements(country)
        .filter(a => a.status === 'active')
        .map(a => ({
          mine: a.concesssionArea,
          operator: getOperatorById(a.operatorId)?.name ?? a.operatorId,
          commodity: a.commodity,
          period: '2026-Q1',
        }));
    case 'esg':
      return getESGMetrics(undefined, country).map(m => ({
        operator: getOperatorById(m.operatorId)?.name ?? m.operatorId,
        category: m.category,
        metric: m.metricName,
        target: m.targetValue,
        actual: m.actualValue,
        unit: m.unit,
        period: m.reportingPeriod,
      }));
    case 'local_content':
      return getLocalContentRecords(undefined, country).map(r => ({
        operator: getOperatorById(r.operatorId)?.name ?? r.operatorId,
        category: r.category,
        promised: r.promised,
        actual: r.actual,
        unit: r.unit,
        period: r.reportingPeriod,
      }));
    default:
      return [];
  }
}

// ─── Regulatory Tracker (M13) ────────────────────────────────

export function getRegulatoryChanges(countryId?: string): RegulatoryChange[] {
  const changes = (!countryId || countryId === 'ALL')
    ? DB.regulatoryChanges
    : DB.regulatoryChanges.filter(r => r.countryId === countryId);
  return [...changes].sort((a, b) => new Date(b.announcedDate).getTime() - new Date(a.announcedDate).getTime());
}

export function getRegulatoryImpacts(regulationId?: string, agreementId?: string): RegulatoryImpact[] {
  return DB.regulatoryImpacts.filter(i =>
    (!regulationId || i.regulationId === regulationId) &&
    (!agreementId || i.agreementId === agreementId),
  );
}

export function getStabilizationConflicts(countryId?: string): RegulatoryChange[] {
  return getRegulatoryChanges(countryId).filter(r => r.stabilizationConflict);
}

export { DEFAULT_THRESHOLDS };
export type { RiskThresholds };
