# Designing an AI-Enabled Investor and Compliance Intelligence System for Continuous Assurance in Guinean Mining Governance: An Institutional Framework for the Republic of Guinea

**Project code: PEB-0526-WA-MIN-05**
**Target journal: Resources Policy (alternative: The Extractive Industries and Society)**

---

## Flashpoint advisory: hedged-wording recommendations

The following claims, present in one or more of the source drafts, could not be fully verified against authoritative primary sources within the present research budget and have accordingly been hedged or excluded in the final manuscript wording. Readers and reviewers should treat them with corresponding caution.

1. The Compagnie du TransGuinéen equity split of "SimFer 42.5% / WCS 42.5% / State 15%" is not directly corroborated in Rio Tinto's public SEC filings, which document only the SimFer mine-level ownership of 85% SimFer / 15% Government of Guinea. The CTG-specific ratio has accordingly been omitted in favour of the verified SimFer figures, with the rail-and-port infrastructure described as a co-development partnership between SimFer, WCS, Baowu and the Government of Guinea.
2. The specific Guinean beneficial-ownership decree reference "D/2021/233/PRG/SGG" cited in some draft material could not be confirmed against EITI documentation, which records that the underlying beneficial-ownership legislation drafted in 2019 and resubmitted to Parliament in 2024 remained pending enactment at the time of writing. The manuscript reflects this hedged position.
3. The Simandou reserve figure of "approximately 1.5 billion tonnes" appears in some draft material; authoritative sources (notably mining-industry reporting and Rio Tinto disclosures) refer to a total Simandou deposit on the order of 3 billion tonnes, with the high-grade (~65% Fe) component representing a substantial sub-set. The manuscript adopts the more cautious phrasing "one of the world's largest remaining high-grade iron-ore deposits" and refers to the IMF Country Report 24/131 modelling rather than reserve figures.

---

## Abstract

The Republic of Guinea's mining sector is experiencing a structural inflexion point. A confluence of resource nationalism, contractual renegotiation and rising critical-mineral demand has exposed the chronic inadequacy of episodic, paper-based compliance regimes for governing complex extractive contracts. Between May 2025 and May 2026, Guinea revoked 129 mineral-exploration permits and an earlier tranche of 51 licences, terminated Emirates Global Aluminium's Guinea Alumina Corporation (GAC) concession, transferred the GAC assets to the state-backed Nimba Mining Company, attracted a USD 28.9 billion ICSID arbitration claim from Axis International over its Boffa bauxite licence, and inaugurated the USD 20 billion Simandou iron-ore mine-rail-port system at Morebaya port. The Guinean state does not currently possess an institutional architecture capable of monitoring contractual, fiscal, environmental and beneficial-ownership obligations at the frequency, granularity and evidentiary standard now demanded by either domestic political economy or international investment law.

This study develops the **Adaptive Continuous Compliance Intelligence (ACCI) Model**, an integrated theoretical and systems-design framework synthesising principal-agent theory, institutional capacity theory, information asymmetry theory, continuous assurance theory and algorithmic governance theory. The ACCI Model is operationalised as a five-module AI-enabled Investor and Compliance Intelligence System encompassing Contract and Agreement Intelligence; Negotiation Intelligence; Performance and Compliance Monitoring; Breach and Risk Detection; and Transparency and Reporting. Methodologically, the paper adopts an institutional systems-design approach combining doctrinal-legal analysis of the Guinean Mining Code (Law L/2011/006/CNT as amended by Law L/2013/053/CNT); jurisdictional triangulation against EITI validation data, IMF Country Report 24/131, the NRGI Resource Governance Index 2021 and operator filings; and design-science systems specification.

The principal findings are threefold. First, Guinea exhibits a hyper-discretionary licence-revocation regime in which formally robust law is operationalised through politically inflected ministerial decisions, generating significant arbitration exposure — a governance pathology that justifies a continuous, evidentially anchored assurance design over the inherited episodic regime. Second, continuous-assurance instrumentation can materially compress the information-asymmetry gap between extractive operators and the state principal, but only where digital-sovereignty, data-custody and algorithmic-legitimacy questions are resolved ex ante. Third, the ACCI Model offers a generalisable contribution to the political economy of digital governance in resource-rich states, repositioning RegTech as a thicker institutional learning architecture rather than a narrow automation layer. The paper concludes with tiered, operational policy recommendations and identifies a Simandou-anchored pilot pathway as the most tractable entry point for national deployment.

**Keywords:** Adaptive Continuous Compliance Intelligence; Guinean mining governance; resource curse; continuous assurance; algorithmic regulation; RegTech; Simandou; bauxite; licence revocation; EITI; beneficial ownership.

---

## 1. Introduction

The governance of extractive contracts in Guinea has entered a period of accelerated institutional stress. Between 2024 and 2026, the Republic of Guinea — holder of the world's largest bauxite reserves and of one of the world's largest remaining high-grade iron-ore deposits at Simandou — has generated cascading regulatory events of sufficient scale to reshape global mineral supply chains, sovereign-investor relations and the domestic political settlement.

The military government led by President Mamadi Doumbouya cancelled 129 mineral-exploration permits on 26 May 2025, following an earlier purge of 51 licences in the same month; revoked the bauxite concession held by Emirates Global Aluminium's Guinea Alumina Corporation; transferred the GAC assets to the state-backed Nimba Mining Company; and simultaneously inaugurated the USD 20 billion Simandou iron-ore project at Morebaya port on 11 November 2025. These moves combine an aggressive resource-nationalist enforcement posture with the single largest mining-infrastructure investment in the country's history, exposing in concentrated form the limits of the inherited compliance architecture.

That architecture remains overwhelmingly episodic, paper-based, retrospective and discretionary. Mineral conventions are negotiated bilaterally between state ministries and operator counsel, lodged in physical archives, monitored through annual returns and ad hoc inspections, and adjudicated — when adjudicated at all — through politically inflected ministerial decisions of the kind that have generated the cluster of ICSID arbitrations now confronting Guinea, including Axis International's USD 28.9 billion claim filed on 25 December 2025 and registered at ICSID on 16 January 2026. The asymmetry of information, technical capacity and legal sophistication between the mining-state principal and multinational operator agents is, on present evidence, widening rather than narrowing.

This paper argues that the structural mismatch between the velocity of contemporary mining-governance events and the cadence of existing compliance systems can be addressed by deliberate institutional and technological redesign. Specifically, it proposes the **Adaptive Continuous Compliance Intelligence (ACCI) Model**, a framework that reconceives mining-sector compliance as a continuous, evidentially anchored, algorithmically supported institutional learning cycle. The ACCI Model integrates five theoretical traditions — principal-agent theory, institutional capacity theory, information asymmetry theory, continuous assurance theory and algorithmic governance theory — into a single operational architecture, and is instantiated as a five-module AI-enabled Investor and Compliance Intelligence System.

The paper is structured as follows. Section 2 reviews the literatures on extractive-sector governance and the resource curse, mining-compliance systems, digital and algorithmic governance, and African mining governance, identifying four unresolved gaps. Section 3 develops the ACCI theoretical framework. Section 4 sets out the institutional systems-design methodology. Section 5 conducts the institutional analysis of Guinea's mining-governance regime. Section 6 specifies the five-module system architecture in design-science detail. Section 7 articulates the formal ACCI Model. Section 8 examines policy simulation and implementation, including a Guinea-first pilot pathway. Section 9 discusses digital sovereignty, state bargaining power, compliance automation ethics, algorithmic legitimacy and limitations. Section 10 sets out tiered policy recommendations, and Section 11 concludes.

---

## 2. Literature Review

### 2.1 Extractive governance, rent theory and the resource curse

The political economy of mineral-rich developing states has been organised, for four decades, around the resource-curse paradox first formalised by Auty (1993) and consolidated by Sachs and Warner (1995). The empirical regularity that mineral-dependent economies underperform their resource-poor peers on growth, institutional quality and conflict outcomes has resisted simple explanation, but the predominant transmission mechanisms — Dutch disease, rent-seeking, weak fiscal linkages and elite capture — converge on a common institutional finding: extractive-sector outcomes are determined less by geology than by the quality of the contracting, monitoring and revenue-management apparatus surrounding the deposit. Subsequent contributions by Collier, Humphreys and others sharpened the analytical focus on contract integrity, fiscal-regime design and transparency mechanisms, while critical scholarship from Bebbington and contributors to the *Resources Policy* and *Extractive Industries and Society* literatures emphasised the spatial and distributional politics of extraction.

For Guinea's bauxite and emerging iron-ore economy, the rent-management problématique is particularly acute because mineral endowments are world-leading — Guinea holds the world's largest bauxite reserves — but absorptive and regulatory capacity remains constrained. The Natural Resource Governance Institute's 2021 Resource Governance Index awarded Guinea's mining sector a composite score of 62 out of 100 ("satisfactory" band, up 6 points from the 2019 interim evaluation). This figure, although an improvement on prior cycles, masks significant intra-component weaknesses, particularly on licence allocation, beneficial-ownership disclosure and subnational resource-revenue sharing.

### 2.2 Mining compliance systems and continuous assurance

Compliance scholarship in extractive industries has historically privileged static, periodic-reporting models grounded in financial-audit traditions. The continuous-auditing literature pioneered by Vasarhelyi and colleagues from the early 1990s onwards reconceived assurance as a real-time, embedded process rather than a periodic event. Although this literature emerged in the corporate-financial context, its core insights — embedded analytics, exception-based escalation, continuous control monitoring and continuous risk assessment — translate directly to the requirements of mining-sector oversight, where contractual obligations are dense, multi-temporal and observable through high-frequency operational data streams.

Adjacent scholarship on RegTech has documented the migration of compliance automation from financial services into broader regulatory domains, and emerging contributions to public-sector audit explore the application of artificial intelligence to procurement, tax and environmental monitoring. The gap, however, is the absence of a comprehensive, theoretically grounded application of continuous assurance to mineral-sector compliance under the institutional conditions of low- and middle-income resource-rich states.

### 2.3 Digital and algorithmic governance

The literature on algorithmic regulation and the digital state has matured rapidly. Yeung's (2018) influential analysis frames algorithmic regulation as the deployment of computational decision-systems for regulatory purposes, distinguishing it from mere e-government digitisation and surfacing the legitimacy, accountability and rule-of-law tensions that automated regulatory decisions generate. Subsequent contributions by Kitchin on data-driven urbanism, and by Ulbricht and Yeung on the law of algorithmic regulation, have refined the conceptual vocabulary, foregrounding questions of contestability, explainability and the dual hazards of regulatory ossification and regulatory drift.

For mineral-sector governance, algorithmic regulation poses both promise and peril. The promise lies in continuous, evidentially grounded monitoring of contractual and environmental obligations at scales beyond current human-inspector capacity. The peril lies in the displacement of discretionary judgement, opaque decision logic, and the possibility that algorithmic systems will entrench rather than correct existing institutional pathologies.

### 2.4 African mining governance

The literature on African mining governance has been enriched by EITI country reports, AfDB sectoral studies, and the African Mining Legislation Atlas (AMLA), as well as by detailed jurisdictional scholarship — notably Campbell and others on Guinean bauxite and the political economy of resource nationalism. The Intergovernmental Forum's Mining Policy Framework (IGF MPF) and the OECD Due Diligence Guidance for Responsible Mineral Supply Chains provide the principal international normative architecture, while the IFC Performance Standards (notably PS1 on environmental and social management, PS5 on involuntary resettlement and PS6 on biodiversity) and the Open Contracting Data Standard's Resource Contracts extension supply operational benchmarks.

### 2.5 Unresolved gaps

Four gaps remain unresolved. First, there is no integrated framework for continuous compliance monitoring tailored to the institutional realities of African mining ministries. Second, no published work tailors a continuous-assurance architecture to the specific conditions of the Guinean mining sector — a hyper-discretionary licensing regime, a flagship multi-decade mine-rail-port concession, and an active investment-arbitration docket. Third, the algorithmic-governance literature is theoretically rich but operationally thin, particularly in extractives. Fourth, no published work synthesises principal-agent, institutional-capacity, information-asymmetry, continuous-assurance and algorithmic-governance literatures into a unified model for resource-state oversight. The ACCI Model is designed to close these gaps.

---

## 3. Theoretical Framework: The Adaptive Continuous Compliance Intelligence (ACCI) Model

The ACCI Model integrates five theoretical traditions.

**Principal-agent theory** frames the host state as principal and the mining operator as agent, with asymmetric information, divergent objectives and incomplete contracts generating monitoring costs and moral-hazard risks. The classical Jensen-Meckling formulation identifies monitoring, bonding and residual-loss costs; in mining governance, monitoring costs are typically under-invested while residual losses (in the form of unpaid royalties, environmental degradation and benefit-sharing failures) are absorbed by the principal.

**Institutional capacity theory** draws on North, Acemoglu and others to argue that the binding constraint on extractive governance is rarely the absence of formal rules — Guinea's 2013 Mining Code is reasonably well drafted — but the absence of institutional capacity to enforce them. Capacity here is understood as the joint product of technical skill, organisational memory, inter-agency interoperability and political insulation from capture.

In the Guinean case the binding constraint is plainly enforcement rather than drafting: Law L/2011/006/CNT (as amended) is reasonably well drafted, yet its administration through politically inflected ministerial discretion is precisely what generates the country's arbitration exposure.

