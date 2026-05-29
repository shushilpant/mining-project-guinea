// ============================================================
// aiContextResolver — turn a right-click on any DOM element into
// a structured AI briefing context.
//
// Mechanics:
//   1. Walk up from the click target through ancestors looking for
//      `data-ai-entity="<kind>:<id>"`. The closest match wins.
//   2. Also capture the nearest `data-ai-region="<name>"` for
//      page-section briefings.
//   3. Capture window.getSelection() text if any range exists.
//   4. Build a list of `BriefingOption`s appropriate to what was
//      found, each carrying the chat messages it would send when
//      invoked. The right-click menu renders these as items;
//      picking one opens the briefing popover.
//
// All briefings reuse the prompt templates from `aiPrompts.ts` and
// the per-entity context builders from `aiContext.ts`. That keeps
// the grounding contract identical to the previous panel-based UI.
// ============================================================

import type { ChatMessage } from '@/services/aiService';
import { fenceUserText } from '@/services/aiService';
import {
  buildContext,
  buildRiskFlagContext,
  buildOperatorContext,
  buildAgreementContext,
  buildNegotiationContext,
} from '@/lib/aiContext';
import {
  triageBriefMessages,
  operatorInsightMessages,
  negotiationMemoMessages,
} from '@/lib/aiPrompts';
import {
  getOperatorById,
  getAgreementById,
  getRiskFlagById,
  getCommitmentById,
  getInfrastructureObligations,
} from '@/services/dataService';

// ─── Types ───────────────────────────────────────────────────

export type EntityKind =
  | 'operator'
  | 'agreement'
  | 'risk'
  | 'commitment'
  | 'infrastructure'
  | 'metric'
  | 'country'
  | 'region';

export interface EntityRef {
  kind: EntityKind;
  id: string;
  label: string;
  /** One-line subtitle shown in the menu header and the popover. */
  sub?: string;
}

export interface ContextHit {
  entity?: EntityRef;
  region?: string;
  selectedText?: string;
  pageRoute: string;
  /** Snippet of text grabbed from near the click — used by the generic
   *  "Explain this" briefing when no entity was tagged. */
  fallbackText?: string;
  /** The DOM target that owned the click — used by the popover to anchor
   *  any later highlight or scroll-into-view follow-ups. */
  targetRect: DOMRect | null;
}

export interface BriefingOption {
  /** Stable id, used as the cache task key. */
  id: string;
  label: string;
  hint: string;
  /** What this brief is about, surfaced in the popover header. */
  entityLabel: string;
  /** Builder so the heavy context-pack work is deferred until the user
   *  actually picks the option. */
  buildMessages: () => ChatMessage[];
  /** Tuning knobs forwarded to streamChat. */
  temperature?: number;
}

// ─── Click-target → context hit ──────────────────────────────

export function resolveContextAt(
  target: EventTarget | null,
  pageRoute: string,
): ContextHit {
  const hit: ContextHit = { pageRoute, targetRect: null };

  // Capture selected text early — selection ranges can vanish if focus shifts.
  const sel = typeof window !== 'undefined' ? window.getSelection() : null;
  const selText = sel && sel.toString().trim();
  if (selText) hit.selectedText = selText.slice(0, 800);

  if (!(target instanceof Element)) return hit;

  // Walk up looking for the nearest tagged ancestor for each axis.
  let el: Element | null = target;
  while (el) {
    if (!hit.entity) {
      const raw = el.getAttribute('data-ai-entity');
      if (raw) {
        const parsed = parseEntity(raw, el);
        if (parsed) hit.entity = parsed;
      }
    }
    if (!hit.region) {
      const region = el.getAttribute('data-ai-region');
      if (region) hit.region = region;
    }
    if (hit.entity && hit.region) break;
    el = el.parentElement;
  }

  // Anchor for later UI affordances (popover scroll, citation highlight).
  hit.targetRect = (target as Element).getBoundingClientRect();

  // Fallback text: only used when no entity was found. We grab the nearest
  // card / row / section text content so even untagged regions can be
  // explained. Cap aggressively so we don't ship huge slabs to the model.
  if (!hit.entity && !hit.selectedText) {
    const block = findEnclosingBlock(target as Element);
    if (block) {
      const txt = block.innerText?.trim().replace(/\s+/g, ' ');
      if (txt) hit.fallbackText = txt.slice(0, 600);
    }
  }

  return hit;
}

function parseEntity(raw: string, el: Element): EntityRef | null {
  const [kind, id] = raw.split(':', 2);
  if (!kind || !id) return null;
  const label =
    el.getAttribute('data-ai-label') ||
    inferLabel(kind as EntityKind, id) ||
    id;
  const sub = el.getAttribute('data-ai-sub') || inferSub(kind as EntityKind, id) || undefined;
  return { kind: kind as EntityKind, id, label, sub };
}

