// ============================================================
// aiSettingsStore — persisted config for the AI Compliance Analyst.
//
// Three providers ship:
//   • local         — DEFAULT. Talks to a locally-running OpenAI-compatible
//                     server (Ollama, LM Studio, llama.cpp). Runs entirely
//                     on the user's machine — no data ever leaves it. The
//                     primary mode for ministerial use of this tool, since
//                     compliance data must not transit the public internet.
//   • pollinations  — Hosted, keyless, OpenAI-compatible. Fallback for demos
//                     where no local LLM is available. Stays anonymous.
//   • openrouter    — Hosted, user-key. Unlocks larger open-weight models
//                     when running on user-owned infrastructure.
//
// Keys / base URLs are stored only in the browser's localStorage. No secret
// ever ships in source. The Admin → AI tab is the only place these are entered.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIProvider = 'local' | 'pollinations' | 'openrouter';

export interface AIModelOption {
  id: string;
  label: string;
  hint: string;
}

// Local models served via LM Studio, Ollama, or any OpenAI-compatible server.
// Order: default first, then alternatives by latency/size.
export const LOCAL_MODELS: AIModelOption[] = [
  { id: 'llama3.2:3b',   label: 'Llama 3.2 · 3B (instant)', hint: 'Meta · ~2 GB · lowest latency local default' },
  { id: 'gemma3:4b',     label: 'Gemma 3 · 4B',             hint: 'Google · ~3 GB · fast on 8 GB RAM' },
  { id: 'qwq:32b',      label: 'QwQ · 32B (reasoning)',    hint: 'Alibaba · ~20 GB · thinking + reasoning' },
  { id: 'gemma3:12b',    label: 'Gemma 3 · 12B',           hint: 'Google · ~8 GB · stronger reasoning' },
  { id: 'gpt-oss:20b',   label: 'GPT-OSS · 20B',           hint: 'OpenAI open-weight · ~13 GB · best quality' },
  { id: 'llama3.1:8b',   label: 'Llama 3.1 · 8B',          hint: 'Meta · ~5 GB · solid all-rounder' },
  { id: 'qwen2.5:7b',    label: 'Qwen 2.5 · 7B',           hint: 'Alibaba · ~4 GB · multilingual' },
  { id: 'mistral:7b',    label: 'Mistral · 7B',            hint: 'Mistral · ~4 GB · low latency' },
];

export const POLLINATIONS_MODELS: AIModelOption[] = [
  { id: 'openai-fast', label: 'GPT-OSS 20B', hint: 'OpenAI open-weight · keyless · anonymous' },
];

export const OPENROUTER_MODELS: AIModelOption[] = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free',         label: 'Llama 3.3 70B (free)',  hint: 'Meta · open weights' },
  { id: 'deepseek/deepseek-chat-v3-0324:free',            label: 'DeepSeek V3 (free)',    hint: 'DeepSeek · MoE · open' },
  { id: 'qwen/qwen-2.5-72b-instruct:free',                label: 'Qwen 2.5 72B (free)',   hint: 'Alibaba · open weights' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free',  label: 'Mistral Small 3.1 24B', hint: 'Mistral · open weights' },
];

export const DEFAULT_PROVIDER: AIProvider = 'local';
export const DEFAULT_LOCAL_BASE_URL = 'http://localhost:11434/v1';
export const DEFAULT_MODEL = LOCAL_MODELS[0].id;

interface AISettingsState {
  provider: AIProvider;
  model: string;
  openRouterKey: string;
  /** OpenAI-compatible base URL for the local provider. Default: Ollama. */
  localBaseUrl: string;
  enabled: boolean;
  setProvider: (p: AIProvider) => void;
  setModel: (m: string) => void;
  setOpenRouterKey: (k: string) => void;
  setLocalBaseUrl: (u: string) => void;
  setEnabled: (e: boolean) => void;
  reset: () => void;
}

function defaultModelFor(p: AIProvider): string {
  switch (p) {
    case 'local':        return LOCAL_MODELS[0].id;
    case 'pollinations': return POLLINATIONS_MODELS[0].id;
    case 'openrouter':   return OPENROUTER_MODELS[0].id;
  }
}

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    (set) => ({
      provider: DEFAULT_PROVIDER,
      model: DEFAULT_MODEL,
      openRouterKey: '',
      localBaseUrl: DEFAULT_LOCAL_BASE_URL,
      enabled: true,
      setProvider: (provider) => {
        // When switching providers, snap to that provider's default model so
        // we never carry a model id the new provider won't recognise.
        set({ provider, model: defaultModelFor(provider) });
      },
      setModel:         (model)         => set({ model }),
      setOpenRouterKey: (openRouterKey) => set({ openRouterKey }),
      setLocalBaseUrl:  (localBaseUrl)  => set({ localBaseUrl: localBaseUrl.replace(/\/+$/, '') }),
      setEnabled:       (enabled)       => set({ enabled }),
      reset: () => set({
        provider: DEFAULT_PROVIDER,
        model: DEFAULT_MODEL,
        openRouterKey: '',
        localBaseUrl: DEFAULT_LOCAL_BASE_URL,
        enabled: true,
      }),
    }),
    { name: 'peb-ai-settings-v5' },
  ),
);

// Helper: is the active provider runnable right now?
export function isProviderReady(s: {
  provider: AIProvider;
  openRouterKey: string;
  localBaseUrl: string;
}): boolean {
  switch (s.provider) {
    case 'local':        return s.localBaseUrl.trim().length > 0;
    case 'pollinations': return true;
    case 'openrouter':   return s.openRouterKey.trim().length > 0;
  }
}
