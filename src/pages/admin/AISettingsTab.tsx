import { useState } from 'react';
import { Sparkles, Eye, EyeOff, Loader2, Check, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  useAISettingsStore,
  LOCAL_MODELS,
  POLLINATIONS_MODELS,
  OPENROUTER_MODELS,
  DEFAULT_LOCAL_BASE_URL,
  type AIProvider,
} from '@/store/aiSettingsStore';
import { testProvider } from '@/services/aiService';
import { inputCls } from '@/pages/admin/shared';

export function AISettingsTab() {
  const {
    provider, model, openRouterKey, localBaseUrl, enabled,
    setProvider, setModel, setOpenRouterKey, setLocalBaseUrl, setEnabled, reset,
  } = useAISettingsStore();

  const [showKey, setShowKey]       = useState(false);
  const [testing, setTesting]       = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; message: string }>(null);

  const modelOptions =
    provider === 'local'        ? LOCAL_MODELS :
    provider === 'pollinations' ? POLLINATIONS_MODELS :
                                  OPENROUTER_MODELS;

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testProvider(provider, model, openRouterKey || undefined, localBaseUrl || undefined);
    if (res.ok) setTestResult({ ok: true,  message: `Connected. Sample reply: "${res.sample}"` });
    else        setTestResult({ ok: false, message: res.error });
    setTesting(false);
  };

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="bg-white border border-line rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 border border-line flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-brand-700" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink">ACCI Compliance Analyst</h3>
            <p className="text-xs text-ink-3 mt-1 leading-relaxed">
              An open-source AI model grounded in the live compliance data you are viewing.
              Defaults to a <span className="font-semibold text-ink-2">local LLM</span> (Llama 3.2
              3B via Ollama) so no compliance data ever leaves your machine.
              Hosted providers (Pollinations, OpenRouter) remain available as fallbacks for
              demos and machines without a local runtime.
            </p>
            <p className="text-[11px] text-ink-4 mt-2">
              Compliance data leaves the browser only when you invoke the AI. The local
              provider keeps it inside your machine; the hosted providers send it to their
              respective endpoints over HTTPS.
            </p>
          </div>
        </div>
      </div>

      {/* Enable toggle */}
      <div className="bg-white border border-line rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">AI Assistant enabled</p>
          <p className="text-xs text-ink-3 mt-0.5">
            When off, the AI Analyst button in the header is disabled.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={e => setEnabled(e.target.checked)}
          />
          <div className="w-11 h-6 bg-line-strong rounded-full peer peer-checked:bg-brand-600 transition-colors" />
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
        </label>
      </div>

      {/* Provider */}
      <div className="bg-white border border-line rounded-xl p-5">
        <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-3">Provider</p>
        <div className="grid grid-cols-3 gap-3">
          <ProviderCard
            id="local"
            label="Local LLM"
            sub="Ollama / LM Studio · on-device · recommended"
            active={provider === 'local'}
            onClick={() => { setProvider('local'); setTestResult(null); }}
          />
          <ProviderCard
            id="pollinations"
            label="Pollinations"
            sub="Hosted · keyless · anonymous"
            active={provider === 'pollinations'}
            onClick={() => { setProvider('pollinations'); setTestResult(null); }}
          />
          <ProviderCard
            id="openrouter"
            label="OpenRouter"
            sub="Hosted · open-weight · key required"
            active={provider === 'openrouter'}
            onClick={() => { setProvider('openrouter'); setTestResult(null); }}
          />
        </div>
      </div>

      {/* Local LLM base URL */}
      {provider === 'local' && (
        <div className="bg-white border border-line rounded-xl p-5">
          <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-3">
            Local server URL
          </p>
          <input
            type="text"
            value={localBaseUrl}
            onChange={e => { setLocalBaseUrl(e.target.value); setTestResult(null); }}
            placeholder={DEFAULT_LOCAL_BASE_URL}
            className={`${inputCls} font-mono text-xs`}
            spellCheck={false}
          />
          <div className="mt-3 rounded-lg bg-surface-2 border border-line-soft p-3 text-[11px] text-ink-3 leading-relaxed">
            <p className="font-semibold text-ink-2 mb-1">Quick start</p>
            <p>
              Load the model in <span className="font-mono">LM Studio</span> from{' '}
              <span className="font-mono">~/.lmstudio/models/</span> and start the local server.
              Alternatively, use <span className="font-mono">ollama</span>:
            </p>
            <pre className="mt-1.5 font-mono text-[11px] bg-white border border-line-soft rounded px-2 py-1.5 overflow-x-auto">
              ollama pull {model || 'qwen2.5:7b'}{'\n'}
              ollama serve
            </pre>
            <p className="mt-2">
              LM Studio listens on <span className="font-mono">http://localhost:1234</span> by
              default and exposes the OpenAI-compatible endpoint at{' '}
              <span className="font-mono">/v1</span>. Ollama uses{' '}
              <span className="font-mono">http://localhost:11434/v1</span>. If using LM Studio, you can use <span className="font-mono">/api/local-ai/v1</span> (this proxies to port 1234 to bypass CORS issues).
            </p>
            <p className="mt-2 text-ink-4">
              If the connection test fails with a CORS error, restart Ollama with{' '}
              <span className="font-mono">OLLAMA_ORIGINS=*</span> in its environment.
            </p>
          </div>
        </div>
      )}

      {/* Model */}
      <div className="bg-white border border-line rounded-xl p-5">
        <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-3">Model</p>
        <select
          value={modelOptions.some(m => m.id === model) ? model : '__custom'}
          onChange={e => {
            const v = e.target.value;
            if (v === '__custom') return;
            setModel(v);
            setTestResult(null);
          }}
          className={inputCls}
        >
          {modelOptions.map(m => (
            <option key={m.id} value={m.id}>{m.label} — {m.hint}</option>
          ))}
          <option value="__custom">Custom (enter model id below)</option>
        </select>
        <input
          type="text"
          value={model}
          onChange={e => { setModel(e.target.value); setTestResult(null); }}
          placeholder="e.g. meta-llama/llama-3.3-70b-instruct:free"
          className={`${inputCls} mt-2 font-mono text-xs`}
        />
        <p className="text-[11px] text-ink-4 mt-2">
          The model id is sent verbatim to the provider's chat-completions endpoint.
        </p>
      </div>

      {/* API Key */}
      {provider === 'openrouter' && (
        <div className="bg-white border border-line rounded-xl p-5">
          <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-3">
            OpenRouter API key
          </p>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={openRouterKey}
              onChange={e => { setOpenRouterKey(e.target.value); setTestResult(null); }}
              placeholder="sk-or-v1-…"
              className={`${inputCls} font-mono text-xs`}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={() => setShowKey(v => !v)}
              className="px-3 py-2 text-xs rounded-lg border border-line text-ink-3 hover:bg-surface-2"
              aria-label={showKey ? 'Hide key' : 'Show key'}
              type="button"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p className="text-[11px] text-ink-4 mt-2">
            Get a free key at <span className="font-mono">openrouter.ai/keys</span>. Stored in this browser only.
          </p>
        </div>
      )}

      {/* Test connection */}
      <div className="bg-surface-2 border border-line rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-ink-2 min-w-0">
          <p className="font-medium">Test connection</p>
          <p className="text-xs text-ink-4 mt-0.5">
            Sends a single short prompt to confirm the provider responds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-line text-ink-3 hover:bg-white"
            type="button"
          >
            Reset defaults
          </button>
          <button
            onClick={runTest}
            disabled={
              testing ||
              (provider === 'openrouter' && !openRouterKey.trim()) ||
              (provider === 'local' && !localBaseUrl.trim())
            }
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            type="button"
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {testing ? 'Testing…' : 'Test connection'}
          </button>
        </div>
      </div>

      {testResult && (
        <div
          className={
            'rounded-xl p-4 flex items-start gap-2 text-sm border ' +
            (testResult.ok
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700')
          }
        >
          {testResult.ok
            ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
          <span className="min-w-0 break-words">{testResult.message}</span>
        </div>
      )}
    </div>
  );
}

function ProviderCard({
  id, label, sub, active, onClick,
}: {
  id: AIProvider; label: string; sub: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-provider={id}
      className={
        'text-left p-3.5 rounded-lg border transition-colors ' +
        (active
          ? 'border-blue-500 bg-blue-50'
          : 'border-line bg-white hover:border-line-strong hover:bg-surface-2')
      }
    >
      <div className={'text-sm font-semibold ' + (active ? 'text-blue-700' : 'text-ink-2')}>{label}</div>
      <div className="text-xs text-ink-4 mt-0.5">{sub}</div>
    </button>
  );
}
