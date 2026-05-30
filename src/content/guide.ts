// ============================================================
// guide.ts — plain-language content layer for first-time users.
//
// One source of truth for: the friendly name of every module, a
// one-line tagline, "what you can do here" bullets, a "how to read
// this page" note, and a glossary of the domain jargon that appears
// across the app. UI components (ModuleIntro, Layout nav, HelpButton,
// GlossaryTerm) read from here so the wording stays consistent and is
// edited in exactly one place.
//
// Everything here is static — it renders with no AI configured. The
// AI layer only ever *adds* a deeper, live interpretation on top.
// ============================================================

export interface ModuleGuide {
  /** Route path this guide describes (matches react-router paths). */
  route: string;
  /** Friendly, plain-language name shown as the primary label. */
  plainName: string;
  /** The official institutional name, kept as a secondary tag. */
  official: string;
  /** Module code (M1–M8) where one exists. */
  moduleCode?: string;
  /** One sentence: what this page is, in everyday words. */
  tagline: string;
  /** 2–4 concrete things a user can do here. */
  whatYouCanDo: string[];
  /** A sentence or two on how to read what's on the page. */
  howToRead: string;
}

// Keyed by the top-level route. Detail routes (e.g. /risk/:id) inherit
// their parent via moduleForPath().
export const MODULES: Record<string, ModuleGuide> = {
  '/': {
    route: '/',
    plainName: 'Overview',
    official: 'Executive Dashboard',
    tagline: 'Your daily snapshot of mining compliance across the region.',
    whatYouCanDo: [
      'See the headline numbers — active agreements, companies watched, and how many promises are being kept.',
      'Spot the most urgent risk alerts and upcoming deadlines at a glance.',
      'Click any number or the map to jump straight to the detail behind it.',
    ],
    howToRead:
      'The cards at the top are your key totals. Green is healthy, amber means "watch this", red means "act now". The map shows each mine coloured by how well that company is keeping its commitments.',
  },
  '/agreements': {
    route: '/agreements',
    plainName: 'Mining Agreements',
    official: 'Contract & Agreement Intelligence',
    moduleCode: 'M1',
    tagline: 'Every contract the government has with mining companies, in one place.',
    whatYouCanDo: [
      'Search and filter every mining agreement by company, mineral, or status.',
      'Open an agreement to see its royalty rate, expiry date, and obligations.',
      'See which contracts are active, expiring soon, or already breached.',
    ],
    howToRead:
      'Each row is one agreement. The status badge tells you if it is active, expiring, or in breach. Click a row to read the full contract detail and its track record.',
  },
  '/negotiation': {
    route: '/negotiation',
    plainName: 'Deal Benchmarking',
    official: 'Negotiation Intelligence',
    moduleCode: 'M2',
    tagline: 'Check whether our royalty deals are fair compared with similar ones.',
    whatYouCanDo: [
      'Compare each agreement’s royalty rate against the benchmark for that mineral.',
      'Spot deals that look low and could be renegotiated for more revenue.',
      'Use the figures to prepare for talks with a specific company.',
    ],
    howToRead:
      'Points below the benchmark line are deals paying less than their peers. The further below, the bigger the gap — and the stronger the case to renegotiate.',
  },
  '/performance': {
    route: '/performance',
    plainName: 'Company Scorecards',
    official: 'Performance & Compliance Monitoring',
    moduleCode: 'M3',
    tagline: 'How well each mining company keeps the promises it made.',
    whatYouCanDo: [
      'See a compliance score for every operator and how it trends over time.',
      'Find which companies are meeting, missing, or at risk of missing commitments.',
      'Open a company to review each individual promise and its status.',
    ],
    howToRead:
      'A higher score means the company is keeping more of its commitments. "At risk" means a promise is slipping; "breached" means it has been broken.',
  },
  '/risk': {
    route: '/risk',
    plainName: 'Risk Alerts',
    official: 'Breach & Risk Detection',
    moduleCode: 'M4',
    tagline: 'Automatic early warnings when something looks wrong.',
    whatYouCanDo: [
      'Review flagged issues ranked by how serious and urgent they are.',
      'See exactly which rule and evidence triggered each alert.',
      'Mark a flag as reviewed, escalate it, or open the company behind it.',
    ],
    howToRead:
      'Every alert is colour-coded by severity (critical → low) and explains, in plain terms, the rule it broke and the evidence — so you can judge it yourself, not just trust the score.',
  },
  '/transparency': {
    route: '/transparency',
    plainName: 'Public Reporting',
    official: 'Transparency & Reporting',
    moduleCode: 'M5',
    tagline: 'The figures we publish openly, and how each country scores.',
    whatYouCanDo: [
      'Compare countries side by side on compliance, royalties, and openness.',
      'Check readiness for the EITI public-reporting standard.',
      'Export a clean report to share publicly or with oversight bodies.',
    ],
    howToRead:
      'Higher bars and scores mean better transparency. The country comparison shows where each one leads or lags so you can see who to learn from.',
  },
  '/scenarios': {
    route: '/scenarios',
    plainName: 'What-If Planner',
    official: 'Fiscal Scenario Modelling',
    moduleCode: 'M6',
    tagline: 'Test how revenue changes if prices, taxes, or operators change.',
    whatYouCanDo: [
      'Move the sliders to model higher or lower commodity prices.',
      'Try different royalty rules and see the effect on government income.',
      'Compare your scenario against today’s baseline instantly.',
    ],
    howToRead:
      'The baseline is the situation today. Your changes show as the difference from it — green means more revenue for the government, red means less. Nothing here changes real data.',
  },
  '/ownership': {
    route: '/ownership',
    plainName: 'Who Owns What',
    official: 'Beneficial Ownership',
    moduleCode: 'M7',
    tagline: 'Trace the real people who ultimately own each mining company.',
    whatYouCanDo: [
      'Follow the ownership chain from a local company up to its real owners.',
      'Spot politically-exposed people (PEPs) and hard-to-trace structures.',
      'Flag opaque ownership that may need closer due diligence.',
    ],
    howToRead:
      'The tree starts with the company you select and branches up to the people or entities behind it. Watch for "opaque" links and PEP markers — these are where ownership is hidden or sensitive.',
  },
  '/local-content': {
    route: '/local-content',
    plainName: 'Local Benefits Tracker',
    official: 'Local Content Auditing',
    moduleCode: 'M8',
    tagline: 'Are companies hiring locally and investing as they promised?',
    whatYouCanDo: [
      'Track local hiring, procurement, training, and community spending.',
      'Compare what was promised against what was actually delivered.',
      'Find shortfalls where a company is below its local-content target.',
    ],
    howToRead:
      'Each category shows promised versus actual. Bars at or above 100% are on target; below means the company is falling short on its local-benefit commitments.',
  },
  '/admin': {
    route: '/admin',
    plainName: 'Settings & Data',
    official: 'System Administration',
    tagline: 'Manage the underlying data, rules, and the AI assistant.',
    whatYouCanDo: [
      'Add or edit agreements, operators, and the rules that drive alerts.',
      'Configure the AI assistant (provider, model, and keys).',
      'Import or export data safely.',
    ],
    howToRead:
      'This area is for administrators. Changes here update what every other page shows, so edit with care.',
  },
  '/audit': {
    route: '/audit',
    plainName: 'Activity Log',
    official: 'Audit & Activity Monitor',
    tagline: 'A running record of every action taken in the platform.',
    whatYouCanDo: [
      'See who changed what, and when, in real time.',
      'Filter the log by action type or the kind of record affected.',
      'Review or escalate entries that need follow-up.',
    ],
    howToRead:
      'Newest activity is at the top. Each entry names the action, the record it touched, and the time — giving you a complete, tamper-evident trail.',
  },
};

