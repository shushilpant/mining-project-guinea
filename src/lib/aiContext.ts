// ============================================================
// aiContext — turn the live dataService snapshot into a compact, grounded
// briefing the LLM can reason over. The point is RAG-without-vectors: we
// hand the model only the slice relevant to the user's selected country,
// not the full database, so prompts stay small and answers stay factual.
//
// Output is plain text (Markdown-ish) bounded by line counts per section,
// which keeps total tokens predictable for the open-weight 20B default
// model. Counts can be widened for larger models if needed.
// ============================================================

import {
  getCountryById,
  getOperatorById,
  getOperators,
  getAgreements,
  getAgreementById,
  getAgreementsByOperator,
  getCommitments,
  getCommitmentsForOperator,
  getCommitmentsForCountry,
  getCommitmentById,
  getRiskFlags,
  getRiskFlagById,
  getRiskFlagsByOperator,
  getInfrastructureObligations,
  getInfrastructureObligationsByAgreement,
  getCountrySummary,
  getOperatorScorecard,
  getAllOperatorScorecards,
  getSystemMetrics,
  getPerformanceRecords,
  getAgreementsWithBenchmark,
  getRoyaltyBenchmarks,
  daysUntilExpiry,
} from '@/services/dataService';
import { fenceUserText } from '@/services/aiService';
import {
  COMMODITY_META,
  commoditiesInScope,
  topMovers,
  fmtUsd,
  fmtDelta,
  fmtProduction,
  type ScenarioInput,
  type RevenueProjection,
} from '@/lib/revenueModel';
import type { Commodity } from '@/data/types';

const COUNTRY_LABEL: Record<string, string> = {
  ALL: 'West Africa region (Guinea, Ghana, Côte d\'Ivoire combined)',
  GIN: 'Republic of Guinea',
  GHA: 'Republic of Ghana',
  CIV: 'Republic of Côte d\'Ivoire',
};

const SEV_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export interface ContextOptions {
  /** Country id from the country selector ('ALL' | 'GIN' | 'GHA' | 'CIV'). */
  countryId: string;
  /** Hard cap on rows per section. Default tuned for ~20B-class models. */
  maxOperators?: number;
  maxAgreements?: number;
  maxCommitments?: number;
  maxRiskFlags?: number;
  maxInfra?: number;
}