function inferLabel(kind: EntityKind, id: string): string | null {
  switch (kind) {
    case 'operator':       return getOperatorById(id)?.name ?? null;
    case 'agreement':      return getAgreementById(id)?.id ?? null;
    case 'risk':           return getRiskFlagById(id)?.id ?? null;
    case 'commitment':     return getCommitmentById(id)?.id ?? null;
    case 'infrastructure': return getInfrastructureObligations().find(io => io.id === id)?.projectName ?? null;
    default:               return null;
  }
}

function inferSub(kind: EntityKind, id: string): string | null {
  switch (kind) {
    case 'operator': {
      const op = getOperatorById(id);
      return op ? `${op.parentCompany} · ${op.countryOfRegistration}` : null;
    }
    case 'agreement': {
      const a = getAgreementById(id);
      return a ? `${a.commodity} · royalty ${a.royaltyRate}% · $${a.contractValue}M` : null;
    }
    case 'risk': {
      const f = getRiskFlagById(id);
      return f ? `${f.severity.toUpperCase()} · ${f.category}` : null;
    }
    case 'commitment': {
      const c = getCommitmentById(id);
      return c ? `${c.type} · target ${c.targetValue} ${c.targetUnit}` : null;
    }
    default: return null;
  }
}

function findEnclosingBlock(el: Element): HTMLElement | null {
  let cur: Element | null = el;
  for (let i = 0; i < 12 && cur; i++) {
    if (cur instanceof HTMLElement) {
      const role = cur.getAttribute('role');
      const tag  = cur.tagName.toLowerCase();
      if (
        tag === 'tr' ||
        tag === 'li' ||
        tag === 'section' ||
        tag === 'article' ||
        role === 'listitem' ||
        role === 'row' ||
        cur.classList.contains('shadow-card') ||
        cur.classList.contains('rounded-xl')
      ) return cur;
    }
    cur = cur.parentElement;
  }
  return el instanceof HTMLElement ? el : null;
}

// ─── Hit → briefing options ──────────────────────────────────

const DEFAULT_REGION_PROMPT = (regionName: string, pageRoute: string, country: string, pack: string) => ([
  {
    role: 'system' as const,
    content: [
      'You are the ACCI Compliance Analyst. Produce a tight read on a',
      'specific section of the dashboard the user has just right-clicked.',
      'Ground every claim in the BRIEFING PACK. Cite operator, agreement,',
      'flag and commitment IDs in brackets, e.g. [OP-06], [AGR-014].',
      '',
      `Section: ${regionName}.`,
      `Page route: ${pageRoute}.`,
      `Country scope: ${country}.`,
      '',
      'Output: 3–5 short bullets, ≤ 28 words each. No preamble, no headings,',
      'no closing sentence. If the pack lacks data for this section, say so',
      'plainly in one bullet rather than guess.',
    ].join('\n'),
  },
  { role: 'system' as const, content: `BRIEFING PACK:\n\n${pack}` },
  { role: 'user' as const,   content: `Brief me on what this section ("${regionName}") is showing.` },
]);

const EXPLAIN_TEXT_PROMPT = (snippet: string, isSelection: boolean, country: string, pack: string) => ([
  {
    role: 'system' as const,
    content: [
      'You are the ACCI Compliance Analyst. The user has right-clicked an',
      `${isSelection ? 'explicitly highlighted selection' : 'unspecified element'} on the dashboard.`,
      'Explain what the snippet refers to in context of the current data,',
      'and what it implies. Ground in the BRIEFING PACK; cite IDs in',
      'brackets if you reference operators / agreements / flags / commitments.',
      '',
      `Country scope: ${country}.`,
      '',
      'Output: ≤ 100 words of plain prose. If you cannot identify the',
      'reference, say "this snippet does not map to a known record" plainly.',
    ].join('\n'),
  },
  { role: 'system' as const, content: `BRIEFING PACK:\n\n${pack}` },
  {
    role: 'user' as const,
    content: `${isSelection ? 'Explain the selected text:' : 'Explain this element:'}\n${fenceUserText(snippet)}`,
  },
]);

const ASK_FREEFORM_PROMPT = (entityLabel: string, entityContext: string) => ([
  {
    role: 'system' as const,
    content: [
      'You are the ACCI Compliance Analyst. The user has opened an',
      `anchored AI briefing on ${entityLabel}. Give a concise read in`,
      'plain prose (≤ 100 words), grounded strictly in the BRIEFING PACK.',
      'Cite related IDs in brackets if useful.',
    ].join('\n'),
  },
  { role: 'system' as const, content: `BRIEFING PACK:\n\n${entityContext}` },
  { role: 'user' as const,   content: `Tell me what matters about ${entityLabel} right now.` },
]);

