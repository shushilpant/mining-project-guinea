// ============================================================
// AIAssistant — header-anchored slide-over panel that wires the live data
// context, the Pollinations / OpenRouter streaming client, and a small
// chat UI into a single "ACCI Compliance Analyst" experience.
//
// Design notes:
//   • Visually matches NotificationPanel (forest-900 header strip, gold
//     rule, mono accents) so it feels native to the gov design system.
//   • Quick-action chips pre-fill ministerial prompts so a user can get
//     value without typing.
//   • The grounded briefing pack is rebuilt for every send so country
//     changes and data edits are always reflected.
//   • Streaming uses an AbortController; the Send button doubles as Stop
//     mid-stream.
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Square, X, Settings2, AlertTriangle, Eraser, Bot, User } from 'lucide-react';
import { useCountry } from '@/context/CountryContext';
import { useAISettingsStore, isProviderReady } from '@/store/aiSettingsStore';
import { streamChat, type ChatMessage } from '@/services/aiService';
import { buildContext, buildSystemPrompt } from '@/lib/aiContext';
import { CitedText } from '@/components/shared/CitedText';

const GOLD = '#d68a18';
const SIDEBAR_BG = '#062b1d';

const COUNTRY_LABEL: Record<string, string> = {
  ALL: 'West Africa region',
  GIN: 'Republic of Guinea',
  GHA: 'Republic of Ghana',
  CIV: "Republic of Côte d'Ivoire",
};

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'briefing',
    label: 'Ministerial briefing',
    prompt: 'Draft this week\'s ministerial briefing. Lead with the 3 to 5 items that warrant the Minister\'s attention in the current country scope, each with a recommended action and an explicit operator / agreement reference. End with one paragraph on overall compliance posture.',
  },
  {
    id: 'risks',
    label: 'Top risks explained',
    prompt: 'Walk me through the most severe open risk flags in scope. For each, explain in plain language what the underlying problem is, why it matters for revenue or social licence, and the single most important next step. Group by operator if there are clusters.',
  },
  {
    id: 'negotiation',
    label: 'Negotiation guidance',
    prompt: 'Looking only at the agreements in the briefing pack, identify any that look out of line on royalty rate or contract value relative to their peers in the same commodity. Suggest concrete renegotiation points and the evidence the team should put on the table.',
  },
  {
    id: 'anomalies',
    label: 'Anomaly hunt',
    prompt: 'Scan the briefing pack for anomalies and red flags that may not yet have triggered a formal risk rule: opaque ultimate beneficial owners, ownership changes, expiry dates clustered together, breached commitments that share a single operator, infrastructure projects stuck below 50% progress. Surface anything that warrants an audit.',
  },
];

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** True while this assistant message is still being streamed. */
  streaming?: boolean;
  /** Set if generation failed mid-flight. */
  error?: string;
}

