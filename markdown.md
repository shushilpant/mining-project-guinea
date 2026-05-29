# Designing an AI-Enabled Investor and Compliance Intelligence System for Continuous Assurance in West African Mining Governance: A Comparative Institutional Framework for Guinea, Ghana, and Côte d'Ivoire

**Project code: PEB-0526-WA-MIN-05**
**Target journal: Resources Policy (alternative: The Extractive Industries and Society)**

---

## Flashpoint advisory: hedged-wording recommendations

The following claims, present in one or more of the source drafts, could not be fully verified against authoritative primary sources within the present research budget and have accordingly been hedged or excluded in the final manuscript wording. Readers and reviewers should treat them with corresponding caution.

1. The Compagnie du TransGuinéen equity split of "SimFer 42.5% / WCS 42.5% / State 15%" is not directly corroborated in Rio Tinto's public SEC filings, which document only the SimFer mine-level ownership of 85% SimFer / 15% Government of Guinea. The CTG-specific ratio has accordingly been omitted in favour of the verified SimFer figures, with the rail-and-port infrastructure described as a co-development partnership between SimFer, WCS, Baowu and the Government of Guinea.
2. The specific Guinean beneficial-ownership decree reference "D/2021/233/PRG/SGG" cited in some draft material could not be confirmed against EITI documentation, which records that the underlying beneficial-ownership legislation drafted in 2019 and resubmitted to Parliament in 2024 remained pending enactment at the time of writing. The manuscript reflects this hedged position.
3. The Simandou reserve figure of "approximately 1.5 billion tonnes" appears in some draft material; authoritative sources (notably mining-industry reporting and Rio Tinto disclosures) refer to a total Simandou deposit on the order of 3 billion tonnes, with the high-grade (~65% Fe) component representing a substantial sub-set. The manuscript adopts the more cautious phrasing "one of the world's largest remaining high-grade iron-ore deposits" and refers to the IMF Country Report 24/131 modelling rather than reserve figures.
4. The headline PIRME figure of "USD 68 billion" is more accurately stated as approximately USD 67–68 billion (the authoritative figure being CFA 38,000 billion over 15 years), and the manuscript uses both formulations.
5. Ghana's 2024 gold production figure has been resolved at exactly 140.6 tonnes (World Gold Council, *Gold Demand Trends Full Year 2024*), removing the qualifier "approximately".

---

## Abstract

West African mining jurisdictions are experiencing a structural inflexion point. A confluence of resource nationalism, contractual renegotiation, environmental crises and rising critical-mineral demand has exposed the chronic inadequacy of episodic, paper-based compliance regimes for governing complex extractive contracts. Between May 2025 and May 2026, Guinea revoked 129 mineral-exploration permits and an earlier tranche of 51 licences, terminated Emirates Global Aluminium's Guinea Alumina Corporation (GAC) concession, attracted a USD 28.9 billion ICSID arbitration claim from Axis International over its Boffa bauxite licence, and inaugurated the USD 20 billion Simandou iron-ore mine-rail-port system; Ghana enacted the Ghana Gold Board Act 2025 (Act 1140), ratified the Ewoyaa lithium mining lease under a price-linked 5–12 per cent royalty, lost two cabinet ministers in an anti-galamsey-related helicopter crash, and faced river turbidity readings of 32,000 NTU against a 2,000 NTU treatment-design threshold; and Côte d'Ivoire adopted the Integrated Mineral and Energy Resources Policy (PIRME), a fifteen-year, CFA 38,000-billion framework targeting a doubling of the mining-energy contribution to GDP from 7 per cent (2022) to 14 per cent by 2040. None of the three states currently possesses an institutional architecture capable of monitoring contractual, fiscal, environmental and beneficial-ownership obligations at the frequency, granularity and evidentiary standard now demanded by either domestic political economy or international investment law.

This study develops the **Adaptive Continuous Compliance Intelligence (ACCI) Model**, an integrated theoretical and systems-design framework synthesising principal-agent theory, institutional capacity theory, information asymmetry theory, continuous assurance theory and algorithmic governance theory. The ACCI Model is operationalised as a five-module AI-enabled Investor and Compliance Intelligence System encompassing Contract and Agreement Intelligence; Negotiation Intelligence; Performance and Compliance Monitoring; Breach and Risk Detection; and Transparency and Reporting. Methodologically, the paper adopts a comparative institutional systems-design approach combining doctrinal-legal analysis of the Guinean Mining Code (Law L/2011/006/CNT as amended by Law L/2013/053/CNT), the Ghanaian Minerals and Mining Act 2006 (Act 703) and the Ivorian Mining Code (Law No. 2014-138 of 24 March 2014); jurisdictional triangulation against EITI validation data, IMF Country Report 24/131, NRGI Resource Governance Index 2021 scores and operator filings; and design-science systems specification.

The principal findings are threefold. First, the three jurisdictions exhibit divergent but structurally complementary governance pathologies — Guinea's hyper-discretionary licence-revocation regime, Ghana's environmental-enforcement vacuum, and Côte d'Ivoire's expanding but under-monitored fiscal architecture — which together justify a regional rather than purely national assurance design. Second, continuous-assurance instrumentation can materially compress the information-asymmetry gap between extractive operators and state principals, but only where digital-sovereignty, data-custody and algorithmic-legitimacy questions are resolved ex ante. Third, the ACCI Model offers a generalisable contribution to the political economy of digital governance in resource-rich states, repositioning RegTech as a thicker institutional learning architecture rather than a narrow automation layer. The paper concludes with tiered, operational policy recommendations and identifies a Guinea-first pilot pathway as the most tractable entry point for regional deployment.

**Keywords:** Adaptive Continuous Compliance Intelligence; West African mining governance; resource curse; continuous assurance; algorithmic regulation; RegTech; Simandou; Ewoyaa lithium; galamsey; comparative institutional analysis; EITI; beneficial ownership.

---

## 1. Introduction

The governance of extractive contracts in West Africa has entered a period of accelerated institutional stress. Between 2024 and 2026, the three principal anglophone- and francophone-mining economies of the sub-region — the Republic of Guinea, the Republic of Ghana and the Republic of Côte d'Ivoire — have each generated cascading regulatory events of sufficient scale to reshape global mineral supply chains, sovereign-investor relations and domestic political settlements.

In Guinea, the military government led by President Mamadi Doumbouya cancelled 129 mineral-exploration permits on 26 May 2025, following an earlier purge of 51 licences in the same month; revoked the bauxite concession held by Emirates Global Aluminium's Guinea Alumina Corporation; transferred the GAC assets to the state-backed Nimba Mining Company; and simultaneously inaugurated the USD 20 billion Simandou iron-ore project at Morebaya port on 11 November 2025. In Ghana, a new administration enacted the Ghana Gold Board Act 2025 (Act 1140), declined to renew Gold Fields' Damang lease on its expiry on 18 April 2025, ratified the Ewoyaa lithium mining lease on 19 March 2026 under a sliding-scale 5–12 per cent royalty regime, and confronted a deteriorating galamsey-driven water-quality crisis culminating in river turbidity readings of 32,000 nephelometric turbidity units (NTU) — sixteen times the 2,000 NTU treatment-design threshold of major Ghana Water Company Limited plants. In Côte d'Ivoire, the Council of Ministers adopted the Integrated Mineral and Energy Resources Policy (PIRME) on 3 December 2025, a fifteen-year framework valued at CFA 38,000 billion (approximately USD 67–68 billion) and designed to double the mining-energy contribution to GDP from 7 per cent in 2022 to 14 per cent by 2040.

These events expose, in concentrated form, the inadequacy of the inherited compliance architecture of West African mining. That architecture remains overwhelmingly episodic, paper-based, retrospective and discretionary. Mineral conventions are negotiated bilaterally between state ministries and operator counsel, lodged in physical archives, monitored through annual returns and ad hoc inspections, and adjudicated — when adjudicated at all — through politically inflected ministerial decisions of the kind that have generated the cluster of ICSID arbitrations now confronting Guinea, including Axis International's USD 28.9 billion claim filed on 25 December 2025 and registered at ICSID on 16 January 2026. The asymmetry of information, technical capacity and legal sophistication between mining-state principals and multinational operator agents is, on present evidence, widening rather than narrowing.

