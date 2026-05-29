// ============================================================
// AnomalyScanPanel — runs the LLM-side anomaly hunter against
// the current country slice and renders findings as a typed
// card list. Distinct from the chat assistant because the
// model is asked for STRICT JSON; we parse, validate, and
// render — not free-form prose.
//
// Findings persist via the same TTL'd aiCache used by the
// inline insight panels; a country switch invalidates the
// cache automatically because countryId is part of the
// fingerprint.
// ============================================================

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radar, Loader2, RefreshCw, Square, AlertTriangle, Sparkles, ChevronDown, ChevronRight,
} from 'lucide-react';
import { completeChat, extractJSON } from '@/services/aiService';
import { useAISettingsStore, isProviderReady } from '@/store/aiSettingsStore';
import { aiCacheGet, aiCacheSet, fingerprint } from '@/lib/aiCache';
import { buildAnomalyScanContext } from '@/lib/aiContext';
import { anomalyScanMessages, type AnomalyScanResult, type AnomalyFinding } from '@/lib/aiPrompts';
import { getOperatorById, getAgreementById, getRiskFlagById } from '@/services/dataService';
import { CitedText } from '@/components/shared/CitedText';

const SEV_STYLE: Record<AnomalyFinding['severity'], { dot: string; chip: string }> = {
  critical: { dot: '#DC2626', chip: 'bg-red-50 text-red-700 border-red-200' },
  high:     { dot: '#D97706', chip: 'bg-amber-50 text-amber-800 border-amber-200' },
  medium:   { dot: '#7A9A88', chip: 'bg-amber-50/60 text-amber-700 border-amber-100' },
  low:      { dot: '#99AB94', chip: 'bg-surface-2 text-ink-3 border-line' },
};

interface Props {
  countryId: string;
}

const CACHE_TASK = 'anomaly-scan';
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6h — anomalies move slowly

