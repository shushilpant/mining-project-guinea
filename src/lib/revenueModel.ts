// ============================================================
// revenueModel — deterministic fiscal projection engine for the
// What-If Scenarios module.
//
// Design contract (the anti-gimmick rule for this codebase): every
// number the UI shows and every number the AI narrates is computed
// HERE, in plain arithmetic over the seed data — never invented by
// the model. The LLM is handed the finished figures and only
// interprets them.
//
// The model projects annual STATE ROYALTY REVENUE (ad-valorem /
// extraction take) per active agreement:
//
//     royalty = annualProduction × commodityPrice × effectiveRate
//
//   • annualProduction comes from the production-type commitment for
//     the agreement — either the current run-rate (last 4 reported
//     quarters, annualised) or the committed capacity (target).
//   • commodityPrice is a user input. Defaults are anchored to the
//     figures cited in the dataset (gold > USD 5,000/oz early 2026,
//     spodumene USD 1,500–3,200/t, etc.) and clearly flagged as
//     assumptions in the UI.
//   • effectiveRate applies the REAL 2025 statutory sliding-scale
//     regimes (Ghana Royalty Regulations 2025 gold/lithium 5–12%,
//     Côte d'Ivoire 2025 Finance Act gold up to 8% above USD
//     2,000/oz) when the user opts into the reform; otherwise the
//     contractual rate stored on the agreement is used (honouring
//     stability clauses).
//
// What this DELIBERATELY does not model: corporate income tax,
// state free-carry dividends, the LDF, or withholding. Those depend
// on profit and equity assumptions the dataset does not carry, and
// inventing them would undermine the grounding contract. The output
// is explicitly labelled "royalty take" everywhere.
// ============================================================

import type { Agreement, Commitment, Commodity } from '@/data/types';
export type { Commodity } from '@/data/types';
import {
  getAgreements,
  getCommitments,
  getPerformanceRecords,
  getOperatorById,
} from '@/services/dataService';

// ─── Production basis ────────────────────────────────────────

export type ProductionBasis = 'current' | 'capacity';

// ─── Royalty regime ──────────────────────────────────────────
//   contractual — use the rate stored on each agreement (current
//                 contracted rate; honours fiscal-stability clauses).
//   reform      — recompute gold & lithium rates from the price using
//                 the 2025 statutory sliding scales.
export type RoyaltyRegime = 'contractual' | 'reform';

// ─── Commodity pricing ───────────────────────────────────────
// The unit each price is quoted in. Gold is per troy ounce; every
// other commodity in the dataset is a bulk mineral priced per tonne.

export interface CommodityMeta {
  /** Display label. */
  label: string;
  /** 'oz' for gold, 't' for bulk minerals. */
  unit: 'oz' | 't';
  /** Default price, anchored to dataset references. Flagged as an assumption in UI. */
  defaultPrice: number;
  /** Slider bounds. */
  min: number;
  max: number;
  step: number;
  /** Short note on where the default comes from / what drives the rate. */
  note: string;
}

export const COMMODITY_META: Record<Commodity, CommodityMeta> = {
  gold: {
    label: 'Gold', unit: 'oz', defaultPrice: 5000, min: 1500, max: 6500, step: 50,
    note: 'LBMA price. Dataset notes gold traded > USD 5,000/oz early 2026. Drives the Ghana 5–12% and Côte d’Ivoire up-to-8% sliding scales.',
  },
  'iron ore': {
    label: 'Iron ore', unit: 't', defaultPrice: 105, min: 50, max: 220, step: 5,
    note: 'SGX / Singapore Iron Ore Index CFR China benchmark. Flat 3% royalty under the Guinea Mining Code (Simandou).',
  },
  bauxite: {
    label: 'Bauxite', unit: 't', defaultPrice: 65, min: 25, max: 130, step: 5,
    note: 'Guinea extraction tax is a flat 0.075% of value — royalty take stays negligible regardless of price or tonnage.',
  },
  manganese: {
    label: 'Manganese', unit: 't', defaultPrice: 250, min: 100, max: 500, step: 10,
    note: 'CRU manganese index. Flat 5% royalty (Ghana, Nsuta).',
  },
  lithium: {
    label: 'Lithium (spodumene)', unit: 't', defaultPrice: 1500, min: 700, max: 4000, step: 50,
    note: 'Spodumene concentrate. Drives the Ghana 5–12% lithium sliding scale (USD 1,500–3,200/t).',
  },
  nickel:   { label: 'Nickel',   unit: 't', defaultPrice: 17000, min: 8000,  max: 30000, step: 250, note: 'LME nickel.' },
  diamonds: { label: 'Diamonds', unit: 't', defaultPrice: 0,     min: 0,     max: 0,     step: 1,   note: 'Not modelled — no producing agreement in scope.' },
  chromite: { label: 'Chromite', unit: 't', defaultPrice: 200,   min: 100,   max: 400,   step: 10,  note: 'Reference only.' },
};

