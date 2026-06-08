// ============================================================
// AIBriefingPopover — floating, draggable AI brief card spawned
// from the right-click menu.
//
// Design notes:
//   • Single card at a time, attached to the chosen briefing
//     option in aiBriefingStore.
//   • Opens with a small scale-in from the cursor point so the
//     spatial relationship to the right-clicked element is clear.
//   • Draggable by the header — `position: fixed`, no portal,
//     z-index above everything.
//   • Streams the model output via streamChat. Renders entity
//     citations as clickable chips through CitedText.
//   • Parses the <<<ACTIONS>>> sentinel and renders suggested
//     actions as one-click buttons (mutations + navigation +
//     clipboard), routed through the existing dispatcher.
//   • Cache-aware via the existing aiCache; opens instantly on
//     repeat invocations of the same option.
// ============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, X, Copy, Check, Loader2, RefreshCw, Square,
  AlertTriangle, GripHorizontal,
} from 'lucide-react';
import { useAIBriefingStore } from '@/store/aiBriefingStore';
import { useAISettingsStore, isProviderReady } from '@/store/aiSettingsStore';
import { streamChat } from '@/services/aiService';
import { checkScope } from '@/lib/scopeGate';
import { useAuditStore } from '@/store/auditStore';
import { aiCacheGet, aiCacheSet, fingerprint } from '@/lib/aiCache';
import { buildDomainPrimer, OUT_OF_SCOPE_REPLY } from '@/lib/aiContext';
import { splitActions, dispatchAction, type AIAction } from '@/lib/aiActions';
import { CitedText } from '@/components/shared/CitedText';

const CARD_W = 440;
const MIN_VIEWPORT_PAD = 12;
const HEADER_H_APPROX = 56;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24h

export function AIBriefingPopover() {
  const brief    = useAIBriefingStore(s => s.brief);
  const closeBrief = useAIBriefingStore(s => s.closeBrief);

  if (!brief) return null;
  // Re-mount on key change so internal state (content, drag pos) resets per invocation.
  return <BriefCard key={brief.key} onClose={closeBrief} />;
}

