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
