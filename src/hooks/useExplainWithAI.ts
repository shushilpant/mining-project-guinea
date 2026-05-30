// ============================================================
// useExplainWithAI — shared "Explain with AI" behaviour for buttons
// that aren't a right-click. It resolves the same context a right-click
// would (via the data-ai-* attributes on the element), builds the
// briefing options, and opens the existing floating AI brief card.
//
//   const { ready, explain } = useExplainWithAI();
//   ...
//   {ready && <button onClick={e => explain(panelEl, e.currentTarget.getBoundingClientRect())}>…</button>}
//
// `ready` reflects whether an AI provider is configured, so callers can
// hide the affordance entirely when the static content is all there is.
// ============================================================

import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useCountry } from '@/context/CountryContext';
import { useAISettingsStore, isProviderReady } from '@/store/aiSettingsStore';
import { useAIBriefingStore } from '@/store/aiBriefingStore';
import { resolveContextAt, buildBriefingOptions } from '@/lib/aiContextResolver';

export function useExplainWithAI() {
  const location = useLocation();
  const { selectedCountry } = useCountry();
  const ai = useAISettingsStore();
  const ready = ai.enabled && isProviderReady(ai);
  const openBrief = useAIBriefingStore((s) => s.openBrief);

  // contextEl  — the element whose data-ai-* attributes ground the brief.
  // spawnRect  — where the floating card should appear (usually the button).
  const explain = useCallback(
    (contextEl: HTMLElement | null, spawnRect: DOMRect) => {
      if (!contextEl) return;
      const hit = resolveContextAt(contextEl, location.pathname);
      const options = buildBriefingOptions(hit, selectedCountry);
      if (options.length === 0) return;
      openBrief({
        option: options[0],
        x: spawnRect.left,
        y: spawnRect.bottom,
        targetRect: contextEl.getBoundingClientRect(),
      });
    },
    [location.pathname, selectedCountry, openBrief],
  );

  return { ready, explain };
}
