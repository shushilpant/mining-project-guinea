import { describe, it, expect } from 'vitest';
import {
  classifyScope,
  scoreScopeRelevance,
  isLikelyFollowUp,
  hasHardOffTopicSignal,
} from '@/lib/scopeEngine';
import { isOutOfScopeVerdict } from '@/lib/aiContext';

const IN_SCOPE_REPLY = 'The top risk flags are RISK-3 and RISK-7 due to overdue commitments.';

describe('classifyScope', () => {
  it('refuses general science trivia', () => {
    expect(classifyScope('how big is the sun')).toBe('out');
  });

  it('refuses geography trivia', () => {
    expect(classifyScope('what is the capital of France')).toBe('out');
  });

  it('refuses sports trivia', () => {
    expect(classifyScope('who won the world cup')).toBe('out');
  });

  it('allows mining record questions', () => {
    expect(classifyScope('explain the royalty on AGR-001')).toBe('in');
  });

  it('allows governance definitional questions', () => {
    expect(classifyScope('what is a stabilisation clause')).toBe('in');
  });

  it('returns unknown for bare follow-up fragments without context', () => {
    expect(classifyScope('why?')).toBe('unknown');
  });
});

describe('hasHardOffTopicSignal', () => {
  it('detects trivia patterns', () => {
    expect(hasHardOffTopicSignal('how big is the sun')).toBe(true);
  });

  it('ignores when in-scope keywords are present', () => {
    expect(hasHardOffTopicSignal('how big is the sun compared to simandou output')).toBe(false);
  });
});

describe('scoreScopeRelevance', () => {
  it('scores mining questions above zero', () => {
    expect(scoreScopeRelevance('what are the top risk flags')).toBeGreaterThan(0);
  });

  it('scores unrelated trivia at zero', () => {
    expect(scoreScopeRelevance('how big is the sun')).toBe(0);
  });
});

describe('isLikelyFollowUp', () => {
  const refusal = 'This request falls outside my operational scope.';

  it('returns false without prior in-scope assistant turn', () => {
    expect(isLikelyFollowUp('why?', { priorTurns: [], refusalText: refusal })).toBe(false);
  });

  it('returns true after an in-scope assistant turn', () => {
    expect(isLikelyFollowUp('why?', {
      priorTurns: [{ role: 'assistant', content: IN_SCOPE_REPLY }],
      refusalText: refusal,
    })).toBe(true);
  });

  it('blocks off-topic pivots mid-thread', () => {
    expect(isLikelyFollowUp('how big is the sun', {
      priorTurns: [{ role: 'assistant', content: IN_SCOPE_REPLY }],
      refusalText: refusal,
    })).toBe(false);
  });

  it('allows operator comparisons after in-scope turn', () => {
    expect(classifyScope('compare those two operators')).toBe('in');
    expect(isLikelyFollowUp('compare those two', {
      priorTurns: [{ role: 'assistant', content: IN_SCOPE_REPLY }],
      refusalText: refusal,
    })).toBe(true);
  });
});

describe('isOutOfScopeVerdict', () => {
  it('treats empty output as out on cold questions', () => {
    expect(isOutOfScopeVerdict('', false)).toBe(true);
  });

  it('treats empty output as in on established threads', () => {
    expect(isOutOfScopeVerdict('', true)).toBe(false);
  });

  it('parses explicit OUT', () => {
    expect(isOutOfScopeVerdict('OUT', false)).toBe(true);
  });

  it('parses explicit IN', () => {
    expect(isOutOfScopeVerdict('IN', false)).toBe(false);
  });
});
