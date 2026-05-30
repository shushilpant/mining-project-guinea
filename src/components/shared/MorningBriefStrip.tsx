// ============================================================
// MorningBriefStrip — proactive AI summary that lives at the
// top of the Executive Dashboard. Three bullets, ≤ 15 seconds
// to read, auto-generates on first dashboard visit per
// country per day. Cached for 12h.
//
// This is the opposite of the "generic AI button" pattern —
// the user doesn't ask, the platform just briefs them. The
// brief auto-invalidates daily and on country switch, and
// becomes pinnable like any other AI output.
// ============================================================

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAISettingsStore, isProviderReady } from '@/store/aiSettingsStore';
import { useCountry } from '@/context/CountryContext';
import { useStoreData } from '@/store/dataStore';
import { completeChat } from '@/services/aiService';
import { aiCacheGet, aiCacheSet, fingerprint } from '@/lib/aiCache';
import { buildContext } from '@/lib/aiContext';
import { morningBriefMessages } from '@/lib/aiPrompts';
import { CitedText } from '@/components/shared/CitedText';

const CACHE_TASK = 'morning-brief';
const CACHE_TTL  = 1000 * 60 * 60 * 12; // 12h — re-brief twice a day max

const COUNTRY_LABEL: Record<string, string> = {
  ALL: 'West Africa region',
  GIN: 'Republic of Guinea',
  GHA: 'Republic of Ghana',
  CIV: "Republic of Côte d'Ivoire",
};

export function MorningBriefStrip() {
  const ai = useAISettingsStore();
  const ready = ai.enabled && isProviderReady(ai);
  const { selectedCountry } = useCountry();

  // Bucket the cache by the calendar date so the brief naturally rolls over
  // each morning even if the TTL hasn't lapsed.
  const day = new Date().toISOString().slice(0, 10);
  const pack = useStoreData(
    () => buildContext({ countryId: selectedCountry, maxOperators: 8, maxAgreements: 8, maxRiskFlags: 10, maxCommitments: 12, maxInfra: 6 }),
    [selectedCountry],
  );
  const cacheKey = useMemo(
    () => fingerprint(ai.model, selectedCountry, day, pack.length),
    [ai.model, selectedCountry, day, pack.length],
  );

  const [content, setContent] = useState<string>(() => aiCacheGet(CACHE_TASK, cacheKey) ?? '');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const abortRef              = useRef<AbortController | null>(null);

  // Reset on country / day / model change via the "Adjusting state when a prop changes" pattern.
  const [prevKey, setPrevKey] = useState(cacheKey);
  if (prevKey !== cacheKey) {
    setPrevKey(cacheKey);
    setContent(aiCacheGet(CACHE_TASK, cacheKey) ?? '');
    setError(null);
  }

  const run = useCallback(async (force: boolean) => {
    if (busy || !ready) return;
    if (!force) {
      const hit = aiCacheGet(CACHE_TASK, cacheKey);
      if (hit) { setContent(hit); return; }
    }
    setBusy(true);
    setError(null);
    setContent('');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const out = await completeChat({
        provider:     ai.provider,
        model:        ai.model,
        apiKey:       ai.openRouterKey || undefined,
        localBaseUrl: ai.localBaseUrl || undefined,
        messages:     morningBriefMessages(pack),
        temperature: 0.15,
        signal: ctrl.signal,
        timeoutMs: 300_000,
      });
      let cleaned = out.trim();
      cleaned = cleaned.replace(/^(?:-\s*)?(?:\*\*?)?Top concern(?:\*\*?)?:(?:\*\*?)?\s*/gmi, '- **Top concern:** ');
      cleaned = cleaned.replace(/^(?:-\s*)?(?:\*\*?)?What changed(?:\*\*?)?:(?:\*\*?)?\s*/gmi, '- **What changed:** ');
      cleaned = cleaned.replace(/^(?:-\s*)?(?:\*\*?)?Recommended priority(?:\*\*?)?:(?:\*\*?)?\s*/gmi, '- **Recommended priority:** ');
      if (cleaned) {
        setContent(cleaned);
        aiCacheSet(CACHE_TASK, cacheKey, cleaned, CACHE_TTL);
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [ai.provider, ai.model, ai.openRouterKey, ai.localBaseUrl, busy, ready, pack, cacheKey]);

  // Auto-fetch once per cacheKey when the provider is ready and we don't
  // already have a cached entry. We mark the key as "seen" via a useState
  // mirror so subsequent renders short-circuit without re-firing the
  // side-effect (the only AI surface that runs without an explicit user
  // click — we are careful about it). The guard prevents cascading renders.
  const [autoRanFor, setAutoRanFor] = useState<string>('');
  const shouldAutoRun = ready && !content && autoRanFor !== cacheKey;
  useEffect(() => {
    if (!shouldAutoRun) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAutoRanFor(cacheKey);
    run(false);
    // `run` is stable enough for this purpose; including it would re-fire
    // on every internal state tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoRun, cacheKey]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <section
      className="rounded-xl border border-line bg-surface shadow-card overflow-hidden"
      aria-label="AI morning brief"
    >
      <div
        className="px-4 py-2 flex items-center justify-between gap-3 border-b border-line-soft"
        style={{ background: 'linear-gradient(90deg, rgba(1,105,64,0.05) 0%, rgba(200,153,30,0.06) 100%)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={13} className="text-brand-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-2 truncate">
              AI Morning Brief
            </div>
            <div className="text-[10px] text-ink-4 truncate">
              Auto-generated for {COUNTRY_LABEL[selectedCountry] ?? selectedCountry} · {day} · refreshes daily
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!busy && (
            <button
              type="button"
              onClick={() => run(true)}
              disabled={!ready}
              className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md border border-line text-ink-3 hover:text-ink hover:bg-surface-2 disabled:opacity-40"
              aria-label="Regenerate morning brief"
              title="Regenerate"
            >
              <RefreshCw size={11} />
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        {!ready && (
          <div className="text-[12px] text-ink-3 leading-relaxed">
            The AI Analyst is not configured — morning briefs will appear here once a provider is set up.
          </div>
        )}

        {ready && busy && (
          <div className="flex items-center gap-2 text-[12px] text-ink-3">
            <Loader2 size={13} className="animate-spin" />
            Generating today's brief…
          </div>
        )}

        {ready && !busy && error && (
          <div className="rounded-lg border border-status-danger/40 bg-status-danger/[0.06] p-3 flex items-start gap-2">
            <AlertTriangle size={13} className="text-status-danger shrink-0 mt-0.5" />
            <div className="text-[12px] text-status-danger leading-snug min-w-0 break-words">
              {error}
            </div>
          </div>
        )}

        {ready && !busy && !error && content && (
          <div className="text-[13px] leading-relaxed text-ink">
            <CitedText text={content} />
          </div>
        )}

        {ready && !busy && !error && !content && (
          <div className="text-[12px] text-ink-3 leading-relaxed">
            No brief yet. <button onClick={() => run(true)} className="text-brand-700 font-semibold underline">Generate one →</button>
          </div>
        )}
      </div>
    </section>
  );
}