This paper argues that the structural mismatch between the velocity of contemporary mining-governance events and the cadence of existing compliance systems can be addressed by deliberate institutional and technological redesign. Specifically, it proposes the **Adaptive Continuous Compliance Intelligence (ACCI) Model**, a framework that reconceives mining-sector compliance as a continuous, evidentially anchored, algorithmically supported institutional learning cycle. The ACCI Model integrates five theoretical traditions — principal-agent theory, institutional capacity theory, information asymmetry theory, continuous assurance theory and algorithmic governance theory — into a single operational architecture, and is instantiated as a five-module AI-enabled Investor and Compliance Intelligence System.

The paper is structured as follows. Section 2 reviews the literatures on extractive-sector governance and the resource curse, mining-compliance systems, digital and algorithmic governance, and comparative African mining governance, identifying four unresolved gaps. Section 3 develops the ACCI theoretical framework. Section 4 sets out the comparative institutional systems-design methodology. Section 5 conducts the jurisdictional analyses of Guinea, Ghana and Côte d'Ivoire and synthesises comparative findings. Section 6 specifies the five-module system architecture in design-science detail. Section 7 articulates the formal ACCI Model. Section 8 examines policy simulation and implementation, including a Guinea-first pilot pathway. Section 9 discusses digital sovereignty, state bargaining power, compliance automation ethics, algorithmic legitimacy and limitations. Section 10 sets out tiered policy recommendations, and Section 11 concludes.

---

## 2. Literature Review

### 2.1 Extractive governance, rent theory and the resource curse

The political economy of mineral-rich developing states has been organised, for four decades, around the resource-curse paradox first formalised by Auty (1993) and consolidated by Sachs and Warner (1995). The empirical regularity that mineral-dependent economies underperform their resource-poor peers on growth, institutional quality and conflict outcomes has resisted simple explanation, but the predominant transmission mechanisms — Dutch disease, rent-seeking, weak fiscal linkages and elite capture — converge on a common institutional finding: extractive-sector outcomes are determined less by geology than by the quality of the contracting, monitoring and revenue-management apparatus surrounding the deposit. Subsequent contributions by Collier, Humphreys and others sharpened the analytical focus on contract integrity, fiscal-regime design and transparency mechanisms, while critical scholarship from Bebbington and contributors to the *Resources Policy* and *Extractive Industries and Society* literatures emphasised the spatial and distributional politics of extraction.

For West African bauxite, gold and emerging lithium economies, the rent-management problématique is particularly acute because mineral endowments are world-leading — Guinea holds the world's largest bauxite reserves — but absorptive and regulatory capacity remains constrained. The Natural Resource Governance Institute's 2021 Resource Governance Index awarded Guinea's mining sector a composite score of 62 out of 100 ("satisfactory" band, up 6 points from the 2019 interim evaluation) and Ghana's gold mining sector 69 out of 100 (up 13 points from the 2017 RGI), while Côte d'Ivoire was not assessed in the 2021 edition. These figures, although improvements on prior cycles, mask significant intra-component weaknesses, particularly on licence allocation, beneficial-ownership disclosure and subnational resource-revenue sharing.

### 2.2 Mining compliance systems and continuous assurance

Compliance scholarship in extractive industries has historically privileged static, periodic-reporting models grounded in financial-audit traditions. The continuous-auditing literature pioneered by Vasarhelyi and colleagues from the early 1990s onwards reconceived assurance as a real-time, embedded process rather than a periodic event. Although this literature emerged in the corporate-financial context, its core insights — embedded analytics, exception-based escalation, continuous control monitoring and continuous risk assessment — translate directly to the requirements of mining-sector oversight, where contractual obligations are dense, multi-temporal and observable through high-frequency operational data streams.

Adjacent scholarship on RegTech has documented the migration of compliance automation from financial services into broader regulatory domains, and emerging contributions to public-sector audit explore the application of artificial intelligence to procurement, tax and environmental monitoring. The gap, however, is the absence of a comprehensive, theoretically grounded application of continuous assurance to mineral-sector compliance under the institutional conditions of low- and middle-income resource-rich states.

### 2.3 Digital and algorithmic governance

The literature on algorithmic regulation and the digital state has matured rapidly. Yeung's (2018) influential analysis frames algorithmic regulation as the deployment of computational decision-systems for regulatory purposes, distinguishing it from mere e-government digitisation and surfacing the legitimacy, accountability and rule-of-law tensions that automated regulatory decisions generate. Subsequent contributions by Kitchin on data-driven urbanism, and by Ulbricht and Yeung on the law of algorithmic regulation, have refined the conceptual vocabulary, foregrounding questions of contestability, explainability and the dual hazards of regulatory ossification and regulatory drift.

For mineral-sector governance, algorithmic regulation poses both promise and peril. The promise lies in continuous, evidentially grounded monitoring of contractual and environmental obligations at scales beyond current human-inspector capacity. The peril lies in the displacement of discretionary judgement, opaque decision logic, and the possibility that algorithmic systems will entrench rather than correct existing institutional pathologies.

### 2.4 Comparative African mining governance

The comparative literature on African mining governance has been enriched by EITI country reports, AfDB sectoral studies, and the African Mining Legislation Atlas (AMLA), as well as by detailed jurisdictional scholarship — Hilson and colleagues on Ghanaian galamsey; Campbell and others on Guinean bauxite and the political economy of resource nationalism; and a smaller but growing literature on Ivorian gold formalisation. The Intergovernmental Forum's Mining Policy Framework (IGF MPF) and the OECD Due Diligence Guidance for Responsible Mineral Supply Chains provide the principal international normative architecture, while the IFC Performance Standards (notably PS1 on environmental and social management, PS5 on involuntary resettlement and PS6 on biodiversity) and the Open Contracting Data Standard's Resource Contracts extension supply operational benchmarks.

### 2.5 Unresolved gaps

Four gaps remain unresolved. First, there is no integrated framework for continuous compliance monitoring tailored to the institutional realities of African mining ministries. Second, comparative analyses rarely treat Guinea, Ghana and Côte d'Ivoire as a single regional governance space despite increasing cross-border operator portfolios. Third, the algorithmic-governance literature is theoretically rich but operationally thin, particularly in extractives. Fourth, no published work synthesises principal-agent, institutional-capacity, information-asymmetry, continuous-assurance and algorithmic-governance literatures into a unified model for resource-state oversight. The ACCI Model is designed to close these gaps.

---

## 3. Theoretical Framework: The Adaptive Continuous Compliance Intelligence (ACCI) Model

The ACCI Model integrates five theoretical traditions.

**Principal-agent theory** frames the host state as principal and the mining operator as agent, with asymmetric information, divergent objectives and incomplete contracts generating monitoring costs and moral-hazard risks. The classical Jensen-Meckling formulation identifies monitoring, bonding and residual-loss costs; in mining governance, monitoring costs are typically under-invested while residual losses (in the form of unpaid royalties, environmental degradation and benefit-sharing failures) are absorbed by the principal.

**Institutional capacity theory** draws on North, Acemoglu and others to argue that the binding constraint on extractive governance is rarely the absence of formal rules — Guinea's 2013 Mining Code, Ghana's Act 703 and Côte d'Ivoire's Law 2014-138 are reasonably well drafted — but the absence of institutional capacity to enforce them. Capacity here is understood as the joint product of technical skill, organisational memory, inter-agency interoperability and political insulation from capture.

**Information asymmetry theory**, building on Akerlof, Stiglitz and Spence, foregrounds the systematic informational disadvantage of state actors vis-à-vis operators with respect to ore-body characteristics, cost structures, transfer-pricing flows and environmental performance. The ACCI Model treats compression of this informational gap as its central design objective.

**Continuous assurance theory**, originating with Vasarhelyi, reconceives audit as embedded, continuous and exception-based rather than periodic and sample-based. Its translation into mining governance entails real-time ingestion of production, fiscal, environmental and corporate-structure data; rule-based and probabilistic evaluation against contractual and statutory obligations; and exception-triggered escalation pathways.

