// ============================================================
// HelpButton — a header "?" affordance that lets a user re-open the
// first-run tour or bring back the current page's intro guide at any
// time. Small dropdown, closes on outside-click or Escape.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HelpCircle, Compass, BookOpen } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboardingStore';
import { moduleForPath } from '@/content/guide';

export function HelpButton() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const guide = moduleForPath(location.pathname);

  const resetTour = useOnboardingStore((s) => s.resetTour);
  const restoreIntro = useOnboardingStore((s) => s.restoreIntro);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Help and guides"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-soft bg-surface-2 text-ink-3 transition-all hover:bg-foreground/10 hover:text-foreground"
      >
        <HelpCircle size={16} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-card shadow-pop"
        >
          <div className="border-b border-line-soft px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-4">
            Help &amp; guides
          </div>
          <button
            role="menuitem"
            onClick={() => { resetTour(); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium text-ink-2 transition-colors hover:bg-foreground/5"
          >
            <Compass size={15} className="text-brand-600" aria-hidden />
            Take the welcome tour
          </button>
          <button
            role="menuitem"
            disabled={!guide}
            onClick={() => { if (guide) restoreIntro(guide.route); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium text-ink-2 transition-colors hover:bg-foreground/5 disabled:opacity-40"
          >
            <BookOpen size={15} className="text-brand-600" aria-hidden />
            Show this page&rsquo;s guide
          </button>
        </div>
      )}
    </div>
  );
}
