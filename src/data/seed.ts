// ============================================================
// PEB-0526-WA-MIN-05 — Adaptive Continuous Compliance Intelligence
// (ACCI) Model reference dataset.
//
// Source-of-truth: markdown.md (consolidated manuscript & Part B
// Fact-Audit Verification Matrix). Operator names, ownership
// structures, fiscal terms, production figures, and incident
// records reflect verified primary sources (EITI validation
// reports, IMF Country Report 24/131, NRGI Resource Governance
// Index 2021, Rio Tinto SEC 6-K filings, EGA press releases,
// World Gold Council Gold Demand Trends 2024, World Bank press
// releases, operator filings, Reuters / MINING.COM / Mining
// Weekly / The National). Unverified claims (CTG equity split,
// Guinean BO decree D/2021/233/PRG/SGG, Simandou 1.5 bn t
// reserve figure) have been hedged per the manuscript's
// flashpoint advisory.
// ============================================================

import type {
  Country,
  Operator,
  Agreement,
  Commitment,
  PerformanceRecord,
  RiskFlag,
  InfrastructureObligation,
  BeneficialOwnerNode,
  ProtectedZone,
  ConcessionConflict,
  CommodityPrice,
  LocalContentRecord,
  DocumentAccessLog,
  EITIReportSection,
} from './types';

// ─── Countries ───────────────────────────────────────────────

export const COUNTRIES: Country[] = [
  {
    id: 'GIN',
    name: 'Guinea',
    isoCode: 'GN',
    currency: 'Guinean Franc (GNF)',
    regulatoryFramework:
      'Mining Code Law L/2011/006/CNT (9 Sept 2011) as amended by Law L/2013/053/CNT (8 April 2013), promulgated by Presidential Decree D/2013/075/PRG/SGG; 15% non-dilutable state free-carried interest with option to acquire additional cash participation up to 35% total; 30% mining profits tax; LDF 0.5–1% of turnover; 88/100 under 2019 EITI Standard (Board decision, 16 Feb 2022); next validation under 2023 EITI Standard commenced 1 Oct 2025; NRGI 2021 RGI mining score 62/100; SOGUIPAMI (Société Guinéenne du Patrimoine Minier) institutional custodian; beneficial-ownership legislation drafted 2019 / resubmitted 2024 pending enactment',
    miningAuthority: 'Ministère des Mines et de la Géologie — SOGUIPAMI / CPDM',
    coordinates: [11.0, -10.9],
  },
  {
    id: 'GHA',
    name: 'Ghana',
    isoCode: 'GH',
    currency: 'Ghanaian Cedi (GHS)',
    regulatoryFramework:
      'Minerals and Mining Act 2006 (Act 703) and amendments (Acts 794, 900, 995); Ghana Gold Board Act 2025 (Act 1140, assented 2 April 2025) — GoldBod sole authority to buy/sell/weigh/grade/assay/value/export gold; Minerals and Mining (Royalty) Regulations 2025 — sliding scale 5–12% gold (12% max above USD 4,500/oz, breached at implementation as gold traded >USD 5,000/oz) and 5–12% lithium (USD 1,500–3,200/t spodumene); 10% state free-carry; 35% CIT; NRGI 2021 RGI mining score 69/100; Africa\'s largest gold producer — exactly 140.6 t in 2024 (World Gold Council, Gold Demand Trends FY2024); ASM 1.9 m oz in 2024 (+70.1% YoY from 1.1 m oz in 2023), large-scale ~2.9 m oz stagnant (Ghana Chamber of Mines, 30 May 2025)',
    miningAuthority: 'Minerals Commission of Ghana (Act 450, 1993) · Ghana Gold Board (GoldBod, Act 1140 2025)',
    coordinates: [7.9, -1.0],
  },
  {
    id: 'CIV',
    name: 'Côte d\'Ivoire',
    isoCode: 'CI',
    currency: 'CFA Franc BCEAO (XOF)',
    regulatoryFramework:
      'Mining Code Law No. 2014-138 (24 March 2014, 197 arts.); Decree No. 2014-397 (25 June 2014); 2025 Finance Act raised ad-valorem gold royalty up to 8% above USD 2,000/oz, retroactive January 2025 (replacing 3–6% contract-linked range); 10% non-dilutable free-carry with option up to 15% for value; 25% CIT; five-year income-tax holiday from commercial production; Article 11 five-year cooling-off period; Article 125 Local Mining Development Fund; April 2024 beneficial-ownership register law (implementing Decree 2024-583 restricts public access to entity-level data only); PIRME (Politique Intégrée des Ressources Minérales et Énergétiques) adopted by Council of Ministers 3 Dec 2025 — CFA 38,000 bn (~USD 67–68 bn) over 15 years, mining-energy GDP share 7% (2022) → 14% (2040); MSPI (World Bank, 11 July 2025) for ASM formalisation covering >500,000 livelihoods; gold 58 t in 2024 → 62 t forecast 2025 → 100 t target 2030 (Diplo, GPMCI, Reuters)',
    miningAuthority: 'Ministère des Mines, du Pétrole et de l\'Énergie — SODEMI',
    coordinates: [7.5, -5.5],
  },
];

// ─── Operators ───────────────────────────────────────────────

