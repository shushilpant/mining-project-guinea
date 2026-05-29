// ============================================================
// aiBriefingStore — single source of truth for the right-click
// AI menu and the briefing card it spawns.
//
//   • Menu state: position + the resolved context hit + the list
//     of briefing options to render.
//   • Briefing state: the chosen option + the position where the
//     card should appear + the entity-rect hint so the caller can
//     pulse a "this is what I'm briefing on" ring.
//
// One card at a time keeps the UI calm. Re-invoking the menu and
// picking another option replaces the current card.
// ============================================================

import { create } from 'zustand';
import type { BriefingOption, ContextHit } from '@/lib/aiContextResolver';

export interface MenuState {
  /** Cursor coordinates in viewport space. */
  x: number;
  y: number;
  hit: ContextHit;
  options: BriefingOption[];
}

export interface BriefingState {
  option: BriefingOption;
  /** Where to spawn the floating card initially. */
  x: number;
  y: number;
  /** Rect of the right-clicked element, so the card can pulse a ring on it. */
  targetRect: DOMRect | null;
  /** Monotonic id so re-runs of the same option still re-mount the card. */
  key: number;
}

interface AIBriefingStoreState {
  menu: MenuState | null;
  brief: BriefingState | null;

  openMenu: (state: MenuState) => void;
  closeMenu: () => void;

  openBrief: (state: Omit<BriefingState, 'key'>) => void;
  closeBrief: () => void;
}

let keyCounter = 0;

export const useAIBriefingStore = create<AIBriefingStoreState>((set) => ({
  menu:  null,
  brief: null,

  openMenu:  (menu)  => set({ menu }),
  closeMenu: ()      => set({ menu: null }),

  openBrief: (state) => set({
    brief: { ...state, key: ++keyCounter },
    menu: null,
  }),
  closeBrief: () => set({ brief: null }),
}));
