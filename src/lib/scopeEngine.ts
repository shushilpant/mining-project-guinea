// ============================================================
// scopeEngine — deterministic, rule-based scope classifier for the
// ACCI Compliance Analyst.
//
// WHY THIS EXISTS
//   The AI assistant must stay on-topic, but an LLM "is this in scope?"
//   classifier (judging a single message in isolation) routinely refused
//   GENUINE dashboard / mining questions — and especially short follow-ups
//   that carry no topic keywords on their own. That is the bug this engine
//   fixes.
//
// CONTRACT
//   A question that touches ANYTHING in this platform's universe — a module,
//   a chart, a map marker, an entity (operator/agreement/risk/commitment…),
//   a commodity, a fiscal/compliance/ESG/transparency/regulatory concept, a
//   glossary term, a country, an operator name, or a record ID — is IN. When
//   there is ANY in-scope signal, classifyScope returns 'in'. It returns 'out'
//   when the text matches a clearly unrelated topic with no in-scope signal.
//   Everything else is 'unknown' — callers run scoreScopeRelevance(),
//   isLikelyFollowUp(), and optionally an LLM tiebreaker via scopeGate.ts.
//   Short continuation fragments ("why?", "explain that") are NOT auto-'in'
//   here; they are resolved in scopeGate with conversation context.
//
//   The lexicon is assembled from across the whole dashboard:
//     • the module guide (plain + official names, taglines)
//     • the domain glossary
//     • commodities, commitment types, infrastructure types, categories
//     • live data — country names, operator & parent-company names, record IDs
//     • a hand-curated mining / extractives-governance vocabulary
// ============================================================

import { MODULES, GLOSSARY } from '@/content/guide';
import { getOperators, getCountries, getAgreements } from '@/services/dataService';

export type ScopeVerdict = 'in' | 'out' | 'unknown';

// ─── Curated domain vocabulary ───────────────────────────────
// Single-word tokens (matched as whole words) and multi-word phrases
// (matched as contiguous substrings). Kept generous on purpose.

const CORE_MINING = [
  'mining', 'mine', 'mines', 'miner', 'miners', 'mineral', 'minerals', 'ore', 'ores',
  'extraction', 'extractive', 'extractives', 'deposit', 'deposits', 'reserve', 'reserves',
  'concession', 'concessions', 'licence', 'licences', 'license', 'licenses', 'permit', 'permits',
  'exploration', 'exploit', 'exploitation', 'smelting', 'smelter', 'refinery', 'refining',
  'processing', 'beneficiation', 'geology', 'geological', 'prospect', 'quarry', 'pit',
  'tonnage', 'tonnes', 'production', 'output', 'mineralisation', 'mineralization',
  'artisanal', 'galamsey', 'simandou', 'sangaredi', 'nimba', 'bauxite', 'gold', 'iron',
  'manganese', 'nickel', 'lithium', 'diamond', 'diamonds', 'chromite', 'commodity', 'commodities',
];
const CORE_MINING_PHRASES = ['iron ore', 'mining sector', 'mining company', 'mining companies', 'mine site'];

const GOVERNANCE = [
  'compliance', 'comply', 'compliant', 'noncompliance', 'breach', 'breached', 'breaches',
  'obligation', 'obligations', 'commitment', 'commitments', 'agreement', 'agreements',
  'contract', 'contracts', 'clause', 'clauses', 'royalty', 'royalties', 'tax', 'taxes',
  'taxation', 'fiscal', 'revenue', 'revenues', 'levy', 'fee', 'fees', 'carry', 'expiry',
  'expire', 'expires', 'expiring', 'renewal', 'renew', 'lapsed', 'operator', 'operators',
  'company', 'companies', 'firm', 'ownership', 'owner', 'owners', 'ubo', 'pep', 'peps',
  'shareholder', 'shareholders', 'jurisdiction', 'sanction', 'sanctions', 'arbitration',
  'icsid', 'dispute', 'disputes', 'stabilisation', 'stabilization', 'amendment', 'amendments',
];
const GOVERNANCE_PHRASES = [
  'beneficial owner', 'beneficial ownership', 'free carry', 'politically exposed', 'due diligence',
  'parent company', 'state participation', 'contract value', 'royalty rate', 'royalty rates',
  'stabilisation clause', 'stabilization clause',
];