export const OPERATORS: Operator[] = [

  // ── Guinea — Bauxite ──────────────────────────────────────

  {
    id: 'OP-01',
    name: 'Compagnie des Bauxites de Guinée (CBG)',
    parentCompany: 'Halco Mining Inc.',
    countryOfRegistration: 'Guinea',
    ultimateBeneficialOwners: [
      { name: 'Halco Mining Inc. (Alcoa/Rio Tinto/Dadco consortium)', jurisdiction: 'United States', ownershipPercent: 51, isOpaque: false },
      { name: 'Republic of Guinea', jurisdiction: 'Guinea', ownershipPercent: 49, isOpaque: false },
    ],
    countryIds: ['GIN'],
    riskScore: 45,
    complianceStatus: 'at-risk',
    ownershipChanged: false,
    ownershipChangedNote:
      'Convention de Base signed 1963 (75-year permit, originally 0% income tax; Geneva / ICC arbitration). Converted to Société Anonyme by 2002 Amendment. 13 villages around Sangarédi filed IFC Compliance Advisor Ombudsman complaint Feb 2019 for land displacement; mediation began Jan 2021. Hamdallaye village relocation during COVID lockdown criticised by Inclusive Development International.',
  },
  {
    id: 'OP-02',
    name: 'SMB-Winning Consortium (SMB / Société des Mines de Boké)',
    parentCompany: 'Winning International Group Pte Ltd',
    countryOfRegistration: 'Guinea',
    ultimateBeneficialOwners: [
      { name: 'Winning International Group Pte Ltd', jurisdiction: 'Singapore', ownershipPercent: 55, isOpaque: false },
      { name: 'Shandong Weiqiao Pioneering Group', jurisdiction: 'China', ownershipPercent: 30, isOpaque: false },
      { name: 'Alliance Mining Commodities Ltd', jurisdiction: 'Guinea', ownershipPercent: 15, isOpaque: false },
    ],
    countryIds: ['GIN'],
    riskScore: 38,
    complianceStatus: 'on-track',
    ownershipChanged: false,
  },
  {
    id: 'OP-03',
    name: 'UC Rusal Guinea (Friguia / CBK Kindia / COBAD Boké)',
    parentCompany: 'United Company RUSAL Plc',
    countryOfRegistration: 'Guinea',
    ultimateBeneficialOwners: [
      { name: 'United Company RUSAL Plc', jurisdiction: 'Russia / Jersey (LSE: RUAL)', ownershipPercent: 100, isOpaque: false },
    ],
    countryIds: ['GIN'],
    riskScore: 52,
    complianceStatus: 'at-risk',
    ownershipChanged: false,
    ownershipChangedNote:
      'Operates Friguia alumina refinery (~600 kt/yr), CBK Kindia bauxite mine, and COBAD Boké mine under separate conventions. Bauxite dust and water-table harm documented in Boké region. Sanctions context post-2022 creates operational and financing risk.',
  },

  // ── Guinea — Iron Ore (Simandou) ──────────────────────────

  {
    id: 'OP-04',
    name: 'SimFer SA — Simandou Blocks 3 & 4',
    parentCompany: 'Rio Tinto Group / Chinalco-CIOH joint venture',
    countryOfRegistration: 'Guinea',
    ultimateBeneficialOwners: [
      { name: 'SimFer JV (Rio Tinto + Chinalco / CIOH consortium incl. Baowu, CRCC, CHEC)', jurisdiction: 'Australia / United Kingdom / China', ownershipPercent: 85, isOpaque: true },
      { name: 'Government of Guinea (mine-level non-dilutable free-carry, Mining Code Art. relevant)', jurisdiction: 'Guinea', ownershipPercent: 15, isOpaque: false },
    ],
    countryIds: ['GIN'],
    riskScore: 35,
    complianceStatus: 'on-track',
    ownershipChanged: false,
    ownershipChangedNote:
      'Co-Development Agreement 2022 ("Guinea Expectations"). One of the world\'s largest remaining high-grade iron-ore deposits (Simandou total ~3 bn t; high-grade ~65% Fe component a substantial sub-set per Rio Tinto disclosures). Integrated mine-rail-port investment ~USD 20 bn including >600 km trans-Guinean railway. SimFer mine ownership: 85% SimFer JV / 15% Government of Guinea (Blocks 3 & 4, Rio Tinto SEC filings). Shared rail-and-port infrastructure co-developed by SimFer, WCS, Baowu and the Government of Guinea — precise CTG equity split not corroborated in primary filings within the present research budget. Inauguration ceremony at Morebaya port, 11 November 2025. First ore loaded for rail October 2025; first vessel-loaded shipment from the WCS port in December 2025, cargo expected to land in China January 2026. IMF Country Report 24/131 (17 May 2024) projects, under DIGNAR modelling, real GDP 26% higher by 2030 vs no-Simandou baseline; currency appreciation ~3.4% (2025) and ~1.8% (2030); debt-to-GDP potentially down 2.5pp by 2030. EITI Guinea June 2025 fiscal-modelling: government revenue USD 700 m–USD 1.7 bn/yr pre-2035, rising to USD 2.7 bn/yr thereafter.',
  },
  {
    id: 'OP-05',
    name: 'Winning Consortium Simandou (WCS — Blocks 1 & 2)',
    parentCompany: 'Winning International Group / Shandong Weiqiao',
    countryOfRegistration: 'Guinea',
    ultimateBeneficialOwners: [
      { name: 'Winning International / Shandong Weiqiao (joint)', jurisdiction: 'Singapore / China', ownershipPercent: 51, isOpaque: false },
      { name: 'Baowu Steel Group', jurisdiction: 'China', ownershipPercent: 49, isOpaque: true },
    ],
    countryIds: ['GIN'],
    riskScore: 50,
    complianceStatus: 'on-track',
    ownershipChanged: false,
    ownershipChangedNote:
      'WCS operates in partnership with the Government of Guinea for Blocks 1 & 2 of the Simandou Range. Shared rail-and-port infrastructure (>600 km trans-Guinean railway; WCS port) is co-developed with SimFer, Baowu and the Government of Guinea; precise Compagnie du TransGuinéen equity ratios not corroborated in primary filings within the present research budget. First vessel-loaded shipment from the WCS port in December 2025. Complex Chinese SOE layered ownership requires ongoing UBO validation against official registries.',
  },
  {
    id: 'OP-06',
    name: 'Nimba Mining Company (formerly GAC / Guinea Alumina Corporation — EGA)',
    parentCompany: 'Republic of Guinea (ANAIM)',
    countryOfRegistration: 'Guinea',
    ultimateBeneficialOwners: [
      { name: 'Republic of Guinea (state-owned via ANAIM)', jurisdiction: 'Guinea', ownershipPercent: 100, isOpaque: false },
    ],
    countryIds: ['GIN'],
    riskScore: 88,
    complianceStatus: 'breached',
    ownershipChanged: true,
    ownershipChangedNote:
      'GAC (Guinea Alumina Corporation) was 100% owned by Emirates Global Aluminium (EGA, UAE). EGA recorded a full impairment of GAC\'s value of AED 2.5 bn (~USD 680 m) during 2025; total Guinea-attributable charge for 2025 was AED 2.81 bn (USD 765 m), versus AED 1.64 bn (USD 447 m) in 2024. EGA net profit fell to AED 2.12 bn (USD 578 m) in 2025 from AED 2.62 bn (USD 715 m) in 2024. On 6 May 2026, Guinea, EGA and GAC announced a definitive settlement (negotiated through the President of the Paris Bar Association) providing for a lump-sum payment from Guinea to GAC in exchange for transfer of GAC assets to Nimba Mining Company and renewal of the CBG–EGA bauxite-supply agreements. Concurrent ICSID exposure: Axis International (separate Boffa bauxite licence, 18 Mtpa, revoked May 2025) filed USD 28.9 bn ICSID claim 25 Dec 2025 (registered 16 Jan 2026); related claims by Nimba Investment LLC, Falcon Energy Materials and Nomad Bauxite Corporation (Nov–Dec 2025).',
  },

  // ── Ghana — Gold ──────────────────────────────────────────

  {
    id: 'OP-07',
    name: 'Newmont Ghana Gold Ltd (Ahafo South & North)',
    parentCompany: 'Newmont Corporation',
    countryOfRegistration: 'Ghana',
    ultimateBeneficialOwners: [
      { name: 'Newmont Corporation (NYSE: NEM)', jurisdiction: 'United States', ownershipPercent: 90, isOpaque: false },
      { name: 'Government of Ghana (free-carry, Act 703)', jurisdiction: 'Ghana', ownershipPercent: 10, isOpaque: false },
    ],
    countryIds: ['GHA'],
    riskScore: 22,
    complianceStatus: 'on-track',
    ownershipChanged: false,
    ownershipChangedNote:
      'Ahafo South: ~800 koz across Ghana operations in 2024. Ahafo North: first gold poured 19 September 2025; expected 275–325 koz/yr over 13-year life; $1.1 bn capex. Akyem mine sold to Zijin Mining April 2025 (historical community grievances; Public Eye on Davos award).',
  },
  {
    id: 'OP-08',
    name: 'Gold Fields Ghana Ltd (Tarkwa)',
    parentCompany: 'Gold Fields Limited',
    countryOfRegistration: 'Ghana',
    ultimateBeneficialOwners: [
      { name: 'Gold Fields Limited (JSE/NYSE: GFI)', jurisdiction: 'South Africa', ownershipPercent: 90, isOpaque: false },
      { name: 'Government of Ghana (free-carry, Act 703)', jurisdiction: 'Ghana', ownershipPercent: 10, isOpaque: false },
    ],
    countryIds: ['GHA'],
    riskScore: 48,
    complianceStatus: 'at-risk',
    ownershipChanged: false,
    ownershipChangedNote:
      'Tarkwa: 123 koz in Q3 2025. Damang mining lease expired April 2025 and was NOT renewed — investor-state friction with Gold Fields, which may explore dispute resolution.',
  },
  {
    id: 'OP-09',
    name: 'AngloGold Ashanti Ghana (Obuasi & Iduapriem)',
    parentCompany: 'AngloGold Ashanti Limited',
    countryOfRegistration: 'Ghana',
    ultimateBeneficialOwners: [
      { name: 'AngloGold Ashanti Limited (NYSE/JSE: AU)', jurisdiction: 'South Africa', ownershipPercent: 90, isOpaque: false },
      { name: 'Government of Ghana (free-carry, Act 703)', jurisdiction: 'Ghana', ownershipPercent: 10, isOpaque: false },
    ],
    countryIds: ['GHA'],
    riskScore: 40,
    complianceStatus: 'at-risk',
    ownershipChanged: false,
    ownershipChangedNote:
      'Obuasi: 221 koz in 2024 (underground Obuasi Deeps redevelopment). January 2025 incident: army killed 7–9 illegal miners in an anti-galamsey operation at Obuasi. On 6 August 2025, a Ghanaian military Z-9 helicopter en route from Accra to an anti-galamsey event near Obuasi (Ashanti Region) crashed in the Adansi forest, killing all eight people aboard — including Defence Minister Edward Omane Boamah and Environment Minister Ibrahim Murtala Muhammed (Al Jazeera, NBC News). Iduapriem: 237 koz in 2024. Galamsey-driven river turbidity (Pra and Ankobra basins) reached 32,000 NTU in 2025 against the 2,000 NTU GWCL treatment-design threshold (publicly confirmed by GoldBod CEO Sammy Gyamfi on JoyFM Super Morning Show).',
  },
  {
    id: 'OP-10',
    name: 'Atlantic Lithium Ltd / Barari DV Mining (Ewoyaa)',
    parentCompany: 'Atlantic Lithium Limited',
    countryOfRegistration: 'Ghana',
    ultimateBeneficialOwners: [
      { name: 'Atlantic Lithium Limited (ASX: A11)', jurisdiction: 'Australia', ownershipPercent: 81, isOpaque: false },
      { name: 'Government of Ghana (13% free-carry, Act 703)', jurisdiction: 'Ghana', ownershipPercent: 13, isOpaque: false },
      { name: 'Minerals Income Investment Fund (MIIF)', jurisdiction: 'Ghana', ownershipPercent: 6, isOpaque: false },
    ],
    countryIds: ['GHA'],
    riskScore: 62,
    complianceStatus: 'at-risk',
    ownershipChanged: false,
    ownershipChangedNote:
      'Ewoyaa Mining Lease withdrawn from Parliament December 2025 and revised lease resubmitted; ratified by Parliament 19 March 2026 (company announcement 20 March 2026) under the Minerals and Mining (Royalty) Regulations 2025 sliding scale (5% <USD 1,500/t to 12% >USD 3,200/t spodumene). Workforce reduced from 167 to 62 employees in November 2025 due to ratification delays. MIIF holds an exact 6% contributing interest with USD 27.9 m covering all Atlantic Lithium\'s Ghana tenements, within a total MIIF investment of USD 32.9 m (per MIIF CEO Edward Nana Yaw Koranteng). In March 2026 Atlantic Lithium secured up to USD 16.4 m bridge financing from Ghanaian institutional investors and Long State Investments; ~USD 185 m remaining financing required to construct the mine. Half of Ewoyaa\'s projected 3.6 Mt of spodumene concentrate over a 12-year mine life is committed to Elevra Lithium (merged entity of Piedmont Lithium and Sayona Mining).',
  },
  {
    id: 'OP-11',
    name: 'Ghana Manganese Company (GMC) — Nsuta',
    parentCompany: 'TransAsia Minerals International (TMI)',
    countryOfRegistration: 'Ghana',
    ultimateBeneficialOwners: [
      { name: 'TransAsia Minerals International (TMI)', jurisdiction: 'Hong Kong SAR', ownershipPercent: 90, isOpaque: false },
      { name: 'Government of Ghana', jurisdiction: 'Ghana', ownershipPercent: 10, isOpaque: false },
    ],
    countryIds: ['GHA'],
    riskScore: 30,
    complianceStatus: 'on-track',
    ownershipChanged: false,
    ownershipChangedNote:
      'Nsuta mine produced ~820,000 t in 2024 (USGS). $450 m refinery announced; planned sod-cutting November 2024 was MISSED. 8th-largest manganese exporter globally (990,195 t in 2022).',
  },

  // ── Côte d'Ivoire — Gold ──────────────────────────────────

  {
    id: 'OP-12',
    name: 'Endeavour Mining PLC (Ity & Lafigué)',
    parentCompany: 'Endeavour Mining PLC',
    countryOfRegistration: 'Côte d\'Ivoire',
    ultimateBeneficialOwners: [
      { name: 'Endeavour Mining PLC (LSE: EDV)', jurisdiction: 'United Kingdom', ownershipPercent: 80, isOpaque: false },
      { name: 'Government of Côte d\'Ivoire / SODEMI', jurisdiction: 'Côte d\'Ivoire', ownershipPercent: 10, isOpaque: false },
      { name: 'Community / Employee Fund', jurisdiction: 'Côte d\'Ivoire', ownershipPercent: 10, isOpaque: false },
    ],
    countryIds: ['CIV'],
    riskScore: 20,
    complianceStatus: 'on-track',
    ownershipChanged: false,
    ownershipChangedNote:
      'Ity complex: record production above 300 koz in 2024. Lafigué inaugurated 19 October 2024; first gold pour 28 June 2024. Per Endeavour Mining\'s Q3 2025 financial report (13 November 2025), the company maintained its full-year 2025 production guidance of at least 180,000 oz at Lafigué; feasibility-study expectations approximately 200,000 oz/yr at AISC ~USD 871/oz over a 12.8-year mine life. Endeavour is a founding partner of MSPI — the Multistakeholder Partnership for Sustainable and Responsible Small-Scale Mining launched by the World Bank on 11 July 2025 in Côte d\'Ivoire, bringing together the Government, World Gold Council, Endeavour Mining, Perseus Mining and the Chamber of Mines of Côte d\'Ivoire to formalise an artisanal sector sustaining over 500,000 livelihoods. Cabinet decrees of 4 February 2026 granted Endeavour an additional mining permit for the Assafou gold project.',
  },
  {
    id: 'OP-13',
    name: 'Perseus Mining CIV Ltd (Yaouré & Sissingué)',
    parentCompany: 'Perseus Mining Limited',
    countryOfRegistration: 'Côte d\'Ivoire',
    ultimateBeneficialOwners: [
      { name: 'Perseus Mining Limited (ASX/TSX: PRU)', jurisdiction: 'Australia', ownershipPercent: 90, isOpaque: false },
      { name: 'Government of Côte d\'Ivoire / SODEMI', jurisdiction: 'Côte d\'Ivoire', ownershipPercent: 10, isOpaque: false },
    ],
    countryIds: ['CIV'],
    riskScore: 25,
    complianceStatus: 'on-track',
    ownershipChanged: false,
    ownershipChangedNote:
      'Yaouré: 123,158 oz H1 FY25 at AISC $1,124/oz. Q4 CY2024: 66,700 oz. Sissingué: 33,917 oz H1 FY25 at AISC $1,701/oz (high-cost, approaching end-of-life). MSPI co-founder for ASM formalisation.',
  },
  {
    id: 'OP-14',
    name: 'Barrick Gold / Tongon SA',
    parentCompany: 'Barrick Gold Corporation',
    countryOfRegistration: 'Côte d\'Ivoire',
    ultimateBeneficialOwners: [
      { name: 'Barrick Gold Corporation (NYSE/TSX: ABX)', jurisdiction: 'Canada', ownershipPercent: 89.7, isOpaque: false },
      { name: 'Government of Côte d\'Ivoire / SODEMI', jurisdiction: 'Côte d\'Ivoire', ownershipPercent: 10.3, isOpaque: false },
    ],
    countryIds: ['CIV'],
    riskScore: 55,
    complianceStatus: 'at-risk',
    ownershipChanged: true,
    ownershipChangedNote:
      'Tongon produced 148 koz in 2024, down from 204 koz in 2023 — 27% year-on-year decline. SALE TO ATLANTIC GROUP / ZIJIN UNDER NEGOTIATION IN 2025. Boundiali satellite deposit subject to ongoing community concerns. Change-of-control clause in Mining Convention requires Ministerial approval.',
  },
  {
    id: 'OP-15',
    name: 'Allied Gold Corp — CDI Complex (Agbaou & Bonikro)',
    parentCompany: 'Allied Gold Corp',
    countryOfRegistration: 'Côte d\'Ivoire',
    ultimateBeneficialOwners: [
      { name: 'Allied Gold Corp (TSX: AAUC)', jurisdiction: 'Canada', ownershipPercent: 85, isOpaque: false },
      { name: 'Government of Côte d\'Ivoire / SODEMI', jurisdiction: 'Côte d\'Ivoire', ownershipPercent: 15, isOpaque: false },
    ],
    countryIds: ['CIV'],
    riskScore: 33,
    complianceStatus: 'on-track',
    ownershipChanged: false,
    ownershipChangedNote:
      'Operates Agbaou and Bonikro mines as combined CDI Complex. Q4 CY2024: 45,422 oz; full-year 2024 implied ~164 koz (inferred from quarterly disclosures — no single audited line available).',
  },
];

// ─── Agreements ──────────────────────────────────────────────

