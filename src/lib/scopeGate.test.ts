// ============================================================
// scopeGate.test — orchestrator-level coverage for checkScope().
//
// scopeEngine.test.ts covers the deterministic lexicon (classifyScope).
// These tests exercise the layer the UI actually calls: checkScope(),
// the gate that AIAssistant and AIBriefingPopover run before any prompt
// reaches the answering model. Every case here short-circuits at the
// deterministic layers (1–3), so the LLM tiebreaker is never invoked and
// the fake `ai` config below is never used for a network call.
// ============================================================

import { describe, it, expect } from 'vitest';
import { checkScope } from '@/lib/scopeGate';
import { OUT_OF_SCOPE_REPLY } from '@/lib/aiContext';

// Deterministic-only AI config. None of these tests reach the tiebreaker,
// so provider/model are placeholders that must never be hit.
const AI = { provider: 'pollinations' as const, model: 'test-model' };

const IN_SCOPE_REPLY = 'The top risk flags are RISK-3 and RISK-7 due to overdue commitments.';
const priorInScope = [{ role: 'assistant' as const, content: IN_SCOPE_REPLY }];

describe('checkScope — off-topic refusal', () => {
  it('refuses "how big is the sun" with the canned reply (no model call)', async () => {
    const r = await checkScope('how big is the sun', { priorTurns: [] }, AI);
    expect(r.allowed).toBe(false);
    expect(r.reply).toBe(OUT_OF_SCOPE_REPLY);
  });

  it('refuses geography trivia', async () => {
    const r = await checkScope('what is the capital of France', { priorTurns: [] }, AI);
    expect(r.allowed).toBe(false);
  });

  it('refuses an empty message', async () => {
    const r = await checkScope('   ', { priorTurns: [] }, AI);
    expect(r.allowed).toBe(false);
  });
});

describe('checkScope — in-scope allow', () => {
  it('allows a record-anchored question', async () => {
    const r = await checkScope('explain the royalty on AGR-001', { priorTurns: [] }, AI);
    expect(r.allowed).toBe(true);
  });

  it('allows a risk question', async () => {
    const r = await checkScope('what are the top risk flags', { priorTurns: [] }, AI);
    expect(r.allowed).toBe(true);
  });

  it('allows a governance definitional question', async () => {
    const r = await checkScope('what is a stabilisation clause', { priorTurns: [] }, AI);
    expect(r.allowed).toBe(true);
  });
});

describe('checkScope — follow-up handling', () => {
  it('allows a bare "why?" follow-up after an in-scope answer', async () => {
    const r = await checkScope('why?', { priorTurns: priorInScope }, AI);
    expect(r.allowed).toBe(true);
  });

  it('allows "compare those two" after an in-scope answer', async () => {
    const r = await checkScope('compare those two', { priorTurns: priorInScope }, AI);
    expect(r.allowed).toBe(true);
  });

  it('still blocks an off-topic pivot mid-thread', async () => {
    const r = await checkScope('how big is the sun', { priorTurns: priorInScope }, AI);
    expect(r.allowed).toBe(false);
  });

  it('refuses a cold bare follow-up with no established thread', async () => {
    const r = await checkScope('why?', { priorTurns: [] }, AI);
    expect(r.allowed).toBe(false);
  });
});
