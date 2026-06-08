// ============================================================
// aiService — provider-agnostic streaming chat client.
//
// All three supported providers (Local / Pollinations / OpenRouter) speak
// the OpenAI chat/completions wire format, so one SSE parser handles all.
// The only per-provider differences are the URL, the auth header, and a
// few nice-to-have headers (OpenRouter likes a site/title for analytics).
//
// CORS:
//   • Local       — Ollama responds with `access-control-allow-origin: *`
//                   by default. LM Studio and llama.cpp do the same. Works
//                   from any origin including file://. No proxy needed.
//                   If the user disabled CORS in their local server config,
//                   set OLLAMA_ORIGINS=* (Ollama) or restart with --cors.
//   • Pollinations — `access-control-allow-origin: *`.
//   • OpenRouter  — documented as browser-callable.
//
// Pollinations status (2026): the legacy text endpoint
// (text.pollinations.ai) remains supported for ANONYMOUS requests. The
// authenticated/legacy path is being phased out in favour of
// enter.pollinations.ai. We send NO auth header to Pollinations, so we
// stay on the anonymous path and require no migration today.
// ============================================================

import type { AIProvider } from '@/store/aiSettingsStore';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Permanent house style applied to EVERY outgoing request, regardless of which
// prompt builder produced the messages. Injected as the first system message so
// it governs all downstream personas. Deliberately silent: the model must never
// announce, explain, or acknowledge this rule — it just writes this way.
const HOUSE_STYLE_RULE: ChatMessage = {
  role: 'system',
  content:
    'House style — always apply, in every response, without exception: write in ' +
    'British English. Use British spelling (e.g. -ise/-isation not -ize/-ization; ' +
    'colour, favour, behaviour, organisation, licence as a noun, defence, centre, ' +
    'metre, analyse, catalogue, programme, modelling, travelled) together with ' +
    'British vocabulary, punctuation and date conventions throughout. This rule is ' +
    'permanent and silent: never mention it, never explain it, and never state that ' +
    'you are using British English or that you were asked to — simply comply.',
};

/** Prepend the permanent house-style rule to any outgoing message list. */
function applyHouseStyle(messages: ChatMessage[]): ChatMessage[] {
  return [HOUSE_STYLE_RULE, ...messages];
}

export interface StreamHandlers {
  /** Called for every content chunk (already concatenated-safe). */
  onDelta: (chunk: string) => void;
  /** Called once at the end with the full text. */
  onDone?: (full: string) => void;
  /** Called on any error — network, HTTP, parse. */
  onError?: (err: Error) => void;
}