export type PriceMap = Partial<Record<Commodity, number>>;

export function defaultPrices(): PriceMap {
  const out: PriceMap = {};
  (Object.keys(COMMODITY_META) as Commodity[]).forEach(c => { out[c] = COMMODITY_META[c].defaultPrice; });
  return out;
}

// ─── Scenario input ──────────────────────────────────────────

export interface ScenarioInput {
  /** Country scope: 'ALL' | 'GIN' | 'GHA' | 'CIV'. */
  countryId: string;
  prices: PriceMap;
  basis: ProductionBasis;
  /** Global production adjustment, percent. -50 … +50. 0 = as-reported. */
  productionAdjustmentPct: number;
  regime: RoyaltyRegime;
  /** Flat manual uplift added to every effective rate, in percentage points. */
  royaltyUpliftPp: number;
  /** Agreement IDs the user has excluded (models revocation / sale collapse / exit). */
  excludedAgreementIds: string[];
}

export function defaultScenario(countryId: string): ScenarioInput {
  return {
    countryId,
    prices: defaultPrices(),
    basis: 'current',
    productionAdjustmentPct: 0,
    regime: 'contractual',
    royaltyUpliftPp: 0,
    excludedAgreementIds: [],
  };
}

/** The fixed reference point deltas are measured against: today's prices,
 *  current run-rate, contracted rates, nothing excluded. */
export function baselineScenario(countryId: string): ScenarioInput {
  return defaultScenario(countryId);
}

// ─── Production extraction ───────────────────────────────────

/** Gold is reported in troy ounces; every other commodity in tonnes. */
function unitFor(commodity: Commodity): 'oz' | 't' {
  return COMMODITY_META[commodity]?.unit ?? 't';
}

/**
 * Annual production for an agreement in its commodity's base unit
 * (oz or tonnes). Sums across all production-type commitments on the
 * agreement (some agreements carry more than one).
 *
 *   • 'current'  → last 4 reported quarters, annualised. A project that
 *                  has never reported (no performance records) is treated
 *                  as a zero run-rate, NOT its target — pre-production
 *                  projects (WCS Simandou, Ahafo North) only contribute
 *                  under the 'capacity' basis.
 *   • 'capacity' → the committed annual target.
 *
 * Returns 0 for agreements with no production commitment (e.g. a pure
 * infrastructure or financial obligation) or pre-production projects
 * whose run-rate is still zero.
 */
export function annualProduction(agreementId: string, basis: ProductionBasis): number {
  const prodCommitments = getCommitments(agreementId).filter(c => c.type === 'production');
  let total = 0;
  for (const c of prodCommitments) total += productionForCommitment(c, basis);
  return total;
}

function productionForCommitment(c: Commitment, basis: ProductionBasis): number {
  if (basis === 'capacity') return c.targetValue;

  const recs = getPerformanceRecords(c.id);
  if (recs.length === 0) return 0; // never reported → zero run-rate (pre-production)
  const lastFour = recs.slice(-4);
  const sum = lastFour.reduce((a, r) => a + r.actualValue, 0);
  // Annualise: 4 quarters = 1 year. If fewer than 4 records exist, scale up.
  return sum * (4 / lastFour.length);
}