const RISK = [
  'risk', 'risks', 'risky', 'flag', 'flags', 'flagged', 'alert', 'alerts', 'anomaly',
  'anomalies', 'anomalous', 'severity', 'critical', 'audit', 'audits', 'monitoring',
  'escalate', 'escalation', 'breaching', 'overdue', 'shortfall', 'exposure',
];
const RISK_PHRASES = ['risk flag', 'risk flags', 'red flag', 'risk score', 'early warning'];

const ESG = [
  'esg', 'environmental', 'environment', 'social', 'governance', 'tailings', 'rehabilitation',
  'closure', 'water', 'carbon', 'emissions', 'pollution', 'grievance', 'grievances',
  'community', 'communities', 'bond', 'provision', 'provisions', 'turbidity', 'sustainability',
  'biodiversity', 'reclamation',
];
const ESG_PHRASES = ['mine closure', 'tailings dam', 'environmental bond', 'community fund', 'rehabilitation provision'];

const TRANSPARENCY = [
  'transparency', 'eiti', 'disclosure', 'disclosures', 'disclose', 'publish', 'published',
  'publication', 'dataset', 'datasets', 'report', 'reports', 'reporting', 'export', 'exported',
  'csv', 'json', 'excel', 'oversight',
];
const TRANSPARENCY_PHRASES = ['open data', 'public data', 'open dataset', 'public portal'];

const FISCAL_SCENARIO = [
  'scenario', 'scenarios', 'model', 'modelling', 'modeling', 'simulate', 'simulation',
  'forecast', 'projection', 'projections', 'project', 'baseline', 'price', 'prices', 'pricing',
  'slider', 'sensitivity', 'elasticity', 'macro',
];
const FISCAL_SCENARIO_PHRASES = ['what if', 'what-if', 'stress test', 'stress testing', 'revenue impact', 'price change'];

const LOCAL_CONTENT = [
  'employment', 'employ', 'procurement', 'training', 'hiring', 'jobs', 'workforce',
  'localisation', 'localization', 'supplier', 'suppliers',
];
const LOCAL_CONTENT_PHRASES = ['local content', 'local benefit', 'local benefits', 'local employment', 'community development'];

const REGULATORY = [
  'regulation', 'regulations', 'regulatory', 'law', 'laws', 'legal', 'legislation', 'statute',
  'decree', 'enacted', 'proposed', 'withdrawn', 'gazette',
];
const REGULATORY_PHRASES = ['mining code', 'mining law', 'finance act', 'under review', 'regulatory change', 'regulatory framework'];

const DASHBOARD_UI = [
  'dashboard', 'platform', 'module', 'modules', 'page', 'pages', 'panel', 'panels', 'map',
  'marker', 'markers', 'legend', 'chart', 'charts', 'graph', 'graphs', 'plot', 'table',
  'tables', 'tab', 'tabs', 'filter', 'filters', 'column', 'columns', 'row', 'rows', 'card',
  'cards', 'metric', 'metrics', 'kpi', 'kpis', 'score', 'scores', 'scorecard', 'scorecards',
  'trend', 'trends', 'breakdown', 'donut', 'radar', 'heatmap', 'sidebar', 'header', 'overview',
  'deadline', 'deadlines', 'widget', 'gauge', 'tooltip', 'badge', 'badges', 'screen', 'view',
  'section', 'sections', 'colour', 'color', 'icon', 'button', 'pin', 'pins', 'feed',
];
const DASHBOARD_PHRASES = [
  'this page', 'this section', 'this chart', 'this map', 'this table', 'this panel',
  'this dashboard', 'this number', 'this metric', 'this card', 'this column', 'this flag',
  'this agreement', 'this operator', 'this risk', 'this score', 'morning brief',
  'how do i read', 'how to read', 'what does this', 'what is this', 'what are these',
];