export interface StreamOptions {
  provider: AIProvider;
  model: string;
  apiKey?: string;       // required for openrouter
  /** OpenAI-compatible base URL for the local provider (e.g. http://localhost:11434/v1). */
  localBaseUrl?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

interface ProviderConfig {
  url: string;
  headers: Record<string, string>;
}

const POLLINATIONS_MAX_ATTEMPTS = 4;
const POLLINATIONS_429_BACKOFF_MS = [3_000, 8_000, 15_000];

function resolveProvider(
  provider: AIProvider,
  apiKey?: string,
  localBaseUrl?: string,
): ProviderConfig {
  if (provider === 'openrouter') {
    if (!apiKey) throw new Error('OpenRouter API key is required. Add one under Admin → AI Assistant.');
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${apiKey}`,
        // OpenRouter analytics — purely cosmetic, harmless if absent.
        'HTTP-Referer':  typeof window !== 'undefined' ? window.location.origin : 'https://acci.local',
        'X-Title':       'ACCI Compliance Analyst',
      },
    };
  }
  if (provider === 'local') {
    const base = (localBaseUrl ?? '').trim().replace(/\/+$/, '');
    if (!base) throw new Error('Local LLM base URL is not set. Configure it under Admin → AI Assistant.');
    // Both Ollama (`/v1/chat/completions`) and LM Studio expose the OpenAI
    // surface; we never send Authorization on this branch because nothing
    // local needs it and a stray header can confuse some servers.
    return {
      url: `${base}/chat/completions`,
      headers: { 'Content-Type': 'application/json' },
    };
  }
  // pollinations — keyless, OpenAI‑compatible endpoint.
  //
  // We use our own Vercel Edge proxy `/api/ai` if running in production to
  // bypass Pollinations' strict IP-based concurrency limits (1 per IP) by
  // injecting a randomized X-Forwarded-For header. In local dev, we hit it directly.
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  return {
    url: isLocalhost ? 'https://text.pollinations.ai/openai' : '/api/ai',
    headers: { 'Content-Type': 'application/json' },
  };
}

// Global mutex to prevent concurrent requests to Pollinations, which strictly
// limits the free anonymous tier to 1 in-flight request per IP.
let aiMutex = Promise.resolve();
async function withAIMutex<T>(fn: () => Promise<T>): Promise<T> {
  const unlock = aiMutex.catch(() => {});
  let release!: () => void;
  aiMutex = new Promise(resolve => { release = resolve; });
  await unlock;
  try { return await fn(); } finally { release(); }
}

function isPollinationsQueueFull(provider: AIProvider, res: Response): boolean {
  return provider === 'pollinations' && res.status === 429;
}

function retryAfterMs(res: Response): number | null {
  const header = res.headers.get('Retry-After');
  if (!header) return null;

  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;

  const dateMs = Date.parse(header);
  if (Number.isFinite(dateMs)) return Math.max(0, dateMs - Date.now());

  return null;
}

async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return;
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => signal?.removeEventListener('abort', onAbort);
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      cleanup();
      reject(signal?.reason instanceof Error ? signal.reason : new DOMException('Aborted', 'AbortError'));
    };

    if (signal) {
      if (signal.aborted) onAbort();
      else signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}

async function fetchWithPollinationsBackoff(
  provider: AIProvider,
  config: ProviderConfig,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<Response> {
  const maxAttempts = provider === 'pollinations' ? POLLINATIONS_MAX_ATTEMPTS : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const res = await fetch(config.url, {
      method: 'POST',
      headers: config.headers,
      signal,
      body: JSON.stringify(body),
    });

    if (!isPollinationsQueueFull(provider, res) || attempt === maxAttempts - 1) return res;

    await res.body?.cancel().catch(() => {});
    const fallbackMs = POLLINATIONS_429_BACKOFF_MS[Math.min(attempt, POLLINATIONS_429_BACKOFF_MS.length - 1)];
    await sleep(retryAfterMs(res) ?? fallbackMs, signal);
  }

  throw new Error('Pollinations retry loop exited unexpectedly.');
}

/**
 * Streams a chat completion. Returns the full assembled text after the stream
 * closes (also available via onDone). Caller can abort with `signal`.
 */
export async function streamChat(opts: StreamOptions, handlers: StreamHandlers): Promise<string> {
  return withAIMutex(async () => {
    const { provider, model, apiKey, localBaseUrl, messages, temperature = 0.3, maxTokens, signal } = opts;
    const started = performance.now();

    let config: ProviderConfig;
    try {
      config = resolveProvider(provider, apiKey, localBaseUrl);
    } catch (e) {
      handlers.onError?.(e as Error);
      recordCall({ task: 'stream', model, provider, ms: 0, ok: false, error: (e as Error).message });
      throw e;
    }

    let res: Response;
    try {
      res = await fetchWithPollinationsBackoff(provider, config, {
        model,
        messages: applyHouseStyle(messages),
        stream: true,
        temperature,
        ...(maxTokens != null && { max_tokens: maxTokens }),
      }, signal);
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      recordCall({ task: 'stream', model, provider, ms: performance.now() - started, ok: true, chars: 0 });
      return '';
    }
    const err = e instanceof Error ? e : new Error(String(e));
    handlers.onError?.(err);
    throw err;
  }

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    const err = new Error(
      `${provider} returned HTTP ${res.status}${text ? ` — ${text.slice(0, 200)}` : ''}`,
    );
    handlers.onError?.(err);
    throw err;
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full   = '';

  try {
    // SSE frames are delimited by blank lines. Each `data: …` line is JSON
    // (or the literal "[DONE]"). We buffer partial lines across reads.
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let nl;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const rawLine = buffer.slice(0, nl).replace(/\r$/, '');
        buffer = buffer.slice(nl + 1);
        if (!rawLine.startsWith('data:')) continue;

        const payload = rawLine.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;

        let parsed: unknown;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue; // ignore malformed frames
        }

        const delta = extractDelta(parsed);
        if (delta) {
          full += delta;
          handlers.onDelta(delta);
        }
      }
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      // Caller cancelled — surface as a clean done with whatever we collected.
      handlers.onDone?.(full);
      recordCall({ task: 'stream', model, provider, ms: performance.now() - started, ok: true, chars: full.length });
      return full;
    }
    const err = e instanceof Error ? e : new Error(String(e));
    handlers.onError?.(err);
    recordCall({ task: 'stream', model, provider, ms: performance.now() - started, ok: false, error: err.message });
    throw err;
  }

  handlers.onDone?.(full);
  recordCall({ task: 'stream', model, provider, ms: performance.now() - started, ok: true, chars: full.length });
  return full;
  });
}

/**
 * Pulls the assistant content delta out of an OpenAI-style streaming chunk.
 *
 * Thinking models (e.g. Qwen3.6-Opus-Deckard) emit `reasoning_content` deltas
 * during internal chain-of-thought, then switch to `content` for the final
 * answer. We surface **both** so the AI panel shows progress during the
 * thinking phase — reasoning tokens are prefixed to make them visually
 * distinct, but the user sees *something* rather than a frozen spinner.
 *
 * Pollinations may also emit a `reasoning` field; we ignore that legacy key
 * and only handle the OpenAI-compatible `reasoning_content`.
 */
function extractDelta(chunk: unknown): string {
  if (!chunk || typeof chunk !== 'object') return '';
  const choices = (chunk as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return '';
  const first = choices[0] as {
    delta?: { content?: unknown; reasoning_content?: unknown };
    message?: { content?: unknown; reasoning_content?: unknown };
  };
  // Prefer real content; fall back to reasoning_content for thinking models.
  const fromDelta   = first?.delta?.content ?? first?.delta?.reasoning_content;
  const fromMessage = first?.message?.content ?? first?.message?.reasoning_content;
  const c = fromDelta ?? fromMessage;
  return typeof c === 'string' ? c : '';
}

// ────────────────────────────────────────────────────────────────
// Non-streaming completion — used by structured-output tasks (triage
// briefs, negotiation memos, anomaly scans) where we want the full
// response in one shot so we can JSON-parse / cache it safely.
// ────────────────────────────────────────────────────────────────

export interface CompleteOptions extends Omit<StreamOptions, 'signal'> {
  signal?: AbortSignal;
  /** Hint to providers that support structured output. We always degrade
   *  gracefully — `extractJSON` doesn't rely on this being honoured. */
  jsonMode?: boolean;
  /** Soft request timeout in ms. Default 5 min — generous because the default
   *  provider is a local thinking model that can take minutes to respond. */
  timeoutMs?: number;
}

export async function completeChat(opts: CompleteOptions): Promise<string> {
  return withAIMutex(async () => {
    const {
      provider, model, apiKey, localBaseUrl, messages,
      temperature = 0.2, maxTokens, jsonMode = false,
      signal, timeoutMs = 300_000,
    } = opts;
    const started = performance.now();

  const config = resolveProvider(provider, apiKey, localBaseUrl);

  // Compose an inner abort that fires on either the caller signal or our
  // own timeout — whichever comes first. We never throw past the caller.
  const ctrl = new AbortController();
  const innerTimer = setTimeout(() => ctrl.abort(new Error('AI request timed out')), timeoutMs);
  const onParentAbort = () => ctrl.abort(signal!.reason);
  if (signal) {
    if (signal.aborted) ctrl.abort(signal.reason);
    else signal.addEventListener('abort', onParentAbort, { once: true });
  }

  let res: Response;
  try {
    const body: Record<string, unknown> = {
      model, messages: applyHouseStyle(messages),
      stream: false,
      temperature,
    };
    if (maxTokens != null) body.max_tokens = maxTokens;
    if (jsonMode) body.response_format = { type: 'json_object' };

    res = await fetchWithPollinationsBackoff(provider, config, body, ctrl.signal);
  } catch (e) {
    clearTimeout(innerTimer);
    signal?.removeEventListener('abort', onParentAbort);
    recordCall({ task: 'complete', model, provider, ms: performance.now() - started, ok: false, error: (e as Error).message });
    throw e instanceof Error ? e : new Error(String(e));
  }

  clearTimeout(innerTimer);
  signal?.removeEventListener('abort', onParentAbort);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`${provider} returned HTTP ${res.status}${text ? ` — ${text.slice(0, 200)}` : ''}`);
    recordCall({ task: 'complete', model, provider, ms: performance.now() - started, ok: false, error: err.message });
    throw err;
  }

  const json = await res.json().catch(() => null) as unknown;
  const content = extractFullContent(json);
  recordCall({
    task: 'complete', model, provider, ms: performance.now() - started, ok: true,
    chars: content.length,
  });
  return content;
  });
}

function extractFullContent(json: unknown): string {
  if (!json || typeof json !== 'object') return '';
  const choices = (json as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return '';
  const first = choices[0] as {
    message?: { content?: unknown; reasoning_content?: unknown };
    text?: unknown;
  };
  const fromMsg = first?.message?.content;
  if (typeof fromMsg === 'string' && fromMsg.trim()) return fromMsg;
  // Thinking models may put everything into reasoning_content when content is empty.
  const fromReasoning = first?.message?.reasoning_content;
  if (typeof fromReasoning === 'string' && fromReasoning.trim()) return fromReasoning;
  if (typeof first?.text === 'string') return first.text;
  return '';
}

// ────────────────────────────────────────────────────────────────
// Prompt-injection hardening
//
// User-controlled text (typed prompts, edited descriptions) is always
// wrapped in <<<USER_DATA>>> fences before being concatenated into a
// system or assistant slot, and any obvious role-escape strings are
// neutralised. This is not a substitute for least-privilege tool use,
// but it removes the trivial "ignore previous instructions" class.
// ────────────────────────────────────────────────────────────────

const INJECTION_PATTERNS: RegExp[] = [
  /ignore (?:all |the )?previous (?:instructions|messages|prompts)/gi,
  /disregard (?:all |the )?(?:above|prior|previous) (?:instructions|context|rules)/gi,
  /system\s*[:-]\s*you are/gi,
  /<\s*\/?\s*system\s*>/gi,
  /\[\s*system\s*\]/gi,
];

export function sanitizeUserText(s: string, maxLen = 4_000): string {
  let out = (s ?? '').slice(0, maxLen);
  for (const re of INJECTION_PATTERNS) out = out.replace(re, '[redacted]');
  return out.replace(/<<<\/?USER_DATA>>>/g, '[redacted]');
}

export function fenceUserText(s: string): string {
  return `<<<USER_DATA>>>\n${sanitizeUserText(s)}\n<<</USER_DATA>>>`;
}

// ────────────────────────────────────────────────────────────────
// Structured-output parsing
//
// Open-weight models frequently wrap JSON in prose or ```json fences.
// extractJSON is tolerant: it searches for the first balanced object or
// array in the string. Returns null instead of throwing so callers can
// degrade to "show raw text".
// ────────────────────────────────────────────────────────────────

export function extractJSON<T = unknown>(raw: string): T | null {
  if (!raw) return null;
  // Strip common code fences first.
  const stripped = raw
    .replace(/```(?:json)?\s*/gi, '')
    .replace(/```/g, '')
    .trim();
  // Try direct parse.
  try { return JSON.parse(stripped) as T; } catch { /* fall through */ }
  // Find first balanced { … } or [ … ] block.
  const start = stripped.search(/[[{]/);
  if (start < 0) return null;
  const open = stripped[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < stripped.length; i++) {
    const ch = stripped[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) {
        const candidate = stripped.slice(start, i + 1);
        try { return JSON.parse(candidate) as T; } catch { return null; }
      }
    }
  }
  return null;
}

// ────────────────────────────────────────────────────────────────
// Observability — a tiny in-memory ring buffer of the last 50 calls.
// Admin can read this via `getRecentCalls()` to spot-check latency
// and error rate without pulling in a real telemetry stack.
// ────────────────────────────────────────────────────────────────

export interface AICallRecord {
  task: 'stream' | 'complete' | 'test';
  provider: AIProvider;
  model: string;
  ms: number;
  ok: boolean;
  chars?: number;
  error?: string;
  at: number;
}

const CALL_LOG: AICallRecord[] = [];
const CALL_LOG_MAX = 50;

function recordCall(r: Omit<AICallRecord, 'at'>): void {
  CALL_LOG.push({ ...r, at: Date.now() });
  if (CALL_LOG.length > CALL_LOG_MAX) CALL_LOG.shift();
}

export function getRecentCalls(): AICallRecord[] {
  return CALL_LOG.slice().reverse();
}

/**
 * Lightweight ping used by the Admin "Test connection" button. Returns true
 * iff the provider answers with something non-empty in a few seconds.
 */
export async function testProvider(
  provider: AIProvider,
  model: string,
  apiKey?: string,
  localBaseUrl?: string,
): Promise<{ ok: true; sample: string } | { ok: false; error: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new Error('Connection timed out')), 60000);
  let sample = '';
  try {
    await streamChat(
      {
        provider,
        model,
        apiKey,
        localBaseUrl,
        signal: ctrl.signal,
        maxTokens: 200,
        temperature: 0,
        messages: [
          { role: 'system', content: 'Reply with one short sentence confirming you are online.' },
          { role: 'user',   content: 'Confirm connectivity.' },
        ],
      },
      { onDelta: (d) => { sample += d; } },
    );
    clearTimeout(timer);
    const trimmed = sample.trim();
    if (!trimmed) return { ok: false, error: 'Empty response from provider.' };
    return { ok: true, sample: trimmed.slice(0, 200) };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, error: (e as Error).message };
  }
}