// ─── Effective royalty rate (the statutory sliding scales) ────

function lerp(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x <= x0) return y0;
  if (x >= x1) return y1;
  return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
}

/**
 * Effective royalty rate (percent) for an agreement under the chosen
 * regime and price. Under 'reform', gold and lithium follow the real
 * 2025 statutory sliding scales; flat-rate commodities are unchanged.
 * A manual uplift (percentage points) is applied last.
 */
export function effectiveRoyaltyRate(
  ag: Agreement,
  prices: PriceMap,
  regime: RoyaltyRegime,
  royaltyUpliftPp: number,
): number {
  let rate = ag.royaltyRate;

  if (regime === 'reform') {
    const price = prices[ag.commodity] ?? COMMODITY_META[ag.commodity]?.defaultPrice ?? 0;

    if (ag.commodity === 'gold' && ag.countryId === 'GHA') {
      // Ghana Minerals & Mining (Royalty) Regulations 2025: 5% base
      // rising to 12% above USD 4,500/oz.
      rate = lerp(price, 2000, 4500, 5, 12);
    } else if (ag.commodity === 'gold' && ag.countryId === 'CIV') {
      // Côte d'Ivoire 2025 Finance Act: ad-valorem up to 8% above USD 2,000/oz.
      rate = lerp(price, 2000, 2500, 6, 8);
    } else if (ag.commodity === 'lithium' && ag.countryId === 'GHA') {
      // Ghana lithium sliding scale: 5% below USD 1,500/t to 12% above USD 3,200/t spodumene.
      rate = lerp(price, 1500, 3200, 5, 12);
    }
    // iron ore (3%), bauxite (0.075%), manganese (5%) have no statutory
    // price-linked scale — keep the contractual rate.
  }

  rate += royaltyUpliftPp;
  return Math.max(0, Math.min(100, rate));
}

// ─── Projection ──────────────────────────────────────────────

export interface AgreementRevenue {
  agreementId: string;
  operatorId: string;
  operatorName: string;
  countryId: string;
  commodity: Commodity;
  production: number;        // oz or tonnes (after adjustment)
  unit: 'oz' | 't';
  price: number;             // USD per unit
  grossValueUsd: number;     // production × price
  effectiveRate: number;     // percent
  royaltyUsd: number;        // grossValue × rate/100
  excluded: boolean;
  preProduction: boolean;    // true when run-rate is 0 but a capacity target exists
}

export interface RevenueProjection {
  scenario: ScenarioInput;
  totalRoyaltyUsd: number;
  byCountry: Record<string, number>;
  byCommodity: Partial<Record<Commodity, number>>;
  rows: AgreementRevenue[];
}

export function computeProjection(scenario: ScenarioInput): RevenueProjection {
  const filterId = scenario.countryId === 'ALL' ? undefined : scenario.countryId;
  const agreements = getAgreements(filterId).filter(a => a.status === 'active');
  const adjust = 1 + scenario.productionAdjustmentPct / 100;
  const excluded = new Set(scenario.excludedAgreementIds);

  const rows: AgreementRevenue[] = [];
  const byCountry: Record<string, number> = {};
  const byCommodity: Partial<Record<Commodity, number>> = {};
  let total = 0;

  for (const ag of agreements) {
    const unit = unitFor(ag.commodity);
    const rawProduction = annualProduction(ag.id, scenario.basis);
    // Avoid a second pass over the performance records when the basis is
    // already 'current' — rawProduction is then the run-rate itself.
    const currentRunRate = scenario.basis === 'current' ? rawProduction : annualProduction(ag.id, 'current');
    const production = rawProduction * adjust;
    const price = scenario.prices[ag.commodity] ?? COMMODITY_META[ag.commodity]?.defaultPrice ?? 0;
    const rate = effectiveRoyaltyRate(ag, scenario.prices, scenario.regime, scenario.royaltyUpliftPp);
    const grossValueUsd = production * price;
    const isExcluded = excluded.has(ag.id);
    const royaltyUsd = isExcluded ? 0 : grossValueUsd * (rate / 100);
    const op = getOperatorById(ag.operatorId);

    rows.push({
      agreementId: ag.id,
      operatorId: ag.operatorId,
      operatorName: op?.name ?? ag.operatorId,
      countryId: ag.countryId,
      commodity: ag.commodity,
      production,
      unit,
      price,
      grossValueUsd,
      effectiveRate: rate,
      royaltyUsd,
      excluded: isExcluded,
      preProduction: currentRunRate === 0 && rawProduction > 0,
    });

    if (!isExcluded) {
      total += royaltyUsd;
      byCountry[ag.countryId] = (byCountry[ag.countryId] ?? 0) + royaltyUsd;
      byCommodity[ag.commodity] = (byCommodity[ag.commodity] ?? 0) + royaltyUsd;
    }
  }

  rows.sort((a, b) => b.royaltyUsd - a.royaltyUsd);

  return { scenario, totalRoyaltyUsd: total, byCountry, byCommodity, rows };
}

