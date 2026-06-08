// ============================================================
// scopeGate — unified scope-check orchestrator for freeform AI chat.
//
// Layers (in order):
//   1. classifyScope() hard IN / OUT
//   2. scoreScopeRelevance() corpus overlap
//   3. isLikelyFollowUp() context-aware continuation
//   4. LLM tiebreaker for remaining ambiguous cases
// ============================================================

import { completeChat } from '@/services/aiService';
import type { AIProvider } from '@/store/aiSettingsStore';
import {
  OUT_OF_SCOPE_REPLY,
  scopeClassifierMessages,
  isOutOfScopeVerdict,
} from '@/lib/aiContext';
import {
  classifyScope,
  scoreScopeRelevance,
  isLikelyFollowUp,
  hasEstablishedInScopeThread,
  RELEVANCE_IN_THRESHOLD,
  type ScopeTurn,
} from '@/lib/scopeEngine';

export interface ScopeContext {
  /** Prior user/assistant turns (excluding the current message). */
  priorTurns: ScopeTurn[];
  /** Popover anchor entity label, e.g. "RISK-3 — overdue commitment". */
  anchorLabel?: string;
}

export interface ScopeGateAI {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  localBaseUrl?: string;
  signal?: AbortSignal;
}

export interface ScopeGateResult {
  allowed: boolean;
  reply?: string;
}

function refuse(): ScopeGateResult {
  return { allowed: false, reply: OUT_OF_SCOPE_REPLY };
}

function allow(): ScopeGateResult {
  return { allowed: true };
}

/**
 * Decide whether a freeform user question may be sent to the answering model.
 */
export async function checkScope(
  question: string,
  ctx: ScopeContext,
  ai: ScopeGateAI,
): Promise<ScopeGateResult> {
  const trimmed = (question ?? '').trim();
  if (!trimmed) return refuse();

  const followUpCtx = {
    priorTurns: ctx.priorTurns,
    refusalText: OUT_OF_SCOPE_REPLY,
  };
  const threadEstablished = hasEstablishedInScopeThread(followUpCtx);
  const anchored = Boolean(ctx.anchorLabel?.trim());

  // Layer 1: deterministic classifier.
  const verdict = classifyScope(trimmed);
  if (verdict === 'in') return allow();
  if (verdict === 'out') return refuse();

  // Layer 2: corpus relevance.
  const relevance = scoreScopeRelevance(trimmed);
  if (relevance >= RELEVANCE_IN_THRESHOLD) return allow();
  if (relevance === 0 && !threadEstablished && !anchored) return refuse();

  // Layer 3: context-aware follow-up.
  if (isLikelyFollowUp(trimmed, followUpCtx)) return allow();

  // Popover anchored to an in-scope record — lenient for short follow-ups only.
  if (anchored && trimmed.split(/\s+/).length <= 6 && threadEstablished) {
    return allow();
  }

  // Layer 4: LLM tiebreaker.
  try {
    const llmVerdict = await completeChat({
      provider: ai.provider,
      model: ai.model,
      apiKey: ai.apiKey,
      localBaseUrl: ai.localBaseUrl,
      messages: scopeClassifierMessages(trimmed, ctx),
      temperature: 0,
      maxTokens: 8,
      timeoutMs: 15000,
      signal: ai.signal,
    });
    if (isOutOfScopeVerdict(llmVerdict, threadEstablished || anchored)) {
      return refuse();
    }
    return allow();
  } catch {
    if (ai.signal?.aborted) return refuse();
    // Fail closed on cold ambiguous questions; allow short follow-ups in threads.
    if (isLikelyFollowUp(trimmed, followUpCtx) || (anchored && threadEstablished)) {
      return allow();
    }
    return refuse();
  }
}
