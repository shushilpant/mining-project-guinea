// ============================================================
// Core domain types for the Investor & Compliance Intelligence System
// ============================================================

export type ComplianceStatus = 'on-track' | 'at-risk' | 'breached' | 'met';
export type AgreementStatus = 'active' | 'lapsed' | 'under-review';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskFlagStatus = 'open' | 'acknowledged' | 'resolved';
export type CommitmentType =
  | 'production'
  | 'infrastructure'
  | 'local-employment'
  | 'environmental'
  | 'community-development'
  | 'financial';
export type InfrastructureProjectType =
  | 'rail'
  | 'port'
  | 'road'
  | 'power'
  | 'processing-plant'
  | 'dam'
  | 'school'
  | 'hospital';
export type Commodity =
  | 'bauxite'
  | 'gold'
  | 'iron ore'
  | 'manganese'
  | 'nickel'
  | 'lithium'
  | 'diamonds'
  | 'chromite';

// ============================================================

export interface Country {
  id: string;
  name: string;
  currency: string;
  regulatoryFramework: string;
  miningAuthority: string;
  isoCode: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface OwnershipEntity {
  name: string;
  jurisdiction: string;
  ownershipPercent: number;
  isOpaque: boolean;
}

export interface Operator {
  id: string;
  name: string;
  parentCompany: string;
  countryOfRegistration: string;
  ultimateBeneficialOwners: OwnershipEntity[];
  countryIds: string[];
  riskScore: number; // 0–100, computed
  complianceStatus: ComplianceStatus; // computed
  ownershipChanged: boolean;
  ownershipChangedNote?: string;
}

export interface Agreement {
  id: string;
  operatorId: string;
  countryId: string;
  commodity: Commodity;
  licenseType: string;
  dateSigned: string; // ISO date
  expiryDate: string; // ISO date
  status: AgreementStatus;
  royaltyRate: number; // percentage
  pricingStructure: string;
  contractValue: number; // USD millions
  description: string;
  concesssionArea: string; // location description
  coordinates: [number, number]; // mine location
}

export interface Commitment {
  id: string;
  agreementId: string;
  type: CommitmentType;
  description: string;
  targetValue: number;
  targetUnit: string;
  dueDate: string; // ISO date
  status: ComplianceStatus; // computed from PerformanceRecords
}

export interface PerformanceRecord {
  id: string;
  commitmentId: string;
  reportingPeriod: string; // e.g. "2023-Q1"
  actualValue: number;
  actualUnit: string;
  dateRecorded: string;
  source: string;
}

export interface RiskFlag {
  id: string;
  operatorId: string;
  agreementId: string;
  commitmentId?: string;
  severity: RiskSeverity;
  category: string;
  description: string;
  triggeredDate: string;
  status: RiskFlagStatus;
  recommendedAction: string;
  ruleTriggered: string;
  evidenceDescription: string;
}

export interface InfrastructureObligation {
  id: string;
  agreementId: string;
  projectType: InfrastructureProjectType;
  projectName: string;
  committedCompletionDate: string;
  actualProgress: number; // 0–100
  status: ComplianceStatus;
  lastUpdated: string;
}

// ============================================================
// Computed / derived shapes used by the UI
// ============================================================

export interface OperatorScorecard {
  operatorId: string;
  operatorName: string;
  countryIds: string[];
  totalCommitments: number;
  metCount: number;
  onTrackCount: number;
  atRiskCount: number;
  breachedCount: number;
  complianceRate: number; // 0–100
  openFlags: number;
  criticalFlags: number;
}

export interface CountrySummary {
  countryId: string;
  countryName: string;
  activeAgreements: number;
  totalOperators: number;
  complianceRate: number;
  openCriticalFlags: number;
  avgRoyaltyRate: number;
}

export interface RiskThresholds {
  productionShortfallPercent: number;      // e.g. 75 → flag if below 75% of target
  productionShortfallPeriods: number;      // consecutive periods
  infrastructureOverdueProgressMax: number;// flag if past due date AND progress < this %
  agreementExpiryWarningDays: number;      // flag if expiring within N days
  performanceDropPercent: number;          // sudden drop threshold
}

export const DEFAULT_THRESHOLDS: RiskThresholds = {
  productionShortfallPercent: 75,
  productionShortfallPeriods: 2,
  infrastructureOverdueProgressMax: 100,
  agreementExpiryWarningDays: 90,
  performanceDropPercent: 25,
};

// ============================================================
// New Feature Types
// ============================================================

export interface BeneficialOwnerNode {
  id: string;
  /** Operator this ownership node belongs to — scopes the tree per operator. */
  operatorId: string;
  name: string;
  jurisdiction: string;
  ownershipPercent: number;
  isPEP: boolean;
  pepDetails?: string;
  isOpaque: boolean;
  parentId?: string;
  entityType: 'individual' | 'corporate' | 'government' | 'trust';
}

export interface ProtectedZone {
  id: string;
  name: string;
  type: 'national_park' | 'artisanal_zone' | 'water_reserve' | 'forest_reserve' | 'wildlife_corridor';
  countryId: string;
  coordinates: [number, number];
  radiusKm: number;
  description: string;
}

export interface ConcessionConflict {
  id: string;
  agreementId: string;
  zoneId: string;
  overlapAreaKm2: number;
  severity: 'critical' | 'high' | 'medium';
  description: string;
}

export interface CommodityPrice {
  date: string;
  commodity: Commodity;
  pricePerUnit: number;
  unit: string;
}

export interface LocalContentRecord {
  id: string;
  agreementId: string;
  operatorId: string;
  category: 'employment' | 'procurement' | 'infrastructure' | 'training' | 'community_fund';
  promised: number;
  actual: number;
  unit: string;
  reportingPeriod: string;
  verifiedBy?: string;
  verifiedDate?: string;
}

export interface DocumentAccessLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'viewed' | 'downloaded' | 'modified' | 'uploaded' | 'deleted';
  documentName: string;
  documentVersion: string;
  documentType: 'agreement' | 'negotiation_note' | 'audit_report' | 'eiti_report' | 'risk_assessment';
  agreementId?: string;
  ipAddress: string;
  /** Content hash of the document version touched — anchors the immutable audit trail. */
  hash: string;
  details?: string;
}