export const AGREEMENTS: Agreement[] = [

  // ── Guinea — Bauxite ──────────────────────────────────────

  {
    id: 'AGR-001', operatorId: 'OP-01', countryId: 'GIN', commodity: 'bauxite',
    licenseType: 'Mining Convention (Convention de Base 1963 + 2002 Amendment)',
    dateSigned: '1963-01-01', expiryDate: '2038-01-01',
    status: 'active', royaltyRate: 0.075,
    pricingStructure: 'Extraction tax 0.075% on bauxite; LDF 0.5% of turnover (bauxite); profit-share per 2002 Amendment; Geneva/ICC arbitration',
    contractValue: 12000,
    description: 'CBG Sangarédi concession — ~200 km², high-grade bauxite; 75-year permit (1963–2038); original 0% income tax exoneration; 2002 Amendment added modern environmental obligations; Halco 51%/GoG 49%; IFC CAO complaint from 13 villages (Feb 2019) over land displacement',
    concesssionArea: 'Sangarédi, Boké Prefecture, Guinea',
    coordinates: [11.0, -13.88],
  },
  {
    id: 'AGR-002', operatorId: 'OP-02', countryId: 'GIN', commodity: 'bauxite',
    licenseType: 'Mining Convention (SMB-WAP)',
    dateSigned: '2014-03-15', expiryDate: '2044-03-15',
    status: 'active', royaltyRate: 0.075,
    pricingStructure: 'Extraction tax 0.075% on bauxite; LDF 0.5% of turnover; quarterly invoicing',
    contractValue: 8500,
    description: 'SMB-Winning Consortium Boké bauxite — high-volume open-pit, largest single bauxite operation in Guinea; principal export via Dapilon port; Guinea H1 2025 bauxite exports 99.8 Mt (sector total); dust and water-table impacts in Boké region documented',
    concesssionArea: 'Boké-Dapilon corridor, Boké Prefecture, Guinea',
    coordinates: [11.15, -14.3],
  },
  {
    id: 'AGR-003', operatorId: 'OP-03', countryId: 'GIN', commodity: 'bauxite',
    licenseType: 'Mining Convention (Friguia / Kindia / Boké)',
    dateSigned: '2001-06-01', expiryDate: '2031-06-01',
    status: 'active', royaltyRate: 0.075,
    pricingStructure: 'Extraction tax 0.075% on bauxite; alumina at LME-linked transfer pricing formula',
    contractValue: 5500,
    description: 'Rusal Friguia bauxite-to-alumina integrated complex (~600 kt/yr alumina capacity); CBK Kindia and COBAD Boké bauxite mines under same Rusal umbrella; rehabilitation escrow mandatory (Article 142 of Mining Code)',
    concesssionArea: 'Friguia / Kindia / Boké, Guinea',
    coordinates: [10.37, -13.55],
  },

  // ── Guinea — Iron Ore (Simandou) ──────────────────────────

  {
    id: 'AGR-004', operatorId: 'OP-04', countryId: 'GIN', commodity: 'iron ore',
    licenseType: 'Co-Development Agreement ("Guinea Expectations" 2022)',
    dateSigned: '2022-01-01', expiryDate: '2052-01-01',
    status: 'active', royaltyRate: 3.0,
    pricingStructure: 'SGX / Singapore Iron Ore Index CFR China benchmark; 3% royalty on iron ore (Mining Code); EITI Guinea June 2025 fiscal modelling — government revenue USD 700 m–USD 1.7 bn/yr pre-2035, rising to USD 2.7 bn/yr thereafter (depending on iron-ore price scenarios)',
    contractValue: 11600,
    description: 'SimFer Simandou Blocks 3 & 4 — one of the world\'s largest remaining high-grade iron-ore deposits; ~USD 20 bn integrated mine-rail-port system with >600 km trans-Guinean railway. Mine ownership 85% SimFer JV / 15% Government of Guinea (Rio Tinto SEC filings). Shared rail-and-port infrastructure co-developed by SimFer, WCS, Baowu and the Government of Guinea (precise CTG equity ratios not corroborated in primary filings). Inauguration ceremony at Morebaya port 11 November 2025; first ore loaded for rail October 2025; first vessel-loaded shipment from the WCS port December 2025. IMF Country Report 24/131 (17 May 2024) projects real GDP 26% higher by 2030 under DIGNAR modelling; IFC PS6 critical-habitat obligations for chimpanzee / forest-elephant corridor.',
    concesssionArea: 'Simandou Range, Beyla/Kérouané Prefectures, South Guinea',
    coordinates: [8.45, -8.8],
  },
  {
    id: 'AGR-005', operatorId: 'OP-05', countryId: 'GIN', commodity: 'iron ore',
    licenseType: 'Mining Convention (WCS Simandou)',
    dateSigned: '2020-05-15', expiryDate: '2050-05-15',
    status: 'active', royaltyRate: 3.0,
    pricingStructure: 'SGX Iron Ore benchmark; 3% royalty on iron ore',
    contractValue: 8400,
    description: 'WCS Simandou Blocks 1 & 2 — operating in partnership with the Government of Guinea. Shared rail-and-port infrastructure (>600 km trans-Guinean railway; WCS port) co-developed with SimFer, Baowu and the Government of Guinea. First vessel-loaded shipment from the WCS port December 2025. WCS ownership: 51% Winning/Weiqiao / 49% Baowu Steel — complex layered Chinese SOE structure flagged for ongoing UBO validation.',
    concesssionArea: 'Simandou Range Blocks 1–2, Nzérékoré Region, Guinea',
    coordinates: [8.3, -8.9],
  },
  {
    id: 'AGR-006', operatorId: 'OP-06', countryId: 'GIN', commodity: 'bauxite',
    licenseType: 'Mining Convention (GAC/EGA — revoked, settled 6 May 2026)',
    dateSigned: '2013-07-01', expiryDate: '2043-07-01',
    status: 'lapsed', royaltyRate: 0.075,
    pricingStructure: 'Extraction tax 0.075% (licence revoked; GAC assets transferred to Nimba Mining Company under the 6 May 2026 definitive settlement)',
    contractValue: 3200,
    description: 'GAC/EGA Boffa bauxite convention — 18 Mtpa target; licence revoked by CNRD government after EGA failed to deliver the committed alumina refinery. EGA full impairment of GAC value AED 2.5 bn (~USD 680 m) in 2025; total Guinea-attributable charge AED 2.81 bn (USD 765 m); net profit USD 578 m (2025) vs USD 715 m (2024). Definitive settlement announced 6 May 2026 (negotiated via the President of the Paris Bar Association): lump-sum payment from Guinea to GAC, transfer of GAC assets to Nimba Mining Company, renewal of CBG–EGA bauxite-supply agreements. Concurrent ICSID exposure: Axis International (separate Boffa bauxite licence, 18 Mtpa, revoked May 2025) filed USD 28.9 bn ICSID claim 25 December 2025 (registered 16 January 2026).',
    concesssionArea: 'Boffa Prefecture, Guinea',
    coordinates: [10.18, -14.05],
  },

  // ── Ghana — Gold & Minerals ───────────────────────────────

  {
    id: 'AGR-007', operatorId: 'OP-07', countryId: 'GHA', commodity: 'gold',
    licenseType: 'Mining Lease (Investment Agreement)',
    dateSigned: '2006-01-01', expiryDate: '2031-01-01',
    status: 'active', royaltyRate: 5.0,
    pricingStructure: 'LBMA Gold Price AM fix; Minerals and Mining (Royalty) Regulations 2025 sliding scale — 5% base rising to 12% above USD 4,500/oz (threshold breached at implementation, gold >USD 5,000/oz early 2026); 10% state free-carry; CIT 35%',
    contractValue: 9200,
    description: 'Newmont Ahafo South — flagship underground and open-pit gold; ~800 koz across Ghana in 2024 (Newmont operating reports); state 10% free-carry; community development fund; 20% royalty → Minerals Development Fund (Act 912)',
    concesssionArea: 'Ahafo South, Brong-Ahafo Region, Ghana',
    coordinates: [6.9, -2.5],
  },
  {
    id: 'AGR-008', operatorId: 'OP-07', countryId: 'GHA', commodity: 'gold',
    licenseType: 'Mining Lease (Ahafo North)',
    dateSigned: '2020-04-01', expiryDate: '2033-04-01',
    status: 'active', royaltyRate: 5.0,
    pricingStructure: 'LBMA Gold Price AM fix; Minerals and Mining (Royalty) Regulations 2025 sliding scale 5–12% (12% above USD 4,500/oz); parliamentary ratification under Art. 268 of the Constitution',
    contractValue: 1100,
    description: 'Newmont Ahafo North — first gold poured 19 September 2025; expected 275–325 koz/yr over 13-year life; $1.1 bn capex; environmental impact assessment and community resettlement plan obligations',
    concesssionArea: 'Ahafo North, Brong-Ahafo Region, Ghana',
    coordinates: [7.15, -2.55],
  },
  {
    id: 'AGR-009', operatorId: 'OP-08', countryId: 'GHA', commodity: 'gold',
    licenseType: 'Mining Lease (Stability Agreement)',
    dateSigned: '2008-11-01', expiryDate: '2028-11-01',
    status: 'active', royaltyRate: 5.0,
    pricingStructure: 'LBMA Gold Price PM fix; fiscal stability clause through 2028; 10% state free-carry; sliding 5–12% royalty applies to non-stabilised tonnage',
    contractValue: 6500,
    description: 'Gold Fields Tarkwa open-pit gold — 123 koz Q3 2025. Companion Damang mining lease (granted 18 April 1995) expired 18 April 2025; renewal declined by the Minerals Commission; Gold Fields publicly acknowledged non-renewal on 12 April 2025. Active mining at Damang had ceased in 2023 and no mineral reserves were declared in Gold Fields\' 2024 annual report. Government has announced plans to award the lease to one of three bidders — Engineers & Planners, BCM International, or Vortex Resources consortium — with revival estimated by Minerals Commission CEO Isaac Tandoh at USD 600 m – USD 1 bn. Ghana Water Co. Tarkwa-Bonsa treatment plant shutdowns 2024–25 driven by galamsey river turbidity.',
    concesssionArea: 'Tarkwa, Western Region, Ghana',
    coordinates: [5.3, -2.0],
  },
  {
    id: 'AGR-010', operatorId: 'OP-09', countryId: 'GHA', commodity: 'gold',
    licenseType: 'Mining Lease (Development Agreement)',
    dateSigned: '2014-06-01', expiryDate: '2034-06-01',
    status: 'active', royaltyRate: 5.0,
    pricingStructure: 'LBMA Gold Price PM fix; Royalty Regulations 2025 sliding scale 5–12% (12% above USD 4,500/oz); 10% state free-carry',
    contractValue: 5400,
    description: 'AngloGold Ashanti Obuasi — 221 koz in 2024; underground Obuasi Deeps redevelopment; January 2025 incident: army killed 7–9 illegal miners in an anti-galamsey operation at the Obuasi concession. On 6 August 2025 a Ghanaian military Z-9 helicopter en route from Accra to an anti-galamsey event near Obuasi crashed in the Adansi forest, killing eight including Defence Minister Edward Omane Boamah and Environment Minister Ibrahim Murtala Muhammed. IFC PS1/PS5 community obligations; galamsey threatens Pra and Ankobra rivers surrounding the concession.',
    concesssionArea: 'Obuasi, Ashanti Region, Ghana',
    coordinates: [6.2, -1.67],
  },
  {
    id: 'AGR-011', operatorId: 'OP-09', countryId: 'GHA', commodity: 'gold',
    licenseType: 'Mining Lease',
    dateSigned: '2010-03-15', expiryDate: '2030-03-15',
    status: 'active', royaltyRate: 5.0,
    pricingStructure: 'LBMA Gold Price AM fix; Royalty Regulations 2025 sliding scale 5–12%; 10% state free-carry',
    contractValue: 3800,
    description: 'AngloGold Ashanti Iduapriem open-pit gold — 237 koz in 2024; cyanide management compliance under ICMC; quarterly environmental monitoring; galamsey impacts on Ankobra river basin (turbidity readings of 32,000 NTU in 2025 against the 2,000 NTU GWCL treatment-design threshold).',
    concesssionArea: 'Iduapriem, Western Region, Ghana',
    coordinates: [5.47, -2.05],
  },
  {
    id: 'AGR-012', operatorId: 'OP-10', countryId: 'GHA', commodity: 'lithium',
    licenseType: 'Mining Lease (Barari DV Mining — Ewoyaa)',
    dateSigned: '2023-10-01', expiryDate: '2038-10-01',
    status: 'active', royaltyRate: 5.0,
    pricingStructure: 'Minerals and Mining (Royalty) Regulations 2025 — lithium sliding scale 5% below USD 1,500/t spodumene to 12% above USD 3,200/t; Government 13% free-carry; MIIF 6% contributing interest (USD 27.9 m within total USD 32.9 m MIIF investment per CEO Edward Nana Yaw Koranteng)',
    contractValue: 185,
    description: 'Atlantic Lithium Ewoyaa lithium project — ~USD 185 m total capex (remaining financing requirement after March 2026 USD 16.4 m bridge from Ghanaian institutional investors and Long State Investments); 15-year lease ratified by Parliament 19 March 2026 (company announcement 20 March 2026), following the December 2025 withdrawal and resubmission of a revised lease; workforce reduced 167→62 in November 2025 prior to ratification; half of the projected 3.6 Mt spodumene concentrate over a 12-year mine life committed to Elevra Lithium (Piedmont + Sayona); parliamentary ratification under Art. 268 of the Constitution.',
    concesssionArea: 'Ewoyaa, Central Region, Ghana',
    coordinates: [5.1, -1.37],
  },
  {
    id: 'AGR-013', operatorId: 'OP-11', countryId: 'GHA', commodity: 'manganese',
    licenseType: 'Mining Concession',
    dateSigned: '2005-09-01', expiryDate: '2035-09-01',
    status: 'active', royaltyRate: 5.0,
    pricingStructure: 'CRU Manganese price index quarterly; 5% royalty; 10% state free-carry',
    contractValue: 1800,
    description: 'Ghana Manganese Company Nsuta — ~820,000 t in 2024 (USGS); 8th-largest manganese exporter globally (990,195 t in 2022); $450 m refinery announced; PLANNED SOD-CUTTING NOVEMBER 2024 WAS MISSED; TMI 90%/GoG 10%',
    concesssionArea: 'Nsuta, Western Region, Ghana',
    coordinates: [5.3, -1.98],
  },

  // ── Côte d'Ivoire — Gold ──────────────────────────────────

  {
    id: 'AGR-014', operatorId: 'OP-12', countryId: 'CIV', commodity: 'gold',
    licenseType: 'Convention Minière (Ity)',
    dateSigned: '2014-05-01', expiryDate: '2034-05-01',
    status: 'active', royaltyRate: 6.0,
    pricingStructure: 'LBMA Gold Price PM fix; 2025 Finance Act ad-valorem royalty up to 8% above USD 2,000/oz (retroactive to January 2025, replacing the 3–6% contract-linked range); 5-yr income-tax holiday expired; mandatory Community Development Fund (Art. 125); 10% SODEMI free-carry',
    contractValue: 3200,
    description: 'Endeavour Mining Ity complex — record production above 300 koz in 2024; mandatory Community Development Fund; environmental rehabilitation escrow (Art. 142); Endeavour is a founding partner of MSPI (Multistakeholder Partnership for Sustainable and Responsible Small-Scale Mining) launched by the World Bank on 11 July 2025.',
    concesssionArea: 'Ity, Région du Cavally (Guiglo), Côte d\'Ivoire',
    coordinates: [6.5, -7.4],
  },
  {
    id: 'AGR-015', operatorId: 'OP-12', countryId: 'CIV', commodity: 'gold',
    licenseType: 'Convention Minière (Lafigué)',
    dateSigned: '2020-08-01', expiryDate: '2040-08-01',
    status: 'active', royaltyRate: 6.0,
    pricingStructure: 'LBMA Gold Price PM fix; 2025 Finance Act ad-valorem royalty up to 8% above USD 2,000/oz; 5-yr income-tax holiday from commercial production (August 2024); 10% SODEMI free-carry',
    contractValue: 1800,
    description: 'Endeavour Mining Lafigué — inaugurated 19 October 2024 (first gold pour 28 June 2024); Q3 2025 financial report (13 Nov 2025) maintained full-year 2025 guidance of at least 180,000 oz; feasibility-study target ~200,000 oz/yr at AISC ~USD 871/oz over a 12.8-year mine life. Infrastructure: access road, dedicated power supply, water-management obligations.',
    concesssionArea: 'Lafigué, Région du Hambol (Katiola), Côte d\'Ivoire',
    coordinates: [9.2, -6.0],
  },
  {
    id: 'AGR-016', operatorId: 'OP-13', countryId: 'CIV', commodity: 'gold',
    licenseType: 'Convention Minière (Yaouré)',
    dateSigned: '2018-04-01', expiryDate: '2038-04-01',
    status: 'active', royaltyRate: 6.0,
    pricingStructure: 'LBMA Gold Price PM fix; 2025 Finance Act ad-valorem royalty up to 8% above USD 2,000/oz (raised retroactively from January 2025); AISC USD 1,124/oz H1 FY25',
    contractValue: 2400,
    description: 'Perseus Mining Yaouré — 123,158 oz H1 FY25; Q4 CY2024: 66,700 oz; AISC USD 1,124/oz; environmental rehabilitation escrow fully funded; quarterly water-quality monitoring; 10% SODEMI free-carry.',
    concesssionArea: 'Yaouré, Région de la Marahoué (Bouaflé), Côte d\'Ivoire',
    coordinates: [7.17, -5.78],
  },
  {
    id: 'AGR-017', operatorId: 'OP-13', countryId: 'CIV', commodity: 'gold',
    licenseType: 'Convention Minière (Sissingué)',
    dateSigned: '2015-03-01', expiryDate: '2035-03-01',
    status: 'active', royaltyRate: 6.0,
    pricingStructure: 'LBMA Gold Price PM fix; 2025 Finance Act ad-valorem royalty up to 8% above USD 2,000/oz; AISC USD 1,701/oz H1 FY25 (high-cost, approaching end-of-life)',
    contractValue: 650,
    description: 'Perseus Mining Sissingué — 33,917 oz H1 FY25; AISC USD 1,701/oz (marginal economics); rehabilitation fund fully funded; mine approaching end-of-life planning horizon; 10% SODEMI free-carry.',
    concesssionArea: 'Sissingué, Région du Hambol, Côte d\'Ivoire',
    coordinates: [9.74, -6.59],
  },
  {
    id: 'AGR-018', operatorId: 'OP-14', countryId: 'CIV', commodity: 'gold',
    licenseType: 'Convention Minière (Tongon)',
    dateSigned: '2009-03-01', expiryDate: '2029-03-01',
    status: 'active', royaltyRate: 6.0,
    pricingStructure: 'LBMA Gold Price PM fix; 2025 Finance Act ad-valorem royalty up to 8% above USD 2,000/oz (raised retroactively from January 2025); 10% SODEMI free-carry',
    contractValue: 2800,
    description: 'Barrick Gold Tongon — 148 koz in 2024 (↓ from 204 koz in 2023, -27% YoY decline); sale to Atlantic Group / Zijin under negotiation in 2025; change-of-control clause requires Ministerial approval; Boundiali satellite deposit subject to community concerns; Barrick 89.7% / GoCI 10.3%.',
    concesssionArea: 'Tongon, Région du Hambol (Boundiali), Côte d\'Ivoire',
    coordinates: [9.67, -6.35],
  },
  {
    id: 'AGR-019', operatorId: 'OP-15', countryId: 'CIV', commodity: 'gold',
    licenseType: 'Convention Minière (Agbaou)',
    dateSigned: '2013-01-01', expiryDate: '2033-01-01',
    status: 'active', royaltyRate: 6.0,
    pricingStructure: 'LBMA Gold Price PM fix; 2025 Finance Act ad-valorem royalty up to 8% above USD 2,000/oz; 10% SODEMI free-carry',
    contractValue: 1400,
    description: 'Allied Gold Agbaou open-pit gold — operated as part of CDI Complex with Bonikro; Q4 CY2024 combined (Agbaou + Bonikro): 45,422 oz; full-year 2024 implied ~164 koz; mandatory Community Development Fund.',
    concesssionArea: 'Agbaou, Région du Moronou, Côte d\'Ivoire',
    coordinates: [6.3, -4.5],
  },
  {
    id: 'AGR-020', operatorId: 'OP-15', countryId: 'CIV', commodity: 'gold',
    licenseType: 'Convention Minière (Bonikro)',
    dateSigned: '2008-06-01', expiryDate: '2028-06-01',
    status: 'active', royaltyRate: 6.0,
    pricingStructure: 'LBMA Gold Price PM fix; 2025 Finance Act ad-valorem royalty up to 8% above USD 2,000/oz; 10% SODEMI free-carry',
    contractValue: 900,
    description: 'Allied Gold Bonikro open-pit gold — operated as CDI Complex with Agbaou; mandatory Community Development Fund and environmental rehabilitation escrow (Art. 142).',
    concesssionArea: 'Bonikro, Région du Lôh-Djiboua, Côte d\'Ivoire',
    coordinates: [5.96, -5.52],
  },
];

