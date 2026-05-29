// ============================================================
// aiActions — small DSL the model can emit at the end of a
// brief so we can render its suggestions as REAL one-click
// buttons that mutate state, navigate, or copy text.
//
// Wire format (appended to the brief, NOT shown to the user):
//
//   <<<ACTIONS>>>
//   [
//     {"label":"Acknowledge flag","action":"flag.ack","target":"DYN-PROD-COM-OP-01-002"},
//     {"label":"Escalate to critical","action":"flag.escalate","target":"DYN-PROD-...","to":"critical"},
//     {"label":"Copy notice","action":"clipboard","payload":"To: Operator…"},
//     {"label":"Open peer agreement","action":"navigate","target":"/agreements/AGR-014"}
//   ]
//   <<</ACTIONS>>>
//
// AIInsightPanel strips the sentinel block from the displayed
// content and renders the parsed actions as a row of buttons.
// All actions are audited via the existing auditStore.
// ============================================================

import { extractJSON } from '@/services/aiService';
import { mutationService } from '@/services/mutationService';
import { useAuditStore } from '@/store/auditStore';

export type AIActionKind =
  | 'flag.ack'
  | 'flag.resolve'
  | 'flag.escalate'
  | 'commitment.atrisk'
  | 'commitment.breached'
  | 'commitment.ontrack'
  | 'navigate'
  | 'clipboard'
  | 'pin';

export interface AIAction {
  label: string;
  action: AIActionKind;
  target?: string;
  to?: string;
  payload?: string;
  /** Optional one-line tooltip shown on hover. */
  hint?: string;
}

const SENTINEL_RE = /<<<ACTIONS>>>([\s\S]*?)<<<\/ACTIONS>>>/;

/**
 * Split a streamed brief into its (visible) prose and (parsed) actions.
 * Tolerant of incomplete sentinel blocks mid-stream — returns no actions
 * until the closing tag arrives.
 */
export function splitActions(raw: string): { prose: string; actions: AIAction[] } {
  if (!raw) return { prose: '', actions: [] };
  const m = raw.match(SENTINEL_RE);
  if (!m) {
    // If the opening tag is present but the close hasn't arrived yet,
    // hide the partial sentinel from the user so streaming looks clean.
    const opener = raw.indexOf('<<<ACTIONS>>>');
    if (opener >= 0) return { prose: raw.slice(0, opener).trimEnd(), actions: [] };
    return { prose: raw, actions: [] };
  }
  const prose = (raw.slice(0, m.index) + raw.slice((m.index ?? 0) + m[0].length)).trimEnd();
  const parsed = extractJSON<unknown>(m[1]);
  let actions: AIAction[] = [];
  if (Array.isArray(parsed)) actions = parsed.filter(isAIAction);
  return { prose, actions };
}

function isAIAction(x: unknown): x is AIAction {
  if (!x || typeof x !== 'object') return false;
  const a = x as Record<string, unknown>;
  if (typeof a.label !== 'string' || typeof a.action !== 'string') return false;
  return ACTION_REGISTRY[a.action as AIActionKind] !== undefined;
}

// ────────────────────────────────────────────────────────────────
// Dispatcher — each kind maps to a side-effecting function and a
// human-readable category logged to the audit store. The dispatcher
// is the *only* surface that should ever touch mutationService on
// behalf of the model, so the trust boundary is explicit.
// ────────────────────────────────────────────────────────────────

export interface DispatchContext {
  /** Set by AIInsightPanel when calling, to attribute the action. */
  source: string; // e.g. "ai.triage:RISK-04"
  navigate: (to: string) => void;
}

const ACTION_REGISTRY: Record<AIActionKind, { describe: (a: AIAction) => string }> = {
  'flag.ack':             { describe: a => `Acknowledge risk flag ${a.target}` },
  'flag.resolve':         { describe: a => `Resolve risk flag ${a.target}` },
  'flag.escalate':        { describe: a => `Escalate flag ${a.target} severity to ${a.to ?? 'critical'}` },
  'commitment.atrisk':    { describe: a => `Mark commitment ${a.target} at-risk` },
  'commitment.breached':  { describe: a => `Mark commitment ${a.target} breached` },
  'commitment.ontrack':   { describe: a => `Mark commitment ${a.target} on-track` },
  'navigate':             { describe: a => `Navigate to ${a.target}` },
  'clipboard':            { describe: ()=> 'Copy text to clipboard' },
  'pin':                  { describe: a => `Pin to briefing: ${a.label}` },
};

export interface DispatchResult {
  ok: boolean;
  message: string;
}

export async function dispatchAction(a: AIAction, ctx: DispatchContext): Promise<DispatchResult> {
  const desc = ACTION_REGISTRY[a.action]?.describe(a) ?? a.label;

  try {
    switch (a.action) {
      case 'flag.ack':
        if (!a.target) throw new Error('Missing target flag id.');
        mutationService.updateRiskFlagStatus(a.target, 'acknowledged');
        break;

      case 'flag.resolve':
        if (!a.target) throw new Error('Missing target flag id.');
        mutationService.updateRiskFlagStatus(a.target, 'resolved');
        break;

      case 'flag.escalate':
        // We don't expose a "change severity" mutation; escalation in this
        // prototype means moving status to "open" + leaving a settings-change
        // audit trail. In Phase II this would link to a real escalation API.
        if (!a.target) throw new Error('Missing target flag id.');
        mutationService.updateRiskFlagStatus(a.target, 'open');
        break;

      case 'commitment.atrisk':
        if (!a.target) throw new Error('Missing commitment id.');
        mutationService.updateCommitmentStatus(a.target, 'at-risk');
        break;

      case 'commitment.breached':
        if (!a.target) throw new Error('Missing commitment id.');
        mutationService.updateCommitmentStatus(a.target, 'breached');
        break;

      case 'commitment.ontrack':
        if (!a.target) throw new Error('Missing commitment id.');
        mutationService.updateCommitmentStatus(a.target, 'on-track');
        break;

      case 'navigate':
        if (!a.target) throw new Error('Missing navigation target.');
        ctx.navigate(a.target);
        break;

      case 'clipboard': {
        const text = a.payload ?? '';
        if (!text) throw new Error('Nothing to copy.');
        await navigator.clipboard.writeText(text);
        break;
      }

      case 'pin':
        // Pinning is handled by the caller (it needs the rendered prose).
        // Returning ok here is intentional — the caller wires the side-effect.
        break;
    }

    // Audit — log every AI-triggered action so it shows up in Audit Monitor
    // alongside human-triggered changes.
    useAuditStore.getState().log({
      action: 'settings_change',
      entity: 'settings',
      entityId: `ai-action:${a.action}`,
      entityLabel: `AI suggested: ${desc}`,
      details: `${ctx.source} → ${desc}`,
      user: 'AI Analyst',
    });

    return { ok: true, message: desc };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
