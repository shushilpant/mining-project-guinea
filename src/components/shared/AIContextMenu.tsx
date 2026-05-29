// ============================================================
// AIContextMenu — global right-click handler that opens an AI
// briefing menu anywhere on the dashboard.
//
// Mounting it once in the layout root attaches a `contextmenu`
// listener to the document. The default browser menu is suppressed
// for all in-app right-clicks UNLESS the user holds Shift (escape
// hatch for inspect-element and friends).
//
// On a real click:
//   1. Resolve the entity / region / selection from the click target.
//   2. Build a list of briefing options tailored to what was found.
//   3. Render an animated floating menu at the cursor, viewport-aware.
//   4. On pick → open the AIBriefingPopover via aiBriefingStore.
//
// The menu itself is closed on outside click, Escape, scroll, or
// another right-click.
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, ChevronRight, FileSearch, X } from 'lucide-react';
import { useAIBriefingStore } from '@/store/aiBriefingStore';
import { resolveContextAt, buildBriefingOptions, type BriefingOption } from '@/lib/aiContextResolver';
import { useCountry } from '@/context/CountryContext';
import { useAISettingsStore, isProviderReady } from '@/store/aiSettingsStore';

const MENU_W = 280;
const MENU_PADDING = 8;

const ENTITY_DOT_COLOR: Record<string, string> = {
  operator:       '#016940',
  agreement:      '#2563eb',
  risk:           '#DC2626',
  commitment:     '#D97706',
  infrastructure: '#7c3aed',
  metric:         '#565c65',
  country:        '#016940',
  region:         '#7A9A88',
};