// ─── Diff helper — scenario vs baseline, per agreement ───────

export interface RevenueMover {
  agreementId: string;
  operatorName: string;
  countryId: string;
  commodity: Commodity;
  baselineUsd: number;
  scenarioUsd: number;
  deltaUsd: number;
}

/** Per-agreement royalty deltas (scenario − baseline), sorted by absolute swing. */
export function topMovers(
  baseline: RevenueProjection,
  scenario: RevenueProjection,
  limit = 6,
): RevenueMover[] {
  const baseById = new Map(baseline.rows.map(r => [r.agreementId, r.royaltyUsd]));
  const movers: RevenueMover[] = scenario.rows.map(r => {
    const b = baseById.get(r.agreementId) ?? 0;
    return {
      agreementId: r.agreementId,
      operatorName: r.operatorName,
      countryId: r.countryId,
      commodity: r.commodity,
      baselineUsd: b,
      scenarioUsd: r.royaltyUsd,
      deltaUsd: r.royaltyUsd - b,
    };
  });
  return movers
    .filter(m => Math.abs(m.deltaUsd) > 1)
    .sort((a, b) => Math.abs(b.deltaUsd) - Math.abs(a.deltaUsd))
    .slice(0, limit);
}

// ─── Formatting helpers ──────────────────────────────────────

/** USD as $X.XXbn / $XXXm / $X.Xm / $XXk. */
export function fmtUsd(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(abs >= 1e8 ? 0 : 1)}m`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

/** Signed delta with a leading +/−. */
export function fmtDelta(n: number): string {
  if (n === 0) return '$0';
  return (n > 0 ? '+' : '') + fmtUsd(n);
}

/** Production volume, in Moz / koz / Mt / kt as appropriate. */
export function fmtProduction(n: number, unit: 'oz' | 't'): string {
  if (n === 0) return unit === 'oz' ? '0 oz' : '0 t';
  if (unit === 'oz') {
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)} Moz`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(0)} koz`;
    return `${Math.round(n)} oz`;
  }
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} Mt`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)} kt`;
  return `${Math.round(n)} t`;
}

/** Stable fingerprint of the scenario inputs — used for the AI narration cache key. */
export function scenarioFingerprintParts(s: ScenarioInput): (string | number)[] {
  const priceStr = (Object.keys(COMMODITY_META) as Commodity[])
    .map(c => `${c}:${s.prices[c] ?? ''}`).join(',');
  return [
    s.countryId, s.basis, s.regime,
    s.productionAdjustmentPct, s.royaltyUpliftPp,
    priceStr, s.excludedAgreementIds.slice().sort().join('|'),
  ];
}

/** Which commodities actually have a producing/active agreement in the current scope. */
export function commoditiesInScope(countryId: string): Commodity[] {
  const filterId = countryId === 'ALL' ? undefined : countryId;
  const set = new Set<Commodity>();
  for (const a of getAgreements(filterId).filter(a => a.status === 'active')) set.add(a.commodity);
  // Stable, sensible order.
  const order: Commodity[] = ['gold', 'iron ore', 'bauxite', 'manganese', 'lithium', 'nickel', 'chromite', 'diamonds'];
  return order.filter(c => set.has(c));
}