const PROGRAM_GEO = [
  'guinea', 'guinean', 'conakry', 'boke', 'boké', 'kamsar', 'ministry', 'ministerial',
  'minister', 'acci',
];
const PROGRAM_GEO_PHRASES = ['ministry of mines', 'republic of guinea', 'west africa'];

// Generic analytical / interrogative verbs that, in this product, almost always
// refer to the data on screen. They are a weak signal on their own, so they are
// treated as in-scope only when paired with a reference word (see classify()).
const ANALYTICAL = [
  'compare', 'comparison', 'analyse', 'analyze', 'analysis', 'summarise', 'summarize',
  'summary', 'explain', 'describe', 'list', 'show', 'rank', 'total', 'totals', 'average',
  'sum', 'count', 'highest', 'lowest', 'top', 'worst', 'best', 'difference', 'versus',
  'vs', 'calculate', 'trend', 'breakdown', 'overview', 'brief', 'review', 'recommend',
  // continuation verbs — typical of follow-ups asking for more on prior context
  'more', 'detail', 'details', 'elaborate', 'expand', 'continue', 'again', 'further',
  'clarify', 'rephrase', 'why', 'meaning', 'means',
];

// Reference / continuation words signalling the user is pointing at on-screen
// content or a previous answer. Combined with an analytical verb → in-scope.
const REFERENCE = [
  'this', 'that', 'these', 'those', 'it', 'them', 'they', 'here', 'above', 'below',
  'previous', 'earlier', 'last', 'first', 'second', 'third', 'former', 'latter', 'one', 'ones',
];

// Greetings / pleasantries — always let through; the assistant just responds.
const GREETINGS = ['hi', 'hello', 'hey', 'hiya', 'thanks', 'thank', 'ok', 'okay', 'yes', 'no', 'please'];

// ─── Clearly out-of-scope topics ─────────────────────────────
// Only used to return a confident 'out' when NO in-scope signal is present.

const OFF_TOPIC = [
  // astronomy / space / nature
  'astronomy', 'galaxy', 'universe', 'planet', 'planets', 'moon', 'comet', 'asteroid',
  'sun', 'solar', 'star', 'stars', 'earth', 'mars', 'venus', 'jupiter', 'saturn',
  'nebula', 'cosmos', 'telescope', 'orbit', 'orbital',
  'horoscope', 'zodiac', 'weather',
  // science / general knowledge (non-mining)
  'physics', 'chemistry', 'biology', 'mathematics', 'math', 'algebra', 'calculus',
  'history', 'geography', 'capital', 'population', 'currency', 'continent',
  // sports
  'football', 'soccer', 'basketball', 'cricket', 'tennis', 'nba', 'nfl', 'fifa', 'olympics',
  'baseball', 'rugby', 'golf',
  // entertainment
  'movie', 'movies', 'film', 'films', 'netflix', 'celebrity', 'celebrities', 'actor', 'actress',
  'singer', 'song', 'songs', 'lyrics', 'anime', 'cartoon', 'videogame',
  // food
  'recipe', 'recipes', 'cook', 'cooking', 'bake', 'baking', 'pizza', 'burger', 'restaurant',
  'cuisine', 'breakfast', 'dinner',
  // personal / creative / misc
  'joke', 'jokes', 'poem', 'poems', 'poetry', 'riddle', 'dating', 'romance', 'astrology',
  'meme', 'memes', 'gossip', 'workout', 'fitness', 'yoga', 'meditation', 'vacation', 'holiday',
  'flight', 'flights', 'hotel', 'hotels',
];
const OFF_TOPIC_PHRASES = [
  'capital of', 'population of', 'meaning of life', 'tell me a joke', 'write a poem',
  'write a story', 'love letter', 'who won', 'world cup', 'solar system', 'how do i cook',
  'how big is', 'how old is', 'how tall is', 'how far is', 'how hot is',
  'what is the capital', 'what is the population', 'what is the currency',
];