export function buildBriefingOptions(
  hit: ContextHit,
  country: string,
): BriefingOption[] {
  const opts: BriefingOption[] = [];

  // Entity-driven options ─ pick prompts based on the entity kind.
  if (hit.entity) {
    const e = hit.entity;
    switch (e.kind) {
      case 'risk': {
        const ctx = buildRiskFlagContext(e.id);
        opts.push({
          id: `triage-brief:${e.id}`,
          label: 'AI: Triage brief',
          hint: 'Severity rationale · root causes · 72-hour plan · draft notice',
          entityLabel: e.label,
          buildMessages: () => triageBriefMessages(ctx),
        });
        opts.push({
          id: `root-cause:${e.id}`,
          label: 'AI: Root-cause read',
          hint: 'Single most-likely cause + the evidence',
          entityLabel: e.label,
          buildMessages: () => [
            { role: 'system', content: [
              'You are the ACCI Triage Analyst. Identify the SINGLE most likely',
              'root cause for this risk flag, grounded only in the BRIEFING PACK.',
              'Output: one paragraph (≤ 70 words) + a 2-bullet evidence list,',
              'each bullet citing the agreement / commitment ID in brackets.',
            ].join('\n') },
            { role: 'system', content: `BRIEFING PACK:\n\n${ctx}` },
            { role: 'user',   content: 'What is the single most likely root cause and the evidence?' },
          ],
        });
        opts.push({
          id: `draft-notice:${e.id}`,
          label: 'AI: Draft notice to operator',
          hint: 'Formal 4–6 sentence outbound notice',
          entityLabel: e.label,
          buildMessages: () => [
            { role: 'system', content: [
              'You are the ACCI Compliance Officer. Draft a 4–6 sentence formal',
              'notice the Ministry can send to the operator, third person, citing',
              'the agreement and the rule breached. No salutation, no signoff —',
              'just the notice body. Ground every fact in the BRIEFING PACK.',
            ].join('\n') },
            { role: 'system', content: `BRIEFING PACK:\n\n${ctx}` },
            { role: 'user',   content: 'Draft the notice.' },
          ],
        });
        break;
      }

      case 'operator': {
        const ctx = buildOperatorContext(e.id);
        opts.push({
          id: `operator-insight:${e.id}`,
          label: 'AI: Operator briefing',
          hint: 'Posture · trajectory · top intervention · watch signals',
          entityLabel: e.label,
          buildMessages: () => operatorInsightMessages(ctx),
        });
        opts.push({
          id: `operator-watch:${e.id}`,
          label: 'AI: Watch signals only',
          hint: 'Latent risks not yet flagged',
          entityLabel: e.label,
          buildMessages: () => [
            { role: 'system', content: [
              'You are the ACCI Operator Watch Analyst. Surface 2–4 LATENT',
              'signals worth monitoring on this operator — UBO opacity,',
              'ownership change, parent-level exposure, expiry concentration,',
              'peer-benchmark divergence. Each as one bullet citing the',
              'agreement / flag ID in brackets. Ground in the BRIEFING PACK.',
            ].join('\n') },
            { role: 'system', content: `BRIEFING PACK:\n\n${ctx}` },
            { role: 'user',   content: 'List the watch signals.' },
          ],
        });
        opts.push({
          id: `operator-peers:${e.id}`,
          label: 'AI: Compare to peers',
          hint: 'How this operator stacks against same-country / same-commodity peers',
          entityLabel: e.label,
          buildMessages: () => [
            { role: 'system', content: [
              'You are the ACCI Compliance Analyst. Compare this operator',
              'against its peers in the BRIEFING PACK along three axes:',
              'compliance rate, open-flag pressure, and benchmark royalty',
              'on their primary agreements. Cite the comparator operator',
              'and agreement IDs you reference. Output: 3 short bullets.',
            ].join('\n') },
            { role: 'system', content: `BRIEFING PACK:\n\n${ctx}` },
            { role: 'user',   content: 'Compare this operator to its peers.' },
          ],
        });
        break;
      }

      case 'agreement': {
        const ag = getAgreementById(e.id);
        const negCtx = buildNegotiationContext({
          countryId: country === 'ALL' ? undefined : country,
          commodity: ag?.commodity,
          focusAgreementId: e.id,
        });
        const ctx = buildAgreementContext(e.id);
        opts.push({
          id: `negotiation-memo:${e.id}`,
          label: 'AI: Negotiation memo',
          hint: 'Position · floors · asks · counter-arguments · talking points',
          entityLabel: e.label,
          buildMessages: () => negotiationMemoMessages(negCtx),
        });
        opts.push({
          id: `term-review:${e.id}`,
          label: 'AI: Term review',
          hint: 'Royalty vs peer median + commitment-by-commitment status',
          entityLabel: e.label,
          buildMessages: () => [
            { role: 'system', content: [
              'You are the ACCI Compliance Analyst. Produce a tight term-review',
              'on this agreement: where the royalty sits relative to peer median,',
              'which commitments are on / at-risk / breached, and the single',
              'biggest exposure. Cite IDs. Output: 4 short bullets.',
            ].join('\n') },
            { role: 'system', content: `BRIEFING PACK:\n\n${ctx}` },
            { role: 'user',   content: 'Term review please.' },
          ],
        });
        break;
      }

      case 'commitment': {
        const c = getCommitmentById(e.id);
        const ctx = c
          ? buildAgreementContext(c.agreementId)
          : buildContext({ countryId: country });
        opts.push({
          id: `commitment-read:${e.id}`,
          label: 'AI: Commitment read',
          hint: 'Status, target vs latest actual, what to do',
          entityLabel: e.label,
          buildMessages: () => [
            { role: 'system', content: [
              'You are the ACCI Compliance Analyst. Read this commitment.',
              'State target vs latest actual in one sentence, classify the',
              'trajectory in one sentence, and recommend one action in one',
              'sentence. Cite the agreement and operator IDs in brackets.',
            ].join('\n') },
            { role: 'system', content: `BRIEFING PACK:\n\n${ctx}` },
            { role: 'user',   content: `Read commitment ${e.id}.` },
          ],
        });
        break;
      }

      case 'infrastructure':
      case 'metric':
      case 'country':
      case 'region':
      default: {
        // Generic anchored ask for less-structured entity kinds.
        const ctx = buildContext({ countryId: country });
        opts.push({
          id: `anchored:${e.kind}:${e.id}`,
          label: 'AI: Brief me on this',
          hint: e.sub ?? 'Tight contextual read',
          entityLabel: e.label,
          buildMessages: () => ASK_FREEFORM_PROMPT(`${e.kind} ${e.label} [${e.id}]`, ctx),
        });
        break;
      }
    }
  }

  // Section briefing — available whenever a region was tagged.
  if (hit.region) {
    const pack = buildContext({ countryId: country });
    opts.push({
      id: `section:${hit.region}:${hit.pageRoute}`,
      label: hit.entity ? 'AI: Brief this section' : 'AI: Brief this section',
      hint: `Overview of "${hit.region}"`,
      entityLabel: humaniseRegion(hit.region),
      buildMessages: () => DEFAULT_REGION_PROMPT(hit.region!, hit.pageRoute, country, pack),
    });
  }

  // Selected text → "Explain this selection"
  if (hit.selectedText) {
    const pack = buildContext({ countryId: country });
    opts.push({
      id: `explain-selection:${hash(hit.selectedText)}`,
      label: 'AI: Explain selection',
      hint: snippetPreview(hit.selectedText),
      entityLabel: 'Selected text',
      buildMessages: () => EXPLAIN_TEXT_PROMPT(hit.selectedText!, true, country, pack),
    });
  }

  // Last resort: snippet from the enclosing block.
  if (!hit.entity && !hit.region && !hit.selectedText && hit.fallbackText) {
    const pack = buildContext({ countryId: country });
    opts.push({
      id: `explain-element:${hash(hit.fallbackText)}`,
      label: 'AI: Explain this',
      hint: snippetPreview(hit.fallbackText),
      entityLabel: 'Element',
      buildMessages: () => EXPLAIN_TEXT_PROMPT(hit.fallbackText!, false, country, pack),
    });
  }

  // Always-available freeform option (when there's *something* to ground on).
  if (opts.length === 0) {
    const pack = buildContext({ countryId: country });
    opts.push({
      id: `page-brief:${hit.pageRoute}`,
      label: 'AI: Brief this page',
      hint: 'Top items that warrant attention right now',
      entityLabel: 'Current page',
      buildMessages: () => [
        { role: 'system', content: [
          'You are the ACCI Compliance Analyst. The user right-clicked an',
          'empty area of the page. Surface 3–5 short bullets about what is',
          'most worth their attention in the current country scope, citing',
          'IDs in brackets where useful. ≤ 28 words per bullet.',
        ].join('\n') },
        { role: 'system', content: `BRIEFING PACK:\n\n${pack}` },
        { role: 'user',   content: `Brief me on the current view (${hit.pageRoute}).` },
      ],
    });
  }

  return opts;
}

// ─── Helpers ────────────────────────────────────────────────

function humaniseRegion(slug: string): string {
  return slug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function snippetPreview(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > 60 ? '"' + t.slice(0, 60) + '…"' : '"' + t + '"';
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