**Information asymmetry theory**, building on Akerlof, Stiglitz and Spence, foregrounds the systematic informational disadvantage of state actors vis-à-vis operators with respect to ore-body characteristics, cost structures, transfer-pricing flows and environmental performance. The ACCI Model treats compression of this informational gap as its central design objective.

**Continuous assurance theory**, originating with Vasarhelyi, reconceives audit as embedded, continuous and exception-based rather than periodic and sample-based. Its translation into mining governance entails real-time ingestion of production, fiscal, environmental and corporate-structure data; rule-based and probabilistic evaluation against contractual and statutory obligations; and exception-triggered escalation pathways.

**Algorithmic governance theory** (Yeung 2018; Kitchin; Ulbricht & Yeung) supplies the legitimacy, contestability and accountability vocabulary necessary to embed automated decision-systems in public-law settings. Critically, the ACCI Model does not treat algorithmic outputs as determinative; rather, they are evidentially structured inputs into human institutional decision-making, with explicit contestation pathways.

The synthesis yields the ACCI Model: a five-layer architecture comprising (i) **inputs** (contractual, fiscal, operational, environmental and beneficial-ownership data); (ii) **processing layers** (clause extraction, rules-engine evaluation, probabilistic breach modelling, anomaly detection); (iii) **decision intelligence** (risk scoring, escalation triage, scenario simulation); (iv) **feedback loops** (operator response, ministerial action, judicial and arbitral outcomes); and (v) **institutional learning cycles** (model retraining, rule revision, capacity reinforcement). Each layer is governed by an explicit accountability and contestability protocol.

---

## 4. Methodology

The study adopts an institutional systems-design research strategy combining doctrinal-legal analysis, jurisdictional triangulation and design-science systems specification.

**Doctrinal-legal analysis** examines Guinea's primary mining legislation: the Mining Code (Law L/2011/006/CNT of 9 September 2011 as amended by Law L/2013/053/CNT of 8 April 2013, promulgated by Presidential Decree D/2013/075/PRG/SGG of 17 April 2013), together with the implementing institutional architecture of SOGUIPAMI (Société Guinéenne du Patrimoine Minier) and the pending 2019/2024 beneficial-ownership legislation.