// Regex patterns for general-knowledge trivia that lacks explicit off-topic tokens.
const OFF_TOPIC_PATTERNS = [
  /\bhow (big|old|tall|far|long|hot|cold|wide|deep|heavy) (is|are|was|were) (the )?(sun|moon|earth|mars|venus|jupiter|saturn|universe|galaxy|star|stars)\b/i,
  /\bwhat is the (capital|population|currency|language) of\b/i,
  /\bwho (won|invented|discovered|founded)\b/i,
  /\btell me (a|about the) (joke|story|poem|recipe)\b/i,
];

// ─── Build the in-scope lexicons (memoised) ──────────────────

interface Lexicon {
  words: Set<string>;     // whole-word matches
  phrases: string[];      // substring matches (space-collapsed, no punctuation)
}

let _cached: { in: Lexicon; off: Lexicon } | null = null;

const STOP_TOKENS = new Set([
  'mining', 'company', 'companies', 'group', 'holding', 'holdings', 'resources', 'resource',
  'international', 'limited', 'ltd', 'inc', 'plc', 'sa', 'sarl', 'corp', 'corporation', 'co',
  'the', 'and', 'des', 'de', 'du', 'la', 'le', 'of', 'global', 'minerals', 'mineral', 'gold',
  'iron', 'mines', 'mine',
  // interrogatives / generic words that must never become in-scope signals on
  // their own (harvested from names like "What-If Planner").
  'what', 'whatif', 'whats', 'if', 'how', 'why', 'who', 'when', 'where', 'which', 'whose',
  'your', 'their', 'daily', 'snapshot', 'place', 'these', 'this', 'that', 'with', 'from',
]);

function splitWords(s: string): string[] {
  return normalize(s).split(' ').filter(Boolean);
}

