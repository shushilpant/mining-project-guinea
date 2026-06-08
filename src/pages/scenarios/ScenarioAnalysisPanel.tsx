import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, RefreshCw, Square, AlertTriangle, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CitedText } from '@/components/shared/CitedText';
import { useAISettingsStore, isProviderReady } from '@/store/aiSettingsStore';
import { streamChat } from '@/services/aiService';
import { aiCacheGet, aiCacheSet, fingerprint } from '@/lib/aiCache';
import { useAuditStore } from '@/store/auditStore';
import { splitActions, dispatchAction, type AIAction } from '@/lib/aiActions';
import { buildScenarioContext } from '@/lib/aiContext';
import { scenarioMemoMessages } from '@/lib/aiPrompts';
import { computeProjection, scenarioFingerprintParts, type ScenarioInput } from '@/lib/revenueModel';

const CACHE_TASK = 'scenario-memo';
const CACHE_TTL = 1000 * 60 * 60 * 12; // 12h

interface PanelProps {
  scenario: ScenarioInput;
  baseline: ReturnType<typeof computeProjection>;
  projection: ReturnType<typeof computeProjection>;
}

export function ScenarioAnalysisPanel({ scenario, baseline, projection }: PanelProps) {
  const ai = useAISettingsStore();
  const ready = ai.enabled && isProviderReady(ai);
  const navigate = useNavigate();

  const cacheKey = useMemo(
    () => fingerprint(ai.model, ...scenarioFingerprintParts(scenario)),
    [ai.model, scenario],
  );

  const [content, setContent]   = useState<string>(() => aiCacheGet(CACHE_TASK, cacheKey) ?? '');
  const [genKey, setGenKey]     = useState<string>(() => (aiCacheGet(CACHE_TASK, cacheKey) ? cacheKey : ''));
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // When the scenario changes, re-pull any cached brief for the new inputs.
  const [prevKey, setPrevKey] = useState(cacheKey);
  if (prevKey !== cacheKey) {
    setPrevKey(cacheKey);
    const hit = aiCacheGet(CACHE_TASK, cacheKey);
    setContent(hit ?? '');
    setGenKey(hit ? cacheKey : '');
    setError(null);
  }

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(() => {
    if (busy || !ready) return;
    setContent('');
    setError(null);
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const pack = buildScenarioContext(scenario, baseline, projection);
    let full = '';
    streamChat(
      {
        provider: ai.provider,
        model: ai.model,
        apiKey: ai.openRouterKey || undefined,
        localBaseUrl: ai.localBaseUrl || undefined,
        messages: scenarioMemoMessages(pack),
        signal: ctrl.signal,
        temperature: 0.25,
      },
      {
        onDelta: (chunk) => { full += chunk; setContent(prev => prev + chunk); },
        onDone: () => {
          if (full.trim().length > 0) {
            aiCacheSet(CACHE_TASK, cacheKey, full, CACHE_TTL);
            setGenKey(cacheKey);
            useAuditStore.getState().log({
              action: 'settings_change', entity: 'settings',
              entityId: 'ai-scenario-memo',
              entityLabel: 'AI fiscal scenario interpretation',
              details: `${ai.provider} / ${ai.model} · ${full.length} chars`,
              user: 'AI Analyst',
            });
          }
          setBusy(false); abortRef.current = null;
        },
        onError: (err) => { setError(err.message); setBusy(false); abortRef.current = null; },
      },
    ).catch(() => {});
  }, [ai, busy, ready, scenario, baseline, projection, cacheKey]);

  const stop = () => { abortRef.current?.abort(); abortRef.current = null; setBusy(false); };

  const { prose, actions } = useMemo(() => splitActions(content), [content]);
  // CitedText renders **bold** but not Markdown headings — turn the memo's
  // "## Section" lines into bold so the headings show cleanly without hashes.
  const displayProse = useMemo(() => prose.replace(/^\s{0,3}#{1,6}\s+(.+?)\s*$/gm, '**$1**'), [prose]);
  const hasContent = prose.trim().length > 0;
  // Brief was generated for an earlier set of inputs (cache miss for current key).
  const stale = hasContent && genKey !== cacheKey;

  const copy = async () => {
    try { await navigator.clipboard.writeText(prose); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  };

  return (
    <section className="rounded-xl border border-line bg-surface shadow-card overflow-hidden" aria-label="AI fiscal interpretation">
      <header
        className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-line-soft"
        style={{ background: 'linear-gradient(90deg, rgba(1,105,64,0.06) 0%, rgba(200,153,30,0.05) 100%)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={13} className="text-brand-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-2 truncate">Ministerial interpretation</div>
            <div className="text-[10.5px] text-ink-4 truncate">The Fiscal Scenario Analyst reads the projected figures above — fiscal impact, exposure, recommended posture.</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasContent && !busy && (
            <button type="button" onClick={copy} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md border border-line text-ink-3 hover:text-ink hover:bg-surface-2" title="Copy">
              {copied ? <Check size={11} /> : <Copy size={11} />}
            </button>
          )}
          {busy ? (
            <button type="button" onClick={stop} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md bg-status-danger text-white hover:opacity-90">
              <Square size={11} /> Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={run}
              disabled={!ready}
              className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {hasContent ? <RefreshCw size={11} /> : <Sparkles size={11} />}
              {hasContent ? (stale ? 'Re-analyse' : 'Re-analyse') : 'Analyse scenario'}
            </button>
          )}
        </div>
      </header>

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

        {ready && !hasContent && !busy && !error && (
          <div className="text-[12px] text-ink-3 leading-relaxed">
            Press <span className="font-semibold text-ink-2">Analyse scenario</span> to have the analyst interpret the current projection —
            what drives the change, where it lands, the stability-clause and arbitration exposure, and what to model next. Every figure it cites is taken from the deterministic projection above.
          </div>
        )}

        {busy && !hasContent && (
          <div className="flex items-center gap-2 text-[12px] text-ink-3"><Loader2 size={13} className="animate-spin text-brand-600" /> Interpreting projection…</div>
        )}

        {error && (
          <div className="rounded-lg border border-status-danger/40 bg-status-danger/[0.06] p-3 flex items-start gap-2">
            <AlertTriangle size={13} className="text-status-danger shrink-0 mt-0.5" />
            <div className="text-[12px] text-status-danger leading-snug min-w-0 break-words">{error}</div>
          </div>
        )}

        {stale && !busy && (
          <div className="mb-2 inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-800">
            <AlertTriangle size={11} /> Conditions changed since this analysis — re-analyse to refresh.
          </div>
        )}

        {hasContent && (
          <div className={cn('text-[13px] leading-relaxed text-ink break-words', stale && 'opacity-60')}>
            <CitedText text={displayProse} />
            {busy && <span className="ai-caret inline-block w-1 h-3.5 ml-0.5 align-middle bg-brand-600" aria-hidden />}
          </div>
        )}

        {actions.length > 0 && !busy && (
          <ScenarioActionStrip actions={actions} navigate={navigate} />
        )}

        {hasContent && (
          <div className="mt-3 pt-2 border-t border-line-soft text-[10px] font-mono text-ink-4 flex items-center justify-between flex-wrap gap-1">
            <span>Model: {ai.model} · Provider: {ai.provider}</span>
            <span>Interprets the deterministic projection — figures are not model-generated</span>
          </div>
        )}
      </div>
    </section>
  );
}

function ScenarioActionStrip({ actions, navigate }: { actions: AIAction[]; navigate: (to: string) => void }) {
  const [pending, setPending] = useState<number | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);

  const onClick = async (a: AIAction, idx: number) => {
    setPending(idx);
    const result = await dispatchAction(a, { source: 'ai.scenario', navigate });
    setPending(null);
    setToast(result);
    if (result.ok) setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="mt-3 pt-3 border-t border-line-soft">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2 text-ink-3">Suggested actions</div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onClick(a, i)}
            disabled={pending !== null}
            title={a.hint ?? a.label}
            className="text-[11px] font-medium flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-line bg-surface-2 text-ink-2 hover:border-brand-600 hover:bg-brand-50 hover:text-brand-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            <Sparkles size={10} className="text-brand-600" />
            {a.label}
            {pending === i && <Loader2 size={11} className="animate-spin ml-0.5" />}
          </button>
        ))}
      </div>
      {toast && (
        <div role="status" className={cn(
          'mt-2 inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md border',
          toast.ok ? 'border-status-success/40 bg-status-success/[0.08] text-status-success' : 'border-status-danger/40 bg-status-danger/[0.08] text-status-danger',
        )}>
          {toast.ok ? <Check size={11} /> : <AlertTriangle size={11} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