**Algorithmic governance theory** (Yeung 2018; Kitchin; Ulbricht & Yeung) supplies the legitimacy, contestability and accountability vocabulary necessary to embed automated decision-systems in public-law settings. Critically, the ACCI Model does not treat algorithmic outputs as determinative; rather, they are evidentially structured inputs into human institutional decision-making, with explicit contestation pathways.

The synthesis yields the ACCI Model: a five-layer architecture comprising (i) **inputs** (contractual, fiscal, operational, environmental and beneficial-ownership data); (ii) **processing layers** (clause extraction, rules-engine evaluation, probabilistic breach modelling, anomaly detection); (iii) **decision intelligence** (risk scoring, escalation triage, scenario simulation); (iv) **feedback loops** (operator response, ministerial action, judicial and arbitral outcomes); and (v) **institutional learning cycles** (model retraining, rule revision, capacity reinforcement). Each layer is governed by an explicit accountability and contestability protocol.

---

## 4. Methodology

The study adopts a comparative institutional systems-design research strategy combining doctrinal-legal analysis, comparative jurisdictional triangulation and design-science systems specification.

**Doctrinal-legal analysis** examines the primary mining legislation of each jurisdiction: Guinea's Mining Code (Law L/2011/006/CNT of 9 September 2011 as amended by Law L/2013/053/CNT of 8 April 2013, promulgated by Presidential Decree D/2013/075/PRG/SGG of 17 April 2013); Ghana's Minerals and Mining Act 2006 (Act 703) and its amendments (Act 794 of 2010, Act 900 of 2015, Act 995 of 2019), the Ghana Gold Board Act 2025 (Act 1140) and the Minerals and Mining (Royalty) Regulations 2025; and Côte d'Ivoire's Mining Code (Law No. 2014-138 of 24 March 2014) together with its implementing Decree No. 2014-397 of 25 June 2014 and the 2025 Finance Act amendments.