**Jurisdictional triangulation** integrates the primary legislation with EITI validation reports (notably Guinea's 88/100 score under the 2019 EITI Standard, agreed by the EITI Board on 16 February 2022); IMF Country Report 24/131 of 17 May 2024; the NRGI Resource Governance Index 2021 country profile; operator filings (Rio Tinto Form 6-K disclosures on Simandou; Emirates Global Aluminium 2025 financial disclosures); ICSID arbitration filings (notably Axis International); and reputable secondary reporting (Reuters, Bloomberg, *Mining Weekly*, MINING.COM, *The National*, *Ecofin Agency*).

**Design-science systems specification** follows the Hevner et al. tradition of design-science research in information systems, producing artefact specifications for ontologies, multilingual clause-extraction pipelines, rules-engine logic, probabilistic breach models and dashboard architectures. These specifications are calibrated against the documentary corpus of mineral conventions, royalty regulations and beneficial-ownership decrees identified in the doctrinal analysis.

**Methodological limitations.** Three limitations should be acknowledged. First, the empirical evidence base for several flashpoint claims rests on secondary reporting whose primary corroboration is constrained by limited governmental data disclosure, particularly for Guinea's permit-revocation processes. Second, the analysis is forward-looking with respect to systems-design artefacts that have not yet been implemented; their political-economy feasibility is examined in Section 8 but cannot be empirically tested at this stage. Third, the rapid evolution of events between May 2025 and May 2026 means that several data points (notably the EGA-Guinea settlement of 6 May 2026) are subject to ongoing revision.

---

## 5. Guinea: Institutional Mining-Governance Analysis

### 5.1 Legal and fiscal framework

Guinea's mining sector is governed by Law L/2011/006/CNT of 9 September 2011, as amended by Law L/2013/053/CNT of 8 April 2013. The Code grants the state an automatic, non-dilutable free-carried interest of 15 per cent in each mining-exploitation company, with an option to acquire an additional cash participation up to a total maximum of 35 per cent. The 15 per cent shareholding cannot be diluted by any share-capital increase. This structure, formally robust, has historically been weakly operationalised through the Société Guinéenne du Patrimoine Minier (SOGUIPAMI).

### 5.2 Resource-nationalist enforcement and arbitration exposure

Since the September 2021 coup that brought President Mamadi Doumbouya's transitional government to power, Guinea has pursued an aggressive resource-nationalist agenda. The most consequential single move was the cancellation, announced on 26 May 2025, of 129 mineral-exploration permits, primarily covering gold deposits. This followed an earlier purge of 51 mining licences earlier the same month covering bauxite, gold, diamond, graphite and iron concessions. Guinea's Minister of Mines, Bouna Sylla, framed the revocations as enforcement of contractual obligations. Affected operators included the Australian-listed Resolute Mining, which lost three permits (Niagassola, Doko and Siguiri-Kouroussa), with one tied to a USD 175 million transaction involving AngloGold Ashanti.

The most financially material revocation involved Emirates Global Aluminium's Guinea Alumina Corporation. EGA recorded a full impairment of GAC's value of AED 2.5 billion (approximately USD 680 million) during 2025; the total Guinea-attributable charge for 2025 was AED 2.81 billion (USD 765 million), compared with AED 1.64 billion (USD 447 million) in 2024. EGA's reported net profit fell to AED 2.12 billion (USD 578 million) in 2025 from AED 2.62 billion (USD 715 million) in 2024. On 6 May 2026, Guinea, EGA and GAC announced a definitive settlement, negotiated through the President of the Paris Bar Association, providing for a lump-sum payment from Guinea to GAC in exchange for the transfer of GAC assets to the Nimba Mining Company and the renewal of the CBG–EGA bauxite-supply agreements. The settlement resolves the conflicting figures appearing across the source drafts: the USD 680 million write-down refers specifically to the full impairment of GAC's value, while the USD 765 million total represents the broader Guinea-attributable charge incorporating that impairment together with associated costs.

Concurrently, Axis International Ltd, a UAE-based bauxite producer holding 85 per cent of Axis Minerals Resources SA, filed an ICSID arbitration claim seeking USD 28.9 billion in damages following the May 2025 revocation of its Boffa bauxite permit. The claim, filed on 25 December 2025 and registered on 16 January 2026, invokes both the 2011 Guinea–UAE bilateral investment treaty and Guinea's 1995 Investment Code, and asserts proven reserves of more than 800 million metric tonnes at Boffa and 2024 production of 18 million tonnes. The claim — among the largest in the history of investment arbitration against an African state — exceeds Guinea's annual national budget and rivals its nominal GDP, illustrating the financial-leverage asymmetry between sovereign respondents and treaty claimants. Related arbitration proceedings have been initiated by Nomad Bauxite Corporation (November 2025) and a coalition of UAE-registered entities including Nimba Investment and Emirates Minting Factory (registered 22 December 2025).

### 5.3 The Simandou counterpoint

The Simandou iron-ore project, simultaneously inaugurated at Morebaya port on 11 November 2025, represents the obverse face of Guinean resource policy. Held jointly by SimFer (85 per cent) and the Government of Guinea (15 per cent) for Blocks 3 and 4, and by Winning Consortium Simandou (operating in partnership with the Government for Blocks 1 and 2), the project entails an integrated mine-rail-port system valued at approximately USD 20 billion, including more than 600 kilometres of trans-Guinean railway. First ore was loaded for rail transport in October 2025, and the first vessel-loaded shipment took place from the WCS port in December 2025, with cargo expected to land in China in January 2026. The shared rail-and-port infrastructure is co-developed by SimFer, WCS, Baowu and the Government of Guinea. IMF Country Report 24/131 (17 May 2024) projects, using the DIGNAR model, that real GDP would be 26 per cent higher by 2030 compared with a baseline without Simandou, with potential currency appreciation of around 3.4 per cent in 2025 and 1.8 per cent in 2030, and the debt-to-GDP ratio potentially falling by 2.5 percentage points by 2030.

### 5.4 Transparency posture and governance synthesis

Guinea achieved a "high" overall score of 88 points out of 100 under the 2019 EITI Standard on 16 February 2022, with component scores of 91 on "Outcomes and impact" and 83 on "Transparency". The next validation under the 2023 EITI Standard commenced on 1 October 2025. The NRGI 2021 RGI awarded Guinea's mining sector 62 out of 100, an improvement of six points on the 2019 interim evaluation. Beneficial-ownership disclosure remains a structural weak point: legislation drafted in 2019 and resubmitted to Parliament in 2024 remains pending enactment as at May 2026; a 2020 ministerial circular introduced a beneficial-ownership declaration form, and a 2022 EITI request reached only nine of approximately 450 operating mining companies. On 30 December 2025, the Government of Guinea published two sets of Simandou-related agreements on the Ministry of Mines website, representing a significant disclosure step.

Guinea's governance pathology is thus distinctively hyper-discretionary: a formally robust legal and fiscal framework — a 15 per cent non-dilutable free-carried interest, a 30 per cent profits tax, an 88/100 EITI validation score — is operationalised through politically inflected ministerial decisions whose velocity (129 permits revoked in a single day, an earlier purge of 51 licences, a flagship concession terminated, and multiple ICSID claims filed within weeks) far outpaces the episodic, paper-based monitoring apparatus available to the state. The same period saw the obverse face of that discretion in the USD 20 billion Simandou inauguration — a multi-counterparty, multi-decade contract set whose obligations will require continuous monitoring for a generation. This mismatch between the cadence of enforcement and the cadence of assurance is precisely the gap a continuous-assurance architecture is designed to close, and it is acute enough in Guinea alone to justify a dedicated national deployment of the ACCI Model — the design developed in the remainder of this paper.

---

## 6. System Architecture Design

The ACCI Model is operationalised as a five-module AI-enabled Investor and Compliance Intelligence System. Each module is specified in terms of functional purpose, data architecture, computational logic, AI/NLP workflows, regulatory-intelligence integration, risk-scoring approach and operational-governance implications.

### 6.1 Module 1: Contract and Agreement Intelligence

**Functional purpose:** to convert mineral conventions, mining leases, royalty agreements and related instruments into machine-readable, queryable contractual ontologies supporting downstream monitoring.

**Data architecture:** a document repository populated from EITI contract disclosures, the African Mining Legislation Atlas, the Open Contracting Data Standard Resource Contracts extension, and direct ministerial deposits. Each contract is decomposed into clauses tagged against an ontology comprising obligation type (fiscal, environmental, social, infrastructure, beneficial-ownership, local content), temporal scope, monetary thresholds, escalation triggers and counterparty identities.

**Computational logic and AI/NLP workflows:** a bilingual (French and English) clause-extraction pipeline employing transformer-based language models fine-tuned on a corpus of Guinean mining conventions. The pipeline performs three stages: (i) document segmentation and clause boundary detection; (ii) clause classification against the ontology; (iii) parameter extraction (amounts, dates, parties, thresholds). Output is validated through a human-in-the-loop review queue prior to commitment to the canonical knowledge graph.

**Regulatory-intelligence integration:** clauses are cross-referenced to Guinea's prevailing legislation (the Mining Code L/2011/006/CNT as amended by L/2013/053/CNT, and its implementing decrees), with deviations from statutory template provisions flagged for ministerial review.

**Risk-scoring:** each contract receives a composite Contract Integrity Score combining clause-completeness, ambiguity index, deviation from jurisdictional model conventions and counterparty-risk profile.

**Operational-governance implications:** ministries gain a structured contractual asset register replacing the current physical-archive regime, materially compressing the information-asymmetry gap identified in Section 3. This addresses, in particular, EITI Requirement 2.4.c.ii on comprehensive contract disclosure.

### 6.2 Module 2: Negotiation Intelligence

**Functional purpose:** to support state negotiators in renegotiations, renewals and new conventions through benchmarking, scenario simulation and historical-outcomes analysis.

**Data architecture:** the contractual ontology of Module 1 supplemented by a fiscal-regime benchmarking dataset drawn from EITI, IGF MPF benchmarks, OECD fiscal-modelling work, NRGI Resource Governance Index data and operator filings.

**Computational logic:** scenario simulation against royalty, free-carried interest, corporate-income-tax and stabilisation-clause parameters, with sensitivity analysis against commodity-price ranges. The module incorporates the IMF DIGNAR-type modelling logic used in IMF Country Report 24/131 for Simandou and accommodates the kind of fiscal scenario analysis embedded in EITI Guinea's June 2025 Simandou fiscal-modelling study (which estimated annual government revenues of USD 700 million to USD 1.7 billion before 2035, rising to up to USD 2.7 billion thereafter, depending on iron-ore price scenarios).

**AI workflows:** clause-recommendation models trained on prior outcome data, surfacing comparable clauses from analogous jurisdictions and outcome-conditioned recommendations. Negotiating parameters are explicitly mapped to the IFC Performance Standards (PS1, PS5, PS6) and OECD due-diligence expectations.

**Risk-scoring:** Negotiation Vulnerability Index quantifying the state's bargaining-position exposure on each contractual parameter.

### 6.3 Module 3: Performance and Compliance Monitoring

**Functional purpose:** real-time, exception-based monitoring of contractual obligations against operational data streams.

**Data architecture:** integration of production-volume data (from operators' reporting under EITI-aligned disclosures), royalty payments (via revenue authorities), environmental monitoring (water-quality sensors, including the NTU readings referenced in Section 5.2), employment and local-content data, and beneficial-ownership filings.

**Computational logic:** a rules engine evaluating each ingested data point against the corresponding contractual obligation, generating compliance, partial-compliance, non-compliance or insufficient-evidence verdicts. Rules are versioned to accommodate statutory change (for example, amendments to the bauxite and iron-ore royalty base, changes to the Local Development Fund levy, or the fiscal terms disclosed in the Simandou agreements published on 30 December 2025).

**Risk-scoring:** Operator Compliance Score updated continuously and disaggregated by obligation type.

### 6.4 Module 4: Breach and Risk Detection

**Functional purpose:** probabilistic identification of latent, emerging or systemic breach patterns not detectable through simple rules.

**Computational logic:** probabilistic breach modelling using Bayesian networks and gradient-boosted classifiers trained on historical breach data; anomaly detection across cross-operator data; and graph-analytic detection of beneficial-ownership opacity, transfer-pricing irregularities and licence-portfolio concentration risks. The module is calibrated to detect patterns of the kind that have generated the Guinean arbitration docket, including dormant-permit clustering and asset-transfer trails.

**Risk-scoring:** composite Breach Risk Index with explainability outputs (SHAP-style attributions) for each escalated case, ensuring algorithmic decisions remain contestable in line with the legitimacy requirements articulated by Yeung (2018).

### 6.5 Module 5: Transparency and Reporting

**Functional purpose:** stakeholder-facing reporting to citizens, civil society, parliaments, investors and international institutions.

**Dashboard architecture:** layered access — public dashboards aligned to EITI disclosure standards and OCDS Resource Contracts; restricted ministerial dashboards exposing operator-level scores; investor-facing risk dashboards.

**Interoperability design:** API-first architecture with OCDS, EITI Summary Data, and IFC Performance Standards reporting schemas; explicit data-sovereignty controls ensuring host-state custody.

---

## 7. The ACCI Model: Formal Conceptual Contribution

The ACCI Model can be formally stated as the tuple **{I, P, D, F, L}**, where:

- **I (inputs)**: structured contractual ontologies; operator operational data; environmental monitoring streams; fiscal disclosures; beneficial-ownership registries; legal and regulatory corpora.
- **P (processing layers)**: clause-extraction pipelines; rules-engine evaluation; probabilistic breach models; anomaly and graph-analytic detection; scenario simulation.
- **D (decision intelligence)**: risk scoring; escalation triage; negotiation support; scenario analysis.
- **F (feedback loops)**: operator response data; ministerial enforcement actions; judicial and arbitral outcomes.
- **L (institutional learning cycles)**: model retraining; rule revision; capacity reinforcement; legislative-amendment feedback.

The enforcement-escalation pathway is sequential and human-anchored: an algorithmic exception triggers a structured human review at the responsible directorate; unresolved cases escalate to ministerial review; non-compliance with statutory thresholds escalates to formal enforcement action (notice, fine, suspension or revocation); contested cases proceed to administrative tribunals or, where international investment treaties apply, to international arbitration. At each stage, the algorithmic output is evidentially supportive but not determinative, preserving the human-decision character of regulatory action while compressing information asymmetry.

The model's contribution over generic RegTech frameworks lies in its explicit integration of institutional-learning cycles, which transform every enforcement outcome into a training signal for future detection and a revision input for future rule design. This positions the ACCI Model as a thicker theoretical contribution suitable for governance journals such as *Resources Policy* and *The Extractive Industries and Society*.

---

## 8. Policy Simulation and Implementation Analysis

### 8.1 Guinea-first pilot

A Guinea-first pilot is the most analytically tractable entry point for three reasons. First, Guinea's EITI score of 88/100 demonstrates institutional readiness for transparency innovation; the next validation under the 2023 EITI Standard, commenced on 1 October 2025, provides a structured external accountability anchor for any pilot. Second, the Simandou project — through SimFer, WCS and the Government's 15 per cent interest — generates a high-stakes, multi-counterparty, multi-decade contract set ideally suited to demonstrating the value of Modules 1 and 3. Third, the active arbitration docket (Axis International, Nimba Investment LLC, Falcon Energy Materials, Nomad Bauxite Corporation) creates immediate political-economy demand for evidentially robust compliance instrumentation. The 30 December 2025 publication of Simandou-related contracts represents a structural opening.

### 8.2 Phased national rollout

Following pilot validation on the Simandou contract set, a phased rollout would extend the architecture across Guinea's full mining portfolio. The bauxite portfolio (CBG, GAC/Nimba, the SMB-Winning group) supplies a high-volume, high-revenue monitoring anchor; the iron-ore concessions (SimFer and Winning Consortium Simandou) supply a large-contract, infrastructure-obligation anchor; and the contested gold and exploration-permit estate supplies the licence-revocation and arbitration-exposure use case. Sequencing modules across these segments — beginning with Contract Intelligence (M1) and Performance Monitoring (M3) before extending to Breach Detection (M4) and the public Transparency layer (M5) — allows SOGUIPAMI and the Ministry of Mines to build institutional capacity incrementally rather than through a single, capture-prone "big bang" deployment.

### 8.3 Institutional adoption barriers

Three principal barriers are likely. **Capacity barriers** — the limited cadre of data-science and legal-engineering personnel within the Ministry of Mines and SOGUIPAMI — can be addressed through structured secondments from the EITI national secretariat, the African Development Bank and Guinean and regional universities. **Political-economy resistance** — from rent-seekers and from operators preferring opacity — must be addressed through phased disclosure architectures and explicit ministerial sponsorship at head-of-government level. **Legal-architectural barriers** — particularly around data sovereignty, the admissibility of algorithmic outputs in regulatory and arbitral proceedings, and conflicts with stabilisation clauses — require explicit statutory authorisation and harmonisation with international evidence standards.

### 8.4 Funding architecture

A blended funding architecture would combine national budget allocations from mineral-revenue surpluses (Guinea's Simandou-related revenues projected by the IMF at USD 700 million to USD 1.7 billion annually before 2035, rising to up to USD 2.7 billion thereafter); concessional finance from the World Bank's Extractives Global Programmatic Support and the AfDB; technical assistance from the EITI International Secretariat and NRGI; and private-sector contributions from operators with reputational incentives.

### 8.5 Scenario analysis

Three scenarios are considered. **Baseline (no deployment)**: existing pathologies persist, arbitration exposure grows, enforcement remains discretionary, fiscal capture continues. **Partial deployment (Modules 1 and 3 only)**: the information-asymmetry gap narrows on contract-monitoring; arbitration exposure stabilises; revenue capture improves modestly. **Full national deployment (all five modules across Guinea's mining portfolio)**: the national governance space tightens substantially; arbitration exposure declines materially as revocation decisions acquire an evidential audit trail; fiscal capture is reduced; investor confidence improves through algorithmic predictability.

---

## 9. Discussion

The ACCI Model raises five substantive discussion questions. **Digital sovereignty**: continuous-assurance architectures must be hosted within host-state data-custody regimes, with explicit safeguards against extraterritorial access by treaty counterparties or arbitration tribunals; failure to resolve this question ex ante risks generating evidential dependencies that compromise sovereign litigation posture. **State bargaining power**: the compression of information asymmetry materially shifts the bargaining frontier in renegotiations, but only where political insulation from capture is sufficient to translate analytical capacity into negotiating outcomes; the Guinean experience with permit revocations under Bouna Sylla illustrates both the upside and the legal risk of state assertiveness. **Compliance automation ethics**: automated breach detection raises proportionality questions, particularly where small-scale operators may face escalation triggers calibrated to large-operator data baselines; Guinea's artisanal gold and diamond economy similarly warrants escalation thresholds calibrated separately from the bauxite- and iron-ore-major baselines. **Algorithmic legitimacy**: legitimacy is secured not by accuracy alone but by contestability, explainability and procedural fairness; the ACCI Model's preservation of human-anchored enforcement escalation is central to its legitimacy claim. **Public trust and transparency futures**: continuous-assurance dashboards can either strengthen or erode trust depending on whether they are perceived as instruments of accountability or of intrusion; Guinea's contested permit-revocation record demonstrates the political-economy salience of credible, evidentially grounded disclosure.

The principal limitations of the present study are the absence of empirical implementation evidence; the dependence on secondary reporting for several factual flashpoints (particularly the precise corporate structure of Compagnie du TransGuinéen and certain Guinean beneficial-ownership instruments); and the inherent contestability of forward-looking governance projections in a setting marked by political volatility.

---

## 10. Policy Recommendations

**The Government of Guinea.** Guinea should (i) operationalise the Société Guinéenne du Patrimoine Minier as the institutional custodian of Module 1 contractual ontologies; (ii) enact the pending 2019/2024 beneficial-ownership legislation; (iii) publish all active mining contracts in machine-readable form pursuant to EITI Requirement 2.4 (building on the 30 December 2025 Simandou disclosure); (iv) establish a Simandou-anchored pilot of the Performance and Compliance Monitoring module by Q4 2026, with explicit triage protocols for licence-revocation decisions to reduce future arbitration exposure of the Axis International type; and (v) introduce explicit statutory authorisation for the use of algorithmic compliance outputs in administrative and arbitral proceedings, so that continuous-assurance evidence is admissible in the kind of ICSID disputes the state now faces.

**Development partners.** The World Bank's Extractives Global Programmatic Support, the African Development Bank and the EU should structure a coordinated Continuous Compliance Intelligence Facility providing technical assistance, concessional finance and capacity-building for ACCI deployment. The EITI International Secretariat should develop a dedicated continuous-assurance supplement to the 2023 EITI Standard.

**Investors.** Investors should adopt ACCI-aligned disclosure as a voluntary leading practice, recognising that algorithmic predictability of compliance outcomes is materially preferable to discretionary regulatory volatility. Operators with pending or anticipated ICSID exposure (notably EGA following the 6 May 2026 settlement; SimFer through Simandou) have strong reputational and legal incentives to participate.

**Academic institutions.** Guinean and regional universities should establish dedicated postgraduate programmes in mining-governance analytics, drawing on the design-science systems-specification methodology articulated in this paper, and should partner with NRGI, the African Tax Administration Forum and the African Centre for Energy Policy.

---

## 11. Conclusion

The May 2025 – May 2026 cluster of mining-governance events in Guinea constitutes a natural experiment in the limits of episodic, paper-based compliance. The cumulative cost — measured in arbitration exposure (Axis International's USD 28.9 billion claim against Guinea, alongside the Nomad Bauxite and Nimba Investment proceedings; EGA's USD 765 million Guinea-attributable charge in 2025), fiscal opportunity loss, and the reputational consequences of a hyper-discretionary licence-revocation record — vastly exceeds the marginal investment required to deploy the Adaptive Continuous Compliance Intelligence Model articulated in this paper. The ACCI Model is not a panacea. It will not resolve the deeper political-economy contradictions of resource-rich states with weak institutions. But it offers a tractable, theoretically grounded and empirically calibrated architecture for compressing information asymmetry, strengthening institutional learning and reorienting Guinean mining governance toward continuous evidential robustness. The Simandou-anchored pilot pathway, scaled through a phased national rollout across Guinea's bauxite, iron-ore and exploration estate, represents the most actionable entry point, and the contribution of this paper to the *Resources Policy* literature is the integration of principal-agent, institutional-capacity, information-asymmetry, continuous-assurance and algorithmic-governance theories into a single operational framework suitable for both theoretical refinement and policy implementation.

---

## References (Harvard UK style)

Acemoglu, D. and Robinson, J.A. (2012) *Why Nations Fail: The Origins of Power, Prosperity, and Poverty*. New York: Crown Business.

African Development Bank (2023) *African Economic Outlook 2023: Mobilizing Private Sector Financing for Climate and Green Growth*. Abidjan: AfDB.

African Mining Legislation Atlas (AMLA) (2024) *Guinea Country Profile*. Available at: https://www.a-mla.org/en/country/Guinea.

Akerlof, G.A. (1970) 'The market for "lemons": quality uncertainty and the market mechanism', *Quarterly Journal of Economics*, 84(3), pp. 488–500.

Auty, R.M. (1993) *Sustaining Development in Mineral Economies: The Resource Curse Thesis*. London: Routledge.

Bebbington, A., Hinojosa, L., Bebbington, D.H., Burneo, M.L. and Warnaars, X. (2008) 'Contention and ambiguity: mining and the possibilities of development', *Development and Change*, 39(6), pp. 887–914.

Campbell, B. (ed.) (2009) *Mining in Africa: Regulation and Development*. London: Pluto Press / IDRC.

CNBC Africa (2025) 'Axis International seeks $28.9 billion from Guinea over revoked bauxite permit', 29 December.

Collier, P. (2010) *The Plundered Planet: How to Reconcile Prosperity with Nature*. Oxford: Oxford University Press.

Ecofin Agency (2026) 'Guinea reaches settlement with EGA over revoked bauxite license', 7 May.

EITI International Secretariat (2022) *Guinea Validation Report 2021*. Oslo: EITI.

EITI International Secretariat (2023) *The EITI Standard 2023*. Oslo: EITI.

EITI International Secretariat (2025) *Guinea Country Page*. Available at: https://eiti.org/countries/guinea.

Emirates Global Aluminium (2025) *Press release: EGA reports resilient H1 financial performance with industry-leading aluminium margins and strategic progress, despite Guinea supply disruption and asset write-down*, 4 September.

Free Press Journal (2025) 'Axis International launches $28.9 billion arbitration against Guinea for unlawful seizure of major bauxite mine'.

Guinea, Republic of (2011) *Loi L/2011/006/CNT du 9 septembre 2011 portant Code Minier*. Conakry.

Guinea, Republic of (2013) *Loi L/2013/053/CNT du 8 avril 2013 modifiant certaines dispositions du Code Minier*. Conakry.

Hevner, A.R., March, S.T., Park, J. and Ram, S. (2004) 'Design science in information systems research', *MIS Quarterly*, 28(1), pp. 75–105.

Humphreys, M., Sachs, J.D. and Stiglitz, J.E. (eds.) (2007) *Escaping the Resource Curse*. New York: Columbia University Press.

Intergovernmental Forum on Mining, Minerals, Metals and Sustainable Development (IGF) (2023) *Mining Policy Framework Assessment*. Winnipeg: IISD.

International Finance Corporation (2012) *Performance Standards on Environmental and Social Sustainability*. Washington, DC: World Bank Group.

International Monetary Fund (2024) *Guinea: Selected Issues, Country Report No. 24/131*, 17 May. Washington, DC: IMF.

Jensen, M.C. and Meckling, W.H. (1976) 'Theory of the firm: managerial behavior, agency costs and ownership structure', *Journal of Financial Economics*, 3(4), pp. 305–360.

Kitchin, R. (2014) *The Data Revolution: Big Data, Open Data, Data Infrastructures and Their Consequences*. London: SAGE.

Library of Congress (2013) 'Guinea: Mining Code amended', Global Legal Monitor, 31 July.

Mayer Brown (2024) *Africa Mining Know-How: Guinea*. London: Mayer Brown.

MINING.COM (2025) 'Guinea cancels 129 exploration permits, further tightening control', 27 May.

MINING.COM (2025) 'Axis sues Guinea for $29B over bauxite permit revocation'.

Natural Resource Governance Institute (NRGI) (2021) *2021 Resource Governance Index: Guinea (Mining)*. New York: NRGI.

North, D.C. (1990) *Institutions, Institutional Change and Economic Performance*. Cambridge: Cambridge University Press.

OECD (2016) *OECD Due Diligence Guidance for Responsible Supply Chains of Minerals from Conflict-Affected and High-Risk Areas*. 3rd ed. Paris: OECD.

Open Contracting Partnership (2020) *Open Contracting Data Standard for Public-Private Partnerships and Resource Contracts*. Available at: https://standard.open-contracting.org.

Rio Tinto (2025) *Form 6-K — Q2 2025 Operations Review*. London/Melbourne: Rio Tinto.

Rio Tinto (2025) *Form 6-K — Q3 2025 Operations Review*. London/Melbourne: Rio Tinto.

Rio Tinto (2025) *Media Release: Simandou partners celebrate start of operations*, 11 November.

Rio Tinto (2026) *Form 6-K — Q4 2025 Operations Review*, 21 January.

Sachs, J.D. and Warner, A.M. (1995) *Natural Resource Abundance and Economic Growth*. NBER Working Paper No. 5398. Cambridge, MA: NBER.

Stiglitz, J.E. (1985) 'Information and economic analysis: a perspective', *Economic Journal*, 95 (Supplement), pp. 21–41.

Spence, M. (1973) 'Job market signaling', *Quarterly Journal of Economics*, 87(3), pp. 355–374.

The National (2026) 'EGA settles disputes with Guinea over bauxite mine project', 6 May.

Ulbricht, L. and Yeung, K. (2022) 'Algorithmic regulation: a maturing concept for investigating regulation of and through algorithms', *Regulation & Governance*, 16(1), pp. 3–22.

Vasarhelyi, M.A. and Halper, F.B. (1991) 'The continuous audit of online systems', *Auditing: A Journal of Practice and Theory*, 10(1), pp. 110–125.

Vasarhelyi, M.A., Alles, M.G. and Williams, K.T. (2010) 'Continuous assurance for the now economy', Institute of Chartered Accountants in Australia / Rutgers Business School Research Report.

Yeung, K. (2018) 'Algorithmic regulation: a critical interrogation', *Regulation & Governance*, 12(4), pp. 505–523.

---

## Part B: Fact-Audit Verification Matrix

| # | Claim | Draft source | Verification status | Correction required? | Final accepted wording |
|---|-------|--------------|---------------------|----------------------|------------------------|
| 1 | Guinea Mining Code Law L/2013/053/CNT; 15% non-dilutable state free-carried interest | Drafts v1, RegTech v2, Continuous Assurance | **VERIFIED** (Mayer Brown; Lexology; Mondaq; AMLA; Library of Congress) | No | "Law L/2011/006/CNT (9 Sept 2011) as amended by Law L/2013/053/CNT (8 April 2013); 15% non-dilutable free-carried state interest with option to acquire additional cash participation up to a maximum total of 35%" |
| 2 | 129+ exploration permit revocations in May 2025 plus earlier 51-permit purge | All drafts | **VERIFIED** (Reuters via MINING.COM; Kaieteur News; *Mining Weekly*; Ecofin) | No | "129 mineral-exploration permits cancelled on 26 May 2025, following an earlier purge of 51 mining licences earlier the same month" |
| 3 | GAC/EGA write-down conflicting figures ($680m vs $765m); net profit $715m→$578m; settlement May 2026 | Drafts diverge | **VERIFIED** — figures are complementary not contradictory (Alcircle; *The National*; West Africa Weekly; EGA press release; ChemAnalyst) | Yes — RESOLVE: both figures correct in different senses | "Full impairment of GAC's value of AED 2.5 billion (~USD 680 million) in 2025; total Guinea-attributable charge for 2025 of AED 2.81 billion (USD 765 million); reported net profit USD 578 million (2025) versus USD 715 million (2024); definitive settlement announced 6 May 2026" |
| 4 | Axis International Boffa permit revocation; $28.9bn ICSID claim Dec 2025 | All drafts | **VERIFIED** (Reuters; *Free Press Journal*; African Law & Business; MINING.COM) | Minor — filed 25 Dec 2025, registered 16 Jan 2026 | "Filed at ICSID on 25 December 2025 (registered 16 January 2026); USD 28.9 billion claim; invokes 2011 Guinea–UAE BIT and 1995 Investment Code" |
| 5 | Simandou: ~1.5bn t reserves, ~65% Fe, ~$20bn investment, 600km railway, CTG equity split, first ore Nov 2025, IMF 24/131 ~26% GDP by 2030 | All drafts | **PARTIALLY VERIFIED** — overall deposit ~3 billion tonnes in primary reporting (1.5 bn t referring possibly to high-grade fraction); ceremony 11 Nov 2025 confirmed; first ore loaded for rail Oct 2025; first vessel shipment Dec 2025; CTG specific 42.5/42.5/15 split not located in primary filings | Yes — hedge | "Approximately USD 20 billion integrated mine-rail-port; over 600 km trans-Guinean rail; SimFer mine ownership 85% SimFer / 15% Government of Guinea (Blocks 3-4); ceremony at Morebaya port 11 Nov 2025; first ore loaded for rail Oct 2025; first vessel shipment from WCS port Dec 2025; IMF Country Report 24/131 (17 May 2024) projects real GDP 26% higher by 2030 under DIGNAR modelling; CTG-specific equity split not corroborated in primary filings" |
| 6 | EITI Guinea validation score 88/100 (2022) | All drafts | **VERIFIED** (EITI Board decision 2022-16, 16 Feb 2022) | No | "88/100 under 2019 EITI Standard, 16 February 2022, 'high' band; component scores 91 (Outcomes) and 83 (Transparency); next validation under 2023 Standard commenced 1 Oct 2025" |
| 7 | Beneficial ownership Decree D/2021/233/PRG/SGG | Drafts | **UNVERIFIED** in available sources; EITI documents only that BO legislation drafted 2019 and resubmitted 2024 still pending | Yes — hedge / remove specific decree reference | "Beneficial-ownership legislation drafted in 2019 and resubmitted to Parliament in 2024 remains pending enactment as at May 2026; a 2020 ministerial circular introduced a BO declaration form" |
| 8 | Resolute Mining permits among 129 revocations (Niagassola, Doko, Siguiri-Kouroussa) | Drafts | **VERIFIED** (Ecofin Agency) | No | As stated |
| 9 | Compagnie du TransGuinéen equity split SimFer 42.5%/WCS 42.5%/State 15% | Drafts | **UNVERIFIED** in primary sources within research budget | Yes — hedge | "Shared rail-and-port infrastructure co-developed by SimFer JV, WCS, Baowu and Government of Guinea; precise CTG equity ratios not corroborated in primary filings within the present research budget" |
| 10 | RGI 2021 mining-sector score for Guinea | Drafts | **VERIFIED** (NRGI 2021 RGI publications) | No | "Guinea mining sector 62/100 in the 2021 NRGI Resource Governance Index, up 6 points on the 2019 interim evaluation" |
| 11 | EITI Standard 2023; OECD Due Diligence Guidance; IGF MPF; IFC PS1/PS5/PS6; OCDS Resource Contracts | Drafts | **VERIFIED** in institutional sources | No | Retain as cited |
| 12 | AMLA; Vasarhelyi continuous-auditing literature; Yeung (2018) on algorithmic regulation | Drafts | **VERIFIED** in scholarly canon | No | Retain as theoretical scaffolding |

---

**End of consolidated manuscript and fact-audit memo.**

---
---

# Part C: Implemented System — Technical & Engineering Specification

> **Purpose of this Part.** Parts A–B above are the academic manuscript and its
> fact-audit memo. Part C is the complete engineering reference for the *working
> software artefact* that operationalises the ACCI Model — the "AI-Enabled
> Investor and Compliance Intelligence System" actually built in this repository.
> It is written so that a full technical report, system-design chapter, or
> design-science "artefact" section can be authored directly from it without
> re-reading the source. Every figure below was extracted from the codebase as
> built (programme code **PEB-0526-WA-MIN-05**, internal product name **ACCI —
> Adaptive Continuous Compliance Intelligence**).

## C.1 Executive summary of the artefact

The artefact is a **single-page web application (SPA)** — a government-grade
compliance-intelligence dashboard dedicated to the Ministry of Mines of the
**Republic of Guinea (GIN)**. It is built on a West-Africa-capable engine whose
dataset and every screen are scoped to Guinea (the regional scaffolding for Ghana
and Côte d'Ivoire remains in the codebase as latent capability but is never
surfaced — see D.21). It is a front-end-only React 19 + TypeScript application
(≈ **21,000 lines** of TypeScript/TSX across ~95 source files) backed by an
in-memory, Guinea-scoped synthetic dataset and a **provider-agnostic, local-first
AI layer**. It instantiates the manuscript's
five conceptual modules (M1–M5) and extends them into **thirteen functional
modules (M1–M13)** plus an Admin console and an Audit Monitor.

Design-science framing: the artefact is the *instantiation* class of Hevner et
al. design-science output. The manuscript's theoretical tuple **{I, P, D, F, L}**
(inputs, processing, decision intelligence, feedback, learning) maps onto
concrete code: **I** = the typed domain model + seed corpus; **P** = the
dataService rule engine, the deterministic revenue model, and the AI prompt/
context pipeline; **D** = risk scoring, scorecards, anomaly scan, scenario
projection and the AI briefs; **F** = the mutation + audit pipeline (operator
status changes, flag acknowledgement, escalation); **L** is represented in
prototype form by the versioned rules/thresholds and AI cache (true model
retraining is out of scope for a front-end prototype and is noted as Phase II).

The central engineering doctrine — stated verbatim in the source as the
"anti-gimmick rule" — is **grounding**: *every number the UI shows and every
number the AI narrates is computed in deterministic TypeScript over the dataset;
the LLM is handed finished figures and only interprets them.* This is the design
answer to the manuscript's "algorithmic legitimacy" requirement (Yeung 2018):
the AI is an explanation/triage layer, never the source of truth.

## C.2 Technology stack (as built)

| Layer | Technology | Version (package.json) | Role |
|---|---|---|---|
| Language | TypeScript | ~6.0.2 | Strict typing across the whole app |
| UI framework | React | ^19.2.6 | Component model, concurrent features |
| Build tool | Vite | ^8.0.12 | Dev server, HMR, production bundling |
| Bundler plugin | @vitejs/plugin-react | ^6.0.1 | React fast-refresh / JSX |
| Routing | react-router-dom | ^7.15.1 | Client-side routing + lazy code-splitting |
| State | zustand | ^5.0.13 | 9 modular stores, `persist` middleware |
| Styling | tailwindcss | ^3.4.19 | Utility CSS + CSS-variable theming |
| | postcss / autoprefixer | ^8.5.15 / ^10.5.0 | CSS pipeline |
| UI primitives | @radix-ui/react-* | dialog, progress, select, separator, slot, tabs, tooltip | Accessible headless components |
| Icons | lucide-react | ^1.16.0 | Icon set |
| Charts | recharts | ^3.8.1 | Bar/line/radar/area charts |
| Maps | leaflet + react-leaflet | ^1.9.4 / ^5.0.0 | GIS overview map (OpenStreetMap tiles) |
| Spreadsheets | xlsx (SheetJS) | ^0.18.5 | CSV/XLSX import & export |
| Class utilities | clsx, tailwind-merge, class-variance-authority | ^2.1.1 / ^3.6.0 / ^0.7.1 | Conditional class composition |
| Lint | eslint + typescript-eslint + react-hooks/react-refresh plugins | ^10.3.0 | Type-aware linting |
| Hosting | Vercel (static + one Edge Function) | — | SPA hosting + AI proxy |

Build scripts: `dev` (Vite), `build` (`tsc -b && vite build`), `lint` (`eslint .`),
`preview`. Path alias `@` → `./src` (configured in both `vite.config.ts` and the
tsconfig project references `tsconfig.app.json` / `tsconfig.node.json`).

## C.3 Repository & source layout

```
mining-project-local/
├── api/ai.js                 # Vercel Edge Function — Pollinations proxy
├── src/
│   ├── App.tsx               # Router, lazy routes, theme + auth wrappers
│   ├── main.tsx              # React root
│   ├── components/
│   │   ├── Layout.tsx        # Sidebar nav (resizable), header, country selector
│   │   └── shared/           # 24 reusable components (see C.10)
│   ├── content/guide.ts      # Plain-language module guides + glossary (1 source of truth)
│   ├── context/CountryContext.tsx   # Country scope provider (locked to GIN)
│   ├── data/
│   │   ├── types.ts          # All domain TypeScript interfaces + thresholds
│   │   └── seed.ts           # ~1,470 lines of grounded synthetic data
│   ├── hooks/                # useRole, useExplainWithAI
│   ├── lib/                  # AI + fiscal + safety logic (see C.7–C.9, C.12)
│   ├── pages/                # 18 top-level pages + admin/ audit/ scenarios/ subfolders
│   ├── services/             # dataService (read), mutationService (write), aiService
│   └── store/                # 9 Zustand stores
├── DESIGN.md                 # Design-system source of truth (West-African gov standard)
├── README.md, project_report.md, markdown.md (this file)
├── tailwind.config.js, vite.config.ts, vercel.json, eslint.config.js
└── tsconfig*.json
```

## C.4 Application shell, routing & authentication

- **`App.tsx`** wraps the app in `ThemeWrapper` (applies `light`/`dark` class to
  `<html>`) → `BrowserRouter` → `CountryProvider` → `Routes`.
- **Route-level code splitting:** every heavy page is `React.lazy()`-imported so
  large dependencies (recharts, leaflet, xlsx) load on demand; a `RouteFallback`
  spinner (with `role="status"`/`aria-live`) covers `Suspense`.
- **Auth gate:** `/login` is public; everything else is nested under
  `<ProtectedRoute>` which redirects unauthenticated users to `/login` via the
  `authStore`. The `Layout` component (with the persistent sidebar) wraps all
  protected routes through `<Outlet/>`.
- **Login (`pages/Login.tsx`):** a styled "Secure Government Access Portal"
  screen with a simulated 700 ms auth delay. **Demo credentials are hard-coded
  for the prototype**: `admin / password` → `admin` role; `viewer / viewer` →
  `viewer` role. (This is explicitly a demo affordance, not a real IdP — see
  C.15 limitations.)
- **Role-based access** is read via the `useRole()` hook (`isAdmin` / `isViewer`)
  off the persisted `authStore`. Admin-only surfaces (data editing, AI keys,
  import/export) check this.

### Route ↔ module map (the left-nav)

| Route | Module code | Plain name | Official name |
|---|---|---|---|
| `/` | — | Overview | Executive Dashboard |
| `/agreements`, `/agreements/:id` | **M1** | Mining Agreements | Contract & Agreement Intelligence |
| `/negotiation` | **M2** | Deal Benchmarking | Negotiation Intelligence |
| `/performance`, `/performance/:operatorId` | **M3** | Company Scorecards | Performance & Compliance Monitoring |
| `/risk`, `/risk/:flagId` | **M4** | Risk Alerts | Breach & Risk Detection |
| `/transparency` | **M5** | Public Reporting | Transparency & Reporting |
| `/scenarios` | **M6** | What-If Planner | Fiscal Scenario Modelling |
| `/ownership` | **M7** | Who Owns What | Beneficial Ownership |
| `/local-content` | **M8** | Local Benefits Tracker | Local Content Auditing |
| `/esg` | **M9** | ESG Tracker | Environmental, Social & Governance |
| `/market` | **M10** | Market Intelligence | Commodity Pricing & Revenue Impact |
| `/documents` | **M11** | Document Vault | Contract Document Management |
| `/public-data` | **M12** | Open Data Portal | Public Transparency & Data Export |
| `/regulatory` | **M13** | Regulatory Tracker | Legal & Regulatory Change Monitor |
| `/admin` | — | Settings & Data | System Administration |
| `/audit` | — | Activity Log | Audit & Activity Monitor |

> **Module mapping to the manuscript.** The paper specifies five modules; the
> software ships them as M1–M5 and then decomposes the manuscript's
> "Transparency and Reporting" and "Performance and Compliance Monitoring"
> ambitions into the operational satellite modules M6–M13 (scenario modelling,
> ownership tracing, local content, ESG, market, documents, open-data portal,
> regulatory tracker). M1–M5 names in the UI match the paper's module titles
> 1:1.

## C.5 Domain data model (`src/data/types.ts`)

The model is a normalised relational graph expressed as TypeScript interfaces.
Core enums: `ComplianceStatus` (`on-track | at-risk | breached | met`),
`AgreementStatus` (`active | lapsed | under-review`), `RiskSeverity`
(`low | medium | high | critical`), `RiskFlagStatus` (`open | acknowledged |
resolved`), `CommitmentType` (production, infrastructure, local-employment,
environmental, community-development, financial), `Commodity` (bauxite, gold,
iron ore, manganese, nickel, lithium, diamonds, chromite).

**Primary entities:** `Country`, `Operator` (with `ultimateBeneficialOwners`,
`countryIds`, computed `riskScore`/`complianceStatus`, `ownershipChanged`),
`Agreement` (commodity, licenseType, royaltyRate, pricingStructure,
contractValue USD m, concession area + `coordinates`), `Commitment` (target +
unit + due date + status), `PerformanceRecord` (quarterly actuals time-series),
`RiskFlag` (severity, category, rule triggered, evidence, recommended action),
`InfrastructureObligation` (project type, % progress, completion date).

**Derived shapes:** `OperatorScorecard`, `CountrySummary`, `RiskThresholds`
(with `DEFAULT_THRESHOLDS` = 75% production-shortfall floor, 2 consecutive
periods, 90-day expiry warning, 25% performance-drop, etc.).

**Expansion-module entities:** `BeneficialOwnerNode` (tree with `isPEP`,
`isOpaque`, `entityType`, `parentId`), `ProtectedZone` + `ConcessionConflict`
(GIS overlap), `CommodityPrice`, `LocalContentRecord`, `DocumentAccessLog` (with
content `hash` for the tamper-evident trail), `EITIReportSection`, `ESGMetric`
(+ `MineClosure` rehab provisions), `CommodityMarketData` +
`RevenueImpactScenario`, `ManagedDocument` + `ExtractedClause` (with simulated
extraction `confidence`), `SystemAlert` (priority/category/trigger rule),
`PublicDataset` + `PublicationLog`, `RegulatoryChange` + `RegulatoryImpact`
(with `stabilizationConflict` flag).

## C.6 Seed dataset (`src/data/seed.ts`) — the grounded corpus

The dataset is **synthetic but deliberately anchored to the real 2024–2026
events documented in Parts A–B** (the Simandou inauguration, the GAC/EGA
concession revocation and 6 May 2026 settlement, the 129-permit cancellation,
the Axis International arbitration, and the SOGUIPAMI free-carry regime). It is
loaded once as a module singleton (`DB = generateSeedData()`), whose **single
chokepoint scopes the corpus to the Republic of Guinea**: it keeps only records
that belong to Guinea directly or chain to a Guinean operator, agreement,
regulation or dataset, and drops everything else. The source arrays still carry
the wider West-Africa programme data (Ghana, Côte d'Ivoire) so the engine remains
regionally capable, but none of it reaches the UI.

**Record inventory (source corpus — the live dataset is the Guinea subset after
`generateSeedData` filtering):**

| Entity | Count | ID prefix |
|---|---:|---|
| Countries | 3 → **1 live (GIN)** | GHA, CIV filtered out at load |
| Operators | 15 | OP-01 … OP-15 |
| Agreements | 20 | AGR-… |
| Commitments | 77 | CMT-… |
| Performance time-series | 18 generators | (quarterly records) |
| Risk flags (static) | 13 | RF-… (+ dynamic DYN-… at runtime) |
| Infrastructure obligations | 8 | INF-… |
| Beneficial-owner nodes | 10 | BO-… |
| Protected zones | 2 | PZ-… |
| Concession conflicts | 1 | CC-… |
| Local-content records | 10 | LC-… |
| Document access logs | 5 | DL-… |
| EITI report sections | 14 | (per country) |
| ESG metrics | 47 | ESG-… |
| Mine closures / rehab | 6 | MC-… |
| Managed documents | 20 | DOC-… |
| Extracted clauses | 32 | CL-… |
| System alerts | 15 | SA-… |
| Public datasets | 9 | PD-… |
| Publication logs | 12 | PL-… |
| Regulatory changes | 10 | RC-… |
| Audit seed entries | 24 | seed-001 … seed-024 |

After Guinea-scoping, the live dataset surfaces 1 country, the 6 Guinea operators,
the 6 Guinea agreements (4 bauxite, 2 iron ore) and the commitments, performance
records, flags, ESG metrics, documents and regulations that chain to them.

The live Guinea `Country` record carries a **dense, citation-grade
`regulatoryFramework` string** — the Mining Code L/2011/006/CNT as amended by
L/2013/053/CNT, the 15% non-dilutable free-carry (option to 35%), the 30% profits
tax, the 88/100 EITI score (16 Feb 2022), SOGUIPAMI custodianship, and the
pending 2019/2024 beneficial-ownership legislation. (The source corpus also
carries Ghana and Côte d'Ivoire records, but these are filtered out at load.)
This is what lets the AI layer answer Guinea regulatory questions factually from
the pack.

Performance records are generated by a `makePerf()` helper that expands a value
array into quarterly `PerformanceRecord`s with computed `reportingPeriod`
("YYYY-QN") and dates — producing realistic multi-quarter trends that the risk
engine and revenue model read.

## C.7 Data & service layer (the deterministic engine)

### `services/dataService.ts` (read model, ~730 lines)
The single abstraction over the seed `DB` (UI never imports `seed.ts` directly —
"swap this for real API calls in Phase II without touching UI code"). It
provides ~50 typed accessors and **all the deterministic computation**:

- **Filtering by country** — scope is locked to `GIN` in this deployment; the
  accessor signatures still accept `ALL | GHA | CIV` so the engine stays
  regionally capable, but `generateSeedData` has already removed all non-Guinea
  records.
- **`getOperatorScorecard` / `getAllOperatorScorecards`** — compliance rate =
  `(met + on-track) / total` commitments, open/critical flag counts.
- **`getCountrySummary` / `getSystemMetrics`** — active agreements, operator
  count, compliance rate, avg royalty, open flags by severity.
- **`getComplianceTrend`** — synthetic 8-quarter trend (2022-Q3 → 2024-Q2) from
  performance records (≥75% of target ⇒ on-track).
- **Dynamic risk-flag engine `computeDynamicFlags(thresholds)`** — the live rule
  engine. Rule 1: a production commitment below the shortfall % for N
  consecutive periods → `DYN-PROD-…` flag (severity high if <60% of target, else
  medium). Rule 2: an active agreement expiring within the warning window **and**
  carrying unresolved obligations → `DYN-EXPIRY-…` flag. Dynamic flags are merged
  with static `RF-…` flags by id, so thresholds in `settingsStore` change the
  flag set live.
- **Negotiation benchmarking** — `getRoyaltyBenchmarks` (median/avg/min/max per
  commodity) and `getAgreementsWithBenchmark` (each agreement's royalty vs
  same-commodity peer median, `vsMedian` in percentage points).
- **`computeRevenueImpact`** — ad-valorem royalty sensitivity ≈ Σ(contractValue
  × royaltyRate%) scaled linearly by a price move.
- **ESG scoring** — direction-aware `esgMetricScore` (a `ESG_LOWER_IS_BETTER`
  set inverts water/carbon/grievance/incident metrics) → 0–100; `getESGSummary`
  averages E/S/G.
- **`generatePublicExport(datasetId)`** — builds format-neutral open-data rows
  per dataset category (revenue, licences, production, esg, local_content) from
  live records, for the Public Portal.
- **EITI readiness** — `(complete + 0.5·partial) / total` sections → %.
- Helpers: `shortOperatorName` (compact labels e.g. OP-04→"SimFer"),
  `daysUntilExpiry` (anchored to a fixed "today" = 2024-05-24 for deterministic
  demos), `getLastRefreshed`.

### `services/mutationService.ts` (write model)
The only write surface to `DB`. Every mutation (`updateAgreement`,
`updateCommitmentStatus`, `updateRiskFlagStatus`, `updateOperator`,
`updateInfrastructureProgress`, `createAgreement`, `createOperator`,
`bulkUpdate*`, `importBatch`) **(a)** records before/after field values, **(b)**
writes a structured entry to the `auditStore`, and **(c)** calls
`useDataStore.getState().refresh()` to bump a version counter that re-renders all
derived views. New IDs are generated as `prefix-<base36 time>-<rand>`.

### Reactivity (`store/dataStore.ts`)
A tiny version-counter store plus a **`useStoreData(compute, deps)`** hook — a
`useMemo` that also re-computes whenever the in-memory DB mutates (it folds the
store `version` into the dependency list in one place, so call sites stay clean
and lint-clean despite reading the mutable module-level `DB`).

## C.8 Fiscal / revenue model (`src/lib/revenueModel.ts`)

The deterministic engine behind **M6 What-If Scenarios** and M10. Projects
**annual state ROYALTY take** (ad-valorem/extraction only — explicitly *not* CIT,
free-carry dividends or the LDF, to avoid inventing numbers the data can't
support). Formula per active agreement: `royalty = annualProduction ×
commodityPrice × effectiveRate`.

- **Production basis:** `current` (last 4 reported quarters, annualised; a
  never-reported project = 0 run-rate, **not** its target) or `capacity`
  (committed target). Pre-production projects (e.g. WCS Simandou) only contribute
  under `capacity`.
- **`COMMODITY_META`** — per-commodity unit (oz for gold, t otherwise), default
  price anchored to the dataset (gold USD 5,000/oz, spodumene USD 1,500/t, iron
  ore USD 105/t, bauxite USD 65/t …), slider bounds, and a sourced note.
- **`effectiveRoyaltyRate`** applies Guinea's flat contractual rates for its
  export commodities (iron ore 3%, bauxite 0.075%); under the `contractual`
  regime the signed rate is used (honouring stability clauses), and a manual
  `royaltyUpliftPp` is applied last. The function also retains the wider engine's
  **2025 statutory sliding scales** via linear interpolation (`lerp`) — Ghana gold
  5%→12% (USD 2,000–4,500/oz), Côte d'Ivoire gold 6%→8% (USD 2,000–2,500/oz),
  Ghana lithium 5%→12% (USD 1,500–3,200/t) — but these are inert in the Guinea
  deployment, whose agreements carry no gold or lithium.
- **`computeProjection(scenario)`** returns total + by-country + by-commodity +
  per-agreement rows (gross value, effective rate, royalty, excluded flag,
  pre-production flag). **`topMovers`** diffs scenario vs baseline per agreement.
- **Levers** (`ScenarioInput`): country scope, per-commodity prices, production
  basis, global production adjustment %, royalty regime, manual royalty uplift,
  and **excluded agreement IDs** (models revocation/sale/exit — used to simulate
  the Guinea licence-revocation precedent and its arbitration exposure).
- Formatting helpers (`fmtUsd`, `fmtDelta`, `fmtProduction`) and a stable
  `scenarioFingerprint` used as the AI-narration cache key.

## C.9 AI integration layer (the "Compliance Analyst")

This is the most substantial subsystem. It is **provider-agnostic, local-first,
and grounded**.

### C.9.1 Providers & models (`store/aiSettingsStore.ts`)
Three providers, all speaking the OpenAI chat-completions wire format:

1. **`local` (DEFAULT)** — an OpenAI-compatible server on the user's machine
   (Ollama / LM Studio / llama.cpp), default base URL `http://localhost:11434/v1`.
   This is the **data-sovereignty mode**: compliance data never leaves the
   machine. Default model `llama3.2:3b`; menu also offers Gemma 3 (4B/12B),
   GPT-OSS 20B, Llama 3.1 8B, Qwen 2.5 7B, Mistral 7B, and QwQ 32B (a
   reasoning model).
2. **`pollinations`** — hosted, keyless, anonymous OpenAI-compatible endpoint
   (`text.pollinations.ai/openai`). Demo fallback when no local LLM exists.
3. **`openrouter`** — hosted, user-supplied API key; unlocks larger open-weight
   models (Llama 3.3 70B, DeepSeek V3, Qwen 2.5 72B, Mistral Small 3.1 24B).

Keys/URLs live **only in browser `localStorage`** (persist key
`peb-ai-settings-v5`); no secret ships in source. `isProviderReady()` gates the
UI affordances.

### C.9.2 Transport (`services/aiService.ts`)
- **`streamChat`** — SSE streaming parser (buffers partial lines across reads,
  ignores malformed frames, handles `[DONE]`). **`extractDelta`** surfaces both
  `content` and `reasoning_content` so "thinking" models show progress instead of
  a frozen spinner.
- **`completeChat`** — non-streaming, for structured/JSON tasks; composes a
  caller-abort + timeout (default 5 min, because a local thinking model can be
  slow) via a single inner `AbortController`.
- **Global AI mutex** (`withAIMutex`) serialises requests — Pollinations' free
  tier allows only one in-flight request per IP.
- **Pollinations 429 back-off** — up to 4 attempts with `[3s, 8s, 15s]` schedule,
  honouring `Retry-After`.
- **Vercel Edge proxy (`api/ai.js`)** — in production, Pollinations calls route
  through `/api/ai`, an Edge Function that injects a randomised
  `X-Forwarded-For` to dodge the strict per-IP concurrency cap and adds CORS
  headers. In localhost dev it hits Pollinations directly.
- **House-style rule** — a permanent, silent system message forcing **British
  English** is prepended to *every* outgoing request via `applyHouseStyle`.
- **Observability** — an in-memory ring buffer (`CALL_LOG`, last 50 calls)
  records task/provider/model/latency/ok/chars/error; surfaced to Admin via
  `getRecentCalls()`. `testProvider()` powers the Admin "Test connection" button.

### C.9.3 Safety & robustness
- **Prompt-injection hardening** — `sanitizeUserText` redacts "ignore previous
  instructions"-class patterns and length-caps input; `fenceUserText` wraps all
  user-controlled text in `<<<USER_DATA>>>` fences before it enters any prompt.
- **`extractJSON`** — tolerant parser that strips code fences and scans for the
  first balanced `{}`/`[]` block; returns `null` rather than throwing, so callers
  degrade to "show raw text".
- **Scope gate** — a separate, deterministic **binary classifier call**
  (`scopeClassifierMessages` → IN/OUT) decides whether a free-form question is in
  the mining/compliance domain; out-of-scope questions get a fixed refusal string
  emitted client-side, so the answering model never sees scope text to leak.

### C.9.4 Grounding context (RAG-without-vectors, `src/lib/aiContext.ts`)
The "retrieval" is deterministic slicing, not embeddings. **`buildContext`** emits
a compact, line-bounded Markdown "briefing pack" for the selected country
(ranked operators, agreements by expiry, off-track commitments, severity-ranked
flags, behind-schedule infrastructure) sized for ~20B-class local models.
Per-entity packs — **`buildRiskFlagContext`**, **`buildOperatorContext`**,
**`buildAgreementContext`**, **`buildNegotiationContext`** (peer benchmark table +
"reference floors" citing the real statutory rates), **`buildAnomalyScanContext`**
(terse region-wide encoding), and **`buildScenarioContext`** (pre-computed
revenue figures + regulatory anchors) — keep each task tightly grounded.
**`buildDomainPrimer`** compiles the module guide + glossary from
`content/guide.ts` so the AI can also explain the *interface* (what map markers
mean, what a "concession" is), and **`buildSystemPrompt`** sets the ministerial
persona.

### C.9.5 Task prompts (`src/lib/aiPrompts.ts`)
Templated system prompts share a hard **`GROUND_RULES`** contract: ground every
claim in the pack; cite exact IDs in brackets (`[AGR-001]`, `[RISK-…]`, etc.) so
the UI can resolve them to live links; write "not in pack" rather than guess;
British English; no emojis/flattery/follow-up filler. Tasks: **triage brief**
(severity rationale → root causes → 72-hour plan → draft notice), **operator
insight** (posture/trajectory/intervention/watch signals), **negotiation memo**
(position/floors/asks/counter-arguments/talking points), **anomaly scan** (strict
JSON findings of latent patterns the rule engine missed), **morning brief**
(3-line ministerial strip), and **scenario memo** (interprets pre-computed fiscal
figures). Several prompts end with an **`<<<ACTIONS>>>` sentinel contract**.

### C.9.6 Suggested-actions DSL (`src/lib/aiActions.ts`)
A model can append a hidden `<<<ACTIONS>>>[…]<<</ACTIONS>>>` JSON block; the UI
strips it from the prose and renders **real one-click buttons**. Action kinds:
`flag.ack`, `flag.resolve`, `flag.escalate`, `commitment.{atrisk|breached|
ontrack}`, `navigate`, `clipboard`, `pin`. `dispatchAction` is the *only* surface
that lets the model touch `mutationService` — an explicit trust boundary — and
**every AI-triggered action is written to the audit log** as "AI Analyst". Models
that ignore the contract degrade gracefully (the brief just renders normally).

### C.9.7 Right-click "brief anything" (`src/lib/aiContextResolver.ts`)
A context-menu system: right-clicking any element walks up the DOM for
`data-ai-entity="<kind>:<id>"` and `data-ai-region` markers, captures any text
selection or nearest block text, and builds entity-appropriate `BriefingOption`s
(triage/root-cause/draft-notice for a flag; insight/watch/peer-compare for an
operator; negotiation-memo/term-review for an agreement; etc.), each reusing the
same grounded context builders. The `useExplainWithAI()` hook offers the same as
a button affordance. Results are TTL-cached in `localStorage`
(`src/lib/aiCache.ts`, djb2 fingerprint over model+prompt+pack+task, 24 h default
TTL, schema-versioned) so navigation doesn't re-bill identical asks.

## C.10 The thirteen functional modules (UI pages)

Each page is a route under `Layout`. Sizes give a sense of surface area.

- **Dashboard (`/`, 714 LOC)** — executive overview: headline metric cards,
  severity-ranked alerts, upcoming deadlines, the **MorningBriefStrip** (AI
  3-liner), and the **Leaflet GIS overview map** ("Operator & Mine Locations")
  with toggleable layers (Mines / Concessions / Protected Zones) and a legend;
  pins coloured by operator compliance status, dashed concession circles, and
  red protected-zone overlaps marking "concession conflicts".
- **M1 Agreements (`/agreements`, 620 LOC)** — searchable/filterable contract
  registry + `AgreementDetailPage` (terms, commitments, infrastructure, track
  record, AI term-review/negotiation hooks).
- **M2 Negotiation (`/negotiation`, 323 LOC)** — royalty benchmarking scatter
  (each agreement vs its commodity peer median) + AI negotiation memos.
- **M3 Performance (`/performance`, 606 LOC)** — operator scorecards + trend
  charts + `OperatorDetailPage` (commitment-by-commitment status, performance
  time-series, AI operator insight).
- **M4 Risk (`/risk`, 577 LOC)** — severity-ranked flag queue (static + dynamic),
  each showing the rule and evidence; `RiskFlagDetailPage` with AI triage and
  one-click acknowledge/escalate.
- **M5 Transparency (`/transparency`, 556 LOC)** — country-by-country comparison,
  EITI readiness gauges, exportable public report.
- **M6 Scenarios (`/scenarios`, 369 LOC + `scenarios/` panels)** — the What-If
  planner; `ScenarioAnalysisPanel`, `StressTestPanel`, slider `inputs`; baseline
  vs scenario deltas (green = more state revenue) narrated by the AI scenario
  memo — all figures from `revenueModel`.
- **M7 Ownership (`/ownership`, 197 LOC)** — beneficial-ownership tree from a
  selected operator up to its real owners, PEP + opaque-entity markers.
- **M8 Local Content (`/local-content`, 201 LOC)** — promised-vs-actual on
  employment/procurement/training/community spend.
- **M9 ESG (`/esg`, 385 LOC)** — 0–100 E/S/G scores, radar comparison, water/
  carbon/tailings/grievance/jobs metrics, mine-closure rehab funding.
- **M10 Market Intelligence (`/market`, 328 LOC)** — live-style commodity prices
  (24h/7d/30d change, year hi/lo) + a price-move revenue-impact simulator.
- **M11 Documents (`/documents`, 267 LOC)** — searchable document vault (titles,
  tags, **and clause text**), clause explorer filtered by clause type, version
  history, extraction-confidence display.
- **M12 Public Portal (`/public-data`, 370 LOC)** — open-dataset catalogue;
  publish/retract; export CSV/JSON/Excel (via SheetJS, through export-safety);
  EITI readiness.
- **M13 Regulatory Tracker (`/regulatory`, 270 LOC)** — newest-first timeline of
  enacted/proposed/under-review/withdrawn changes, affected-agreement impact, and
  **stabilisation-conflict** flags.
- **Admin (`/admin`, 93 LOC + `admin/` tabs)** — tabbed console: **CreateTab**
  (add operators/agreements), **BulkActionsTab**, **ImportTab** (drag-drop
  XLSX/CSV with import-safety), **ExportTab**, **AISettingsTab** (provider/model/
  key/base-URL + connection test + call log), **AuditLogTab**, and a risk-threshold
  editor.
- **Audit Monitor (`/audit`, 575 LOC + `audit/` widgets)** — real-time activity
  feed with a **review workflow** (`ReviewQueue`, `ReviewControls`): mark
  reviewed / flag / escalate, plus automatic **anomaly highlighting** (off-hours
  changes, large bulk operations).

## C.11 State management (Zustand stores)

| Store | Persist key | Responsibility |
|---|---|---|
| `authStore` | `auth-storage` | `isAuthenticated`, `role` (admin/viewer), login/logout |
| `aiSettingsStore` | `peb-ai-settings-v5` | provider, model, keys, base URL, enabled |
| `aiBriefingStore` | (in-memory) | right-click menu + floating AI brief card state |
| `alertStore` | `peb-alerts-v1` | acknowledged/dismissed alert IDs (defs are seed) |
| `auditStore` | `peb-audit-log` (v2, migrated) | append-only entries (cap 500), review status, 24 seeded entries, anomaly tagging |
| `dataStore` | (in-memory) | version counter for DB-mutation reactivity |
| `onboardingStore` | `peb-onboarding-v1` | tour-seen + per-route dismissed intros |
| `settingsStore` | `peb-settings-storage` | editable `RiskThresholds` |
| `themeStore` | `theme-storage` | dark/light (default dark) |

`CountryContext` provides the country scope (locked to `GIN`) that scopes every
page and every AI briefing pack.

## C.12 First-timer UX & explainability layer

A deliberate "plain-language" layer (`content/guide.ts` is the single source of
truth) makes the institutional tool legible to non-experts:

- **`MODULES`** — per-route friendly name, official name, module code, tagline,
  "what you can do here", and "how to read this page".
- **`GLOSSARY`** — 23 plain-language definitions (royalty rate, breach, PEP,
  opaque entity, stabilisation clause, tailings, galamsey, turbidity/NTU, EITI,
  …) surfaced via `GlossaryTerm` tooltips and consumed by the AI domain primer.
- Supporting components: **ModuleIntro** (dismissible "what is this page"
  panel), **GuidedTour** (first-run tour, tracked in onboardingStore),
  **HelpButton**, **InfoTip**, **ChartPanel** (chart-with-explainer), **PageHeader**,
  **MetricCard**, **StatusBadge**/**StatusDropdown**, **RulePill**, **CitedText**
  (renders `[AGR-…]` citations from AI output as live links),
  **AnomalyScanPanel**, **AlertCenter**, **GlobalSearch**, **CountrySelector**,
  **CountryMap**, **EditModal**. (24 shared components total, ~3,940 LOC.)

## C.13 Design system implementation

`DESIGN.md` is the canonical "West African Government Standard": Pan-West-African
palette (deep Sahel-green authority surfaces, Pan-African green `#006B3F` primary,
Saharan-saffron gold accent, Pan-African red for danger; the Tailwind `blue`
scale is deliberately *overridden* to "Premium Emerald" so there is no real blue),
WCAG-AA contrast, 1px solid borders, small institutional radii, flat design,
3px focus rings. The implementation in `tailwind.config.js` drives all of this
through **CSS variables** (`--brand-*`, `--gold-*`, `--forest-*`, `--background`,
etc.), enabling the runtime **dark/light theme** toggle (default dark) applied by
`ThemeWrapper`. The deployment is single-country, so charts use Guinea's national
palette (Pan-African green); the per-country palette tokens for Ghana gold and
Côte d'Ivoire orange remain in the design system but are unused. Fonts: Outfit
(sans) + JetBrains Mono.

## C.14 Security & governance posture (engineering)

This directly serves the manuscript's "digital sovereignty / algorithmic
legitimacy" discussion:

- **Data sovereignty** — local-first AI default means compliance data can be
  analysed with **no egress** to any third party; the manuscript's host-state
  data-custody requirement is satisfiable out of the box.
- **HTTP hardening (`vercel.json`)** — a strict **Content-Security-Policy**
  (script-src 'self'; connect-src limited to the three AI endpoints + localhost),
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  no-referrer`, COOP/CORP same-origin, a locked-down `Permissions-Policy`, and
  HSTS preload.
- **Spreadsheet egress defence (`lib/exportSafety.ts`)** — CSV/formula-injection
  (CIAJ) neutralisation: every string cell beginning with `= + - @` or a control
  char is prefixed with `'`, per OWASP; 32k cell cap.
- **Untrusted-import defence (`lib/importSafety.ts`)** — 5 MB / 10,000-row /
  200-col / 10k-cell bounds (client-side DoS guard), extension allow-list
  (`.xlsx/.xls/.csv`), and **prototype-pollution** key stripping
  (`__proto__/constructor/prototype`).
- **Prompt-injection hardening & scope gating** — see C.9.3.
- **Tamper-evident audit trail** — `DocumentAccessLog` carries a content `hash`;
  the `auditStore` records every create/update/import/bulk/AI action with
  before/after values and flags off-hours or large-bulk operations as anomalies;
  the Audit Monitor adds a human review/escalation workflow.
- **RBAC** — admin vs viewer gating on all write/admin surfaces.

## C.15 Deployment & limitations (prototype honesty)

- **Deployment:** static SPA on **Vercel** + one **Edge Function** (`api/ai.js`).
  Local dev proxies a second OpenAI-compatible server at `127.0.0.1:1234` via
  `/api/local-ai` (vite proxy).
- **Acknowledged prototype caveats (for the report's "limitations" section):**
  (1) the dataset is **synthetic** (though grounded in real events) and lives
  **in memory** — there is no backend persistence; edits reset on reload.
  (2) **Auth is demo-only** (hard-coded `admin/viewer` credentials, simulated SSO
  in seed logs) — a real deployment needs a government IdP. (3) The "AI actions"
  and clause-extraction `confidence` are prototype affordances; `flag.escalate`
  is modelled as a status+audit change, not a real escalation API. (4)
  Institutional-learning "L" (model retraining, rule revision feedback) exists in
  prototype form (versioned thresholds, AI cache) rather than as a trained
  pipeline. (5) Multilingual clause extraction described in the manuscript (M1)
  is represented by pre-extracted `ExtractedClause` records, not a live NLP
  pipeline. These are explicitly framed as Phase II in the source comments.

## C.16 How the artefact evidences the manuscript's claims

| Manuscript claim / module | Where realised in the software |
|---|---|
| M1 Contract & Agreement Intelligence | `/agreements` + `ManagedDocument`/`ExtractedClause` + agreement context builders |
| M2 Negotiation Intelligence | `/negotiation` + `getRoyaltyBenchmarks` + `buildNegotiationContext` + negotiation-memo prompt |
| M3 Performance & Compliance Monitoring | `/performance` + scorecards + rule engine + performance time-series |
| M4 Breach & Risk Detection | `/risk` + `computeDynamicFlags` + anomaly-scan AI task |
| M5 Transparency & Reporting | `/transparency` + `/public-data` + EITI readiness + safe exports |
| "Compression of information asymmetry" | deterministic dataService scoring + grounded AI briefs that cite IDs |
| "Algorithmic legitimacy / human-anchored escalation" | AI never mutates directly; `dispatchAction` trust boundary; full audit trail; review workflow |
| "Digital sovereignty / data custody" | local-first AI default; strict CSP; no secrets in source |
| Continuous-assurance cadence | live reactive recomputation (`dataStore` version) on every mutation; dynamic flags recompute against editable thresholds |
| Guinea fiscal regime (15% free-carry; bauxite/iron-ore royalties; Simandou terms) | Guinea `Country` record in `seed.ts` + `effectiveRoyaltyRate` in `revenueModel.ts` |
| Guinea-dedicated, regionally-capable engine | scope locked to `GIN`; accessors + context builders retain `ALL/GIN/GHA/CIV` filtering as latent capability, `generateSeedData` scopes the live corpus to Guinea |

---

**End of Part C (implemented-system specification).** Parts A–B describe the
theory and the verified facts; Part C describes the running artefact that
embodies them. Together they are sufficient to author a full design-science
report covering motivation, theoretical framework, system design, implementation,
security/governance posture, and limitations/future work.

---

# Part D: Runtime Walkthrough — Everything Happening Inside the Dashboard

> **Purpose of this Part.** Part C documents *what the software is* (architecture,
> data model, services, AI layer). Part D documents *what the software does when
> you use it* — a screen-by-screen, control-by-control account of every surface,
> every interaction, and every computation that fires in response, written from
> the operator's seat. Where Part C is the blueprint, Part D is the guided tour of
> the running building. Everything below reflects the artefact **as currently
> configured**: a single-tenant deployment dedicated to the **Republic of Guinea**
> (the three-country engine documented in Part C still sits underneath — see D.21).

## D.0 What loads, in what order

1. The browser loads the React 19 SPA. `ThemeWrapper` immediately applies the
   persisted theme class (`dark` by default) to `<html>`, so there is no light/dark
   flash.
2. `BrowserRouter` → `CountryProvider` (country scope fixed to Guinea) → route
   matching. If the visitor is not authenticated, `ProtectedRoute` bounces every
   path except `/login` straight to the **Secure Government Access Portal**.
3. Once authenticated, the persistent `Layout` shell mounts (sidebar + header +
   breadcrumb) and the requested page lazy-loads behind a spinner (`RouteFallback`)
   while its heavy dependencies — charts, the Leaflet map, the spreadsheet engine —
   stream in on demand.
4. On a first-ever visit the **Guided Tour** modal appears over the dashboard; on
   return visits it stays closed (state remembered in `onboardingStore`).

## D.1 Logging in (session start)

The login screen presents a styled ministry portal with two demo identities
(prototype-only, see C.15):

- **`admin / password`** → full **Admin** role: can edit data, configure the AI,
  import/export, and reach the Admin and Audit sections.
- **`viewer / viewer`** → **Read-Only** role: sees everything, changes nothing;
  the System nav group (Admin, Audit) is hidden and write affordances are gated.

Submitting runs a simulated ~700 ms authentication delay (so the loading state is
visible), then writes `isAuthenticated`/`role` into the persisted `authStore` and
navigates to the Overview. Because auth is persisted, a reload keeps you signed in
until you press **Sign out** (the door icon, top-right), which clears the store and
returns you to `/login`.

## D.2 The persistent shell — always on screen

Everything below frames every page and never unmounts as you navigate.

### The left sidebar (deep Sahel-green, gold-accented)
- **Ministry identity block** — the "MoM / Ministry of Mines / Republic of Guinea"
  crest, the platform name ("National Compliance Intelligence Platform"), and a
  live "Republic of Guinea" pill with a pulsing emerald dot.
- **Modules list** — fourteen entries, each showing a plain-language name, the
  official institutional name beneath it, and an **M-code chip** (M1–M13) on the
  right. The active route is marked by a gold left-border and gold icon. Hovering
  shows the module's one-line tagline as a tooltip.
- **System group** (admins only) — a divider then **Settings & Data** (Admin) and
  **Activity Log** (Audit).
- **Resizable & self-measuring** — drag the right edge to widen the sidebar;
  double-click the handle to reset to the default width. The app measures the
  longest label and refuses to drag wider than the point where text is fully
  visible. A custom gold-on-hover scrollbar thumb is rendered (the native one is
  hidden for cross-OS consistency) and can itself be dragged.
- **Footer** — a live ticking clock (updates every second, formatted to Guinea's
  GMT zone) and the platform code "PEB-0526 · Secure Government Platform".

### The top header (floating glass bar)
Left: a shield mark, the page title ("Platform Dashboard"), and the subtitle
"Adaptive Continuous Compliance Intelligence". Right, a cluster of always-available
controls (each separated by a hairline divider):

1. **Global Search** — see D.3.
2. **AI Compliance Analyst** — see D.4.
3. **Alert Center** (bell with a count badge) — see D.5.
4. **Help** button — re-opens the Guided Tour.
5. **Theme toggle** — sun/moon, flips dark↔light instantly (animated icon).
6. **Role badge** — "Admin" (emerald) or "Read-Only" (grey).
7. **Sign out**.

### The breadcrumb bar
A thin strip reading `Section › <current module> · <module code & official name>` ·
**Republic of Guinea**, ending with a pulsing "**Restricted — Government Use Only**"
classification marker. The `<main>` element is tagged with a `data-ai-region`
attribute derived from the current page, so the right-click AI knows where you are.

## D.3 Global Search (Cmd/Ctrl-K)

Click the search field or press **⌘K / Ctrl-K** anywhere to open a centred command
palette. Typing filters **agreements, operators, and risk flags** in real time
(matching on names, IDs, commodities, etc.). Each result shows its type and a short
label; clicking — or it tells you to press **Esc** to dismiss — navigates straight
to that record's detail page. Clicking outside closes it and clears the query.

## D.4 The AI Compliance Analyst (chat dock)

Clicking the sparkle button opens a right-hand chat panel headed by the active
**model name** and a shortcut to AI settings. Its behaviour:

- **If the AI isn't configured**, it says so and links you to Admin to enable a
  provider (it never silently fails).
- **Four one-click Quick Actions** seed common asks: **Ministerial briefing** (the
  3–5 items warranting the Minister's attention, each with a recommended action and
  an operator/agreement reference), **Top risks explained** (plain-language
  walkthrough of the most severe open flags), **Negotiation guidance** (agreements
  out of line on royalty/value vs commodity peers, with renegotiation points), and
  **Anomaly hunt** (opaque owners, clustered expiries, single-operator breach
  clusters, stuck infrastructure).
- **Free-form questions** are answered against a freshly built, Guinea-scoped
  *briefing pack* (ranked operators, agreements by expiry, off-track commitments,
  severity-ranked flags, behind-schedule infrastructure). Answers **stream token by
  token**; the **Send button doubles as Stop** (abortable mid-generation).
- **Grounding is enforced**: the model is handed finished figures and must cite
  exact IDs in brackets. Those `[AGR-…]`/`[RF-…]` citations render as **live links**
  (via `CitedText`) you can click to jump to the record.
- **Off-topic questions** are caught by a separate scope-classifier call and get a
  fixed polite refusal — the answering model never sees the off-topic text.
- If a reply carries a hidden `<<<ACTIONS>>>` block, the dock renders **real
  one-click buttons** (e.g. *Acknowledge flag*, *Mark breached*, *Open operator*).
  Pressing one performs the actual mutation through the single AI trust boundary and
  **logs it to the audit trail as "AI Analyst"**.

## D.5 The Alert Center (bell)

Opening the bell drops a panel in two sections:

- **Automated Alerts** — the seeded `SystemAlert` set (compliance / payment /
  deadline / renewal / risk / regulatory / ESG), each with a priority colour, the
  trigger rule, and two controls: **Acknowledge** (ticks it, remembered in
  `alertStore`) and **Dismiss**. Clicking the alert body navigates to the entity it
  concerns.
- **Live Notifications** — derived, in-the-moment items (e.g. things needing
  attention now), each linking to the relevant page.

The bell's **count badge** reflects how many items still need attention; acknowledged
and dismissed states persist across reloads.

## D.6 Right-click "brief anything" + page-level AI

Anywhere in the app you can **right-click** an element. The system walks up the DOM
for `data-ai-entity="<kind>:<id>"` and `data-ai-region` markers, grabs any selected
or nearby text, and offers entity-appropriate briefing options — *triage /
root-cause / draft-notice* for a flag, *insight / watch-signals / peer-compare* for
an operator, *negotiation-memo / term-review* for an agreement, plain-language
*explain* for charts and regions. The chosen brief streams into a floating card.
Results are **TTL-cached in the browser** (24 h, keyed by model+prompt+pack), so
re-opening the same brief is instant and doesn't re-bill the model. The same
capability is also offered as explicit **"Explain with AI"** buttons via the
`useExplainWithAI` hook, and as inline panels (Morning Brief, Anomaly Scan) described
per-page below.

## D.7 Overview — the Executive Dashboard (`/`)

The landing page is the daily snapshot:

- **Headline metric cards** — active agreements, operators watched, overall
  compliance rate, and open critical flags, computed live from the dataset. Green =
  healthy, amber = watch, red = act now. Cards are clickable into their detail.
- **MorningBriefStrip** — a 3-line AI ministerial brief that **auto-generates once**
  on first view (then serves from cache) with a **Regenerate** button; it degrades to
  a "Generate one →" prompt if the AI isn't configured.
- **Severity-ranked alerts** and **upcoming deadlines** — the most urgent items at a
  glance.
- **GIS overview map** — a Leaflet/OpenStreetMap map, "Operator & Mine Locations",
  with **toggleable layers** (Mines / Concessions / Protected Zones) and a legend.
  Mine pins are coloured by that operator's compliance status; concessions show as
  dashed circles; **protected-zone overlaps render in red as "concession
  conflicts"**. Clicking a pin drills into the operator/agreement.

## D.8 M1 · Mining Agreements (`/agreements`)

A searchable, filterable **contract registry** — one row per agreement, filterable by
company, mineral, and status, each row carrying a status badge (active / expiring /
breached). Selecting a row opens the **Agreement Detail** page: full terms (royalty
rate, pricing structure, contract value, expiry), the list of **commitments**, the
**infrastructure obligations** and their % progress, the agreement's **track record**,
and AI hooks for *term-review* and *negotiation*. This is M1 of the manuscript —
the structured contractual asset register replacing the physical archive.

## D.9 M2 · Deal Benchmarking / Negotiation (`/negotiation`)

A **royalty-benchmarking scatter**: every agreement plotted against the **median
royalty for its commodity**. Points below the line are paying less than their peers —
the further below, the stronger the renegotiation case. The AI **negotiation memo**
turns a selected agreement into a position/floors/asks/counter-arguments brief,
grounded in Guinea's statutory fiscal terms (the 15% non-dilutable free-carry,
the bauxite and iron-ore royalty base) and same-commodity peer medians.

## D.10 M3 · Company Scorecards / Performance (`/performance`)

Per-operator **compliance scorecards** — a 0–100 score (share of commitments met or
on-track), open/critical flag counts, and trend charts. Opening an operator shows
the **Operator Detail** page: each commitment with its status, the quarterly
**performance time-series**, and an AI **operator insight** brief
(posture / trajectory / intervention / watch-signals).

## D.11 M4 · Risk Alerts / Breach Detection (`/risk`)

A **severity-ranked flag queue** mixing two sources: static seeded `RF-…` flags and
**live `DYN-…` flags** recomputed on the fly by the rule engine against the *current*
risk thresholds. Every flag states, in plain terms, the **rule it broke** and the
**evidence** — so a human can judge it, not just trust a score. The **Risk Flag
Detail** page adds an AI **triage brief** (severity rationale → root causes →
72-hour plan → draft notice) and **one-click Acknowledge / Escalate / Resolve**,
each of which mutates the flag and writes to the audit log. An **AnomalyScanPanel** is
available here too: it asks the model for *latent* patterns the deterministic rules
missed, returned as structured findings each with a recommended next step (advisory —
"confirm against source data before action").

## D.12 M5 · Public Reporting / Transparency (`/transparency`)

Country-comparison view (compliance, royalties, openness) with **EITI readiness
gauges** — `(complete + ½·partial) / total` disclosure sections — and an exportable,
shareable public report.

## D.13 M6 · What-If Planner / Scenarios (`/scenarios`)

The fiscal sandbox. Move sliders to model commodity prices, production basis (current
run-rate vs committed capacity), a global production adjustment, the royalty regime
(honour stability clauses vs apply the 2025 reforms), and a manual royalty uplift; you
can even **exclude agreements** to simulate a revocation/sale/exit (the Guinea
licence-revocation precedent and its arbitration exposure). The page recomputes
projected **annual state royalty take** instantly — total, by-commodity and
per-agreement — and shows the **delta vs today's baseline** (green = more revenue for
the state, red = less). `StressTestPanel` and `ScenarioAnalysisPanel` frame the
results; an AI **scenario memo** interprets the pre-computed figures. **Nothing here
touches real data** — it's a pure model over `revenueModel.ts`.

## D.14 M7 · Who Owns What / Beneficial Ownership (`/ownership`)

A **beneficial-ownership tree** rising from a selected operator to the real people or
entities behind it, with **PEP markers** (politically-exposed persons) and **opaque-
entity** flags where ownership can't be traced — the due-diligence view for hidden or
sensitive control.

## D.15 M8 · Local Benefits Tracker (`/local-content`)

**Promised vs actual** across employment, procurement, training, and community spend.
Bars at/above 100% are on target; below means the operator is short on its local-
benefit commitments.

## D.16 M9 · ESG Tracker (`/esg`)

0–100 **Environmental / Social / Governance** scores per operator on a radar chart,
plus the underlying metrics (water use, carbon, tailings-dam safety, community
grievances, jobs) — scored **direction-aware** so that "lower is better" measures
invert correctly. A **mine-closure** panel shows rehabilitation provisions and how
much of each clean-up fund is actually paid in.

## D.17 M10–M13 · Market, Documents, Open Data, Regulatory

- **M10 Market Intelligence (`/market`)** — live-style commodity prices (24h / 7d /
  30d change, year hi/lo) and a **price-move revenue-impact simulator**; green = price
  rose, red = fell, and the simulator flags when a price crosses a level that changes
  the royalty rate.
- **M11 Document Vault (`/documents`)** — a searchable library that searches titles,
  tags **and the clause text inside contracts**; a **clause explorer** filters by
  clause type (royalty, stabilisation, dispute-resolution, …), each extracted clause
  shown with an AI **confidence** figure and page reference, plus version history.
- **M12 Open Data Portal (`/public-data`)** — the public-transparency catalogue:
  browse datasets by theme, mark them public/private, **export CSV/JSON/Excel** (via
  SheetJS, through the export-safety neutraliser), and read each country's EITI
  readiness.
- **M13 Regulatory Tracker (`/regulatory`)** — a newest-first timeline of regulatory
  changes (enacted / proposed / under-review / withdrawn), the agreements each affects
  and its estimated financial impact, and a **stabilisation-conflict** flag where a new
  rule may clash with a contract's frozen-terms clause — a likely dispute to watch.

## D.18 Admin · Settings & Data (`/admin`, admins only)

A tabbed console that is the *only* place data and configuration change:

- **Create** — add operators and agreements through validated forms.
- **Bulk Actions** — apply status/field changes across many records at once.
- **Import** — drag-and-drop XLSX/CSV, run through `importSafety` (size/row/column
  caps, extension allow-list, prototype-pollution key stripping) before anything lands.
- **Export** — pull data out, neutralised against CSV/formula injection.
- **AI Settings** — choose the provider (**local / Pollinations / OpenRouter**), model,
  API key and base URL; **Test connection**; and inspect a **call log** (last 50
  calls: task, provider, model, latency, ok/error). Keys live only in the browser.
- **Audit Log** tab and a **risk-threshold editor** — and changing a threshold here
  **immediately recomputes the live `DYN-…` flags** everywhere.

Every write on every tab records before/after values, appends a structured **audit
entry**, and bumps the reactive version counter so all derived views refresh at once.

## D.19 Audit Monitor · Activity Log (`/audit`, admins only)

A real-time, append-only **activity feed** (newest first, capped, persisted, seeded
with 24 prior entries). Each entry names the actor, the action, the record touched,
before/after values, and the time. It carries a **review workflow** — mark reviewed,
flag, or escalate, individually or in bulk — and **auto-highlights anomalies** such as
off-hours changes and large bulk operations. `DocumentAccessLog` entries carry a
content **hash**, making the trail tamper-evident. Crucially, **AI-triggered actions
appear here attributed to "AI Analyst"**, so algorithmic activity is as auditable as
human activity.

## D.20 What's happening continuously, under every screen

Several mechanisms run on every page without you asking:

- **Live reactive recomputation** — the moment any mutation lands (a status change, an
  import, an AI action), `dataStore` bumps a version counter and **every derived view
  recomputes** (scorecards, summaries, the risk queue, the map colours). This is the
  software embodiment of the manuscript's *continuous-assurance cadence*.
- **Deterministic-first, AI-second** — every number on screen and every number the AI
  narrates is computed in TypeScript over the dataset; the model only ever interprets
  finished figures. The "anti-gimmick rule."
- **Country scoping** — every accessor and every AI pack is scoped (here, fixed to
  Guinea); the regional engine is the same code path with the scope opened up.
- **Plain-language layer** — each page opens with a dismissible "What is this page?"
  intro, every chart has a "How to read this" (i) and a one-line takeaway, and any
  underlined jargon term reveals a glossary definition on hover (23 terms — royalty,
  breach, PEP, opaque entity, stabilisation clause, tailings, galamsey, NTU, EITI, …).
- **AI economy & resilience** — a global mutex serialises AI calls, a 429 back-off
  handles the free hosted tier, British-English house style is forced on every request,
  and brief results are TTL-cached so navigation doesn't re-bill identical asks.
- **Persistence boundary** — UI preferences and session (theme, auth, AI settings,
  acknowledged alerts, dismissed intros, tour-seen, thresholds, audit log) persist in
  `localStorage`; the *domain data itself* is in-memory and resets on reload (a
  prototype caveat, Phase II adds a backend — see C.15).

## D.21 Current configuration note (Guinea single-tenant)

As shipped, the dashboard is **dedicated to the Republic of Guinea**: the header
country selector has been removed, the scope is pinned to `GIN`, `generateSeedData`
filters the corpus to Guinea, and the Guided Tour states plainly that "every number,
chart, map pin, and alert reflects Guinea's mining agreements." The wider
West-Africa machinery from Part C (the latent Ghana and Côte d'Ivoire accessors, the
revenue model's per-jurisdiction sliding scales, the unused per-country palette
tokens) **remains intact in the codebase** but is never surfaced — it is what would
make a future regional extension a configuration change rather than a rebuild. In
other words: Part D describes the **Guinea-first deployment** of Section 8.1,
scaled through the phased national rollout of Section 8.2.

---

**End of Part D (runtime walkthrough).** Parts A–B give the theory and the verified
facts; Part C gives the architecture; Part D gives the lived behaviour of the running
artefact, screen by screen. Together the four Parts cover motivation, theoretical
framework, comparative analysis, system design, implementation, operational experience,
security/governance posture, and limitations — sufficient to author the complete
design-science account end to end.