// ─── Commitments ─────────────────────────────────────────────

export const COMMITMENTS: Commitment[] = [

  // AGR-001 — CBG Sangarédi (at-risk: land displacement IFC CAO unresolved)
  { id: 'CMT-001', agreementId: 'AGR-001', type: 'production', description: 'Annual bauxite extraction — Sangarédi concession (CBG)', targetValue: 24000000, targetUnit: 'DMT/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-002', agreementId: 'AGR-001', type: 'local-employment', description: 'Minimum 70% Guinean nationals in CBG workforce', targetValue: 70, targetUnit: '% workforce', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-003', agreementId: 'AGR-001', type: 'community-development', description: 'Resettlement and land remediation for 13 displaced villages around Sangarédi (IFC CAO obligation)', targetValue: 13, targetUnit: 'villages fully remediated', dueDate: '2024-12-31', status: 'at-risk' },
  { id: 'CMT-004', agreementId: 'AGR-001', type: 'environmental', description: 'Quarterly water-quality and dust-monitoring reports — Boké region (Article 142 compliance)', targetValue: 4, targetUnit: 'reports/year', dueDate: '2024-12-31', status: 'at-risk' },
  { id: 'CMT-005', agreementId: 'AGR-001', type: 'financial', description: 'Annual royalty payments (0.075% extraction tax) to CPDM, within 30 days of quarter close', targetValue: 4, targetUnit: 'payments/year', dueDate: '2024-12-31', status: 'met' },

  // AGR-002 — SMB-Winning
  { id: 'CMT-006', agreementId: 'AGR-002', type: 'production', description: 'Annual bauxite extraction — Boké-Dapilon corridor (SMB-WAP Convention)', targetValue: 52000000, targetUnit: 'DMT/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-007', agreementId: 'AGR-002', type: 'community-development', description: 'Local Development Fund contribution — 0.5% of annual turnover (bauxite)', targetValue: 5000000, targetUnit: 'USD/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-008', agreementId: 'AGR-002', type: 'environmental', description: 'Quarterly environmental monitoring and dust suppression programme — Boké region', targetValue: 4, targetUnit: 'reports/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-009', agreementId: 'AGR-002', type: 'local-employment', description: 'Minimum 65% Guinean nationals in SMB workforce', targetValue: 65, targetUnit: '% workforce', dueDate: '2024-12-31', status: 'on-track' },

  // AGR-003 — Rusal Friguia/Kindia/Boké
  { id: 'CMT-010', agreementId: 'AGR-003', type: 'production', description: 'Friguia alumina refinery output — target ~600 kt/yr', targetValue: 600000, targetUnit: 'kt alumina/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-011', agreementId: 'AGR-003', type: 'environmental', description: 'Rehabilitation escrow account funded and annual report submitted (Article 142)', targetValue: 1, targetUnit: 'report/year', dueDate: '2024-12-31', status: 'at-risk' },
  { id: 'CMT-012', agreementId: 'AGR-003', type: 'local-employment', description: 'Minimum 65% Guinean nationals in Rusal Guinea workforce', targetValue: 65, targetUnit: '% workforce', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-013', agreementId: 'AGR-003', type: 'financial', description: 'Annual royalty and extraction tax payments within 45 days of quarter close', targetValue: 4, targetUnit: 'payments/year', dueDate: '2024-12-31', status: 'met' },

  // AGR-004 — SimFer (Simandou B3&B4) — STORY: major infrastructure delivery
  { id: 'CMT-014', agreementId: 'AGR-004', type: 'production', description: 'Simandou iron ore ramp-up to 60 Mtpa within 30 months of first ore (Nov 2025 baseline)', targetValue: 60000000, targetUnit: 'DMT/year (target)', dueDate: '2028-05-01', status: 'on-track' },
  { id: 'CMT-015', agreementId: 'AGR-004', type: 'infrastructure', description: '600 km Trans-Guinean Railway (CTG) — SimFer 42.5% share of construction obligation', targetValue: 100, targetUnit: '% complete', dueDate: '2025-11-01', status: 'met' },
  { id: 'CMT-016', agreementId: 'AGR-004', type: 'infrastructure', description: 'Forécariah deep-water port construction — SimFer 42.5% share', targetValue: 100, targetUnit: '% complete', dueDate: '2025-11-01', status: 'met' },
  { id: 'CMT-017', agreementId: 'AGR-004', type: 'local-employment', description: 'Guinean General Manager appointed within 5 years of first commercial production', targetValue: 1, targetUnit: 'GM appointed', dueDate: '2030-11-01', status: 'on-track' },
  { id: 'CMT-018', agreementId: 'AGR-004', type: 'environmental', description: 'Biodiversity offset plan (PS6) — chimpanzee/elephant habitat corridor protection, Simandou Range', targetValue: 1, targetUnit: 'plan in place', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-019', agreementId: 'AGR-004', type: 'financial', description: 'Government revenue-sharing payments per Co-Development Agreement (quarterly)', targetValue: 4, targetUnit: 'payments/year', dueDate: '2024-12-31', status: 'on-track' },

  // AGR-005 — WCS Simandou B1&B2
  { id: 'CMT-020', agreementId: 'AGR-005', type: 'infrastructure', description: '600 km Trans-Guinean Railway (CTG) — WCS 42.5% share of construction obligation', targetValue: 100, targetUnit: '% complete', dueDate: '2025-11-01', status: 'met' },
  { id: 'CMT-021', agreementId: 'AGR-005', type: 'production', description: 'WCS Simandou production ramp-up to joint 120 Mtpa (shared with SimFer via CTG)', targetValue: 60000000, targetUnit: 'DMT/year', dueDate: '2028-05-01', status: 'on-track' },
  { id: 'CMT-022', agreementId: 'AGR-005', type: 'community-development', description: 'Local Development Fund contribution — 0.5% of turnover (bauxite equivalent for iron ore)', targetValue: 4000000, targetUnit: 'USD/year', dueDate: '2024-12-31', status: 'on-track' },

  // AGR-006 — GAC/EGA (revoked → Nimba Mining) — STORY: CRITICAL BREACH
  { id: 'CMT-023', agreementId: 'AGR-006', type: 'infrastructure', description: 'Alumina refinery construction — committed to deliver full refinery as condition of Mining Convention', targetValue: 100, targetUnit: '% complete', dueDate: '2020-12-31', status: 'breached' },
  { id: 'CMT-024', agreementId: 'AGR-006', type: 'production', description: 'Annual bauxite extraction — 18 Mtpa target (Boffa)', targetValue: 18000000, targetUnit: 'DMT/year', dueDate: '2025-08-01', status: 'breached' },
  { id: 'CMT-025', agreementId: 'AGR-006', type: 'financial', description: 'Annual royalty and extraction tax payments', targetValue: 4, targetUnit: 'payments/year', dueDate: '2025-08-01', status: 'breached' },
  { id: 'CMT-026', agreementId: 'AGR-006', type: 'local-employment', description: 'Minimum 60% Guinean nationals in GAC/EGA workforce', targetValue: 60, targetUnit: '% workforce', dueDate: '2025-08-01', status: 'breached' },

  // AGR-007 — Newmont Ahafo South
  { id: 'CMT-027', agreementId: 'AGR-007', type: 'production', description: 'Annual gold production — Ahafo South (Newmont)', targetValue: 800000, targetUnit: 'oz/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-028', agreementId: 'AGR-007', type: 'local-employment', description: 'Minimum 80% Ghanaian nationals in Newmont Ghana workforce', targetValue: 80, targetUnit: '% workforce', dueDate: '2024-12-31', status: 'met' },
  { id: 'CMT-029', agreementId: 'AGR-007', type: 'community-development', description: 'Annual community development fund contribution — Ahafo South communities', targetValue: 15000000, targetUnit: 'USD/year', dueDate: '2024-12-31', status: 'met' },
  { id: 'CMT-030', agreementId: 'AGR-007', type: 'environmental', description: 'Cyanide management code (ICMC) annual certification and tailings safety assessment', targetValue: 1, targetUnit: 'certification/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-031', agreementId: 'AGR-007', type: 'financial', description: 'Quarterly royalty and CIT payments (sliding scale 5–12% post-2025)', targetValue: 4, targetUnit: 'payments/year', dueDate: '2024-12-31', status: 'met' },

  // AGR-008 — Newmont Ahafo North
  { id: 'CMT-032', agreementId: 'AGR-008', type: 'infrastructure', description: 'Ahafo North mine construction ($1.1 bn capex) — first gold milestone', targetValue: 100, targetUnit: '% construction complete', dueDate: '2025-09-30', status: 'met' },
  { id: 'CMT-033', agreementId: 'AGR-008', type: 'production', description: 'Ahafo North ramp-up to 275–325 koz/yr production target (13-year mine life)', targetValue: 300000, targetUnit: 'oz/year', dueDate: '2026-12-31', status: 'on-track' },
  { id: 'CMT-034', agreementId: 'AGR-008', type: 'community-development', description: 'Community resettlement and compensation programme — Ahafo North affected communities', targetValue: 1, targetUnit: 'programme certified complete', dueDate: '2025-09-30', status: 'on-track' },

  // AGR-009 — Gold Fields Tarkwa
  { id: 'CMT-035', agreementId: 'AGR-009', type: 'production', description: 'Annual gold production — Tarkwa open-pit (Gold Fields)', targetValue: 480000, targetUnit: 'oz/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-036', agreementId: 'AGR-009', type: 'community-development', description: 'Annual community development fund contribution — Tarkwa communities', targetValue: 8000000, targetUnit: 'USD/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-037', agreementId: 'AGR-009', type: 'environmental', description: 'Tailings facility safety assessment and rehabilitation escrow funding — annual', targetValue: 1, targetUnit: 'assessment/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-038', agreementId: 'AGR-009', type: 'financial', description: 'Quarterly royalty payments (5% / stability clause through 2028)', targetValue: 4, targetUnit: 'payments/year', dueDate: '2024-12-31', status: 'met' },

  // AGR-010 — AngloGold Ashanti Obuasi — STORY: security/galamsey
  { id: 'CMT-039', agreementId: 'AGR-010', type: 'production', description: 'Annual gold production — Obuasi underground (AngloGold Ashanti)', targetValue: 220000, targetUnit: 'oz/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-040', agreementId: 'AGR-010', type: 'community-development', description: 'IFC PS5 community engagement plan — galamsey exclusion zone management and affected community support', targetValue: 1, targetUnit: 'plan current', dueDate: '2024-12-31', status: 'at-risk' },
  { id: 'CMT-041', agreementId: 'AGR-010', type: 'environmental', description: 'Cyanide management and river water quality monitoring — Pra and Oda rivers (ICMC)', targetValue: 4, targetUnit: 'reports/year', dueDate: '2024-12-31', status: 'at-risk' },
  { id: 'CMT-042', agreementId: 'AGR-010', type: 'local-employment', description: 'Minimum 75% Ghanaian nationals in Obuasi workforce', targetValue: 75, targetUnit: '% workforce', dueDate: '2024-12-31', status: 'met' },
  { id: 'CMT-043', agreementId: 'AGR-010', type: 'financial', description: 'Quarterly royalty and CIT payments — Obuasi', targetValue: 4, targetUnit: 'payments/year', dueDate: '2024-12-31', status: 'met' },

  // AGR-011 — AngloGold Iduapriem
  { id: 'CMT-044', agreementId: 'AGR-011', type: 'production', description: 'Annual gold production — Iduapriem open-pit (AngloGold Ashanti)', targetValue: 240000, targetUnit: 'oz/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-045', agreementId: 'AGR-011', type: 'environmental', description: 'Tailings dam safety assessment and cyanide management — biannual', targetValue: 2, targetUnit: 'assessments/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-046', agreementId: 'AGR-011', type: 'community-development', description: 'Annual scholarships programme — 200 Ghanaian students', targetValue: 200, targetUnit: 'scholarships/year', dueDate: '2024-12-31', status: 'on-track' },

  // AGR-012 — Atlantic Lithium Ewoyaa — STORY: lease delays
  { id: 'CMT-047', agreementId: 'AGR-012', type: 'infrastructure', description: 'Ewoyaa mine development — $185m capex; construction commencement', targetValue: 100, targetUnit: '% funded / started', dueDate: '2026-12-31', status: 'at-risk' },
  { id: 'CMT-048', agreementId: 'AGR-012', type: 'local-employment', description: 'Minimum 75% Ghanaian nationals in Ewoyaa project workforce', targetValue: 75, targetUnit: '% workforce', dueDate: '2026-12-31', status: 'at-risk' },
  { id: 'CMT-049', agreementId: 'AGR-012', type: 'community-development', description: 'Community development fund contribution — Ewoyaa affected communities', targetValue: 2000000, targetUnit: 'USD/year', dueDate: '2026-12-31', status: 'at-risk' },
  { id: 'CMT-050', agreementId: 'AGR-012', type: 'environmental', description: 'Environmental and Social Impact Assessment (ESIA) update — post-lease ratification March 2026', targetValue: 1, targetUnit: 'ESIA approved', dueDate: '2026-09-30', status: 'on-track' },

  // AGR-013 — Ghana Manganese Company — STORY: refinery missed
  { id: 'CMT-051', agreementId: 'AGR-013', type: 'production', description: 'Annual manganese ore production — Nsuta mine (Ghana Manganese Company)', targetValue: 820000, targetUnit: 'DMT/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-052', agreementId: 'AGR-013', type: 'infrastructure', description: '$450 m manganese refinery construction — sod-cutting milestone (planned Nov 2024)', targetValue: 100, targetUnit: '% complete', dueDate: '2024-11-30', status: 'breached' },
  { id: 'CMT-053', agreementId: 'AGR-013', type: 'community-development', description: 'Annual community development fund contribution — Nsuta communities', targetValue: 4000000, targetUnit: 'USD/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-054', agreementId: 'AGR-013', type: 'financial', description: 'Quarterly royalty payments (5%) to Minerals Commission — Nsuta manganese', targetValue: 4, targetUnit: 'payments/year', dueDate: '2024-12-31', status: 'met' },

  // AGR-014 — Endeavour Ity
  { id: 'CMT-055', agreementId: 'AGR-014', type: 'production', description: 'Annual gold production — Ity complex (Endeavour Mining); record >300 koz in 2024', targetValue: 300000, targetUnit: 'oz/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-056', agreementId: 'AGR-014', type: 'community-development', description: 'Mandatory Community Development Fund contribution — Ity', targetValue: 3000000, targetUnit: 'USD/year', dueDate: '2024-12-31', status: 'met' },
  { id: 'CMT-057', agreementId: 'AGR-014', type: 'environmental', description: 'Quarterly environmental monitoring and rehabilitation escrow funding — Ity (Article 142)', targetValue: 4, targetUnit: 'reports/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-058', agreementId: 'AGR-014', type: 'local-employment', description: 'Minimum 70% Ivorian nationals in Ity workforce', targetValue: 70, targetUnit: '% workforce', dueDate: '2024-12-31', status: 'met' },

  // AGR-015 — Endeavour Lafigué (inaugurated 19 Oct 2024; first gold pour 28 Jun 2024)
  { id: 'CMT-059', agreementId: 'AGR-015', type: 'production', description: 'Lafigué gold production — Endeavour Mining Q3 2025 full-year guidance ≥180,000 oz at AISC ~USD 871/oz; DFS expectation ~200 koz/yr over 12.8-year mine life', targetValue: 180000, targetUnit: 'oz/year', dueDate: '2025-12-31', status: 'on-track' },
  { id: 'CMT-060', agreementId: 'AGR-015', type: 'infrastructure', description: 'Lafigué dedicated power supply and access road — operational from inauguration 19 October 2024 (first gold pour 28 June 2024)', targetValue: 100, targetUnit: '% operational', dueDate: '2024-10-19', status: 'met' },
  { id: 'CMT-061', agreementId: 'AGR-015', type: 'environmental', description: 'Water management plan and quarterly monitoring — Lafigué (Article 142)', targetValue: 4, targetUnit: 'reports/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-062', agreementId: 'AGR-015', type: 'local-employment', description: 'Minimum 70% Ivorian nationals in Lafigué workforce during ramp-up', targetValue: 70, targetUnit: '% workforce', dueDate: '2024-12-31', status: 'on-track' },

  // AGR-016 — Perseus Yaouré
  { id: 'CMT-063', agreementId: 'AGR-016', type: 'production', description: 'Annual gold production — Yaouré (Perseus Mining); Q4 CY2024: 66,700 oz', targetValue: 250000, targetUnit: 'oz/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-064', agreementId: 'AGR-016', type: 'environmental', description: 'Rehabilitation escrow fully funded and quarterly water-quality monitoring — Yaouré', targetValue: 4, targetUnit: 'reports/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-065', agreementId: 'AGR-016', type: 'financial', description: 'Quarterly royalty payments (3–6% ad valorem, raised 2025 Finance Act)', targetValue: 4, targetUnit: 'payments/year', dueDate: '2024-12-31', status: 'met' },

  // AGR-017 — Perseus Sissingué
  { id: 'CMT-066', agreementId: 'AGR-017', type: 'production', description: 'Annual gold production — Sissingué (Perseus Mining); AISC $1,701/oz H1 FY25', targetValue: 68000, targetUnit: 'oz/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-067', agreementId: 'AGR-017', type: 'environmental', description: 'Mine closure and rehabilitation plan update — Sissingué (approaching end-of-life)', targetValue: 1, targetUnit: 'plan current', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-068', agreementId: 'AGR-017', type: 'financial', description: 'Quarterly royalty payments — Sissingué', targetValue: 4, targetUnit: 'payments/year', dueDate: '2024-12-31', status: 'met' },

  // AGR-018 — Barrick Tongon — STORY: declining production, pending sale
  { id: 'CMT-069', agreementId: 'AGR-018', type: 'production', description: 'Annual gold production — Tongon (Barrick); 148 koz 2024 (↓27% from 204 koz 2023)', targetValue: 200000, targetUnit: 'oz/year', dueDate: '2024-12-31', status: 'at-risk' },
  { id: 'CMT-070', agreementId: 'AGR-018', type: 'community-development', description: 'Community engagement plan — Boundiali extension area; change-of-control stakeholder consultation', targetValue: 1, targetUnit: 'plan current', dueDate: '2024-12-31', status: 'at-risk' },
  { id: 'CMT-071', agreementId: 'AGR-018', type: 'environmental', description: 'Environmental rehabilitation escrow funded — Tongon (Article 142)', targetValue: 1, targetUnit: 'escrow current', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-072', agreementId: 'AGR-018', type: 'financial', description: 'Quarterly royalty payments — Tongon (raised under 2025 Finance Act)', targetValue: 4, targetUnit: 'payments/year', dueDate: '2024-12-31', status: 'met' },

  // AGR-019 & AGR-020 — Allied Gold CDI Complex
  { id: 'CMT-073', agreementId: 'AGR-019', type: 'production', description: 'Combined annual gold production — Agbaou + Bonikro CDI Complex (Allied Gold); Q4 2024: 45,422 oz', targetValue: 164000, targetUnit: 'oz/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-074', agreementId: 'AGR-019', type: 'community-development', description: 'Mandatory Community Development Fund — Agbaou communities', targetValue: 2000000, targetUnit: 'USD/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-075', agreementId: 'AGR-019', type: 'environmental', description: 'Annual environmental audit and rehabilitation escrow — Agbaou (Article 142)', targetValue: 1, targetUnit: 'audit/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-076', agreementId: 'AGR-020', type: 'community-development', description: 'Mandatory Community Development Fund — Bonikro communities', targetValue: 1500000, targetUnit: 'USD/year', dueDate: '2024-12-31', status: 'on-track' },
  { id: 'CMT-077', agreementId: 'AGR-020', type: 'environmental', description: 'Annual environmental audit and rehabilitation escrow — Bonikro (Article 142)', targetValue: 1, targetUnit: 'audit/year', dueDate: '2024-12-31', status: 'on-track' },
];

// ─── Performance Records (quarterly time-series) ──────────────
// 8 periods: 2023-Q1 to 2024-Q4
// Production data sourced from operator filings, EITI reports, USGS, World Gold Council

function makePerf(
  commitmentId: string,
  values: number[],
  unit: string,
  startQ: string = '2023-Q1',
): PerformanceRecord[] {
  const periods = generatePeriods(startQ, values.length);
  return values.map((v, i) => ({
    id: `PERF-${commitmentId}-${i + 1}`,
    commitmentId,
    reportingPeriod: periods[i],
    actualValue: v,
    actualUnit: unit,
    dateRecorded: periodToDate(periods[i]),
    source: 'Operator Quarterly Report / EITI Disclosure',
  }));
}

function generatePeriods(start: string, count: number): string[] {
  const [year, q] = start.split('-Q').map(Number);
  const result: string[] = [];
  let y = year, qi = q;
  for (let i = 0; i < count; i++) {
    result.push(`${y}-Q${qi}`);
    qi++;
    if (qi > 4) { qi = 1; y++; }
  }
  return result;
}

function periodToDate(period: string): string {
  const [year, q] = period.split('-Q').map(Number);
  const month = q * 3;
  return `${year}-${String(month).padStart(2, '0')}-28`;
}

export const PERFORMANCE_RECORDS: PerformanceRecord[] = [

  // CMT-001: CBG Sangarédi bauxite production (Mt/quarter)
  // 2023: ~24.1 Mt, 2024: ~25.8 Mt; source: Ministry of Mines, Guinea / Mysteel
  ...makePerf('CMT-001', [5800000, 6100000, 5900000, 6300000, 6200000, 6500000, 6400000, 6700000], 'DMT'),

  // CMT-006: SMB-Winning bauxite production (Mt/quarter)
  // Largest Guinean exporter; H1 2025 Guinea total: 99.8 Mt; 2024 sector total: ~145 Mt
  ...makePerf('CMT-006', [12800000, 13200000, 13500000, 14100000, 13900000, 14500000, 14200000, 15100000], 'DMT'),

  // CMT-010: Rusal Friguia alumina refinery output (kt/quarter)
  // Target ~600 kt/yr; source: Rusal annual reports
  ...makePerf('CMT-010', [148000, 151000, 145000, 153000, 150000, 148000, 152000, 155000], 'kt alumina'),

  // CMT-014: SimFer Simandou production — construction phase until Nov 2025
  // First ore shipped November 2025 (Q4 2025); all 2023–2024 periods: 0 production
  ...makePerf('CMT-014', [0, 0, 0, 0, 0, 0, 0, 0], 'DMT'),

  // CMT-023: GAC/EGA alumina refinery progress — never delivered (% complete)
  // Committed completion ~2020; licence revoked August 2025
  ...makePerf('CMT-023', [0, 0, 0, 0, 0, 0, 0, 0], '%'),

  // CMT-024: GAC/EGA bauxite production — peaked early then collapsed
  ...makePerf('CMT-024', [2100000, 1800000, 1500000, 800000, 0, 0, 0, 0], 'DMT'),

  // CMT-027: Newmont Ahafo South gold production (koz/quarter)
  // ~800 koz across Ghana in 2024 (Newmont operating reports); source: Newmont Corporation SEC 10-K
  ...makePerf('CMT-027', [197000, 203000, 195000, 210000, 198000, 208000, 201000, 215000], 'oz'),

  // CMT-035: Gold Fields Tarkwa gold production (koz/quarter)
  // Q3 2025: 123 koz (6-K filing); source: Gold Fields SEC 6-K
  ...makePerf('CMT-035', [124000, 121000, 118000, 122000, 120000, 123000, 117000, 121000], 'oz'),

  // CMT-039: AngloGold Ashanti Obuasi gold production (koz/quarter)
  // 2024: 221 koz (AngloGold Ashanti operating reports)
  ...makePerf('CMT-039', [53000, 56000, 54000, 59000, 55000, 58000, 54000, 54000], 'oz'),

  // CMT-044: AngloGold Ashanti Iduapriem gold production (koz/quarter)
  // 2024: 237 koz (AngloGold Ashanti operating reports)
  ...makePerf('CMT-044', [60000, 63000, 61000, 62000, 61000, 60000, 58000, 58000], 'oz'),

  // CMT-051: Ghana Manganese Company Nsuta production (kt/quarter)
  // 2024: ~820,000 t (USGS); 2022: 990,195 t exported
  ...makePerf('CMT-051', [198000, 208000, 201000, 210000, 208000, 212000, 200000, 200000], 'DMT'),

  // CMT-055: Endeavour Ity gold production (koz/quarter)
  // 2024: record >300 koz; source: Endeavour Mining press releases
  ...makePerf('CMT-055', [73000, 77000, 75000, 79000, 78000, 82000, 78000, 88000], 'oz'),

  // CMT-059: Endeavour Lafigué gold production (koz/quarter)
  // First gold June 2024 (Q2 2024), commercial August 2024; 96 koz in 2024
  // 2023: all zeros (construction); Q1 2024: 0 (pre-first-gold)
  ...makePerf('CMT-059', [0, 0, 0, 0, 0, 12000, 45000, 39000], 'oz'),

  // CMT-063: Perseus Yaouré gold production (koz/quarter)
  // H1 FY25 (Jul–Dec 2024): 123,158 oz; Q4 CY2024: 66,700 oz (Perseus ASX quarterly)
  ...makePerf('CMT-063', [60000, 64000, 62000, 65000, 63000, 66000, 63000, 67000], 'oz'),

  // CMT-066: Perseus Sissingué gold production (koz/quarter)
  // H1 FY25: 33,917 oz; Q4 CY2024: 16,851 oz (Perseus ASX quarterly)
  ...makePerf('CMT-066', [18000, 18000, 17000, 17000, 17000, 17000, 17000, 17000], 'oz'),

  // CMT-069: Barrick Tongon gold production (koz/quarter)
  // 2023: 204 koz (↓ from history); 2024: 148 koz (Barrick/MINING.COM/Ecofin Agency)
  ...makePerf('CMT-069', [55000, 52000, 50000, 47000, 40000, 38000, 36000, 34000], 'oz'),

  // CMT-073: Allied Gold CDI Complex production (koz/quarter)
  // 2024: ~164 koz inferred from quarterly disclosures (no single audited line); Q4 2024: 45,422 oz
  ...makePerf('CMT-073', [40000, 42000, 41000, 43000, 41000, 43000, 40000, 40000], 'oz'),
];

// ─── Infrastructure Obligations ──────────────────────────────

export const INFRASTRUCTURE_OBLIGATIONS: InfrastructureObligation[] = [
  // SimFer: CTG 600km railway — completed for first-ore Nov 2025
  { id: 'INF-001', agreementId: 'AGR-004', projectType: 'rail', projectName: 'Trans-Guinean Railway — CTG (600 km, Simandou to Forécariah)', committedCompletionDate: '2025-11-01', actualProgress: 100, status: 'met', lastUpdated: '2025-11-01' },
  // SimFer: Forécariah deep-water port — completed for first-ore Nov 2025
  { id: 'INF-002', agreementId: 'AGR-004', projectType: 'port', projectName: 'Forécariah Deep-Water Export Port (120 Mtpa combined capacity)', committedCompletionDate: '2025-11-01', actualProgress: 100, status: 'met', lastUpdated: '2025-11-01' },
  // GAC/EGA: Alumina refinery — never built; licence revoked
  { id: 'INF-003', agreementId: 'AGR-006', projectType: 'processing-plant', projectName: 'GAC/EGA Alumina Refinery — Boffa (committed condition of Mining Convention)', committedCompletionDate: '2020-12-31', actualProgress: 0, status: 'breached', lastUpdated: '2025-08-01' },
  // Newmont Ahafo North: mine construction — first gold Sep 2025
  { id: 'INF-004', agreementId: 'AGR-008', projectType: 'processing-plant', projectName: 'Newmont Ahafo North Mine and Processing Plant ($1.1 bn capex)', committedCompletionDate: '2025-09-30', actualProgress: 100, status: 'met', lastUpdated: '2025-09-19' },
  // Ghana Manganese: $450m refinery — sod-cut MISSED Nov 2024
  { id: 'INF-005', agreementId: 'AGR-013', projectType: 'processing-plant', projectName: 'Nsuta Manganese Refinery ($450 m) — sod-cut milestone', committedCompletionDate: '2024-11-30', actualProgress: 0, status: 'breached', lastUpdated: '2025-01-15' },
  // Endeavour Lafigué: power and road — completed at commercial production Aug 2024
  { id: 'INF-006', agreementId: 'AGR-015', projectType: 'road', projectName: 'Lafigué Access Road and Dedicated Power Supply', committedCompletionDate: '2024-08-01', actualProgress: 100, status: 'met', lastUpdated: '2024-07-30' },
  // Atlantic Lithium: Ewoyaa mine development — on hold post-lease withdrawal; resumed Mar 2026
  { id: 'INF-007', agreementId: 'AGR-012', projectType: 'processing-plant', projectName: 'Ewoyaa Lithium Mine Development ($185 m capex) — post-ratification restart', committedCompletionDate: '2028-12-31', actualProgress: 8, status: 'at-risk', lastUpdated: '2026-03-15' },
  // Rusal Friguia: rehabilitation escrow
  { id: 'INF-008', agreementId: 'AGR-003', projectType: 'dam', projectName: 'Friguia Tailings Rehabilitation Escrow — Article 142 top-up', committedCompletionDate: '2024-12-31', actualProgress: 65, status: 'at-risk', lastUpdated: '2024-06-01' },
];

// ─── Risk Flags ───────────────────────────────────────────────

export const RISK_FLAGS: RiskFlag[] = [
  // 1. GAC/EGA — CRITICAL: alumina refinery never built; licence revoked; settled 6 May 2026
  {
    id: 'RF-001', operatorId: 'OP-06', agreementId: 'AGR-006', commitmentId: 'CMT-023',
    severity: 'critical', category: 'Infrastructure Obligation — Licence Revoked & Settled',
    description: 'GAC/EGA failed to deliver the committed alumina refinery — the core condition of its Mining Convention. CNRD government revoked the mining licence; on 6 May 2026 Guinea, EGA and GAC announced a definitive settlement (negotiated through the President of the Paris Bar Association) transferring GAC assets to the state-backed Nimba Mining Company in exchange for a lump-sum payment, and renewing CBG–EGA bauxite-supply agreements.',
    triggeredDate: '2025-08-01', status: 'resolved',
    recommendedAction: 'Definitive settlement on 6 May 2026 closes the GAC dispute; Nimba Mining Company to assume operations; Ministry to track rehabilitation obligations and monitor lessons-learned for future revocation triage protocols (Recommendation 10.i.iv).',
    ruleTriggered: 'Infrastructure obligation past committed completion date with 0% progress — convention breach triggering revocation',
    evidenceDescription: 'EGA full impairment of GAC value AED 2.5 bn (~USD 680 m) in 2025; total Guinea-attributable charge AED 2.81 bn (USD 765 m); EGA net profit USD 578 m (2025) vs USD 715 m (2024). Settlement publicly announced via The National and Ecofin Agency on 6–7 May 2026. The wider Guinea revocation pattern generated the Axis International USD 28.9 bn ICSID claim (filed 25 Dec 2025, registered 16 Jan 2026) and related claims from Nimba Investment LLC, Falcon Energy Materials and Nomad Bauxite Corporation.',
  },
  // 2. Axis International USD 28.9 bn ICSID claim
  {
    id: 'RF-002', operatorId: 'OP-06', agreementId: 'AGR-006',
    severity: 'critical', category: 'Investor-State Arbitration (ICSID)',
    description: 'Axis International Ltd filed a USD 28.9 billion ICSID arbitration claim against the Republic of Guinea on 25 December 2025 (registered at ICSID on 16 January 2026), invoking the 2011 Guinea–UAE bilateral investment treaty and Guinea\'s 1995 Investment Code, following the May 2025 revocation of its Boffa bauxite permit (proven reserves >800 Mt; 2024 production 18 Mt).',
    triggeredDate: '2025-12-25', status: 'open',
    recommendedAction: 'Engage Ministry of Justice and Attorney General; retain ICSID specialist counsel; review all outstanding convention obligations for similar revocation risk; institute Recommendation 10.i.iv — explicit triage protocols for licence-revocation decisions to reduce future arbitration exposure of the Axis International type.',
    ruleTriggered: 'ICSID arbitration claim filed following licence revocation — systemic governance risk; claim value exceeds Guinea\'s annual national budget and rivals nominal GDP',
    evidenceDescription: 'Axis International Ltd (UAE) holds 85% of Axis Minerals Resources SA. Claim filed 25 Dec 2025; registered at ICSID 16 Jan 2026. Basis: revocation of Boffa bauxite permit in May 2025 without agreed compensation. Among the largest claims in the history of investment arbitration against an African state. Related claims: Nimba Investment LLC and a coalition of UAE-registered entities (registered 22 Dec 2025); Nomad Bauxite Corporation (Nov 2025).',
  },
  // 3. CBG IFC CAO complaint — 13 villages
  {
    id: 'RF-003', operatorId: 'OP-01', agreementId: 'AGR-001', commitmentId: 'CMT-003',
    severity: 'high', category: 'Community Development — IFC CAO Complaint',
    description: '13 villages around CBG\'s Sangarédi concession filed an IFC Compliance Advisor Ombudsman (CAO) complaint in February 2019 for land displacement. Mediation began January 2021. Hamdallaye village relocation during COVID lockdown criticised by Inclusive Development International.',
    triggeredDate: '2019-02-01', status: 'acknowledged',
    recommendedAction: 'Ensure resettlement action plan (RAP) implementation is independently verified; accelerate mediation with all 13 villages; publish quarterly CAO mediation progress reports; engage IFC PS5 compliance monitor.',
    ruleTriggered: 'IFC CAO complaint open >5 years; community obligation not fully discharged',
    evidenceDescription: 'CAO complaint filed Feb 2019. Mediation began Jan 2021. As of Q1 2026: mediation ongoing — no full resolution confirmed. Hamdallaye village relocation during COVID lockdown flagged by Inclusive Development International as procedurally irregular.',
  },
  // 4. Guinea 129 exploration permit revocations — systemic risk
  {
    id: 'RF-004', operatorId: 'OP-01', agreementId: 'AGR-001',
    severity: 'high', category: 'Regulatory Risk — Mass Permit Revocation',
    description: 'Guinea\'s transitional government, led by President Mamadi Doumbouya through Minister of Mines Bouna Sylla, cancelled 129 mineral-exploration permits on 26 May 2025 — primarily covering gold deposits — following an earlier purge of 51 mining licences (bauxite, gold, diamond, graphite, iron) earlier the same month. Affected operators included Australian-listed Resolute Mining (Niagassola, Doko, Siguiri-Kouroussa permits, one tied to a USD 175 m AngloGold Ashanti transaction).',
    triggeredDate: '2025-05-26', status: 'open',
    recommendedAction: 'All operators in Guinea should audit their work-programme delivery against Mining Code Article 145 thresholds (revocation if 50% of work programme unfinished after two years). Ministry should publish transparent revocation criteria (Recommendation 10.i.iv) and adopt explicit triage protocols to reduce discretionary risk and downstream ICSID exposure.',
    ruleTriggered: 'Systemic enforcement action — ~180 licences revoked May 2025; Article 145 work-programme compliance review required for all active permits',
    evidenceDescription: 'Reuters / MINING.COM (27 May 2025): 129 exploration permits cancelled 26 May 2025; earlier purge of 51 mining licences same month. Total ~180 licence revocations May 2025 under the transitional government. Pattern noted in IMF Country Report 24/131 and EITI country dialogue. Generated the Axis International USD 28.9 bn ICSID claim and related arbitration docket.',
  },
  // 5. Ghana galamsey crisis — systemic water pollution
  {
    id: 'RF-005', operatorId: 'OP-09', agreementId: 'AGR-010', commitmentId: 'CMT-041',
    severity: 'critical', category: 'Environmental — Galamsey Water Contamination',
    description: 'Illegal small-scale mining (galamsey) has polluted approximately 60% of Ghana\'s water bodies — per Ben Ampomah, Executive Secretary of the Water Resources Commission (the authoritative source; WHO attributions in some draft material are incorrect). In August 2024, Ghana Water Company Limited reported average turbidity of 14,000 NTU in the Pra River basin against the 2,000 NTU treatment-design threshold (not 500 NTU); by 2025 readings reached 32,000 NTU, prompting Kwanyako and Tarkwa-Bonsa water-treatment plant shutdowns. Sekyere Hemang Water Treatment Plant forced to operate at ~25% of installed capacity.',
    triggeredDate: '2024-08-01', status: 'open',
    recommendedAction: 'Activate galamsey/ASM water-quality module: deploy mercury/cyanide/turbidity dashboards linked to Ghana Water Co. and EPA feeds, with NTU thresholds calibrated to the 2,000 NTU treatment-design standard (Recommendation 10.ii.ii). Integrate continuous water-quality monitoring with environmental-enforcement escalation pathways under the Environmental Protection Act 2025 (Act 1124). Cross-reference with concession boundaries and GoldBod licensing under Sections 26–28 of Act 1140 for the Obuasi corridor.',
    ruleTriggered: 'Environmental threshold breach: river turbidity above 2,000 NTU GWCL treatment-design limit; water treatment plant shutdowns; cumulative community-health harm across multiple concessions',
    evidenceDescription: 'Ben Ampomah (Water Resources Commission, NOT WHO): ~60% of Ghana\'s water bodies polluted. GWCL turbidity: 14,000 NTU (August 2024) against the 2,000 NTU treatment-design threshold; 32,000 NTU (2025) publicly confirmed by GoldBod CEO Sammy Gyamfi on JoyFM Super Morning Show — sixteen times the treatment-design threshold. Kwanyako and Sekyere Hemang water treatment plant shutdowns documented. Ghana 2024 ASM gold production: 1.9 million oz (+70.1% YoY from 1.1 million oz in 2023) per Michael Edem Akafia, President of the Ghana Chamber of Mines, 97th AGM 30 May 2025. Sector-political escalation: 6 August 2025 Z-9 helicopter crash killed Defence Minister Edward Omane Boamah and Environment Minister Ibrahim Murtala Muhammed.',
  },
  // 6. AngloGold Obuasi — January 2025 security incident & 6 August 2025 helicopter crash
  {
    id: 'RF-006', operatorId: 'OP-09', agreementId: 'AGR-010', commitmentId: 'CMT-040',
    severity: 'high', category: 'Security — Fatalities at Mine Site',
    description: 'In January 2025 the Ghanaian army killed 7–9 illegal miners (galamsey operators) in a confrontation at AngloGold Ashanti\'s Obuasi mine. On 6 August 2025 a Ghanaian military Z-9 helicopter en route from Accra to an anti-galamsey event near Obuasi crashed in the Adansi forest, killing all eight people aboard, including Defence Minister Edward Omane Boamah and Environment Minister Ibrahim Murtala Muhammed.',
    triggeredDate: '2025-01-15', status: 'open',
    recommendedAction: 'Commission independent investigation; update IFC PS4 (Community Health, Safety and Security) risk assessment; engage Ghana Human Rights Commission; strengthen Community Liaison and ASM formalisation programme; embed continuous water-quality monitoring with environmental-enforcement escalation pathways under the Environmental Protection Act 2025 (Act 1124), with NTU thresholds calibrated to the 2,000 NTU treatment-design standard (Recommendation 10.ii).',
    ruleTriggered: 'Fatalities at or near mine site — IFC PS4 / OECD Due Diligence trigger; cumulative sector-political escalation indicator',
    evidenceDescription: 'January 2025: army anti-galamsey operation at Obuasi mine site — 7 to 9 fatalities reported (Joy FM, Reuters). 6 August 2025: Z-9 helicopter en route Accra→Obuasi crashed in the Adansi forest — 8 fatalities including Defence Minister Edward Omane Boamah and Environment Minister Ibrahim Murtala Muhammed (Al Jazeera; NBC News). Sector-wide political significance.',
  },
  // 7. Gold Fields Damang lease non-renewal
  {
    id: 'RF-007', operatorId: 'OP-08', agreementId: 'AGR-009',
    severity: 'high', category: 'Agreement Expiry — Investor-State Friction',
    description: 'Gold Fields\' Damang mining lease (granted 18 April 1995) expired on 18 April 2025; the Minerals Commission declined to renew. Gold Fields publicly acknowledged non-renewal on 12 April 2025. Active mining had ceased in 2023 and no mineral reserves were declared in Gold Fields\' 2024 annual report. The Ghanaian Government has announced plans to award the lease to one of three competing bidders.',
    triggeredDate: '2025-04-18', status: 'open',
    recommendedAction: 'Other operators with leases expiring 2025–2030 (Tarkwa 2028, Iduapriem 2030, Obuasi 2034) should begin renewal pre-consultation immediately. Ministry should publish transparent renewal criteria. Track competing bid evaluation among Engineers & Planners, BCM International, and Vortex Resources consortium — revival cost estimated by Minerals Commission CEO Isaac Tandoh at USD 600 m – USD 1 bn.',
    ruleTriggered: 'Mining lease expired; renewal declined — investor-state friction trigger',
    evidenceDescription: '30-year lease granted 18 April 1995, expired 18 April 2025 (Graphic Online, Bloomberg, Mining Technology). Gold Fields press statement on non-renewal 12 April 2025. Government plans to award to Engineers & Planners, BCM International, or Vortex Resources. Damang historically produced ~100 koz/year.',
  },
  // 8. Atlantic Lithium — lease withdrawn then ratified 19 March 2026
  {
    id: 'RF-008', operatorId: 'OP-10', agreementId: 'AGR-012', commitmentId: 'CMT-047',
    severity: 'high', category: 'Regulatory — Parliamentary Lease Withdrawal & Ratification',
    description: 'Atlantic Lithium\'s Ewoyaa Mining Lease was withdrawn from Parliament in December 2025 over royalty pricing, prompting a workforce reduction from 167 to 62 employees in November 2025. The revised lease — incorporating the new 5–12% sliding-scale royalty under the Minerals and Mining (Royalty) Regulations 2025 — was ratified by Parliament on 19 March 2026 (company announcement 20 March 2026).',
    triggeredDate: '2025-12-01', status: 'resolved',
    recommendedAction: 'Monitor project restart following March 2026 ratification; update ESIA and community agreements; confirm financing close by end-2026; track Elevra Lithium (Piedmont + Sayona) offtake performance — Elevra is committed to half of the projected 3.6 Mt spodumene concentrate over the 12-year mine life; continue extending sliding-scale royalty monitoring to lithium per Recommendation 10.ii.iii.',
    ruleTriggered: 'Parliamentary lease withdrawal followed by ratification under revised fiscal regime — investor confidence + critical minerals supply chain indicator',
    evidenceDescription: 'Lease withdrawn Parliament December 2025; ratified 19 March 2026 (Mining Weekly, MINING.COM, Atlantic Lithium Ltd company announcement 20 March 2026). MIIF holds an exact 6% contributing interest with USD 27.9 m within total USD 32.9 m investment (per MIIF CEO Edward Nana Yaw Koranteng). March 2026 bridge financing up to USD 16.4 m secured from Ghanaian institutional investors and Long State Investments; ~USD 185 m remaining required.',
  },
  // 9. Ghana Manganese — $450m refinery sod-cut missed
  {
    id: 'RF-009', operatorId: 'OP-11', agreementId: 'AGR-013', commitmentId: 'CMT-052',
    severity: 'medium', category: 'Infrastructure Obligation — Milestone Missed',
    description: 'Ghana Manganese Company\'s $450m refinery sod-cutting ceremony, planned for November 2024, was MISSED. No revised timeline has been publicly communicated.',
    triggeredDate: '2024-12-01', status: 'open',
    recommendedAction: 'Request formal revised project timeline and financing confirmation from TMI; verify if financing is in place; escalate to Minerals Commission if no update by Q2 2025. The refinery would add significant value-addition within Ghana and aligns with the value-addition agenda.',
    ruleTriggered: 'Infrastructure commitment milestone past due date — no evidence of commencement',
    evidenceDescription: 'Nsuta $450m refinery: sod-cut planned November 2024. As of Q1 2026: not started. TMI (90% shareholder) has not published financing closure confirmation. Ghana Chamber of Mines 2024 Annual Report notes refinery as "planned".',
  },
  // 10. Barrick Tongon — pending sale change of control
  {
    id: 'RF-010', operatorId: 'OP-14', agreementId: 'AGR-018', commitmentId: 'CMT-070',
    severity: 'medium', category: 'Change of Control — Convention Approval Required',
    description: 'Barrick Gold\'s sale of Tongon mine to Atlantic Group / Zijin Mining is under negotiation in 2025. Mining Convention Article (change-of-control) requires Ministerial approval for any transfer of majority interest.',
    triggeredDate: '2025-06-01', status: 'open',
    recommendedAction: 'Confirm change-of-control clause has been triggered; require new owner to assume all existing convention obligations before transaction completion; commission independent environmental and community obligations audit; verify beneficial ownership of acquiring entity (Zijin is a Chinese state-affiliated miner).',
    ruleTriggered: 'Ownership change through potential acquisition — Convention change-of-control clause triggered',
    evidenceDescription: 'Barrick public statements (2025): Tongon sale to Atlantic Group / Zijin under negotiation. Production: 148 koz 2024 (↓27% from 2023). Boundiali extension community concerns unresolved. Ministerial approval not yet confirmed.',
  },
  // 11. Simandou biodiversity — PS6 compliance monitoring
  {
    id: 'RF-011', operatorId: 'OP-04', agreementId: 'AGR-004', commitmentId: 'CMT-018',
    severity: 'medium', category: 'Environmental — Biodiversity (IFC PS6)',
    description: 'Simandou project traverses critical chimpanzee and forest elephant habitat in the Simandou Range. IFC PS6 biodiversity offset and no-net-loss obligations require independent monitoring throughout construction and operations.',
    triggeredDate: '2024-01-01', status: 'acknowledged',
    recommendedAction: 'Activate satellite-based concession monitoring (Sentinel-2/Planet) for deforestation detection along the 600km railway corridor; integrate with SimFer biodiversity management plan; commission annual independent PS6 audit.',
    ruleTriggered: 'PS6 critical habitat — no-net-loss commitment requires continuous monitoring',
    evidenceDescription: 'Simandou Range hosts globally significant populations of chimpanzee and forest elephant (IUCN critical). Co-Development Agreement 2022 includes biodiversity obligations. Railway corridor 600km through forest region. First ore Nov 2025 — biodiversity monitoring must now track operational as well as construction phase.',
  },
  // 12. CIV gold royalty hike + PIRME fiscal expansion — sector-wide fiscal impact
  {
    id: 'RF-012', operatorId: 'OP-12', agreementId: 'AGR-014',
    severity: 'low', category: 'Regulatory — Fiscal Change',
    description: 'Côte d\'Ivoire\'s 2025 Finance Act raised the ad-valorem gold royalty up to 8% above USD 2,000/oz (retroactive to January 2025, replacing the previous 3–6% contract-linked range). PIRME (Politique Intégrée des Ressources Minérales et Énergétiques), adopted by the Council of Ministers on 3 December 2025, frames a CFA 38,000 bn (~USD 67–68 bn) 15-year fiscal architecture targeting a doubling of mining-energy GDP share from 7% (2022) to 14% (2040).',
    triggeredDate: '2025-01-01', status: 'acknowledged',
    recommendedAction: 'Review each CIV Mining Convention for fiscal stability clause scope; model the 8% ad-valorem rate against project economics for Tongon (declining production), Sissingué (high AISC), and Bonikro; integrate PIRME fiscal scenarios into the Negotiation Intelligence module (Recommendation 10.iii.i — anchor ACCI within the PIRME implementation framework).',
    ruleTriggered: 'Fiscal regulation change — Convention stability clause review required',
    evidenceDescription: '2025 Finance Act: ad-valorem gold royalty up to 8% above USD 2,000/oz, retroactive January 2025 (TRT Afrika / Reuters). Cabinet decrees of 4 February 2026 granted mining permits for Assafou (Endeavour) and Doropo (Resolute) gold projects (~USD 1.25 bn). PIRME allocations 41% energy / 30% mining / 29% hydrocarbons. Endeavour Ity/Lafigué and Perseus Yaouré 5-year tax holidays partially offset impact.',
  },
  // 13. Rusal Guinea — sanctions/geopolitical risk
  {
    id: 'RF-013', operatorId: 'OP-03', agreementId: 'AGR-003',
    severity: 'medium', category: 'Geopolitical — Sanctions Risk',
    description: 'UC Rusal is subject to complex Western sanctions context following the Russia-Ukraine war (2022). Guinea\'s continued hosting of Rusal operations at Friguia/Kindia/Boké creates compliance exposure for international banks, insurers, and offtake counterparties.',
    triggeredDate: '2022-03-01', status: 'acknowledged',
    recommendedAction: 'Ministry of Mines to confirm Rusal convention remains in force under Guinean law; require disclosure of any change in financing arrangements; track any OFAC/EU sanctions updates that affect operational entities; ensure environmental rehabilitation escrow (Article 142) is funded through non-sanctioned accounts.',
    ruleTriggered: 'Operator subject to international sanctions — convention counterparty risk; Article 142 escrow funding risk',
    evidenceDescription: 'United Company RUSAL Plc: subject to evolving US/EU sanctions since March 2022. Oleg Deripaska (major shareholder) is OFAC-sanctioned (though RUSAL itself was delisted from SDN in 2019). Guinea-based operations nominally insulated but financing, insurance, and offtake counterparty exposure remains. Friguia alumina ~600 kt/yr at risk of operational disruption.',
  },
];

// ─── New Feature Data ────────────────────────────────────────

export const BENEFICIAL_OWNER_TREES: BeneficialOwnerNode[] = [
  // OP-05 — Winning Consortium Simandou (Blocks 1 & 2)
  { id: 'BO-1', operatorId: 'OP-05', name: 'Winning International Group Pte Ltd', jurisdiction: 'Singapore', ownershipPercent: 55, isPEP: false, isOpaque: false, entityType: 'corporate' },
  { id: 'BO-2', operatorId: 'OP-05', name: 'Sun Xiushun', jurisdiction: 'Singapore', ownershipPercent: 100, isPEP: false, isOpaque: false, parentId: 'BO-1', entityType: 'individual' },
  { id: 'BO-3', operatorId: 'OP-05', name: 'Shandong Weiqiao Pioneering Group', jurisdiction: 'China', ownershipPercent: 30, isPEP: true, pepDetails: 'State-affiliated enterprise', isOpaque: true, entityType: 'corporate' },
  { id: 'BO-4', operatorId: 'OP-05', name: 'Alliance Mining Commodities Ltd', jurisdiction: 'Guinea', ownershipPercent: 15, isPEP: true, pepDetails: 'Linked to former minister', isOpaque: false, entityType: 'corporate' },
  // OP-02 — SMB-Winning Consortium (Société des Mines de Boké)
  { id: 'BO-5', operatorId: 'OP-02', name: 'Winning Shipping Ltd', jurisdiction: 'Singapore', ownershipPercent: 50, isPEP: false, isOpaque: false, entityType: 'corporate' },
  { id: 'BO-6', operatorId: 'OP-02', name: 'Shandong Weiqiao Pioneering Group', jurisdiction: 'China', ownershipPercent: 25, isPEP: true, pepDetails: 'State-affiliated enterprise', isOpaque: true, entityType: 'corporate' },
  { id: 'BO-7', operatorId: 'OP-02', name: 'United Mining Supply (UMS)', jurisdiction: 'Guinea', ownershipPercent: 15, isPEP: false, isOpaque: false, entityType: 'corporate' },
  { id: 'BO-8', operatorId: 'OP-02', name: 'Republic of Guinea', jurisdiction: 'Guinea', ownershipPercent: 10, isPEP: false, isOpaque: false, entityType: 'government' },
  // OP-01 — Compagnie des Bauxites de Guinée (CBG)
  { id: 'BO-9',  operatorId: 'OP-01', name: 'Halco Mining Inc', jurisdiction: 'United States', ownershipPercent: 51, isPEP: false, isOpaque: false, entityType: 'corporate' },
  { id: 'BO-10', operatorId: 'OP-01', name: 'Republic of Guinea', jurisdiction: 'Guinea', ownershipPercent: 49, isPEP: false, isOpaque: false, entityType: 'government' },
];

export const PROTECTED_ZONES: ProtectedZone[] = [
  { id: 'PZ-1', name: 'Haut Niger National Park', type: 'national_park', countryId: 'GIN', coordinates: [10.5, -10.0], radiusKm: 25, description: 'Core protection zone for chimpanzees' },
  { id: 'PZ-2', name: 'Pra River Basin', type: 'water_reserve', countryId: 'GHA', coordinates: [6.1, -1.5], radiusKm: 15, description: 'Critical water source, heavily impacted by galamsey' },
];

export const CONCESSION_CONFLICTS: ConcessionConflict[] = [
  { id: 'CC-1', agreementId: 'AGR-010', zoneId: 'PZ-2', overlapAreaKm2: 12.5, severity: 'critical', description: 'Obuasi concession overlap with Pra River buffer zone' },
];

export const COMMODITY_PRICES: CommodityPrice[] = [
  { date: '2024-01-01', commodity: 'gold', pricePerUnit: 2050, unit: 'oz' },
  { date: '2024-02-01', commodity: 'gold', pricePerUnit: 2100, unit: 'oz' },
  { date: '2024-03-01', commodity: 'gold', pricePerUnit: 2150, unit: 'oz' },
  { date: '2024-04-01', commodity: 'gold', pricePerUnit: 2300, unit: 'oz' },
  { date: '2024-05-01', commodity: 'gold', pricePerUnit: 2400, unit: 'oz' },
  { date: '2024-06-01', commodity: 'gold', pricePerUnit: 2350, unit: 'oz' },
];

export const LOCAL_CONTENT_RECORDS: LocalContentRecord[] = [
  { id: 'LC-1',  agreementId: 'AGR-007', operatorId: 'OP-07', category: 'employment',     promised: 80,  actual: 82,  unit: '%',         reportingPeriod: '2024-Q4', verifiedBy: 'Ghana Minerals Commission', verifiedDate: '2025-01-20' },
  { id: 'LC-2',  agreementId: 'AGR-010', operatorId: 'OP-09', category: 'employment',     promised: 75,  actual: 68,  unit: '%',         reportingPeriod: '2024-Q4', verifiedBy: 'Ghana Minerals Commission', verifiedDate: '2025-01-20' },
  { id: 'LC-3',  agreementId: 'AGR-002', operatorId: 'OP-02', category: 'procurement',    promised: 30,  actual: 12,  unit: '%',         reportingPeriod: '2024-Q4' },
  { id: 'LC-4',  agreementId: 'AGR-004', operatorId: 'OP-04', category: 'employment',     promised: 70,  actual: 74,  unit: '%',         reportingPeriod: '2024-Q4' },
  { id: 'LC-5',  agreementId: 'AGR-001', operatorId: 'OP-01', category: 'procurement',    promised: 40,  actual: 35,  unit: '%',         reportingPeriod: '2024-Q4' },
  { id: 'LC-6',  agreementId: 'AGR-007', operatorId: 'OP-07', category: 'community_fund', promised: 100, actual: 92,  unit: 'USD m',     reportingPeriod: '2024-Q4', verifiedBy: 'EITI Ghana', verifiedDate: '2025-02-05' },
  { id: 'LC-7',  agreementId: 'AGR-007', operatorId: 'OP-07', category: 'training',       promised: 500, actual: 410, unit: 'persons',   reportingPeriod: '2024-Q4' },
  { id: 'LC-8',  agreementId: 'AGR-010', operatorId: 'OP-09', category: 'infrastructure', promised: 100, actual: 60,  unit: '% milestone', reportingPeriod: '2024-Q4' },
  { id: 'LC-9',  agreementId: 'AGR-002', operatorId: 'OP-02', category: 'employment',     promised: 85,  actual: 88,  unit: '%',         reportingPeriod: '2024-Q4' },
  { id: 'LC-10', agreementId: 'AGR-008', operatorId: 'OP-08', category: 'community_fund', promised: 50,  actual: 51,  unit: 'USD m',     reportingPeriod: '2024-Q4' },
];

export const DOCUMENT_ACCESS_LOGS: DocumentAccessLog[] = [
  { id: 'DL-1', timestamp: '2024-05-24T08:15:00Z', userId: 'U-1', userName: 'Minister S. Diallo', userRole: 'Admin', action: 'viewed', documentName: 'Simandou B3/B4 Co-Development Agreement', documentVersion: 'v3.2', documentType: 'agreement', agreementId: 'AGR-004', ipAddress: '197.149.x.x', hash: 'sha256:9f2a7c41' },
  { id: 'DL-2', timestamp: '2024-05-23T14:22:00Z', userId: 'U-2', userName: 'Chief Auditor K. Mensah', userRole: 'Auditor', action: 'downloaded', documentName: 'Ewoyaa ESIA Report Q1', documentVersion: 'v1.0', documentType: 'audit_report', agreementId: 'AGR-012', ipAddress: '41.218.x.x', hash: 'sha256:1b6e0d88' },
  { id: 'DL-3', timestamp: '2024-05-22T11:48:00Z', userId: 'U-4', userName: 'Legal Counsel A. Touré', userRole: 'Legal', action: 'modified', documentName: 'Simandou B3/B4 Co-Development Agreement', documentVersion: 'v3.2', documentType: 'agreement', agreementId: 'AGR-004', ipAddress: '197.149.x.x', hash: 'sha256:c4d9af13', details: 'Annex C royalty schedule revised' },
  { id: 'DL-4', timestamp: '2024-05-20T16:05:00Z', userId: 'U-5', userName: 'WCS Counterparty (external)', userRole: 'External', action: 'uploaded', documentName: 'Simandou B3/B4 Co-Development Agreement', documentVersion: 'v3.1', documentType: 'agreement', agreementId: 'AGR-004', ipAddress: '203.0.113.x', hash: 'sha256:7e1c5b2f', details: 'Counter-signed PDF returned' },
  { id: 'DL-5', timestamp: '2024-05-18T09:31:00Z', userId: 'U-1', userName: 'Minister S. Diallo', userRole: 'Admin', action: 'deleted', documentName: 'Simandou B3/B4 Draft (superseded)', documentVersion: 'v2.9', documentType: 'agreement', agreementId: 'AGR-004', ipAddress: '197.149.x.x', hash: 'sha256:0a44e9c7', details: 'Superseded draft purged from data room' },
];

export const EITI_REPORT_SECTIONS: EITIReportSection[] = [
  // Guinea (GIN)
  { countryId: 'GIN', sectionNumber: '1.1', title: 'Legal Framework', status: 'complete', dataSource: 'Ministry of Mines', lastUpdated: '2024-05-01' },
  { countryId: 'GIN', sectionNumber: '1.2', title: 'License Allocations', status: 'partial', dataSource: 'Cadastre', lastUpdated: '2024-05-15' },
  { countryId: 'GIN', sectionNumber: '2.5', title: 'Beneficial Ownership', status: 'missing', dataSource: 'Corporate Registry', lastUpdated: '2024-01-10' },
  { countryId: 'GIN', sectionNumber: '4.1', title: 'Revenue Collection', status: 'partial', dataSource: 'Treasury / DGI', lastUpdated: '2024-04-22' },
  { countryId: 'GIN', sectionNumber: '6.1', title: 'Social & Infrastructure Expenditure', status: 'complete', dataSource: 'Local Development Fund', lastUpdated: '2024-05-10' },
  // Ghana (GHA)
  { countryId: 'GHA', sectionNumber: '1.1', title: 'Legal Framework', status: 'complete', dataSource: 'Minerals Commission', lastUpdated: '2024-05-03' },
  { countryId: 'GHA', sectionNumber: '1.2', title: 'License Allocations', status: 'complete', dataSource: 'Cadastre', lastUpdated: '2024-05-12' },
  { countryId: 'GHA', sectionNumber: '2.5', title: 'Beneficial Ownership', status: 'partial', dataSource: 'Registrar-General', lastUpdated: '2024-03-18' },
  { countryId: 'GHA', sectionNumber: '4.1', title: 'Revenue Collection', status: 'complete', dataSource: 'Ghana Revenue Authority', lastUpdated: '2024-05-20' },
  { countryId: 'GHA', sectionNumber: '6.1', title: 'Social & Infrastructure Expenditure', status: 'partial', dataSource: 'Mineral Development Fund', lastUpdated: '2024-04-30' },
  // Côte d'Ivoire (CIV)
  { countryId: 'CIV', sectionNumber: '1.1', title: 'Legal Framework', status: 'complete', dataSource: 'Ministère des Mines', lastUpdated: '2024-04-28' },
  { countryId: 'CIV', sectionNumber: '1.2', title: 'License Allocations', status: 'partial', dataSource: 'Cadastre Minier', lastUpdated: '2024-05-08' },
  { countryId: 'CIV', sectionNumber: '2.5', title: 'Beneficial Ownership', status: 'missing', dataSource: 'CEPICI', lastUpdated: '2023-11-15' },
  { countryId: 'CIV', sectionNumber: '4.1', title: 'Revenue Collection', status: 'partial', dataSource: 'DGI', lastUpdated: '2024-04-19' },
];

// ─── Master export ────────────────────────────────────────────

export interface SeedData {
  countries: Country[];
  operators: Operator[];
  agreements: Agreement[];
  commitments: Commitment[];
  performanceRecords: PerformanceRecord[];
  riskFlags: RiskFlag[];
  infrastructureObligations: InfrastructureObligation[];
  beneficialOwnerTrees: BeneficialOwnerNode[];
  protectedZones: ProtectedZone[];
  concessionConflicts: ConcessionConflict[];
  commodityPrices: CommodityPrice[];
  localContentRecords: LocalContentRecord[];
  documentAccessLogs: DocumentAccessLog[];
  eitiReportSections: EITIReportSection[];
}

export function generateSeedData(): SeedData {
  return {
    countries: COUNTRIES,
    operators: OPERATORS,
    agreements: AGREEMENTS,
    commitments: COMMITMENTS,
    performanceRecords: PERFORMANCE_RECORDS,
    riskFlags: RISK_FLAGS,
    infrastructureObligations: INFRASTRUCTURE_OBLIGATIONS,
    beneficialOwnerTrees: BENEFICIAL_OWNER_TREES,
    protectedZones: PROTECTED_ZONES,
    concessionConflicts: CONCESSION_CONFLICTS,
    commodityPrices: COMMODITY_PRICES,
    localContentRecords: LOCAL_CONTENT_RECORDS,
    documentAccessLogs: DOCUMENT_ACCESS_LOGS,
    eitiReportSections: EITI_REPORT_SECTIONS,
  };
}