// ─── Glossary ────────────────────────────────────────────────
// Plain-language definitions for the jargon that appears around the
// app. Keys are lower-cased so lookups are case-insensitive.

export interface GlossaryEntry {
  term: string;
  definition: string;
}

const GLOSSARY_LIST: GlossaryEntry[] = [
  { term: 'Royalty rate', definition: 'The share of a mine’s revenue the company pays the government, usually a percentage of the value of what it produces.' },
  { term: 'Commitment', definition: 'A specific promise a company made in its agreement — for example to hire locally, build a road, or hit a production level.' },
  { term: 'Breach', definition: 'A commitment that has been broken — the company failed to do what its agreement requires.' },
  { term: 'At risk', definition: 'A commitment that is slipping and likely to be broken soon unless something changes.' },
  { term: 'On track', definition: 'A commitment that is being met or is on course to be met on time.' },
  { term: 'Compliance rate', definition: 'The share of all commitments that are being kept — a simple measure of how well promises are honoured.' },
  { term: 'Beneficial owner', definition: 'The real person who ultimately owns or controls a company, even when layers of other companies sit in between.' },
  { term: 'PEP', definition: 'Politically-Exposed Person — someone in (or close to) a position of public power, whose ownership of a company warrants extra scrutiny.' },
  { term: 'Opaque entity', definition: 'A company in the ownership chain whose real owners cannot be traced — often registered in a secrecy jurisdiction.' },
  { term: 'Secrecy jurisdiction', definition: 'A country or territory that lets company owners stay hidden (e.g. some offshore financial centres).' },
  { term: 'EITI', definition: 'Extractive Industries Transparency Initiative — a global standard for publishing what mining companies pay and governments receive.' },
  { term: 'Concession', definition: 'A defined area of land a company is licensed to explore or mine.' },
  { term: 'Risk flag', definition: 'An automatic alert raised when the data matches a pattern that may indicate a problem.' },
  { term: 'Anomaly score', definition: 'A number showing how unusual something looks compared with normal patterns — higher means more unusual and worth a look.' },
  { term: 'Local content', definition: 'The share of a company’s jobs, purchasing, and investment that goes to the local economy rather than abroad.' },
  { term: 'Operator', definition: 'A company that runs a mining operation under an agreement with the government.' },
  { term: 'Agreement', definition: 'The contract between the government and a mining company setting out rights, royalties, and obligations.' },
  { term: 'Benchmark', definition: 'A reference value (here, a typical royalty rate for a mineral) used to judge whether a specific deal is fair.' },
];

export const GLOSSARY: Record<string, GlossaryEntry> = Object.fromEntries(
  GLOSSARY_LIST.map((e) => [e.term.toLowerCase(), e]),
);

export function lookupTerm(term: string): GlossaryEntry | undefined {
  return GLOSSARY[term.trim().toLowerCase()];
}

// ─── Route → module lookup ───────────────────────────────────
// Mirrors the breadcrumb logic in Layout: match the exact path, then
// fall back to the first path segment (so /risk/RF-01 resolves to /risk).

export function moduleForPath(pathname: string): ModuleGuide | undefined {
  if (MODULES[pathname]) return MODULES[pathname];
  const base = '/' + pathname.split('/').filter(Boolean)[0];
  return MODULES[base];
}