export interface EITIReportSection {
  countryId: string;
  sectionNumber: string;
  title: string;
  status: 'complete' | 'partial' | 'missing';
  dataSource: string;
  lastUpdated: string;
}

// ============================================================
// Expansion Modules — ESG, Market, Documents, Alerts,
// Public Portal, Regulatory Tracker
// ============================================================

// ── ESG Tracking (M9) ──
export interface ESGMetric {
  id: string;
  operatorId: string;
  agreementId: string;
  category: 'environmental' | 'social' | 'governance';
  subcategory: string; // e.g. 'water_usage', 'carbon_emissions', 'tailings_dam', 'community_grievance', 'rehab_provision'
  metricName: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  reportingPeriod: string;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

export interface MineClosure {
  id: string;
  agreementId: string;
  operatorId: string;
  mineName: string;
  estimatedClosureDate: string;
  rehabilitationProvisionUSD: number;
  rehabilitationSpentUSD: number;
  closurePlanStatus: 'approved' | 'pending' | 'overdue';
  environmentalBondUSD: number;
  lastAuditDate: string;
}

// ── Market Intelligence (M10) ──
export interface CommodityMarketData {
  commodity: Commodity;
  currentPrice: number;
  priceUnit: string;
  change24h: number;
  change7d: number;
  change30d: number;
  yearHigh: number;
  yearLow: number;
  lastUpdated: string;
}

export interface RevenueImpactScenario {
  commodity: Commodity;
  priceChangePercent: number;
  currentRevenue: number;
  projectedRevenue: number;
  impactUSD: number;
}

// ── Document Management (M11) ──
export interface ManagedDocument {
  id: string;
  title: string;
  documentType: 'agreement' | 'amendment' | 'audit_report' | 'esg_report' | 'closure_plan' | 'regulatory';
  agreementId?: string;
  operatorId?: string;
  countryId: string;
  uploadDate: string;
  lastModified: string;
  version: string;
  fileSize: string;
  uploadedBy: string;
  tags: string[];
  extractedClauses: ExtractedClause[];
  hash: string;
}

export interface ExtractedClause {
  id: string;
  documentId: string;
  clauseType: 'royalty' | 'stabilization' | 'dispute_resolution' | 'local_content' | 'environmental' | 'termination' | 'force_majeure';
  clauseText: string;
  pageNumber: number;
  confidence: number; // 0-1, simulated AI confidence
}

// ── Automated Alerts ──
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type AlertCategory = 'compliance' | 'payment' | 'deadline' | 'renewal' | 'risk' | 'regulatory' | 'esg';

export interface SystemAlert {
  id: string;
  category: AlertCategory;
  priority: AlertPriority;
  title: string;
  description: string;
  triggerRule: string;
  entityType: 'agreement' | 'operator' | 'commitment' | 'regulation';
  entityId: string;
  createdAt: string;
  expiresAt?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  actionUrl: string;
}

// ── Public Portal / Open Data (M12) ──
export interface PublicDataset {
  id: string;
  name: string;
  description: string;
  category: 'revenue' | 'licenses' | 'production' | 'esg' | 'local_content';
  countryId: string;
  recordCount: number;
  lastPublished: string;
  format: 'CSV' | 'JSON' | 'Excel';
  isPublic: boolean;
  downloadCount: number;
  dataFields: string[];
}

export interface PublicationLog {
  id: string;
  datasetId: string;
  publishedAt: string;
  publishedBy: string;
  recordCount: number;
  status: 'published' | 'draft' | 'retracted';
  notes?: string;
}

// ── Regulatory Tracker (M13) ──
export interface RegulatoryChange {
  id: string;
  countryId: string;
  title: string;
  description: string;
  category: 'mining_law' | 'tax_code' | 'environmental' | 'labor' | 'ownership' | 'royalty';
  status: 'enacted' | 'proposed' | 'under_review' | 'withdrawn';
  effectiveDate: string;
  announcedDate: string;
  source: string;
  impactSeverity: 'high' | 'medium' | 'low';
  affectedAgreementIds: string[];
  stabilizationConflict: boolean;
  summary: string;
}

export interface RegulatoryImpact {
  regulationId: string;
  agreementId: string;
  impactType: 'royalty_increase' | 'new_obligation' | 'stabilization_conflict' | 'compliance_gap';
  description: string;
  estimatedFinancialImpactUSD?: number;
}