export function buildContext(opts: ContextOptions): string {
  const {
    countryId,
    maxOperators   = 12,
    maxAgreements  = 12,
    maxCommitments = 20,
    maxRiskFlags   = 14,
    maxInfra       = 8,
  } = opts;

  const filterId = countryId === 'ALL' ? undefined : countryId;
  const country  = filterId ? getCountryById(filterId) : undefined;
  const label    = COUNTRY_LABEL[countryId] ?? COUNTRY_LABEL.ALL;

  const metrics    = getSystemMetrics(filterId);
  const operators  = getOperators(filterId);
  const agreements = getAgreements(filterId);
  const commits    = filterId ? getCommitmentsForCountry(filterId) : [];
  const flags      = getRiskFlags(filterId).filter(f => f.status !== 'resolved');
  const infra      = getInfrastructureObligations(filterId);
  const scorecards = getAllOperatorScorecards(filterId);

  const lines: string[] = [];

  // ── Header ──
  lines.push(`# Compliance briefing pack — ${label}`);
  if (country) {
    lines.push(`Regulatory framework: ${country.regulatoryFramework}. Authority: ${country.miningAuthority}. Currency: ${country.currency}.`);
  }
  if (filterId) {
    const summary = getCountrySummary(filterId);
    lines.push(
      `Country totals: ${summary.activeAgreements} active agreements · ${summary.totalOperators} operators · ` +
      `compliance ${summary.complianceRate}% · avg royalty ${summary.avgRoyaltyRate}% · ` +
      `${summary.openCriticalFlags} open critical risk flag(s).`,
    );
  }
  lines.push(
    `System metrics: ${metrics.totalActiveAgreements} active agreements · ${metrics.totalOperators} operators · ` +
    `${metrics.totalCommitments} commitments (${metrics.breachedCommitments} breached, ${metrics.atRiskCommitments} at-risk) · ` +
    `system compliance ${metrics.systemComplianceRate}% · open flags by severity: ` +
    `${metrics.openCriticalFlags} crit / ${metrics.openHighFlags} high / ${metrics.openMediumFlags} med / ${metrics.openLowFlags} low.`,
  );
  lines.push('');

  // ── Operators (ranked by risk surface) ──
  lines.push('## Operators');
  const opRows = scorecards
    .sort((a, b) => (b.criticalFlags - a.criticalFlags) || (a.complianceRate - b.complianceRate))
    .slice(0, maxOperators)
    .map(s => {
      const op = operators.find(o => o.id === s.operatorId);
      const parent = op?.parentCompany ? ` (parent: ${op.parentCompany})` : '';
      const reg    = op?.countryOfRegistration ? ` reg:${op.countryOfRegistration}` : '';
      const opaque = op?.ultimateBeneficialOwners.some(u => u.isOpaque) ? ' opaque-UBO' : '';
      const own    = op?.ownershipChanged ? ' ownership-changed' : '';
      return `- ${s.operatorName} [${s.operatorId}]${parent}${reg}${opaque}${own} — ` +
             `commitments ${s.metCount}met/${s.onTrackCount}on-track/${s.atRiskCount}at-risk/${s.breachedCount}breached · ` +
             `compliance ${s.complianceRate}% · flags ${s.openFlags} (${s.criticalFlags} critical)`;
    });
  if (opRows.length === 0) lines.push('- (no operators in scope)');
  lines.push(...opRows);
  if (scorecards.length > maxOperators) lines.push(`- … and ${scorecards.length - maxOperators} more operators not shown`);
  lines.push('');

  // ── Agreements ──
  lines.push('## Agreements');
  const agRows = agreements
    .slice()
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
    .slice(0, maxAgreements)
    .map(a => {
      const days = daysUntilExpiry(a.expiryDate);
      const expHint = days < 0 ? 'EXPIRED' : days < 90 ? `expires in ${days}d` : `expires ${a.expiryDate}`;
      const op = operators.find(o => o.id === a.operatorId);
      return `- ${a.id} · ${op?.name ?? a.operatorId} · ${a.commodity} · ${a.countryId} · ` +
             `${a.licenseType} · royalty ${a.royaltyRate}% · value $${a.contractValue}M · ` +
             `status:${a.status} · ${expHint} · ${a.concesssionArea}`;
    });
  if (agRows.length === 0) lines.push('- (no agreements in scope)');
  lines.push(...agRows);
  if (agreements.length > maxAgreements) lines.push(`- … and ${agreements.length - maxAgreements} more agreements not shown`);
  lines.push('');

  // ── Commitments at-risk or breached ──
  if (filterId) {
    const focusCommits = commits
      .filter(c => c.status === 'breached' || c.status === 'at-risk')
      .slice(0, maxCommitments);
    if (focusCommits.length > 0) {
      lines.push('## Commitments not on track');
      for (const c of focusCommits) {
        lines.push(
          `- ${c.id} [${c.status}] ${c.type} · target ${c.targetValue} ${c.targetUnit} ` +
          `by ${c.dueDate} — ${c.description.length > 110 ? c.description.slice(0, 110) + '…' : c.description}`,
        );
      }
      lines.push('');
    }
  }

  // ── Risk flags (ordered by severity, then date) ──
  lines.push('## Open risk flags');
  const flagRows = flags
    .slice()
    .sort((a, b) => (SEV_RANK[a.severity] - SEV_RANK[b.severity]) || b.triggeredDate.localeCompare(a.triggeredDate))
    .slice(0, maxRiskFlags)
    .map(f => {
      const op = operators.find(o => o.id === f.operatorId);
      return `- [${f.severity.toUpperCase()}] ${f.category} — ${op?.name ?? f.operatorId} (${f.id}) · ` +
             `triggered ${f.triggeredDate} · ${f.description} · rule: ${f.ruleTriggered}. ` +
             `Recommended: ${f.recommendedAction}`;
    });
  if (flagRows.length === 0) lines.push('- (no open flags in scope)');
  lines.push(...flagRows);
  if (flags.length > maxRiskFlags) lines.push(`- … and ${flags.length - maxRiskFlags} more open flags not shown`);
  lines.push('');

  // ── Infrastructure obligations (overdue or behind) ──
  const infraRows = infra
    .filter(io => io.status === 'breached' || io.status === 'at-risk' || io.actualProgress < 100)
    .slice(0, maxInfra)
    .map(io =>
      `- ${io.projectName} (${io.projectType}) — agreement ${io.agreementId} · ` +
      `progress ${io.actualProgress}% · due ${io.committedCompletionDate} · status:${io.status}`,
    );
  if (infraRows.length > 0) {
    lines.push('## Infrastructure obligations');
    lines.push(...infraRows);
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================================
// Per-entity context builders
//
// These are small, focused briefing packs aimed at a single
// decision: triaging one flag, briefing one operator, drafting
// one negotiation memo. Smaller packs mean cheaper inference,
// tighter grounding, and fewer hallucinations than handing the
// model the full country snapshot for every per-entity task.
// ============================================================

function clip(s: string | undefined, n: number): string {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

/** Briefing pack scoped to a single risk flag and its surrounding entities. */
export function buildRiskFlagContext(flagId: string): string {
  const flag = getRiskFlagById(flagId);
  if (!flag) return `# Flag not found: ${flagId}`;

  const op  = getOperatorById(flag.operatorId);
  const ag  = getAgreementById(flag.agreementId);
  const cm  = flag.commitmentId ? getCommitmentById(flag.commitmentId) : undefined;
  const sc  = op ? getOperatorScorecard(op.id) : undefined;
  const sib = op ? getRiskFlagsByOperator(op.id).filter(f => f.id !== flag.id && f.status !== 'resolved') : [];
  const recs = cm ? getPerformanceRecords(cm.id) : [];

  const lines: string[] = [];
  lines.push(`# Risk flag briefing — ${flag.id}`);
  lines.push(`Severity: ${flag.severity.toUpperCase()} · Category: ${flag.category} · Status: ${flag.status}`);
  lines.push(`Triggered: ${flag.triggeredDate}`);
  lines.push(`Rule: ${flag.ruleTriggered}`);
  lines.push(`Evidence: ${clip(flag.evidenceDescription, 400)}`);
  lines.push(`Description: ${clip(flag.description, 400)}`);
  lines.push(`Existing recommended action: ${clip(flag.recommendedAction, 240)}`);
  lines.push('');

  if (op) {
    lines.push('## Operator');
    lines.push(`${op.name} [${op.id}] · parent: ${op.parentCompany} · registered in ${op.countryOfRegistration}`);
    lines.push(`Risk score: ${op.riskScore} · Compliance posture: ${op.complianceStatus}`);
    if (op.ownershipChanged) lines.push(`Ownership change flagged: ${op.ownershipChangedNote ?? '(no note)'}`);
    const opaqueUbos = op.ultimateBeneficialOwners.filter(u => u.isOpaque);
    if (opaqueUbos.length > 0) {
      lines.push(`Opaque ultimate beneficial owners: ${opaqueUbos.map(u => `${u.name} (${u.jurisdiction})`).join('; ')}`);
    }
    if (sc) lines.push(`Scorecard: ${sc.metCount}met / ${sc.onTrackCount}on-track / ${sc.atRiskCount}at-risk / ${sc.breachedCount}breached · compliance ${sc.complianceRate}%`);
    lines.push('');
  }

  if (ag) {
    lines.push('## Agreement');
    lines.push(`${ag.id} · ${ag.commodity} · ${ag.licenseType} · royalty ${ag.royaltyRate}% · value $${ag.contractValue}M`);
    lines.push(`Signed ${ag.dateSigned} · expires ${ag.expiryDate} (${daysUntilExpiry(ag.expiryDate)} days) · status:${ag.status}`);
    lines.push(`Concession: ${clip(ag.concesssionArea, 160)}`);
    lines.push('');
  }

  if (cm) {
    lines.push('## Underlying commitment');
    lines.push(`${cm.id} · ${cm.type} · target ${cm.targetValue} ${cm.targetUnit} by ${cm.dueDate}`);
    lines.push(`Description: ${clip(cm.description, 240)}`);
    if (recs.length > 0) {
      const series = recs.slice(-6).map(r => {
        const pct = cm.targetValue > 0 ? Math.round((r.actualValue / cm.targetValue) * 100) : null;
        return `${r.reportingPeriod}: ${r.actualValue.toLocaleString()} ${r.actualUnit}${pct !== null ? ` (${pct}% of target)` : ''}`;
      });
      lines.push(`Recent actuals: ${series.join(' · ')}`);
    }
    lines.push('');
  }

  if (sib.length > 0) {
    lines.push('## Other open flags on same operator');
    for (const f of sib.slice(0, 8)) {
      lines.push(`- [${f.severity.toUpperCase()}] ${f.category} (${f.id}) — ${clip(f.description, 120)}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/** Briefing pack scoped to a single operator: agreements, commitments, flags, performance. */
export function buildOperatorContext(operatorId: string): string {
  const op = getOperatorById(operatorId);
  if (!op) return `# Operator not found: ${operatorId}`;

  const sc        = getOperatorScorecard(op.id);
  const ags       = getAgreementsByOperator(op.id);
  const cms       = getCommitmentsForOperator(op.id);
  const openFlags = getRiskFlagsByOperator(op.id).filter(f => f.status !== 'resolved');

  const lines: string[] = [];
  lines.push(`# Operator briefing — ${op.name} [${op.id}]`);
  lines.push(`Parent: ${op.parentCompany} · Registered: ${op.countryOfRegistration} · Risk score: ${op.riskScore}`);
  lines.push(`Compliance: ${sc.complianceRate}% — ${sc.metCount}met / ${sc.onTrackCount}on-track / ${sc.atRiskCount}at-risk / ${sc.breachedCount}breached over ${sc.totalCommitments} commitments`);
  lines.push(`Open flags: ${sc.openFlags} (${sc.criticalFlags} critical)`);
  if (op.ownershipChanged) lines.push(`Ownership change flagged: ${op.ownershipChangedNote ?? '(no note)'}`);
  const opaque = op.ultimateBeneficialOwners.filter(u => u.isOpaque);
  if (opaque.length > 0) lines.push(`Opaque UBOs: ${opaque.map(u => `${u.name}(${u.jurisdiction})`).join(', ')}`);
  lines.push('');

  if (ags.length > 0) {
    lines.push('## Agreements');
    for (const a of ags) {
      const d = daysUntilExpiry(a.expiryDate);
      const expHint = d < 0 ? 'EXPIRED' : `expires in ${d}d`;
      lines.push(`- ${a.id} · ${a.commodity} · ${a.countryId} · royalty ${a.royaltyRate}% · value $${a.contractValue}M · ${a.status} · ${expHint}`);
    }
    lines.push('');
  }

  const focus = cms.filter(c => c.status === 'breached' || c.status === 'at-risk').slice(0, 14);
  if (focus.length > 0) {
    lines.push('## Commitments off-track');
    for (const c of focus) {
      const recs = getPerformanceRecords(c.id);
      const latest = recs[recs.length - 1];
      const pct = latest && c.targetValue > 0 ? Math.round((latest.actualValue / c.targetValue) * 100) : null;
      const tail = pct !== null ? ` · latest ${pct}% of target (${latest.reportingPeriod})` : '';
      lines.push(`- ${c.id} [${c.status}] ${c.type} · target ${c.targetValue} ${c.targetUnit} by ${c.dueDate}${tail} — ${clip(c.description, 110)}`);
    }
    lines.push('');
  }

  if (openFlags.length > 0) {
    lines.push('## Open risk flags');
    for (const f of openFlags.slice(0, 10)) {
      lines.push(`- [${f.severity.toUpperCase()}] ${f.category} (${f.id}) · ${clip(f.description, 140)} · rule: ${clip(f.ruleTriggered, 80)}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/** Briefing pack scoped to a single agreement: terms, commitments, peer benchmark, infrastructure. */
export function buildAgreementContext(agreementId: string): string {
  const ag = getAgreementById(agreementId);
  if (!ag) return `# Agreement not found: ${agreementId}`;

  const op    = getOperatorById(ag.operatorId);
  const cms   = getCommitments(ag.id);
  const infra = getInfrastructureObligationsByAgreement(ag.id);
  const peers = getAgreements()
    .filter(p => p.commodity === ag.commodity && p.status === 'active' && p.id !== ag.id);
  const peerRates = peers.map(p => p.royaltyRate).sort((a, b) => a - b);
  const peerMedian = peerRates.length > 0 ? peerRates[Math.floor(peerRates.length / 2)] : ag.royaltyRate;
  const peerMin = peerRates[0] ?? ag.royaltyRate;
  const peerMax = peerRates[peerRates.length - 1] ?? ag.royaltyRate;

  const lines: string[] = [];
  lines.push(`# Agreement briefing — ${ag.id}`);
  if (op) lines.push(`Operator: ${op.name} [${op.id}] · parent ${op.parentCompany} · registered ${op.countryOfRegistration}`);
  lines.push(`Country: ${ag.countryId} · Commodity: ${ag.commodity} · Licence: ${ag.licenseType}`);
  lines.push(`Royalty: ${ag.royaltyRate}% (peer median ${peerMedian}%, range ${peerMin}–${peerMax}% across ${peers.length} peers) · Value: $${ag.contractValue}M`);
  lines.push(`Pricing: ${ag.pricingStructure}`);
  lines.push(`Signed ${ag.dateSigned} · Expires ${ag.expiryDate} (${daysUntilExpiry(ag.expiryDate)} days) · Status: ${ag.status}`);
  lines.push(`Concession: ${clip(ag.concesssionArea, 200)}`);
  lines.push(`Description: ${clip(ag.description, 240)}`);
  lines.push('');

  if (cms.length > 0) {
    lines.push('## Commitments');
    for (const c of cms.slice(0, 16)) {
      lines.push(`- ${c.id} [${c.status}] ${c.type} · target ${c.targetValue} ${c.targetUnit} by ${c.dueDate} — ${clip(c.description, 110)}`);
    }
    lines.push('');
  }

  if (infra.length > 0) {
    lines.push('## Infrastructure obligations');
    for (const io of infra) {
      lines.push(`- ${io.projectName} (${io.projectType}) · progress ${io.actualProgress}% · due ${io.committedCompletionDate} · status:${io.status}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/** Briefing pack scoped to negotiation use: full benchmark table for a commodity/country slice. */
export function buildNegotiationContext(opts: {
  countryId?: string;
  commodity?: string;
  focusAgreementId?: string;
}): string {
  const { countryId, commodity, focusAgreementId } = opts;
  const benchmarks = getRoyaltyBenchmarks(commodity, countryId);
  const rows = getAgreementsWithBenchmark(countryId)
    .filter(a => !commodity || a.commodity === commodity);

  const lines: string[] = [];
  lines.push('# Negotiation briefing');
  if (countryId) {
    const c = getCountryById(countryId);
    if (c) lines.push(`Country: ${c.name} (${c.id}) · authority ${c.miningAuthority} · framework ${c.regulatoryFramework}`);
  }
  if (commodity) lines.push(`Commodity filter: ${commodity}`);
  if (benchmarks) {
    lines.push(`Peer royalty stats (${benchmarks.count} agreements): median ${benchmarks.median}% · avg ${benchmarks.avg.toFixed(1)}% · range ${benchmarks.min}–${benchmarks.max}%`);
  }
  lines.push('');

  if (focusAgreementId) {
    const focus = rows.find(r => r.id === focusAgreementId);
    if (focus) {
      lines.push('## Focus agreement');
      lines.push(`${focus.id} · ${focus.commodity} · royalty ${focus.royaltyRate}% (peer median ${focus.peerMedianRoyalty}%, vsMedian ${focus.vsMedian > 0 ? '+' : ''}${focus.vsMedian.toFixed(1)}pp)`);
      lines.push(`Contract value $${focus.contractValue}M · pricing ${focus.pricingStructure} · signed ${focus.dateSigned} · expires ${focus.expiryDate}`);
      const op = getOperatorById(focus.operatorId);
      if (op) lines.push(`Operator: ${op.name} (parent ${op.parentCompany}, registered ${op.countryOfRegistration})`);
      lines.push('');
    }
  }

  lines.push('## Comparable agreements');
  for (const r of rows.slice(0, 14)) {
    if (r.id === focusAgreementId) continue;
    const op = getOperatorById(r.operatorId);
    lines.push(`- ${r.id} · ${op?.name ?? r.operatorId} · ${r.commodity} · ${r.countryId} · royalty ${r.royaltyRate}% (vs median ${r.vsMedian > 0 ? '+' : ''}${r.vsMedian.toFixed(1)}pp) · value $${r.contractValue}M`);
  }
  lines.push('');

  lines.push('## Reference floors');
  lines.push('- Ghana: Royalty Regulations 2025 sliding 5–12% (gold).');
  lines.push("- Côte d'Ivoire: 2025 Finance Act — 8% royalty above USD 2,000/oz gold.");
  lines.push('- Guinea: EITI Guinea June 2025 — Simandou fiscal modelling pre-2035 USD 0.7–1.7bn/yr, USD 2.7bn/yr post-2035.');
  lines.push('- Frameworks: IGF MPF, OECD MNE Guidelines, NRGI RGI 2021, IFC PS, IMF DIGNAR scenarios.');

  return lines.join('\n');
}

/** Region-wide *thin* pack for anomaly scans. Densely encoded for max signal/token. */
export function buildAnomalyScanContext(countryId: string): string {
  const filterId = countryId === 'ALL' ? undefined : countryId;
  const operators  = getOperators(filterId);
  const agreements = getAgreements(filterId);
  const flags      = getRiskFlags(filterId).filter(f => f.status !== 'resolved');
  const infra      = getInfrastructureObligations(filterId);
  const scorecards = getAllOperatorScorecards(filterId);

  const lines: string[] = [];
  lines.push(`# Anomaly scan dataset — ${countryId}`);

  lines.push('## Operators (one per line, terse)');
  for (const op of operators) {
    const sc = scorecards.find(s => s.operatorId === op.id);
    const opaque = op.ultimateBeneficialOwners.some(u => u.isOpaque) ? 'opaque-UBO' : '';
    const oc = op.ownershipChanged ? 'owner-changed' : '';
    const ags = agreements.filter(a => a.operatorId === op.id).map(a => a.id).join(',');
    lines.push(`- ${op.id} ${op.name} parent=${op.parentCompany} reg=${op.countryOfRegistration} risk=${op.riskScore} ${opaque} ${oc} compliance=${sc?.complianceRate}% breached=${sc?.breachedCount} flags=${sc?.openFlags} ags=[${ags}]`);
  }

  lines.push('');
  lines.push('## Agreements (terse)');
  for (const a of agreements) {
    lines.push(`- ${a.id} op=${a.operatorId} ${a.commodity} ${a.countryId} royalty=${a.royaltyRate}% value=$${a.contractValue}M expires=${a.expiryDate}(${daysUntilExpiry(a.expiryDate)}d) status=${a.status}`);
  }

  lines.push('');
  lines.push('## Open flags (terse)');
  for (const f of flags) {
    lines.push(`- ${f.id} op=${f.operatorId} ag=${f.agreementId} sev=${f.severity} cat=${f.category}`);
  }

  lines.push('');
  lines.push('## Infrastructure (terse)');
  for (const io of infra) {
    lines.push(`- ${io.id} ag=${io.agreementId} ${io.projectType} progress=${io.actualProgress}% due=${io.committedCompletionDate} status=${io.status}`);
  }

  return lines.join('\n');
}

/**
 * Briefing pack for the What-If revenue projector. Every figure here is
 * pre-computed by revenueModel — the model must reason over these numbers,
 * not re-derive them. Agreement IDs are cited so the UI can resolve them
 * to live links.
 */
export function buildScenarioContext(
  scenario: ScenarioInput,
  baseline: RevenueProjection,
  projection: RevenueProjection,
): string {
  const label = COUNTRY_LABEL[scenario.countryId] ?? COUNTRY_LABEL.ALL;
  const lines: string[] = [];

  const total = projection.totalRoyaltyUsd;
  const base = baseline.totalRoyaltyUsd;
  const delta = total - base;
  const pct = base > 0 ? (delta / base) * 100 : 0;

  lines.push(`# What-If revenue projection — ${label}`);
  lines.push(
    'Metric: projected ANNUAL STATE ROYALTY TAKE (ad-valorem / extraction only). ' +
    'Excludes corporate income tax, state free-carry dividends, and the local development fund.',
  );
  lines.push('');

  // ── Headline ──
  lines.push('## Headline');
  lines.push(`- Baseline royalty take (today's prices, current run-rate, contracted rates): ${fmtUsd(base)}/yr`);
  lines.push(`- Scenario royalty take: ${fmtUsd(total)}/yr`);
  lines.push(`- Change vs baseline: ${fmtDelta(delta)}/yr (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`);
  lines.push('');

  // ── Levers the user set ──
  lines.push('## Scenario assumptions');
  lines.push(`- Production basis: ${scenario.basis === 'capacity' ? 'committed capacity (annual targets)' : 'current run-rate (last 4 reported quarters, annualised)'}`);
  lines.push(`- Royalty regime: ${scenario.regime === 'reform' ? 'apply 2025 statutory sliding scales (Ghana gold/lithium 5–12%, Côte d’Ivoire gold up to 8% above USD 2,000/oz)' : 'contractual rates as signed (honours fiscal-stability clauses)'}`);
  if (scenario.productionAdjustmentPct !== 0) lines.push(`- Global production adjustment: ${scenario.productionAdjustmentPct > 0 ? '+' : ''}${scenario.productionAdjustmentPct}%`);
  if (scenario.royaltyUpliftPp !== 0) lines.push(`- Manual royalty uplift applied to every rate: ${scenario.royaltyUpliftPp > 0 ? '+' : ''}${scenario.royaltyUpliftPp} percentage points`);
  const scopeCommodities = commoditiesInScope(scenario.countryId);
  const priceLines = scopeCommodities
    .filter(c => COMMODITY_META[c].defaultPrice > 0)
    .map(c => {
      const p = scenario.prices[c] ?? COMMODITY_META[c].defaultPrice;
      const d = COMMODITY_META[c].defaultPrice;
      const tag = p !== d ? ` (default ${d})` : '';
      return `${COMMODITY_META[c].label} ${p}/${COMMODITY_META[c].unit}${tag}`;
    });
  if (priceLines.length > 0) lines.push(`- Commodity prices: ${priceLines.join(' · ')}`);
  lines.push('');

  // ── Country split ──
  const countries = Object.keys({ ...baseline.byCountry, ...projection.byCountry });
  if (countries.length > 0) {
    lines.push('## By country (baseline → scenario)');
    for (const cid of countries) {
      const b = baseline.byCountry[cid] ?? 0;
      const s = projection.byCountry[cid] ?? 0;
      lines.push(`- ${COUNTRY_LABEL[cid] ?? cid}: ${fmtUsd(b)} → ${fmtUsd(s)} (${fmtDelta(s - b)})`);
    }
    lines.push('');
  }

  // ── Commodity split ──
  const commodities = Object.keys({ ...baseline.byCommodity, ...projection.byCommodity }) as Commodity[];
  if (commodities.length > 0) {
    lines.push('## By commodity (baseline → scenario)');
    for (const c of commodities) {
      const b = baseline.byCommodity[c] ?? 0;
      const s = projection.byCommodity[c] ?? 0;
      lines.push(`- ${COMMODITY_META[c]?.label ?? c}: ${fmtUsd(b)} → ${fmtUsd(s)} (${fmtDelta(s - b)})`);
    }
    lines.push('');
  }

  // ── Agreement-level movers (cite IDs) ──
  const movers = topMovers(baseline, projection, 8);
  if (movers.length > 0) {
    lines.push('## Largest agreement-level swings');
    for (const m of movers) {
      lines.push(`- [${m.agreementId}] ${m.operatorName} (${m.commodity}, ${m.countryId}): ${fmtUsd(m.baselineUsd)} → ${fmtUsd(m.scenarioUsd)} (${fmtDelta(m.deltaUsd)})`);
    }
    lines.push('');
  }

  // ── Excluded agreements (revenue forgone) ──
  if (scenario.excludedAgreementIds.length > 0) {
    lines.push('## Excluded from take (modelled as revoked / exited / sold)');
    for (const id of scenario.excludedAgreementIds) {
      const b = baseline.rows.find(r => r.agreementId === id);
      lines.push(`- [${id}] ${b?.operatorName ?? id} — royalty forgone vs baseline: ${fmtUsd(b?.royaltyUsd ?? 0)}/yr`);
    }
    lines.push('');
  }

  // ── Pre-production projects (zero run-rate, capacity matters) ──
  const preProd = projection.rows.filter(r => r.preProduction);
  if (preProd.length > 0) {
    lines.push('## Pre-production / ramping (no current run-rate; only contribute under "capacity" basis)');
    for (const r of preProd.slice(0, 6)) {
      lines.push(`- [${r.agreementId}] ${r.operatorName} (${r.commodity}) — capacity target ${fmtProduction(r.production, r.unit)} → ${fmtUsd(r.royaltyUsd)}/yr at ${r.effectiveRate.toFixed(2)}%`);
    }
    lines.push('');
  }

  // ── Regulatory anchors for caveats (grounded, cite IDs) ──
  lines.push('## Regulatory anchors (for caveats)');
  lines.push('- Ghana: Minerals & Mining (Royalty) Regulations 2025 — gold sliding 5–12% (12% above USD 4,500/oz); lithium 5–12% (USD 1,500–3,200/t spodumene).');
  lines.push("- Côte d'Ivoire: 2025 Finance Act — gold ad-valorem up to 8% above USD 2,000/oz, retroactive to January 2025.");
  lines.push('- Guinea: bauxite extraction tax 0.075% (negligible ad-valorem yield); iron-ore royalty 3% (Simandou). State value sits in the 15% free-carry, not bauxite ad-valorem.');
  lines.push('- Fiscal-stability friction: [AGR-009] Gold Fields Tarkwa carries a stability clause through 2028 — applying the 2025 sliding scale to stabilised tonnage risks investor-state dispute.');
  lines.push('- Revocation precedent: Guinea cancelled ~180 licences in May 2025, generating the Axis International USD 28.9bn ICSID claim — model exclusions as fiscal gains net of arbitration exposure, not pure upside.');

  return lines.join('\n');
}

// Re-export the user-text fencer so prompt builders can use it without
// importing aiService directly.
export { fenceUserText };

/**
 * The system prompt is intentionally strict: the model is told to ground every
 * claim in the supplied briefing pack and to admit uncertainty rather than
 * invent numbers. That matters for a ministerial-grade tool.
 */
export function buildSystemPrompt(countryLabel: string): string {
  return [
    'You are the ACCI Compliance Analyst — an AI assistant embedded in a',
    'government compliance-intelligence system used by Ministries of Mining',
    'in Guinea, Ghana, and Côte d\'Ivoire (programme PEB-0526-WA-MIN-05).',
    '',
    `The user is currently viewing: ${countryLabel}.`,
    '',
    'You will receive a BRIEFING PACK containing the live data the user is',
    'looking at. Ground every answer in that pack. Cite operator names, ',
    'agreement IDs (AGR-…), and risk-flag IDs when you reference them.',
    '',
    'House rules:',
    '• Be concise and structured. Use short Markdown — bullet lists, bold',
    '  for severities, plain prose otherwise. No emojis. No flattery.',
    '• If the pack does not contain the answer, say so plainly. Do not',
    '  invent operators, royalty rates, dates, or production figures.',
    '• Treat severities critical > high > medium > low when prioritising.',
    '• When the user asks for a "briefing" or "summary", lead with the top',
    '  3–5 things that warrant ministerial attention this week, with the',
    '  recommended action for each.',
    '• Distinguish facts present in the pack from your interpretation.',
    '• If the user asks about anything outside the scope of this compliance dashboard or irrelevant to the provided data, politely reply that it is "This request falls outside my operational scope. I am designed exclusively to analyse and advise on the mining compliance data provided within this dashboard." and decline to answer.',
    '• Always use British English spellings and conventions (e.g., categorise, colour, licence as noun).',
    '• Do not end your responses with conversational fillers, offers of further assistance, or follow-up questions (e.g., "Is there anything else?", "Would you like to know more?"). Just provide the answer and stop.',
  ].join('\n');
}