**Comparative jurisdictional triangulation** integrates primary legislation with EITI validation reports (notably Guinea's 88/100 score under the 2019 EITI Standard, agreed by the EITI Board on 16 February 2022); IMF Country Report 24/131 of 17 May 2024; NRGI Resource Governance Index 2021 country profiles; World Bank press releases (notably the announcement of 11 July 2025 on Côte d'Ivoire's MSPI); operator filings (Rio Tinto Form 6-K disclosures on Simandou; Emirates Global Aluminium 2025 financial disclosures; Atlantic Lithium announcements; Gold Fields disclosures on Damang); and reputable secondary reporting (Reuters, Bloomberg, *Mining Weekly*, MINING.COM, *The National*, *Ecofin Agency*).

**Design-science systems specification** follows the Hevner et al. tradition of design-science research in information systems, producing artefact specifications for ontologies, multilingual clause-extraction pipelines, rules-engine logic, probabilistic breach models and dashboard architectures. These specifications are calibrated against the documentary corpus of mineral conventions, royalty regulations and beneficial-ownership decrees identified in the doctrinal analysis.

**Methodological limitations.** Three limitations should be acknowledged. First, the empirical evidence base for several flashpoint claims rests on secondary reporting whose primary corroboration is constrained by limited governmental data disclosure, particularly for Guinea's permit-revocation processes. Second, the analysis is forward-looking with respect to systems-design artefacts that have not yet been implemented; their political-economy feasibility is examined in Section 8 but cannot be empirically tested at this stage. Third, the rapid evolution of events between May 2025 and May 2026 means that several data points (notably the EGA-Guinea settlement of 6 May 2026) are subject to ongoing revision.

---

## 5. Comparative Mining Governance Analysis

### 5.1 Guinea

Guinea's mining sector is governed by Law L/2011/006/CNT of 9 September 2011, as amended by Law L/2013/053/CNT of 8 April 2013. The Code grants the state an automatic, non-dilutable free-carried interest of 15 per cent in each mining-exploitation company, with an option to acquire an additional cash participation up to a total maximum of 35 per cent. The 15 per cent shareholding cannot be diluted by any share-capital increase. This structure, formally robust, has historically been weakly operationalised through the Société Guinéenne du Patrimoine Minier (SOGUIPAMI).

Since the September 2021 coup that brought President Mamadi Doumbouya's transitional government to power, Guinea has pursued an aggressive resource-nationalist agenda. The most consequential single move was the cancellation, announced on 26 May 2025, of 129 mineral-exploration permits, primarily covering gold deposits. This followed an earlier purge of 51 mining licences earlier the same month covering bauxite, gold, diamond, graphite and iron concessions. Guinea's Minister of Mines, Bouna Sylla, framed the revocations as enforcement of contractual obligations. Affected operators included the Australian-listed Resolute Mining, which lost three permits (Niagassola, Doko and Siguiri-Kouroussa), with one tied to a USD 175 million transaction involving AngloGold Ashanti.

The most financially material revocation involved Emirates Global Aluminium's Guinea Alumina Corporation. EGA recorded a full impairment of GAC's value of AED 2.5 billion (approximately USD 680 million) during 2025; the total Guinea-attributable charge for 2025 was AED 2.81 billion (USD 765 million), compared with AED 1.64 billion (USD 447 million) in 2024. EGA's reported net profit fell to AED 2.12 billion (USD 578 million) in 2025 from AED 2.62 billion (USD 715 million) in 2024. On 6 May 2026, Guinea, EGA and GAC announced a definitive settlement, negotiated through the President of the Paris Bar Association, providing for a lump-sum payment from Guinea to GAC in exchange for the transfer of GAC assets to the Nimba Mining Company and the renewal of the CBG–EGA bauxite-supply agreements. The settlement resolves the conflicting figures appearing across the source drafts: the USD 680 million write-down refers specifically to the full impairment of GAC's value, while the USD 765 million total represents the broader Guinea-attributable charge incorporating that impairment together with associated costs.

Concurrently, Axis International Ltd, a UAE-based bauxite producer holding 85 per cent of Axis Minerals Resources SA, filed an ICSID arbitration claim seeking USD 28.9 billion in damages following the May 2025 revocation of its Boffa bauxite permit. The claim, filed on 25 December 2025 and registered on 16 January 2026, invokes both the 2011 Guinea–UAE bilateral investment treaty and Guinea's 1995 Investment Code, and asserts proven reserves of more than 800 million metric tonnes at Boffa and 2024 production of 18 million tonnes. The claim — among the largest in the history of investment arbitration against an African state — exceeds Guinea's annual national budget and rivals its nominal GDP, illustrating the financial-leverage asymmetry between sovereign respondents and treaty claimants. Related arbitration proceedings have been initiated by Nomad Bauxite Corporation (November 2025) and a coalition of UAE-registered entities including Nimba Investment and Emirates Minting Factory (registered 22 December 2025).

The Simandou iron-ore project, simultaneously inaugurated at Morebaya port on 11 November 2025, represents the obverse face of Guinean resource policy. Held jointly by SimFer (85 per cent) and the Government of Guinea (15 per cent) for Blocks 3 and 4, and by Winning Consortium Simandou (operating in partnership with the Government for Blocks 1 and 2), the project entails an integrated mine-rail-port system valued at approximately USD 20 billion, including more than 600 kilometres of trans-Guinean railway. First ore was loaded for rail transport in October 2025, and the first vessel-loaded shipment took place from the WCS port in December 2025, with cargo expected to land in China in January 2026. The shared rail-and-port infrastructure is co-developed by SimFer, WCS, Baowu and the Government of Guinea. IMF Country Report 24/131 (17 May 2024) projects, using the DIGNAR model, that real GDP would be 26 per cent higher by 2030 compared with a baseline without Simandou, with potential currency appreciation of around 3.4 per cent in 2025 and 1.8 per cent in 2030, and the debt-to-GDP ratio potentially falling by 2.5 percentage points by 2030.

Guinea achieved a "high" overall score of 88 points out of 100 under the 2019 EITI Standard on 16 February 2022, with component scores of 91 on "Outcomes and impact" and 83 on "Transparency". The next validation under the 2023 EITI Standard commenced on 1 October 2025. The NRGI 2021 RGI awarded Guinea's mining sector 62 out of 100, an improvement of six points on the 2019 interim evaluation. Beneficial-ownership disclosure remains a structural weak point: legislation drafted in 2019 and resubmitted to Parliament in 2024 remains pending enactment as at May 2026; a 2020 ministerial circular introduced a beneficial-ownership declaration form, and a 2022 EITI request reached only nine of approximately 450 operating mining companies. On 30 December 2025, the Government of Guinea published two sets of Simandou-related agreements on the Ministry of Mines website, representing a significant disclosure step.

### 5.2 Ghana

Ghana's mining sector is governed by the Minerals and Mining Act 2006 (Act 703) and its amendments (Acts 794, 900 and 995), supplemented by the Ghana Gold Board Act 2025 (Act 1140), assented to by the President on 2 April 2025, and the Minerals and Mining (Royalty) Regulations 2025. Act 1140 establishes the Ghana Gold Board (GoldBod) as the sole authority with exclusive rights to buy, sell, weigh, grade, assay, value and export gold and other precious minerals in Ghana, replacing the Precious Minerals Marketing Company. Sections 26, 27 and 28 of Act 1140 establish a tiered licensing regime and effectively bar direct foreign participation in the local gold-trading market, although foreign investors may participate as approved off-takers or through joint ventures with licensed Ghanaian entities. The Board is empowered to appoint inspectors with the search and investigation powers of a police officer.

The Minerals and Mining (Royalty) Regulations 2025 replaced the flat 5 per cent gold royalty with a sliding scale running from 5 per cent to 12 per cent, with the maximum 12 per cent rate triggered when gold prices exceed USD 4,500 per ounce — a threshold which, with gold trading above USD 5,000 per ounce in early 2026, was breached immediately upon implementation. Lithium royalties were similarly placed on a 5–12 per cent sliding scale linked to spodumene-concentrate prices between USD 1,500 and USD 3,200 per tonne. All other minerals retained the flat 5 per cent rate. The reform was opposed by joint diplomatic representations from the United States, China and several Western governments, but the Ghanaian Minerals Commission, under CEO Isaac Tandoh, proceeded with implementation.

The Ewoyaa lithium project, operated by Atlantic Lithium through its Ghanaian subsidiary Barari DV Ghana Limited, was ratified by the Parliament of Ghana on 19 March 2026 (formally announced by the company on 20 March 2026), following the December 2025 withdrawal and resubmission of a revised lease. The ratified fifteen-year lease incorporates the new sliding-scale royalty. Half of Ewoyaa's projected 3.6 million tonnes of spodumene concentrate over a twelve-year mine life is committed to Elevra Lithium, the merged entity of Piedmont Lithium and Sayona Mining. The Minerals Income Investment Fund (MIIF) holds an exact 6 per cent contributing interest, with USD 27.9 million covering all Atlantic Lithium's tenements in Ghana, out of a total MIIF investment of USD 32.9 million, per MIIF CEO Edward Nana Yaw Koranteng. Atlantic Lithium had laid off over 100 workers in November 2025, reducing its workforce from 167 to 62 employees due to ratification delays, before securing up to USD 16.4 million in March 2026 funding from Ghanaian institutional investors and Long State Investments to advance the project pending the final investment decision; approximately USD 185 million in remaining financing is required to construct the mine.

Gold Fields Limited's Damang mining lease, granted on 18 April 1995, expired on 18 April 2025; the Minerals Commission declined to renew the lease, and Gold Fields publicly acknowledged the non-renewal on 12 April 2025, citing engagements with the Minister of Lands and Natural Resources. Active mining at Damang had ceased in 2023 as the company processed stockpiles, and no mineral reserves were declared in Gold Fields' 2024 annual report. The Ghanaian Government subsequently announced plans to award the lease to one of three competing bidders — Engineers & Planners, BCM International, or the Vortex Resources consortium — with revival of the mine estimated by Tandoh at USD 600 million to USD 1 billion.

The galamsey environmental crisis remains Ghana's most acute mining-governance pathology. The Water Resources Commission, through its Executive Secretary Ben Ampomah, has documented that approximately 60 per cent of Ghana's water bodies are polluted, predominantly through illegal small-scale gold mining concentrated in south-western Ghana. (Drafts that attributed this figure to a World Health Organization report are incorrect; the authoritative source is the Water Resources Commission.) In August 2024, Ghana Water Company Limited reported average turbidity of 14,000 NTU in the Pra River basin against the 2,000 NTU design threshold for adequate treatment, forcing the Sekyere Hemang Water Treatment Plant to operate at approximately one-quarter of installed capacity. (The 500 NTU threshold figure appearing in some draft material is incorrect; the authoritative GWCL figure is 2,000 NTU.) By 2025, turbidity in some monitored stretches had risen to 32,000 NTU, prompting shutdowns including at the Kwanyako water-treatment plant; GoldBod Chief Executive Officer Sammy Gyamfi publicly confirmed the underlying turbidity data on JoyFM's *Super Morning Show*, characterising the figures as part of a "half-truth" only in the sense that other indicators showed selective improvement.

The political costs of the galamsey crisis crystallised on 6 August 2025, when a Ghanaian military Z-9 helicopter en route from Accra to an anti-galamsey event near Obuasi in the Ashanti region crashed in the Adansi forest, killing all eight people aboard, including Defence Minister Edward Omane Boamah and Environment Minister Ibrahim Murtala Muhammed. Ghana's 2024 gold production reached 140.6 tonnes (World Gold Council, *Gold Demand Trends Full Year 2024*), retaining the country's position as Africa's largest gold producer. Per Michael Edem Akafia, President of the Ghana Chamber of Mines, at the Chamber's 97th Annual General Meeting on 30 May 2025 in Accra, artisanal and small-scale gold mining accounted for 1.9 million ounces in 2024 — a 70.1 per cent increase from 1.1 million ounces in 2023 — while large-scale production stayed essentially stagnant at around 2.9 million ounces. The NRGI 2021 RGI awarded Ghana's mining sector 69 out of 100.

### 5.3 Côte d'Ivoire

Côte d'Ivoire's mining sector is governed by Law No. 2014-138 of 24 March 2014, implemented by Decree No. 2014-397 of 25 June 2014. The Mining Code grants the state a 10 per cent free-carried, non-dilutable participation in each mining-exploitation company, with an option to acquire an additional participation for value up to 15 per cent of share capital. Corporate income tax is set at 25 per cent, and the regime provides for a five-year income-tax holiday from the commencement of commercial production. Article 11 imposes a five-year cooling-off period during which persons with access to strategic mining information are prohibited from taking direct or indirect interests in mining companies; Article 125 establishes the Local Mining Development Fund.

The 2025 Finance Act, adopted at the end of 2024, raised the ad-valorem gold royalty rate by up to two percentage points across all price bands, replacing the previous 3–6 per cent contract-linked range with rates reaching 8 per cent above USD 2,000 per ounce, applicable retroactively from January 2025. In April 2024, the Government passed a law creating a beneficial-ownership register; although Article 15 provides for public access, implementing Decree No. 2024-583 limits accessible data to general entity-level information, restricting disclosure of beneficial-owner identities under its Article 8. As a member of ECOWAS, Côte d'Ivoire is required by Directive C/DIR.2/07/23 to implement a central register of beneficial ownership of legal entities by 1 January 2027.

Côte d'Ivoire's gold output reached 58 tonnes in 2024, up from 51 tonnes in 2023 and 24 tonnes in 2015. Jean-Claude Diplo, outgoing president of the Groupement des Producteurs de Mines d'Or de Côte d'Ivoire (GPMCI), told Reuters: "Ivory Coast's gold production would rise to 62 metric tons this year from 58 tons in 2024. Growth will come from the Lafigue gold mine, which is about to go into full production." Diplo further projected 100 tonnes by 2030, contingent on full ramp-up of Endeavour Mining's Lafigué mine (inaugurated 19 October 2024; first gold pour 28 June 2024). Per Endeavour Mining's Q3 2025 financial report (13 November 2025), the company maintained its full-year production guidance of at least 180,000 ounces of gold at Lafigué for 2025, with feasibility-study expectations of approximately 200,000 ounces per annum at an all-in sustaining cost of approximately USD 871 per ounce over a 12.8-year mine life. Two further decrees adopted by Cabinet on 4 February 2026 granted mining permits for the Assafou (Endeavour Mining) and Doropo (Resolute Mining) gold projects.

On 11 July 2025, the World Bank announced the launch of the Multistakeholder Partnership for Sustainable and Responsible Small-Scale Mining (MSPI) in Côte d'Ivoire, bringing together the Government, the World Gold Council, Endeavour Mining, Perseus Mining and the Chamber of Mines of Côte d'Ivoire. The World Bank's official press release confirms that "the newly launched Multistakeholder Partnership for Sustainable and Responsible Small-Scale Mining (MSPI) brings together government agencies, international institutions, and major industry players in an effort to formalize a historically informal and illicit sector that sustains over 500,000 livelihoods."

The Integrated Mineral and Energy Resources Policy (PIRME) was adopted by the Council of Ministers on 3 December 2025. Implementation will require CFA 38,000 billion (approximately USD 67–68 billion) over fifteen years, with allocations of 41 per cent to energy, 30 per cent to mining and 29 per cent to hydrocarbons, and aims to raise the mining-energy sector's contribution to GDP from 7 per cent in 2022 to 14 per cent by 2040. PIRME articulates the entire value chain from exploration through local processing and is positioned as the second economic pillar after agriculture. Côte d'Ivoire was not assessed in the 2021 NRGI Resource Governance Index, although it remains an active EITI implementing country.

### 5.4 Comparative synthesis

The three jurisdictions exhibit structurally complementary governance pathologies rather than identical institutional failures. Guinea's pathology is hyper-discretionary, with formally robust law operationalised through politically inflected ministerial decisions that have generated significant arbitration exposure. Ghana's pathology is environmental-enforcement-driven: the formal regulatory architecture has been strengthened markedly through Act 1140 and the 2025 royalty regulations, but enforcement against the galamsey economy remains structurally weak. Côte d'Ivoire's pathology is one of an ambitious but under-monitored expansion trajectory, with rapid expansion of fiscal architecture under PIRME outpacing institutional capacity. Crucially, these complementary pathologies imply that a regional continuous-assurance architecture would yield substantially greater institutional returns than purely national deployments, justifying the regional design of the ACCI Model.

---

## 6. System Architecture Design

The ACCI Model is operationalised as a five-module AI-enabled Investor and Compliance Intelligence System. Each module is specified in terms of functional purpose, data architecture, computational logic, AI/NLP workflows, regulatory-intelligence integration, risk-scoring approach and operational-governance implications.

### 6.1 Module 1: Contract and Agreement Intelligence

**Functional purpose:** to convert mineral conventions, mining leases, royalty agreements and related instruments into machine-readable, queryable contractual ontologies supporting downstream monitoring.

**Data architecture:** a document repository populated from EITI contract disclosures, the African Mining Legislation Atlas, the Open Contracting Data Standard Resource Contracts extension, and direct ministerial deposits. Each contract is decomposed into clauses tagged against an ontology comprising obligation type (fiscal, environmental, social, infrastructure, beneficial-ownership, local content), temporal scope, monetary thresholds, escalation triggers and counterparty identities.

**Computational logic and AI/NLP workflows:** a multilingual (French, English and Portuguese) clause-extraction pipeline employing transformer-based language models fine-tuned on a corpus of West African mining conventions. The pipeline performs three stages: (i) document segmentation and clause boundary detection; (ii) clause classification against the ontology; (iii) parameter extraction (amounts, dates, parties, thresholds). Output is validated through a human-in-the-loop review queue prior to commitment to the canonical knowledge graph.

**Regulatory-intelligence integration:** clauses are cross-referenced to the prevailing legislation of each jurisdiction (Guinea L/2013/053/CNT; Ghana Act 703 and amendments; Côte d'Ivoire Law 2014-138), with deviations from statutory template provisions flagged for ministerial review.

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

**Computational logic:** a rules engine evaluating each ingested data point against the corresponding contractual obligation, generating compliance, partial-compliance, non-compliance or insufficient-evidence verdicts. Rules are versioned to accommodate statutory change (for example, the transition from Ghana's flat 5 per cent gold royalty to the 5–12 per cent sliding scale under the Minerals and Mining (Royalty) Regulations 2025, and Côte d'Ivoire's transition from the 3–6 per cent contract-linked range to the 8 per cent ad-valorem rate under the 2025 Finance Act).

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

### 8.2 Regional tripartite deployment

Following pilot validation, a tripartite deployment across Guinea, Ghana and Côte d'Ivoire under ECOWAS auspices would harness the complementary pathologies identified in Section 5.4. Côte d'Ivoire's PIRME provides a fiscal-architecture anchor; Ghana's GoldBod provides an artisanal-mining enforcement anchor; Guinea's bauxite-iron portfolio provides a large-contract monitoring anchor. ECOWAS Directive C/DIR.2/07/23 on beneficial-ownership harmonisation provides legal scaffolding.

### 8.3 Institutional adoption barriers

Three principal barriers are likely. **Capacity barriers** — the limited cadre of data-science and legal-engineering personnel within ministries — can be addressed through structured secondments from EITI national secretariats, the African Development Bank and African universities. **Political-economy resistance** — from rent-seekers and from operators preferring opacity — must be addressed through phased disclosure architectures and explicit ministerial sponsorship at head-of-government level. **Legal-architectural barriers** — particularly around data sovereignty, the admissibility of algorithmic outputs in regulatory and arbitral proceedings, and conflicts with stabilisation clauses — require explicit statutory authorisation and harmonisation with international evidence standards.

### 8.4 Funding architecture

A blended funding architecture would combine national budget allocations from mineral-revenue surpluses (Côte d'Ivoire's expanding fiscal space under the new 8 per cent gold royalty; Guinea's Simandou-related revenues projected by the IMF at USD 700 million to USD 1.7 billion annually before 2035, rising to up to USD 2.7 billion thereafter); concessional finance from the World Bank's Extractives Global Programmatic Support and the AfDB; technical assistance from the EITI International Secretariat and NRGI; and private-sector contributions from operators with reputational incentives.

### 8.5 Scenario analysis

Three scenarios are considered. **Baseline (no deployment)**: existing pathologies persist, arbitration exposure grows, environmental enforcement remains weak, fiscal capture continues. **Partial deployment (Guinea-only, Modules 1 and 3)**: information-asymmetry gap narrows on contract-monitoring; arbitration exposure stabilises; revenue capture improves modestly. **Full tripartite deployment (all five modules across all three jurisdictions)**: regional governance space tightens substantially; arbitration exposure declines materially; environmental enforcement becomes evidentially robust; investor confidence improves through algorithmic predictability.

---

## 9. Discussion

The ACCI Model raises five substantive discussion questions. **Digital sovereignty**: continuous-assurance architectures must be hosted within host-state data-custody regimes, with explicit safeguards against extraterritorial access by treaty counterparties or arbitration tribunals; failure to resolve this question ex ante risks generating evidential dependencies that compromise sovereign litigation posture. **State bargaining power**: the compression of information asymmetry materially shifts the bargaining frontier in renegotiations, but only where political insulation from capture is sufficient to translate analytical capacity into negotiating outcomes; the Guinean experience with permit revocations under Bouna Sylla illustrates both the upside and the legal risk of state assertiveness. **Compliance automation ethics**: automated breach detection raises proportionality questions, particularly where small-scale operators may face escalation triggers calibrated to large-operator data baselines; the Ivorian MSPI provides a structured policy instrument for differentiated artisanal-mining treatment. **Algorithmic legitimacy**: legitimacy is secured not by accuracy alone but by contestability, explainability and procedural fairness; the ACCI Model's preservation of human-anchored enforcement escalation is central to its legitimacy claim. **Public trust and transparency futures**: continuous-assurance dashboards can either strengthen or erode trust depending on whether they are perceived as instruments of accountability or of intrusion; the Ghanaian galamsey crisis demonstrates the political-economy salience of credible environmental disclosure.

The principal limitations of the present study are the absence of empirical implementation evidence; the dependence on secondary reporting for several factual flashpoints (particularly the precise corporate structure of Compagnie du TransGuinéen and certain Guinean beneficial-ownership instruments); and the inherent contestability of forward-looking governance projections in a region marked by political volatility.

---

## 10. Policy Recommendations

**National governments.** Guinea should (i) operationalise the Société Guinéenne du Patrimoine Minier as the institutional custodian of Module 1 contractual ontologies; (ii) enact the pending 2019/2024 beneficial-ownership legislation; (iii) publish all active mining contracts in machine-readable form pursuant to EITI Requirement 2.4 (building on the 30 December 2025 Simandou disclosure); and (iv) establish a Simandou-anchored pilot of the Performance and Compliance Monitoring module by Q4 2026, with explicit triage protocols for licence-revocation decisions to reduce future arbitration exposure of the Axis International type. Ghana should (i) embed the ACCI architecture within GoldBod's statutory remit under Sections 26–28 of Act 1140; (ii) integrate continuous water-quality monitoring with environmental-enforcement escalation pathways under the Environmental Protection Act 2025 (Act 1124), with NTU thresholds calibrated to the 2,000 NTU treatment-design standard; (iii) extend the sliding-scale royalty monitoring to lithium under the Ewoyaa mining lease; and (iv) introduce explicit statutory authorisation for the use of algorithmic compliance outputs in administrative and judicial proceedings. Côte d'Ivoire should (i) anchor the ACCI architecture within the PIRME implementation framework; (ii) publish the beneficial-ownership register data envisaged by the April 2024 law in full pursuant to Article 15, repealing the access restrictions in Decree No. 2024-583; (iii) extend the MSPI artisanal-mining formalisation initiative through ACCI-enabled traceability; and (iv) integrate the 2025 Finance Act 8 per cent ad-valorem gold royalty with real-time monitoring across all licensed operations.

**Regional bodies (ECOWAS and WAEMU).** ECOWAS should adopt a regional Continuous Compliance Intelligence Protocol harmonising data standards, interoperability requirements and mutual-recognition principles across the three jurisdictions, drawing on the 2023 Directive C/DIR.2/07/23 on beneficial ownership as a precedent. WAEMU should integrate continuous-assurance architectures into the regional fiscal-surveillance framework.

**Development partners.** The World Bank's Extractives Global Programmatic Support, the African Development Bank and the EU should structure a coordinated Continuous Compliance Intelligence Facility providing technical assistance, concessional finance and capacity-building for ACCI deployment. The EITI International Secretariat should develop a dedicated continuous-assurance supplement to the 2023 EITI Standard.

**Investors.** Investors should adopt ACCI-aligned disclosure as a voluntary leading practice, recognising that algorithmic predictability of compliance outcomes is materially preferable to discretionary regulatory volatility. Operators with pending or anticipated ICSID exposure (notably EGA following the 6 May 2026 settlement; SimFer through Simandou) have strong reputational and legal incentives to participate.

**Academic institutions.** West African universities should establish dedicated postgraduate programmes in mining-governance analytics, drawing on the design-science systems-specification methodology articulated in this paper, and should partner with NRGI, the African Tax Administration Forum and the African Centre for Energy Policy.

---

## 11. Conclusion

The May 2025 – May 2026 cluster of mining-governance events in Guinea, Ghana and Côte d'Ivoire constitutes a natural experiment in the limits of episodic, paper-based compliance. The cumulative cost — measured in arbitration exposure (Axis International's USD 28.9 billion claim against Guinea; EGA's USD 765 million Guinea-attributable charge in 2025), environmental degradation (Ghana's 32,000 NTU river-turbidity readings against a 2,000 NTU treatment threshold), fiscal opportunity loss and political instability (Ghana's 6 August 2025 helicopter crash) — vastly exceeds the marginal investment required to deploy the Adaptive Continuous Compliance Intelligence Model articulated in this paper. The ACCI Model is not a panacea. It will not resolve the deeper political-economy contradictions of resource-rich states with weak institutions. But it offers a tractable, theoretically grounded and empirically calibrated architecture for compressing information asymmetry, strengthening institutional learning and reorienting West African mining governance toward continuous evidential robustness. The Guinea-first pilot pathway, scaled to a tripartite regional deployment under ECOWAS auspices, represents the most actionable entry point, and the contribution of this paper to the *Resources Policy* literature is the integration of principal-agent, institutional-capacity, information-asymmetry, continuous-assurance and algorithmic-governance theories into a single operational framework suitable for both theoretical refinement and policy implementation.

---

## References (Harvard UK style)

Acemoglu, D. and Robinson, J.A. (2012) *Why Nations Fail: The Origins of Power, Prosperity, and Poverty*. New York: Crown Business.

African Development Bank (2023) *African Economic Outlook 2023: Mobilizing Private Sector Financing for Climate and Green Growth*. Abidjan: AfDB.

African Mining Legislation Atlas (AMLA) (2024) *Guinea Country Profile*. Available at: https://www.a-mla.org/en/country/Guinea.

Akerlof, G.A. (1970) 'The market for "lemons": quality uncertainty and the market mechanism', *Quarterly Journal of Economics*, 84(3), pp. 488–500.

Al Jazeera (2025) 'Ghana's defence, environment ministers among 8 killed in helicopter crash', 6 August. Available at: https://www.aljazeera.com/news/2025/8/6/ghanian-defence-environment-ministers-killed-in-helicopter-crash.

Atlantic Lithium Ltd (2026) *Parliamentary Ratification of the Ewoyaa Mining Lease — Company Announcement*, 20 March. Perth: Atlantic Lithium.

Auty, R.M. (1993) *Sustaining Development in Mineral Economies: The Resource Curse Thesis*. London: Routledge.

Bebbington, A., Hinojosa, L., Bebbington, D.H., Burneo, M.L. and Warnaars, X. (2008) 'Contention and ambiguity: mining and the possibilities of development', *Development and Change*, 39(6), pp. 887–914.

Bloomberg (2025) 'Ghana takes over Gold Fields mine after failed renewal bid', 16 April.

Campbell, B. (ed.) (2009) *Mining in Africa: Regulation and Development*. London: Pluto Press / IDRC.

CNBC Africa (2025) 'Axis International seeks $28.9 billion from Guinea over revoked bauxite permit', 29 December.

Collier, P. (2010) *The Plundered Planet: How to Reconcile Prosperity with Nature*. Oxford: Oxford University Press.

Côte d'Ivoire, Government of (2014) *Loi No. 2014-138 du 24 mars 2014 portant Code Minier*. Abidjan.

Côte d'Ivoire, Government of (2024) *Loi portant création du registre des bénéficiaires effectifs*, avril 2024. Abidjan.

Côte d'Ivoire, Government of (2024) *Décret No. 2024-583 portant application de la loi sur le registre des bénéficiaires effectifs*. Abidjan.

Côte d'Ivoire, Council of Ministers (2025) *Politique Intégrée des Ressources Minérales et Énergétiques (PIRME)*, adoptée le 3 décembre 2025. Abidjan.

Dabafinance (2025) 'Côte d'Ivoire gold production set to reach record in 2025'.

Devdiscourse (2025) 'Côte d'Ivoire launches major reform to legalize and transform gold mining', July.

Ecofin Agency (2025) 'Côte d'Ivoire unveils mines-energy strategy to drive economic transformation', 10 December.

Ecofin Agency (2026) 'Côte d'Ivoire grants mining permits for $1.25 billion gold projects', 5 February.

Ecofin Agency (2026) 'Guinea reaches settlement with EGA over revoked bauxite license', 7 May.

EITI International Secretariat (2022) *Guinea Validation Report 2021*. Oslo: EITI.

EITI International Secretariat (2023) *The EITI Standard 2023*. Oslo: EITI.

EITI International Secretariat (2024) *Côte d'Ivoire Country Page*. Available at: https://eiti.org/countries/cote-divoire.

EITI International Secretariat (2025) *Guinea Country Page*. Available at: https://eiti.org/countries/guinea.

Emirates Global Aluminium (2025) *Press release: EGA reports resilient H1 financial performance with industry-leading aluminium margins and strategic progress, despite Guinea supply disruption and asset write-down*, 4 September.

Endeavour Mining (2024) *Press release: Endeavour Achieves First Gold Pour at Lafigué Mine in Côte d'Ivoire*, 28 June.

Endeavour Mining (2025) *Q3 2025 Financial Report*, 13 November.

Free Press Journal (2025) 'Axis International launches $28.9 billion arbitration against Guinea for unlawful seizure of major bauxite mine'.

Ghana, Republic of (2006) *Minerals and Mining Act 2006 (Act 703)*. Accra: Government Printer.

Ghana, Republic of (2025) *Ghana Gold Board Act 2025 (Act 1140)*. Accra: Government Printer.

Ghana, Republic of (2025) *Minerals and Mining (Royalty) Regulations 2025*. Accra: Government Printer.

Ghana Chamber of Mines (2025) *97th Annual General Meeting Report*, 30 May. Accra.

Gold Fields Ltd (2025) *Press statement on the non-renewal of the Damang mining lease*, 12 April. Johannesburg.

Graphic Online (2025) 'Ghana gov't rejects Gold Fields Damang lease renewal for another 30 years', April.

Guinea, Republic of (2011) *Loi L/2011/006/CNT du 9 septembre 2011 portant Code Minier*. Conakry.

Guinea, Republic of (2013) *Loi L/2013/053/CNT du 8 avril 2013 modifiant certaines dispositions du Code Minier*. Conakry.

Hevner, A.R., March, S.T., Park, J. and Ram, S. (2004) 'Design science in information systems research', *MIS Quarterly*, 28(1), pp. 75–105.

Hilson, G. (2017) 'Shootings and burning excavators: some rapid reflections on the Government of Ghana's handling of the informal Galamsey mining "menace"', *Resources Policy*, 54, pp. 109–116.

Hilson, G. and McQuilken, J. (2014) 'Four decades of support for artisanal and small-scale mining in sub-Saharan Africa: a critical review', *Extractive Industries and Society*, 1(1), pp. 104–118.

Humphreys, M., Sachs, J.D. and Stiglitz, J.E. (eds.) (2007) *Escaping the Resource Curse*. New York: Columbia University Press.

ICLG (2025) 'Ghana Gold Board Act 2025 — briefing'. International Comparative Legal Guides.

Intergovernmental Forum on Mining, Minerals, Metals and Sustainable Development (IGF) (2023) *Mining Policy Framework Assessment*. Winnipeg: IISD.

International Finance Corporation (2012) *Performance Standards on Environmental and Social Sustainability*. Washington, DC: World Bank Group.

International Monetary Fund (2024) *Guinea: Selected Issues, Country Report No. 24/131*, 17 May. Washington, DC: IMF.

Jensen, M.C. and Meckling, W.H. (1976) 'Theory of the firm: managerial behavior, agency costs and ownership structure', *Journal of Financial Economics*, 3(4), pp. 305–360.

Kitchin, R. (2014) *The Data Revolution: Big Data, Open Data, Data Infrastructures and Their Consequences*. London: SAGE.

KOACI (2025) 'Côte d'Ivoire mines et énergie: le pays dévoile sa stratégie intégrée', 3 décembre.

Library of Congress (2013) 'Guinea: Mining Code amended', Global Legal Monitor, 31 July.

Mayer Brown (2024) *Africa Mining Know-How: Guinea*. London: Mayer Brown.

Minerals Income Investment Fund (MIIF) (2023) *Press release: MIIF Investment in Atlantic Lithium*. Accra: MIIF.

MINING.COM (2025) 'Guinea cancels 129 exploration permits, further tightening control', 27 May.

MINING.COM (2026) 'Atlantic Lithium wins key Ghana approval for Ewoyaa mine', 20 March.

MINING.COM (2025) 'Axis sues Guinea for $29B over bauxite permit revocation'.

Mining Weekly (2026) 'Ghana's Parliament ratifies Atlantic Lithium's Ewoyaa mining lease', 20 March.

Mining Technology (2025) 'Gold Fields to close Damang mine in Ghana after lease renewal rejection'.

Modern Ghana (2024) 'Galamsey menace: water crisis hits Cape Coast, Elmina'.

MyJoyOnline (2025) 'Improved turbidity in key rivers shows progress in galamsey fight — Sammy Gyamfi'.

NBC News (2025) 'Helicopter crash in Ghana kills defense and environment ministers and 6 other people', 6 August.

Natural Resource Governance Institute (NRGI) (2021) *2021 Resource Governance Index: Guinea (Mining)*. New York: NRGI.

Natural Resource Governance Institute (NRGI) (2021) *2021 Resource Governance Index: Ghana (Mining)*. New York: NRGI.

North, D.C. (1990) *Institutions, Institutional Change and Economic Performance*. Cambridge: Cambridge University Press.

OECD (2016) *OECD Due Diligence Guidance for Responsible Supply Chains of Minerals from Conflict-Affected and High-Risk Areas*. 3rd ed. Paris: OECD.

Open Contracting Partnership (2020) *Open Contracting Data Standard for Public-Private Partnerships and Resource Contracts*. Available at: https://standard.open-contracting.org.

Open Ownership (2024) *Côte d'Ivoire country profile*. London: Open Ownership.

Oxford Business Group (2024) *The Report: Ghana 2024 — Mining*. London: OBG.

PIRME (2025) *Document de politique intégrée des ressources minérales et de l'énergie*. Abidjan: Ministère des Mines, du Pétrole et de l'Énergie.

Reuters (via MINING.COM) (2025) 'Ivory Coast gold output expected to reach record high this year'.

Rio Tinto (2025) *Form 6-K — Q2 2025 Operations Review*. London/Melbourne: Rio Tinto.

Rio Tinto (2025) *Form 6-K — Q3 2025 Operations Review*. London/Melbourne: Rio Tinto.

Rio Tinto (2025) *Media Release: Simandou partners celebrate start of operations*, 11 November.

Rio Tinto (2026) *Form 6-K — Q4 2025 Operations Review*, 21 January.

Sachs, J.D. and Warner, A.M. (1995) *Natural Resource Abundance and Economic Growth*. NBER Working Paper No. 5398. Cambridge, MA: NBER.

Stiglitz, J.E. (1985) 'Information and economic analysis: a perspective', *Economic Journal*, 95 (Supplement), pp. 21–41.

Spence, M. (1973) 'Job market signaling', *Quarterly Journal of Economics*, 87(3), pp. 355–374.

SWISSAID (2024) *African Gold Report — Ghana*. Bern: SWISSAID.

The National (2026) 'EGA settles disputes with Guinea over bauxite mine project', 6 May.

TRT Afrika / Reuters (2025) 'West Africa reassesses gold royalties amid record-breaking prices'.

Ulbricht, L. and Yeung, K. (2022) 'Algorithmic regulation: a maturing concept for investigating regulation of and through algorithms', *Regulation & Governance*, 16(1), pp. 3–22.

US Department of State (2025) *2025 Investment Climate Statements: Côte d'Ivoire*. Washington, DC: US Department of State.

Vasarhelyi, M.A. and Halper, F.B. (1991) 'The continuous audit of online systems', *Auditing: A Journal of Practice and Theory*, 10(1), pp. 110–125.

Vasarhelyi, M.A., Alles, M.G. and Williams, K.T. (2010) 'Continuous assurance for the now economy', Institute of Chartered Accountants in Australia / Rutgers Business School Research Report.

Visual Capitalist (2025) 'Visualizing gold production by country in 2024' (World Gold Council data).

World Bank (2025) *Press release: Côte d'Ivoire Moves to Formalize Its Vast Informal Gold Mining Sector*, 11 July. Washington, DC: World Bank.

World Bank (2024) *The Multistakeholder Partnership Initiative for Sustainable and Responsible Artisanal and Small-Scale Mining (MSPI) — Programme Brief*. Washington, DC: World Bank.

World Gold Council (2025) *Gold Demand Trends Full Year 2024*. London: WGC.

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
| 8 | Ghana Act 703 and amendments (Acts 794, 900, 995) | All drafts | **VERIFIED** | No | As stated |
| 9 | Ewoyaa lithium parliamentary ratification March 2026; prior Dec 2025 withdrawal | Drafts | **VERIFIED** (*Mining Weekly*; *MINING.COM*; News Ghana; Ecofin) | No | "Ratified by Parliament on 19 March 2026 (company announcement 20 March 2026); December 2025 withdrawal and resubmission of revised lease" |
| 10 | Minerals and Mining (Royalty) Regulations 2025: gold 5–12% (max at $4,500/oz); lithium 5–12% ($1,500–$3,200/t) | Drafts | **VERIFIED** (Reuters via MINING.COM; *Miningmx*; *African Leadership Magazine*; Serrari) | No | As stated |
| 11 | Ghana Gold Board (GoldBod) Act 2025 (Act 1140) and statutory powers | Drafts | **VERIFIED** (B&P Associates; Legalstone; Mondaq; ICLG; goldbod.gov.gh) | No | "Act 1140, assented 2 April 2025; GoldBod as sole authority to buy/sell/weigh/grade/assay/value/export gold and other precious minerals; police-equivalent inspector powers" |
| 12 | Galamsey ~60% water bodies polluted (attributed to WHO in one draft) | Drafts | **CONTESTED — REMOVE WHO attribution**; correct attribution is Water Resources Commission (Ben Ampomah) | Yes — correct attribution | "~60% of Ghana's water bodies polluted, per Water Resources Commission Executive Secretary Ben Ampomah; the WHO attribution in some draft material is incorrect" |
| 13 | Turbidity 14,000 NTU (Aug 2024) rising to 32,000 NTU; Kwanyako shutdown; treatment threshold 500 vs 2,000 NTU | Drafts diverge on threshold | **VERIFIED** — threshold is 2,000 NTU (Ghana Water Company Limited); 500 NTU is incorrect; 32,000 NTU confirmed publicly by Sammy Gyamfi | Yes — RESOLVE: 2,000 NTU is correct | "GWCL reported average turbidity of 14,000 NTU in August 2024 against 2,000 NTU treatment-design threshold; subsequent readings of 32,000 NTU publicly confirmed by GoldBod CEO Sammy Gyamfi on JoyFM" |
| 14 | Gold Fields Damang lease non-renewal April 2025 | Drafts | **VERIFIED** (Graphic Online; Bloomberg; *Mining Technology*; Mining Review Africa) | No | "30-year lease granted 18 April 1995 expired 18 April 2025; renewal declined by Minerals Commission; Gold Fields publicly acknowledged 12 April 2025" |
| 15 | Ghana 2024 gold production 140.6 tonnes | Drafts | **VERIFIED** (World Gold Council, *Gold Demand Trends Full Year 2024*) | Yes — drop "approximately"; figure is precise | "140.6 tonnes in 2024 (World Gold Council, *Gold Demand Trends Full Year 2024*); Africa's largest gold producer" |
| 16 | MIIF ~$27.9m / 6% stake in Ewoyaa | Drafts | **VERIFIED** (MIIF official press release; Oxford Business Group) | Yes — make precise | "6% contributing interest for USD 27.9 million covering all Atlantic Lithium's Ghana tenements, within total MIIF investment of USD 32.9 million, per MIIF CEO Edward Nana Yaw Koranteng" |
| 17 | August 2025 helicopter crash killing Defence and Environment Ministers en route to anti-galamsey event | Drafts | **VERIFIED** (Al Jazeera; NBC News; CNN; Euronews) | No | "On 6 August 2025, a Ghanaian military Z-9 helicopter en route from Accra to Obuasi crashed in the Adansi forest, killing all eight on board including Defence Minister Edward Omane Boamah and Environment Minister Ibrahim Murtala Muhammed" |
| 18 | Côte d'Ivoire Mining Code Law 2014-138 (24 March 2014); 2025 Finance Act gold royalty | Drafts | **VERIFIED** (Mayer Brown via Lexology; Mondaq; EITI; *African Sustainability Matters*; TRT Afrika) | No | "Law No. 2014-138 of 24 March 2014; 2025 Finance Act raised ad-valorem gold royalty up to 8% above USD 2,000/oz, retroactive to January 2025" |
| 19 | State free-carried 10% (negotiable up to 15%); CIT 25%; five-year tax holiday | Drafts | **VERIFIED** (Mondaq; Crux Investor; Fasken) | No | "10% free-carried non-dilutable; additional up to 15% participation for value; 25% CIT; five-year income-tax holiday from commencement of commercial production" |
| 20 | Côte d'Ivoire gold production 58t (2024), forecast 62t (2025), 100t by 2030 attributed to GPMCI/Diplo (Reuters) | Drafts | **VERIFIED** (MINING.COM/Reuters; Ecofin; bne IntelliNews) | No | "58 tonnes (2024); forecast 62 tonnes (2025); target 100 tonnes by 2030 (Jean-Claude Diplo, outgoing GPMCI president, via Reuters)" |
| 21 | April 2024 beneficial-ownership register law | Drafts | **VERIFIED** (EITI; Open Ownership) — Decree 2024-583 restricts public access | Minor — note access limitations | "April 2024 law creates BO register; implementing Decree No. 2024-583 restricts public access to general entity-level data only (Article 8); ECOWAS Directive C/DIR.2/07/23 requires full central register by 1 January 2027" |
| 22 | MSPI 2025 with World Bank/World Gold Council; ~500,000 artisanal miners | Drafts | **VERIFIED** (World Bank press release 11 July 2025; Devdiscourse) | No | "Launched 11 July 2025; partners include World Bank, World Gold Council, Endeavour Mining, Perseus Mining, Chamber of Mines of Côte d'Ivoire; sector 'sustains over 500,000 livelihoods'" |
| 23 | PIRME: $68bn / 15-year framework; GDP target 14% by 2040; December 2025 adoption | Drafts diverge on exact USD figure | **VERIFIED** (AIP; KOACI; Agence Ecofin; *Africa Legal*; *Ecofin Agency*) | Yes — RESOLVE: CFA 38,000 bn ≈ USD 67–68 bn | "Adopted by Council of Ministers on 3 December 2025; CFA 38,000 billion (~USD 67–68 billion) over 15 years; targets doubling of mining-energy GDP contribution from 7% (2022) to 14% (2040); allocations 41% energy / 30% mining / 29% hydrocarbons" |
| 24 | EITI Standard 2023; OECD Due Diligence Guidance; IGF MPF; IFC PS1/PS5/PS6; OCDS Resource Contracts | Drafts | **VERIFIED** in institutional sources | No | Retain as cited |
| 25 | RGI 2021 scores: Guinea 62, Ghana 69 mining, Côte d'Ivoire not assessed | Drafts | **VERIFIED** (NRGI 2021 RGI publications) | No | As stated |
| 26 | AMLA; Vasarhelyi continuous-auditing literature; Yeung (2018) on algorithmic regulation | Drafts | **VERIFIED** in scholarly canon | No | Retain as theoretical scaffolding |
| 27 | WHO as source of 60% water-pollution figure (one draft) | One draft only | **REMOVE** — correct source is WRC Ben Ampomah | Yes — REMOVE WHO attribution | Use only WRC attribution |
| 28 | Resolute Mining permits among 129 revocations (Niagassola, Doko, Siguiri-Kouroussa) | Drafts | **VERIFIED** (Ecofin Agency) | No | As stated |
| 29 | Compagnie du TransGuinéen equity split SimFer 42.5%/WCS 42.5%/State 15% | Drafts | **UNVERIFIED** in primary sources within research budget | Yes — hedge | "Shared rail-and-port infrastructure co-developed by SimFer JV, WCS, Baowu and Government of Guinea; precise CTG equity ratios not corroborated in primary filings within the present research budget" |
| 30 | Ghana 2024 ASM gold output 1.9 million ounces; large-scale 2.9 million ounces | Drafts | **VERIFIED** (Michael Edem Akafia, Ghana Chamber of Mines 97th AGM, 30 May 2025) | Yes — precise figures | "Exactly 1.9 million ounces ASM (70.1% YoY increase from 1.1 million in 2023); large-scale stayed essentially stagnant at ~2.9 million ounces; total ~4.8 million ounces (140.6 tonnes)" |
| 31 | Lafigué mine — inauguration date and 2025 production forecast | Drafts | **VERIFIED** (Endeavour Mining 19 Oct 2024 inauguration; first gold pour 28 June 2024; Q3 2025 report) | Yes — replace vague "~200,000 oz" with sourced guidance | "Inaugurated 19 October 2024; first gold pour 28 June 2024; Endeavour Mining's Q3 2025 financial report (13 Nov 2025) maintained full-year guidance of at least 180,000 ounces for 2025; DFS contemplates ~200,000 ounces per annum at AISC ~USD 871/oz over 12.8-year mine life" |

---

**End of consolidated manuscript and fact-audit memo.**