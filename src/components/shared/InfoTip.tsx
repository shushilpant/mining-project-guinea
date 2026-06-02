// ============================================================
// InfoTip — a small, accessible "(i)" affordance that reveals a
// plain-language explanation on hover, focus, or click. Used on
// chart titles, metric labels, and anywhere a first-timer might ask
// "what does this mean?".
//
//   • Opens on hover/focus (slight delay) and toggles on click.
//   • Esc or an outside click closes it; staying over the popover
//     keeps it open so the text is selectable.
//   • Keyboard reachable; announces via aria-describedby + role.
// ============================================================

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTipProps {
  /** The explanation body — string or rich content. */
  body: ReactNode;
  /** Optional bold heading above the body. */
  title?: string;
  /** Accessible label for the trigger button. */
  label?: string;
  /** Horizontal anchoring of the popover relative to the trigger. */
  align?: 'start' | 'end' | 'center';
  /** Popover width in px. */
  width?: number;
  /** Custom trigger; defaults to a muted (i) icon. */
  children?: ReactNode;
  /** Extra classes for the trigger wrapper. */
  className?: string;
}

export function InfoTip({
  body,
  title,
  label = 'More information',
  align = 'start',
  width = 264,
  children,
  className,
}: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tipId = useId();

  const clearTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openNow = () => { clearTimer(); setOpen(true); };
  const closeSoon = () => {
    clearTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  // Close on Escape or any click outside the wrapper.
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

  useEffect(() => () => clearTimer(), []);

  // After the popover renders, measure its box and clamp it inside the
  // viewport by nudging it horizontally. Done imperatively on the node (rather
  // than via state) since it's a pure DOM-measurement sync with no re-render.
  useLayoutEffect(() => {
    const el = popRef.current;
    if (!open || !el) return;
    const margin = 8;
    el.style.marginLeft = '0px';
    const rect = el.getBoundingClientRect();
    const overflowRight = rect.right - (window.innerWidth - margin);
    const overflowLeft = margin - rect.left;
    if (overflowRight > 0) el.style.marginLeft = `${-overflowRight}px`;
    else if (overflowLeft > 0) el.style.marginLeft = `${overflowLeft}px`;
  }, [open]);

  const alignClass =
    align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0';

  return (
    <span
      ref={wrapRef}
      className={cn('relative inline-flex align-middle', className)}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onClick={() => (open ? setOpen(false) : openNow())}
        onFocus={openNow}
        onBlur={closeSoon}
        className={cn(
          'inline-flex items-center justify-center rounded-full text-ink-4 transition-colors',
          'hover:text-brand-600 focus:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40',
          !children && 'h-4 w-4',
        )}
      >
        {children ?? <Info size={13} strokeWidth={2.25} aria-hidden />}
      </button>

      {open && (
        <span
          ref={popRef}
          id={tipId}
          role="tooltip"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
          className={cn(
            'absolute top-full mt-1.5 z-50 block rounded-xl border border-line bg-surface p-3 text-left shadow-pop',
            alignClass,
          )}
          style={{
            width,
            maxWidth: 'calc(100vw - 16px)',
            pointerEvents: 'auto',
          }}
        >
          {title && (
            <span className="mb-1 block text-[12px] font-bold leading-snug text-ink">{title}</span>
          )}
          <span className="block text-[12px] leading-relaxed text-ink-3">{body}</span>
        </span>
      )}
    </span>
  );
}