export function AIContextMenu() {
  const menu = useAIBriefingStore(s => s.menu);
  const openMenu = useAIBriefingStore(s => s.openMenu);
  const closeMenu = useAIBriefingStore(s => s.closeMenu);
  const openBrief = useAIBriefingStore(s => s.openBrief);

  const ai = useAISettingsStore();
  const ready = ai.enabled && isProviderReady(ai);
  const { selectedCountry } = useCountry();
  const location = useLocation();

  const menuRef = useRef<HTMLDivElement>(null);

  // ── Capture right-clicks document-wide ──────────────────────
  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      // Shift-Right-Click → keep the native browser menu (Inspect, View Source).
      if (e.shiftKey) return;
      // Ignore right-clicks inside form fields — users may want native paste etc.
      const t = e.target as HTMLElement | null;
      if (t && t.closest('input, textarea, [contenteditable="true"]')) return;
      // Ignore right-clicks inside our own menu / briefing card.
      if (t && t.closest('[data-ai-overlay]')) return;
      // Ignore right-clicks outside the app shell (e.g. browser chrome). The
      // app root has id="root"; if we're outside that, do nothing.
      if (t && !t.closest('#root')) return;

      e.preventDefault();
      const hit = resolveContextAt(e.target, location.pathname);
      const options = buildBriefingOptions(hit, selectedCountry);
      openMenu({ x: e.clientX, y: e.clientY, hit, options });
    };

    document.addEventListener('contextmenu', onContext);
    return () => document.removeEventListener('contextmenu', onContext);
  }, [openMenu, location.pathname, selectedCountry]);

  // ── Dismiss handlers ─────────────────────────────────────────
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    const onScroll = () => closeMenu();
    // Use mousedown (capture) so we dismiss before a click lands on something underneath.
    document.addEventListener('mousedown', onDown, true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDown, true);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [menu, closeMenu]);

  // ── Pulse-ring the right-clicked element ─────────────────────
  // While the menu is open, the element under the click gets a brief
  // ring so it's obvious what the AI is about to brief on.
  useEffect(() => {
    if (!menu || !menu.hit.targetRect) return;
    const t = document.elementFromPoint(menu.x, menu.y);
    const block = t?.closest<HTMLElement>('[data-ai-entity], [data-ai-region], tr, li, section, .shadow-card');
    if (!block) return;
    block.classList.add('ai-target-ring');
    const timer = window.setTimeout(() => block.classList.remove('ai-target-ring'), 900);
    return () => {
      window.clearTimeout(timer);
      block.classList.remove('ai-target-ring');
    };
  }, [menu]);

  const onPick = useCallback((opt: BriefingOption) => {
    if (!menu) return;
    if (!ready) return;
    openBrief({
      option: opt,
      x: menu.x,
      y: menu.y,
      targetRect: menu.hit.targetRect,
    });
  }, [menu, ready, openBrief]);

  if (!menu) return null;

  // ── Position-aware placement (flip near viewport edges) ──────
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Approximate height — close enough to flip correctly even before measure.
  const approxH = Math.min(60 + menu.options.length * 44 + 36, 360);
  let left = menu.x;
  let top  = menu.y;
  let originX: 'left' | 'right' = 'left';
  let originY: 'top'  | 'bottom' = 'top';
  if (left + MENU_W + MENU_PADDING > vw) { left = left - MENU_W; originX = 'right'; }
  if (top + approxH + MENU_PADDING > vh) { top  = top  - approxH; originY = 'bottom'; }
  left = Math.max(MENU_PADDING, left);
  top  = Math.max(MENU_PADDING, top);

  const dotColor = menu.hit.entity ? ENTITY_DOT_COLOR[menu.hit.entity.kind] ?? '#7A9A88' : '#7A9A88';

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="AI briefing menu"
      data-ai-overlay
      className="ai-menu-pop fixed z-[1000] bg-surface rounded-xl border border-line shadow-pop overflow-hidden"
      style={{
        left, top, width: MENU_W,
        transformOrigin: `${originX} ${originY}`,
      }}
      onContextMenu={e => { e.preventDefault(); closeMenu(); }}
    >
      {/* Header chip — what we're briefing on */}
      <div
        className="px-3 py-2 border-b border-line-soft flex items-start gap-2"
        style={{ background: 'linear-gradient(90deg, rgba(1,105,64,0.06) 0%, rgba(200,153,30,0.06) 100%)' }}
      >
        <span
          className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
          style={{ background: dotColor }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">
            {menu.hit.entity?.kind ?? (menu.hit.region ? 'section' : (menu.hit.selectedText ? 'selection' : 'page'))}
          </div>
          <div className="text-[12px] font-semibold text-ink truncate">
            {menu.hit.entity?.label ?? menu.hit.region ?? (menu.hit.selectedText ? 'selected text' : location.pathname)}
          </div>
          {menu.hit.entity?.sub && (
            <div className="text-[10px] text-ink-4 truncate">{menu.hit.entity.sub}</div>
          )}
        </div>
        <button
          type="button"
          onClick={closeMenu}
          className="shrink-0 text-ink-4 hover:text-ink"
          aria-label="Close menu"
        >
          <X size={11} />
        </button>
      </div>

      {/* Provider-not-ready hint */}
      {!ready && (
        <div className="px-3 py-2.5 text-[11px] text-ink-3 leading-snug border-b border-line-soft">
          AI is not configured. Open{' '}
          <span className="font-semibold text-ink-2">Admin → AI Assistant</span>{' '}
          to enable a local or hosted model.
        </div>
      )}

      {/* Briefing options */}
      <ul className="py-1 max-h-[360px] overflow-y-auto">
        {menu.options.map(opt => (
          <li key={opt.id}>
            <button
              type="button"
              role="menuitem"
              onClick={() => onPick(opt)}
              disabled={!ready}
              className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed group transition-colors"
            >
              <Sparkles size={13} className="shrink-0 text-brand-600 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold text-ink-2 group-hover:text-brand-700 truncate">
                  {opt.label}
                </div>
                <div className="text-[10.5px] text-ink-4 truncate">{opt.hint}</div>
              </div>
              <ChevronRight size={11} className="shrink-0 text-ink-4 mt-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          </li>
        ))}
      </ul>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-line-soft bg-surface-2 flex items-center justify-between">
        <div className="text-[9.5px] text-ink-4 leading-tight flex items-center gap-1.5">
          <FileSearch size={10} />
          <span>Grounded in current data only</span>
        </div>
        <div className="text-[9.5px] font-mono text-ink-4">⇧ + right-click = browser menu</div>
      </div>
    </div>
  );
}