function shortId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function AIAssistant() {
  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState('');
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [busy, setBusy]         = useState(false);
  const abortRef    = useRef<AbortController | null>(null);
  const panelRef    = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);
  const navigate    = useNavigate();

  const { selectedCountry } = useCountry();
  const ai = useAISettingsStore();
  const ready = isProviderReady(ai) && ai.enabled;

  // ── Close on outside click / Escape ─────────────────────────
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // ── Auto-focus composer when panel opens ────────────────────
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  // ── Auto-scroll on new content ──────────────────────────────
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // ── Cleanup any in-flight stream on unmount ─────────────────
  useEffect(() => () => abortRef.current?.abort(), []);


  const send = useCallback((promptText: string, extraPack?: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || busy) return;
    if (!ready) return;

    const userMsg: UIMessage = { id: shortId(), role: 'user', content: trimmed };
    const asstId = shortId();
    const placeholder: UIMessage = { id: asstId, role: 'assistant', content: '', streaming: true };
    setMessages(prev => [...prev, userMsg, placeholder]);
    setInput('');
    setBusy(true);

    // Rebuild the briefing pack on every send so it reflects the *current*
    // country selection and any admin edits made since the last turn.
    const context  = buildContext({ countryId: selectedCountry });
    const sysPrompt = buildSystemPrompt(COUNTRY_LABEL[selectedCountry] ?? 'West Africa region');

    // We replay prior turns so the model has conversation memory, but keep
    // the briefing pack as a single fresh message right before the user's
    // current question — that way the model always sees current data.
    const history: ChatMessage[] = messages
      .filter(m => !m.error)
      .map(m => ({ role: m.role, content: m.content }));

    const wire: ChatMessage[] = [
      { role: 'system', content: sysPrompt },
      ...history,
      { role: 'system', content: `BRIEFING PACK (live data, ground every answer in this):\n\n${context}` },
      ...(extraPack
        ? [{ role: 'system' as const, content: `ANCHOR — the user opened this chat from a specific record. Treat this as the primary context for the next answer:\n\n${extraPack}` }]
        : []),
      { role: 'user',   content: trimmed },
    ];

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    streamChat(
      {
        provider:     ai.provider,
        model:        ai.model,
        apiKey:       ai.openRouterKey || undefined,
        localBaseUrl: ai.localBaseUrl || undefined,
        messages:     wire,
        signal:       ctrl.signal,
      },
      {
        onDelta: (chunk) => {
          setMessages(prev => prev.map(m =>
            m.id === asstId ? { ...m, content: m.content + chunk } : m,
          ));
        },
        onDone: () => {
          setMessages(prev => prev.map(m =>
            m.id === asstId ? { ...m, streaming: false } : m,
          ));
          setBusy(false);
          abortRef.current = null;
        },
        onError: (err) => {
          setMessages(prev => prev.map(m =>
            m.id === asstId ? { ...m, streaming: false, error: err.message } : m,
          ));
          setBusy(false);
          abortRef.current = null;
        },
      },
    ).catch(() => { /* error already surfaced via onError */ });
  }, [busy, ready, messages, selectedCountry, ai.provider, ai.model, ai.openRouterKey, ai.localBaseUrl]);

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  };

  const sendFromComposer = () => send(input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendFromComposer();
    }
  };

  const clearChat = () => {
    if (busy) stop();
    setMessages([]);
  };

  // ── Trigger button (header) ─────────────────────────────────
  return (
    <div className="relative shrink-0" ref={panelRef}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Open AI Compliance Analyst"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-[12px] font-semibold transition-colors bg-surface-2 border border-line text-ink-2 hover:border-line-strong hover:text-ink whitespace-nowrap"
      >
        <Sparkles size={13} className="text-brand-600 shrink-0" aria-hidden />
        <span className="header-ctrl-label">AI Analyst</span>
        {ai.provider === 'pollinations' && (
          <span
            className="ml-0.5 w-1.5 h-1.5 rounded-full pulse-live"
            style={{ background: GOLD }}
            aria-hidden
            title="AI ready (open-source model)"
          />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="AI Compliance Analyst"
          className="absolute right-0 top-full mt-2 w-[460px] max-w-[calc(100vw-2rem)] bg-card rounded-xl shadow-pop z-50 overflow-hidden border border-line flex flex-col"
          style={{ height: 'min(640px, calc(100vh - 5rem))' }}
        >
          {/* Header strip */}
          <div
            className="px-4 py-3 flex items-center justify-between shrink-0"
            style={{ background: SIDEBAR_BG, borderBottom: `2px solid ${GOLD}` }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles size={12} style={{ color: GOLD }} aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-widest truncate" style={{ color: GOLD }}>
                ACCI Compliance Analyst
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono text-white/40 truncate max-w-[120px]" title={ai.model}>
                {ai.model.split('/').pop()}
              </span>
              <button
                onClick={() => { setOpen(false); navigate('/admin'); }}
                className="text-white/50 hover:text-white"
                aria-label="Open AI settings"
                title="AI settings (Admin)"
              >
                <Settings2 size={13} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-white/50 hover:text-white"
                aria-label="Close assistant"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Scope strip */}
          <div className="px-4 py-2 flex items-center justify-between shrink-0 bg-secondary border-b border-line-soft">
            <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-ink-4">
              Scope
            </span>
            <span className="text-[11px] font-medium text-ink-2">
              {COUNTRY_LABEL[selectedCountry] ?? selectedCountry}
            </span>
          </div>

          {/* Body */}
          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {!ready && (
              <div className="rounded-lg border border-line bg-surface-2 p-3 flex items-start gap-2">
                <AlertTriangle size={14} className="text-status-warning shrink-0 mt-0.5" />
                <div className="text-xs text-ink-2 leading-snug">
                  {ai.enabled
                    ? <>An OpenRouter API key is required for this provider. <button onClick={() => { setOpen(false); navigate('/admin'); }} className="text-brand-600 font-semibold underline">Configure in Admin</button>.</>
                    : <>The AI Analyst is currently disabled. <button onClick={() => { setOpen(false); navigate('/admin'); }} className="text-brand-600 font-semibold underline">Enable in Admin</button>.</>}
                </div>
              </div>
            )}

            {messages.length === 0 && ready && (
              <>
                <div className="text-xs text-ink-3 leading-relaxed">
                  Ask anything about the operators, agreements, commitments, and risk flags in scope.
                  Every answer is grounded in the live data you are viewing — no external sources.
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {QUICK_ACTIONS.map(q => (
                    <button
                      key={q.id}
                      onClick={() => send(q.prompt)}
                      className="text-left rounded-lg border border-line bg-card px-3 py-2.5 hover:border-brand-600 hover:bg-brand-50/40 transition-colors group"
                    >
                      <div className="text-[11px] font-semibold text-ink-2 group-hover:text-brand-700">
                        {q.label}
                      </div>
                      <div className="text-[10px] text-ink-4 mt-0.5 leading-snug line-clamp-2">
                        {q.prompt.slice(0, 70)}…
                      </div>
                    </button>
                  ))}
                </div>
                <div className="text-[10px] font-mono text-ink-4 pt-1">
                  Model: {ai.model} · Provider: {ai.provider}
                </div>
              </>
            )}

            {messages.map(m => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-line bg-secondary px-3 py-2.5">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder={ready ? 'Ask about operators, risks, agreements…' : 'AI Analyst is not configured'}
                disabled={!ready}
                data-focus-ring="custom"
                className="flex-1 resize-none rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink placeholder:text-ink-4 outline-none focus:border-brand-600 disabled:opacity-50"
              />
              {busy ? (
                <button
                  onClick={stop}
                  className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-status-danger text-white hover:opacity-90"
                  aria-label="Stop generating"
                  title="Stop generating"
                >
                  <Square size={14} />
                </button>
              ) : (
                <button
                  onClick={sendFromComposer}
                  disabled={!ready || !input.trim()}
                  className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send"
                  title="Send (Enter)"
                >
                  <Send size={14} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-ink-4">
                Enter to send · Shift+Enter for newline
              </span>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-[10px] flex items-center gap-1 text-ink-4 hover:text-ink-2"
                >
                  <Eraser size={10} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Message rendering
//
// We deliberately keep this lo-fi: whitespace-pre-wrap respects the model's
// own newlines and bullets, and `prose`-style libraries would bloat the
// bundle without changing the visual feel of the gov UI.
// ────────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className="flex items-start gap-2.5">
      <div
        className={
          'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ' +
          (isUser ? 'bg-forest-800 text-white' : 'bg-brand-50 text-brand-700 border border-line')
        }
        aria-hidden
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink-4 mb-1">
          {isUser ? 'You' : 'Analyst'}
        </div>
        <div
          className={
            'text-[13px] leading-relaxed break-words rounded-lg px-3 py-2 ' +
            (isUser
              ? 'bg-surface-2 text-ink-2 border border-line-soft whitespace-pre-wrap'
              : 'bg-surface text-ink border border-line')
          }
        >
          {message.content
            ? (isUser
                ? message.content
                : <CitedText text={message.content} />)
            : (message.streaming ? <StreamingDots /> : <em className="text-ink-4">(no response)</em>)}
          {message.streaming && message.content && <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-brand-600 animate-pulse" aria-hidden />}
        </div>
        {message.error && (
          <div className="mt-1.5 text-[11px] text-status-danger flex items-center gap-1.5">
            <AlertTriangle size={11} /> {message.error}
          </div>
        )}
      </div>
    </div>
  );
}

function StreamingDots() {
  return (
    <span className="inline-flex items-center gap-1 text-ink-4" aria-label="Generating">
      <span className="w-1.5 h-1.5 rounded-full bg-ink-4 animate-pulse" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-4 animate-pulse [animation-delay:120ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-4 animate-pulse [animation-delay:240ms]" />
    </span>
  );
}