export function AnomalyScanPanel({ countryId }: Props) {
  const ai = useAISettingsStore();
  const ready = ai.enabled && isProviderReady(ai);
  const navigate = useNavigate();

  // Build context once per countryId — same input, same fingerprint.
  const briefingPack = useMemo(() => buildAnomalyScanContext(countryId), [countryId]);
  const cacheKey     = fingerprint(ai.model, countryId, briefingPack);

  const [collapsed, setCollapsed]   = useState(true);
  const [busy, setBusy]             = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [result, setResult]         = useState<AnomalyScanResult | null>(() => {
    const hit = aiCacheGet(CACHE_TASK, cacheKey);
    if (!hit) return null;
    return extractJSON<AnomalyScanResult>(hit);
  });
  const [fromCache, setFromCache]   = useState<boolean>(!!result);

  const abortRef = useRef<AbortController | null>(null);

  // React's "Adjusting state when a prop changes" pattern — see
  // https://react.dev/learn/you-might-not-need-an-effect. We mirror the
  // cacheKey in a useState; when it diverges we re-pull the cached result
  // synchronously and reset error state.
  const [prevKey, setPrevKey] = useState(cacheKey);
  if (prevKey !== cacheKey) {
    setPrevKey(cacheKey);
    const hit = aiCacheGet(CACHE_TASK, cacheKey);
    setResult(hit ? extractJSON<AnomalyScanResult>(hit) : null);
    setFromCache(!!hit);
    setError(null);
  }

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(async (force: boolean) => {
    if (busy || !ready) return;
    if (!force) {
      const hit = aiCacheGet(CACHE_TASK, cacheKey);
      if (hit) {
        const parsed = extractJSON<AnomalyScanResult>(hit);
        if (parsed) { setResult(parsed); setFromCache(true); setCollapsed(false); return; }
      }
    }

    setBusy(true);
    setError(null);
    setFromCache(false);
    setCollapsed(false);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const raw = await completeChat({
        provider:     ai.provider,
        model:        ai.model,
        apiKey:       ai.openRouterKey || undefined,
        localBaseUrl: ai.localBaseUrl || undefined,
        messages:     anomalyScanMessages(briefingPack),
        temperature: 0.15,
        jsonMode: true,
        signal: ctrl.signal,
        timeoutMs: 300_000,
      });
      const parsed = extractJSON<AnomalyScanResult>(raw);
      if (!parsed || !Array.isArray(parsed.findings)) {
        throw new Error('Anomaly scan returned malformed JSON.');
      }
      setResult(parsed);
      aiCacheSet(CACHE_TASK, cacheKey, JSON.stringify(parsed), CACHE_TTL);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError((e as Error).message);
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [ai.provider, ai.model, ai.openRouterKey, ai.localBaseUrl, busy, ready, briefingPack, cacheKey]);

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  };

  const findings = result?.findings ?? [];
  const hasResult = !!result;

  return (
    <section
      className="rounded-xl border border-line bg-surface shadow-card overflow-hidden"
      aria-label="AI semantic anomaly scan"
    >
      <header
        className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-line-soft"
        style={{ background: 'linear-gradient(90deg, rgba(1,105,64,0.06) 0%, rgba(200,153,30,0.05) 100%)' }}
      >
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          className="flex items-center gap-2 text-left min-w-0"
          aria-expanded={!collapsed}
        >
          {collapsed
            ? <ChevronRight size={13} className="text-ink-3 shrink-0" />
            : <ChevronDown  size={13} className="text-ink-3 shrink-0" />}
          <Radar size={13} className="text-brand-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-2 truncate">
              AI Semantic Anomaly Scan
            </div>
            <div className="text-[10.5px] text-ink-4 truncate">
              Latent patterns the rule engine has not caught — UBO opacity clusters, expiry clusters, royalty outliers, parent-level exposure.
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {fromCache && hasResult && (
            <span
              className="text-[9px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded border text-ink-4 bg-surface-2 border-line"
              title="Loaded from local cache — click Re-scan to refresh"
            >
              Cached
            </span>
          )}
          {hasResult && !busy && (
            <span className="text-[10px] font-mono text-ink-4">
              {findings.length} finding{findings.length === 1 ? '' : 's'}
            </span>
          )}
          {busy && (
            <button
              type="button"
              onClick={stop}
              className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md bg-status-danger text-white hover:opacity-90"
            >
              <Square size={11} /> Stop
            </button>
          )}
          {!busy && (
            <button
              type="button"
              onClick={() => run(hasResult)}
              disabled={!ready}
              className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {hasResult ? <RefreshCw size={11} /> : <Sparkles size={11} />}
              {hasResult ? 'Re-scan' : 'Run scan'}
            </button>
          )}
        </div>
      </header>

      {!collapsed && (
        <div className="px-4 py-3">
          {!ready && (
            <div className="rounded-lg border border-line bg-surface-2 p-3 flex items-start gap-2">
              <AlertTriangle size={13} className="text-status-warning shrink-0 mt-0.5" />
              <div className="text-[12px] text-ink-2 leading-snug">
                {ai.enabled
                  ? <>An API key is required for the selected provider. <button onClick={() => navigate('/admin')} className="text-brand-600 font-semibold underline">Configure in Admin</button>.</>
                  : <>The AI Analyst is disabled. <button onClick={() => navigate('/admin')} className="text-brand-600 font-semibold underline">Enable in Admin</button>.</>}
              </div>
            </div>
          )}

          {ready && !hasResult && !busy && !error && (
            <div className="text-[12px] text-ink-3 leading-relaxed">
              Press <span className="font-semibold text-ink-2">Run scan</span> to ask the analyst
              to look for latent patterns across operators, agreements, infrastructure and open
              flags in the current country scope. Returns a structured list of findings — each
              with cited entities and a recommended next step.
            </div>
          )}

          {busy && (
            <div className="flex items-center gap-2 text-[12px] text-ink-3">
              <Loader2 size={13} className="animate-spin" />
              Scanning {findings.length === 0 ? 'dataset' : 'updated dataset'}…
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-status-danger/40 bg-status-danger/[0.06] p-3 flex items-start gap-2">
              <AlertTriangle size={13} className="text-status-danger shrink-0 mt-0.5" />
              <div className="text-[12px] text-status-danger leading-snug min-w-0 break-words">
                {error}
              </div>
            </div>
          )}

          {hasResult && findings.length === 0 && (
            <div className="text-[12px] text-ink-3 leading-relaxed">
              No latent anomalies surfaced beyond what the rule engine already flagged. Re-scan
              after data changes if useful.
            </div>
          )}

          {hasResult && findings.length > 0 && (
            <ul className="space-y-2.5">
              {findings.map(f => (
                <li
                  key={f.id}
                  className="rounded-lg border border-line bg-surface-2 p-3 flex items-start gap-2.5"
                >
                  <span
                    className="shrink-0 w-2 h-2 rounded-full mt-1.5"
                    style={{ background: SEV_STYLE[f.severity]?.dot ?? '#94a3b8' }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={'text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ' + (SEV_STYLE[f.severity]?.chip ?? '')}>
                        {f.severity}
                      </span>
                      <span className="text-[10px] font-mono text-ink-4">{f.pattern}</span>
                    </div>
                    <div className="text-[13px] font-semibold text-ink leading-snug">
                      <CitedText text={f.title} />
                    </div>
                    <div className="text-[12px] text-ink-3 mt-1 leading-relaxed">
                      <CitedText text={f.evidence} />
                    </div>
                    {f.entities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {f.entities.map(eid => (
                          <EntityChip key={eid} id={eid} />
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-[12px] text-brand-800 bg-brand-50 border border-brand-100 rounded px-2.5 py-1.5 inline-block">
                      <span className="font-semibold">Next: </span>{f.recommended_action}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {hasResult && (
            <div className="mt-3 pt-2 border-t border-line-soft text-[10px] font-mono text-ink-4 flex items-center justify-between flex-wrap gap-1">
              <span>Model: {ai.model} · Provider: {ai.provider}</span>
              <span>Findings are advisory — confirm against source data before action</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// Resolve an entity id into a clickable chip that routes into the
// app. Falls back to a plain mono pill if the id doesn't resolve.
function EntityChip({ id }: { id: string }) {
  const navigate = useNavigate();
  let target: string | null = null;
  let label = id;

  if (id.startsWith('OP-')) {
    const op = getOperatorById(id);
    if (op) { target = `/performance/${id}`; label = op.name; }
  } else if (id.startsWith('AGR-')) {
    const ag = getAgreementById(id);
    if (ag) { target = `/agreements/${id}`; label = id; }
  } else if (id.startsWith('RISK-') || id.startsWith('DYN-')) {
    const f = getRiskFlagById(id);
    if (f) { target = `/risk/${id}`; label = id; }
  }

  if (!target) {
    return (
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-line bg-surface text-ink-4">
        {id}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => navigate(target!)}
      className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-line bg-surface text-brand-700 hover:bg-brand-50 hover:border-brand-200"
    >
      {label}
    </button>
  );
}