function BriefCard({ onClose }: { onClose: () => void }) {
  const brief = useAIBriefingStore(s => s.brief)!;
  const ai    = useAISettingsStore();
  const ready = ai.enabled && isProviderReady(ai);
  const navigate = useNavigate();

  // ── Card position (drag) ────────────────────────────────────
  // Initial: spawn near the cursor but kept fully inside the viewport.
  const initialPos = useMemo(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const guessH = Math.min(420, vh - 2 * MIN_VIEWPORT_PAD);
    let x = brief.x + 16;
    let y = brief.y + 16;
    if (x + CARD_W + MIN_VIEWPORT_PAD > vw) x = brief.x - CARD_W - 16;
    if (y + guessH + MIN_VIEWPORT_PAD > vh) y = vh - guessH - MIN_VIEWPORT_PAD;
    x = Math.max(MIN_VIEWPORT_PAD, x);
    y = Math.max(MIN_VIEWPORT_PAD, y);
    return { x, y };
  }, [brief.x, brief.y]);

  const [pos, setPos] = useState(initialPos);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  const onHeaderDown = (e: React.MouseEvent) => {
    // Ignore drags on header buttons.
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const x = Math.max(MIN_VIEWPORT_PAD, Math.min(vw - CARD_W - MIN_VIEWPORT_PAD, e.clientX - dragRef.current.dx));
      const y = Math.max(MIN_VIEWPORT_PAD, Math.min(vh - HEADER_H_APPROX - MIN_VIEWPORT_PAD, e.clientY - dragRef.current.dy));
      setPos({ x, y });
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // ── Streaming ────────────────────────────────────────────────
  const cacheKey = useMemo(() => fingerprint(ai.model, brief.option.id), [ai.model, brief.option.id]);

  const [content, setContent] = useState<string>(() => aiCacheGet(brief.option.id, cacheKey) ?? '');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [copied, setCopied]   = useState(false);
  
  const [thread, setThread]   = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [draft, setDraft]     = useState('');

  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback((force: boolean) => {
    if (busy || !ready) return;
    if (!force) {
      const hit = aiCacheGet(brief.option.id, cacheKey);
      if (hit) { setContent(hit); return; }
    }
    setContent('');
    setError(null);
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let full = '';
    streamChat(
      {
        provider:     ai.provider,
        model:        ai.model,
        apiKey:       ai.openRouterKey || undefined,
        localBaseUrl: ai.localBaseUrl || undefined,
        messages:     brief.option.buildMessages(),
        signal:       ctrl.signal,
        temperature:  brief.option.temperature ?? 0.2,
      },
      {
        onDelta: (chunk) => {
          full += chunk;
          setContent(prev => prev + chunk);
        },
        onDone: () => {
          if (full.trim().length > 0) {
            aiCacheSet(brief.option.id, cacheKey, full, CACHE_TTL);
            useAuditStore.getState().log({
              action: 'settings_change',
              entity: 'settings',
              entityId: `ai-brief:${brief.option.id}`,
              entityLabel: `AI brief · ${brief.option.label} on ${brief.option.entityLabel}`,
              details: `${ai.provider} / ${ai.model} · ${full.length} chars`,
              user: 'AI Analyst',
            });
          }
          setBusy(false);
          abortRef.current = null;
        },
        onError: (err) => {
          setError(err.message);
          setBusy(false);
          abortRef.current = null;
        },
      },
    ).catch(() => { /* surfaced via onError */ });
  }, [ai.provider, ai.model, ai.openRouterKey, ai.localBaseUrl, busy, ready, brief.option, cacheKey]);

  const submitFollowUp = useCallback((text: string) => {
    if (busy || !ready || !text.trim()) return;
    const userMsg = { role: 'user' as const, content: text.trim() };

    setThread(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setBusy(true);
    setError(null);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // Update the trailing (placeholder) assistant turn we just appended.
    const setLastAssistant = (updater: (c: string) => string) =>
      setThread(prev => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], content: updater(next[next.length - 1].content) };
        return next;
      });

    void (async () => {
      const priorTurns = [
        ...(content.trim() ? [{ role: 'assistant' as const, content }] : []),
        ...thread,
      ];

      const scope = await checkScope(text.trim(), {
        priorTurns,
        anchorLabel: brief.option.entityLabel,
      }, {
        provider: ai.provider,
        model: ai.model,
        apiKey: ai.openRouterKey || undefined,
        localBaseUrl: ai.localBaseUrl || undefined,
        signal: ctrl.signal,
      });

      if (!scope.allowed) {
        if (ctrl.signal.aborted) {
          setBusy(false);
          abortRef.current = null;
          return;
        }
        setLastAssistant(() => scope.reply ?? OUT_OF_SCOPE_REPLY);
        setBusy(false);
        abortRef.current = null;
        return;
      }

      // Lead with the domain primer so follow-ups about the platform, map
      // markers or terminology can be answered — the brief's own messages only
      // carry the record-level pack.
      const historyForAI = [
        { role: 'system' as const, content: buildDomainPrimer() },
        ...brief.option.buildMessages(),
        { role: 'assistant' as const, content },
        ...thread,
        userMsg,
      ];

      streamChat(
        {
          provider: ai.provider,
          model: ai.model,
          apiKey: ai.openRouterKey || undefined,
          localBaseUrl: ai.localBaseUrl || undefined,
          messages: historyForAI,
          signal: ctrl.signal,
          temperature: brief.option.temperature ?? 0.2,
        },
        {
          onDelta: (chunk) => { setLastAssistant(c => c + chunk); },
          onDone: () => {
            setBusy(false);
            abortRef.current = null;
          },
          onError: (err) => {
            setError(err.message);
            setBusy(false);
            abortRef.current = null;
          },
        }
      ).catch(() => {});
    })();
  }, [ai, busy, ready, brief.option, content, thread]);

  // Auto-run on mount if nothing cached. `run` writes state via streamChat's
  // onDelta — that's intentional for this one-shot mount-time auto-fire and
  // is guarded by the cache + ready checks above so it cannot cascade.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!ready) return;
    if (content) return;
    run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Cleanup on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  // ── Dismiss handlers ─────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Body content + parsed actions ────────────────────────────
  const { prose, actions } = useMemo(() => splitActions(content), [content]);
  const hasContent = prose.trim().length > 0;

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prose);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked — silent */ }
  };

  return (
    <div
      role="dialog"
      aria-label="AI briefing"
      data-ai-overlay
      className="ai-brief-in fixed z-[1000] bg-surface dark:bg-[#141414] rounded-xl border border-line shadow-pop overflow-hidden flex flex-col"
      style={{
        left: pos.x,
        top:  pos.y,
        width: CARD_W,
        maxHeight: Math.min(560, window.innerHeight - pos.y - MIN_VIEWPORT_PAD),
        transformOrigin: `${Math.max(0, brief.x - pos.x)}px ${Math.max(0, brief.y - pos.y)}px`,
      }}
    >
      {/* Header — drag handle + entity label + actions */}
      <header
        onMouseDown={onHeaderDown}
        className="shrink-0 px-3.5 py-2.5 flex items-center gap-2 border-b border-line-soft cursor-grab active:cursor-grabbing select-none"
        style={{
          background: 'linear-gradient(180deg, #062b1d 0%, #0a3a28 100%)',
          borderBottom: '2px solid #d68a18',
        }}
      >
        <GripHorizontal size={11} className="text-white/40 shrink-0" aria-hidden />
        <Sparkles size={12} className="shrink-0" style={{ color: '#d68a18' }} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: '#d68a18' }}>
            {brief.option.label.replace(/^AI:\s*/, '')}
          </div>
          <div className="text-[11px] font-semibold text-white/85 truncate">{brief.option.entityLabel}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {busy ? (
            <button
              type="button"
              onClick={stop}
              className="text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/20 text-white/85 hover:bg-white/10"
              aria-label="Stop generating"
              title="Stop"
            >
              <Square size={9} /> Stop
            </button>
          ) : hasContent && (
            <>
              <button
                type="button"
                onClick={copy}
                className="text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/20 text-white/75 hover:text-white hover:bg-white/10"
                aria-label="Copy brief to clipboard"
                title="Copy"
              >
                {copied ? <Check size={9} /> : <Copy size={9} />}
              </button>
              <button
                type="button"
                onClick={() => run(true)}
                className="text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/20 text-white/75 hover:text-white hover:bg-white/10"
                aria-label="Regenerate"
                title="Regenerate"
              >
                <RefreshCw size={9} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-white/55 hover:text-white p-0.5 rounded"
            aria-label="Close briefing"
            title="Close (Esc)"
          >
            <X size={12} />
          </button>
        </div>
      </header>

      {/* Body — streaming content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {!ready && (
          <div className="rounded-lg border border-line bg-surface-2 p-3 flex items-start gap-2">
            <AlertTriangle size={13} className="text-status-warning shrink-0 mt-0.5" />
            <div className="text-[12px] text-ink-2 leading-snug">
              AI is not configured.{' '}
              <button onClick={() => { onClose(); navigate('/admin'); }} className="text-brand-600 font-semibold underline">
                Configure in Admin
              </button>.
            </div>
          </div>
        )}

        {ready && busy && !hasContent && (
          <div className="flex items-center gap-2 text-[12px] text-ink-3">
            <Loader2 size={13} className="animate-spin text-brand-600" />
            <span>Generating brief…</span>
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

        {hasContent && (
          <div className="text-[13px] leading-relaxed text-ink break-words">
            <CitedText text={prose} onEntityClick={onClose} />
            {busy && thread.length === 0 && (
              <span className="ai-caret inline-block w-1 h-3.5 ml-0.5 align-middle bg-brand-600" aria-hidden />
            )}
          </div>
        )}

        {/* Action strip */}
        {actions.length > 0 && thread.length === 0 && !busy && (
          <ActionStrip
            actions={actions}
            source={brief.option.id}
            navigate={(to) => { onClose(); navigate(to); }}
          />
        )}

        {/* Thread rendering */}
        {thread.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} className={`mt-4 pt-4 border-t border-line-soft text-[13px] leading-relaxed break-words ${isUser ? 'ml-4' : 'mr-4'}`}>
              <div className="font-semibold mb-1 text-[11px] uppercase tracking-wider text-ink-3">
                {isUser ? 'You' : 'Analyst'}
              </div>
              <div className={isUser ? 'text-ink-2 bg-surface-2 p-2.5 rounded-lg border border-line' : 'text-ink'}>
                {isUser ? msg.content : <CitedText text={splitActions(msg.content).prose} onEntityClick={onClose} />}
                {busy && i === thread.length - 1 && !isUser && (
                  <span className="ai-caret inline-block w-1 h-3.5 ml-0.5 align-middle bg-brand-600" aria-hidden />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      {hasContent && (
        <div className="shrink-0 p-3 border-t border-line-soft bg-surface">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draft.trim()) {
                submitFollowUp(draft);
                setDraft('');
              }
            }}
            disabled={busy}
            placeholder="Ask a follow-up..."
            className="w-full bg-surface-2 border border-line rounded-md px-3 py-2 text-[12px] text-ink focus:outline-none focus:border-brand-500 disabled:opacity-50"
          />
        </div>
      )}

      {/* Footer */}
      <footer className="shrink-0 px-4 py-1.5 border-t border-line-soft bg-surface-2 flex items-center justify-between gap-2 text-[9.5px] font-mono text-ink-4">
        <span className="truncate">
          {ai.provider === 'local' ? `local · ${ai.model}` : `${ai.provider} · ${ai.model}`}
        </span>
        <span>Drag header to move · Esc to close</span>
      </footer>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Action strip — same DSL as before, but rendered in the popover.
// ────────────────────────────────────────────────────────────────

interface ActionStripProps {
  actions: AIAction[];
  source: string;
  navigate: (to: string) => void;
}

function ActionStrip({ actions, source, navigate }: ActionStripProps) {
  const [pending, setPending] = useState<number | null>(null);
  const [toast, setToast]     = useState<{ ok: boolean; message: string } | null>(null);

  const onClick = async (a: AIAction, idx: number) => {
    setPending(idx);
    const result = await dispatchAction(a, { source, navigate });
    setPending(null);
    setToast(result);
    if (result.ok) setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="mt-3 pt-3 border-t border-line-soft">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2 text-ink-3">
        Suggested actions
      </div>
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
        <div
          role="status"
          className={
            'mt-2 inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md border ' +
            (toast.ok
              ? 'border-status-success/40 bg-status-success/[0.08] text-status-success'
              : 'border-status-danger/40 bg-status-danger/[0.08] text-status-danger')
          }
        >
          {toast.ok ? <Check size={11} /> : <AlertTriangle size={11} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