function buildLexicon(): { in: Lexicon; off: Lexicon } {
  if (_cached) return _cached;

  const words = new Set<string>();
  const phrases = new Set<string>();

  const addList = (singles: string[], phraseList: string[] = []) => {
    for (const w of singles) {
      const n = normalize(w);
      if (!n) continue;
      if (n.includes(' ')) phrases.add(n);
      else words.add(n);
    }
    for (const p of phraseList) {
      const n = normalize(p);
      if (n) phrases.add(n);
    }
  };

  addList(CORE_MINING, CORE_MINING_PHRASES);
  addList(GOVERNANCE, GOVERNANCE_PHRASES);
  addList(RISK, RISK_PHRASES);
  addList(ESG, ESG_PHRASES);
  addList(TRANSPARENCY, TRANSPARENCY_PHRASES);
  addList(FISCAL_SCENARIO, FISCAL_SCENARIO_PHRASES);
  addList(LOCAL_CONTENT, LOCAL_CONTENT_PHRASES);
  addList(REGULATORY, REGULATORY_PHRASES);
  addList(DASHBOARD_UI, DASHBOARD_PHRASES);
  addList(PROGRAM_GEO, PROGRAM_GEO_PHRASES);

  // ── Harvest the module guide: plain names, official names, taglines ──
  for (const m of Object.values(MODULES)) {
    for (const phrase of [m.plainName, m.official]) {
      const n = normalize(phrase);
      if (!n) continue;
      if (n.includes(' ')) phrases.add(n);
      for (const tok of n.split(' ')) if (tok.length >= 4 && !STOP_TOKENS.has(tok)) words.add(tok);
    }
    // Route segment, e.g. /local-content → "local content"
    const seg = normalize(m.route.replace(/\//g, ' '));
    if (seg.includes(' ')) phrases.add(seg);
    else if (seg.length >= 3) words.add(seg);
  }

  // ── Harvest the glossary terms ──
  for (const entry of Object.values(GLOSSARY)) {
    const n = normalize(entry.term);
    if (!n) continue;
    if (n.includes(' ')) phrases.add(n);
    for (const tok of n.split(' ')) if (tok.length >= 4 && !STOP_TOKENS.has(tok)) words.add(tok);
  }

  // ── Harvest live data: countries, operators, parent companies ──
  try {
    for (const c of getCountries()) {
      for (const tok of splitWords(c.name)) if (tok.length >= 4 && !STOP_TOKENS.has(tok)) words.add(tok);
      const cn = normalize(c.name);
      if (cn.includes(' ')) phrases.add(cn);
      if (c.id) words.add(normalize(c.id));
      if (c.miningAuthority) {
        const a = normalize(c.miningAuthority);
        if (a.includes(' ')) phrases.add(a);
      }
    }
    for (const op of getOperators()) {
      for (const name of [op.name, op.parentCompany]) {
        if (!name) continue;
        const n = normalize(name);
        if (n.includes(' ')) phrases.add(n);
        for (const tok of n.split(' ')) if (tok.length >= 5 && !STOP_TOKENS.has(tok)) words.add(tok);
      }
    }
    // Commodities present in live agreements (covers any not in the static list).
    for (const a of getAgreements()) {
      if (a.commodity) {
        const n = normalize(a.commodity);
        if (n.includes(' ')) phrases.add(n);
        else words.add(n);
      }
    }
  } catch {
    // Data layer unavailable (e.g. during tests) — static lexicon still applies.
  }

  const off: Lexicon = { words: new Set(), phrases: [] };
  for (const w of OFF_TOPIC) {
    const n = normalize(w);
    if (n.includes(' ')) off.phrases.push(n);
    else off.words.add(n);
  }
  for (const p of OFF_TOPIC_PHRASES) {
    const n = normalize(p);
    if (n) off.phrases.push(n);
  }

  _cached = { in: { words, phrases: [...phrases] }, off };
  return _cached;
}

// ─── Normalisation & matching ────────────────────────────────

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasWord(tokens: Set<string>, lex: Set<string>): boolean {
  for (const t of tokens) if (lex.has(t)) return true;
  return false;
}

function hasPhrase(normalized: string, phrases: string[]): boolean {
  const padded = ` ${normalized} `;
  for (const p of phrases) if (padded.includes(` ${p} `)) return true;
  return false;
}

// Record-ID references: [OP-06], AGR-014, RISK-3, COM-12, INF-2, PZ-1, RC-09, etc.
const ID_PATTERN = /\b(op|agr|risk|rf|com|inf|pz|cc|rc|pd|dyn|eiti)[-\s]?\d{1,4}\b/i;

/** Relevance score threshold — at or above → treat as in-scope. */
export const RELEVANCE_IN_THRESHOLD = 0.15;

// Question tokens excluded from relevance scoring (not domain signals).
const RELEVANCE_STOP = new Set([
  ...STOP_TOKENS,
  'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did',
  'can', 'could', 'would', 'should', 'will', 'shall', 'may', 'might', 'must',
  'about', 'into', 'over', 'under', 'between', 'through', 'during', 'before', 'after',
  'me', 'my', 'you', 'your', 'i', 'we', 'our', 'us', 'they', 'their', 'them', 'he', 'she',
  'it', 'its', 'in', 'on', 'at', 'to', 'for', 'by', 'or', 'and', 'not', 'no', 'yes',
  'big', 'small', 'much', 'many', 'some', 'any', 'all', 'most', 'more', 'less',
]);

export interface ScopeTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface FollowUpContext {
  priorTurns: ScopeTurn[];
  /** Refusal text used to detect broken threads. */
  refusalText?: string;
}

// ─── Off-topic pattern helpers ───────────────────────────────

/** True when the text matches off-topic lexicon or trivia patterns and has no in-scope signal. */
export function hasHardOffTopicSignal(question: string): boolean {
  const raw = (question ?? '').trim();
  if (!raw) return false;

  const { in: inLex, off } = buildLexicon();
  const normalized = normalize(raw);
  const tokens = new Set(normalized.split(' ').filter(Boolean));

  if (ID_PATTERN.test(raw)) return false;
  if (hasWord(tokens, inLex.words)) return false;
  if (hasPhrase(normalized, inLex.phrases)) return false;

  if (hasWord(tokens, off.words) || hasPhrase(normalized, off.phrases)) return true;
  return OFF_TOPIC_PATTERNS.some((re) => re.test(raw));
}

/**
 * Token-overlap relevance against the scope corpus (in-scope lexicon).
 * Returns 0–1: fraction of meaningful question tokens that hit the corpus.
 */
export function scoreScopeRelevance(question: string): number {
  const raw = (question ?? '').trim();
  if (!raw) return 0;

  const { in: inLex } = buildLexicon();
  const normalized = normalize(raw);
  const tokens = normalized.split(' ').filter((t) => t && !RELEVANCE_STOP.has(t));
  if (tokens.length === 0) return 0;

  let hits = 0;
  for (const t of tokens) {
    if (inLex.words.has(t)) hits++;
  }
  if (hasPhrase(normalized, inLex.phrases)) hits += 1;

  return Math.min(1, hits / tokens.length);
}

/** Whether the thread has a prior in-scope assistant reply (not a refusal). */
export function hasEstablishedInScopeThread(ctx: FollowUpContext): boolean {
  const refusal = ctx.refusalText ?? '';
  for (let i = ctx.priorTurns.length - 1; i >= 0; i--) {
    const t = ctx.priorTurns[i];
    if (t.role === 'assistant' && t.content.trim() && !t.content.includes(refusal)) {
      return true;
    }
  }
  return false;
}

/**
 * True when the message looks like a continuation of an established in-scope thread.
 * Blocks pivots to off-topic even mid-conversation.
 */
export function isLikelyFollowUp(question: string, ctx: FollowUpContext): boolean {
  const raw = (question ?? '').trim();
  if (!raw || !hasEstablishedInScopeThread(ctx)) return false;
  if (hasHardOffTopicSignal(raw)) return false;

  const normalized = normalize(raw);
  const tokens = new Set(normalized.split(' ').filter(Boolean));
  const analytical = hasWord(tokens, new Set(ANALYTICAL));
  const reference = hasWord(tokens, new Set(REFERENCE));

  if (analytical && reference) return true;
  if (tokens.size > 0 && tokens.size <= 6 && (reference || analytical)) return true;
  return false;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Classify a single user message against the dashboard's scope.
 *   'in'      — carries a clear in-scope signal; answer it.
 *   'out'     — matches a clearly unrelated topic with no in-scope signal.
 *   'unknown' — no strong signal; caller runs scopeGate tiebreaker pipeline.
 */
export function classifyScope(question: string): ScopeVerdict {
  const raw = (question ?? '').trim();
  if (!raw) return 'unknown';

  const { in: inLex } = buildLexicon();
  const normalized = normalize(raw);
  const tokens = new Set(normalized.split(' ').filter(Boolean));

  // 1. Record-ID reference → unambiguously in scope.
  if (ID_PATTERN.test(raw)) return 'in';

  // 2. Any in-scope keyword or phrase → in.
  if (hasWord(tokens, inLex.words)) return 'in';
  if (hasPhrase(normalized, inLex.phrases)) return 'in';

  // 3. Greetings / pleasantries → let through.
  if (hasWord(tokens, new Set(GREETINGS))) return 'in';

  // 4. Clearly off-topic (lexicon + trivia patterns, no in-scope signal).
  if (hasHardOffTopicSignal(raw)) return 'out';

  // 5. Nothing matched either way — defer to relevance / follow-up / LLM.
  return 'unknown';
}

/** Convenience: is the message safe to answer without an LLM scope check? */
export function isInScope(question: string): boolean {
  return classifyScope(question) === 'in';
}

/** Convenience: did the engine positively identify this as off-topic? */
export function isOffScope(question: string): boolean {
  return classifyScope(question) === 'out';
}
