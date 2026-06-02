import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useCountry } from '@/context/CountryContext';
import { CountrySelector } from '@/components/shared/CountrySelector';
import { AlertCenter } from '@/components/shared/AlertCenter';
import { GlobalSearch } from '@/components/shared/GlobalSearch';
import { AIAssistant } from '@/components/shared/AIAssistant';
import { AIContextMenu } from '@/components/shared/AIContextMenu';
import { AIBriefingPopover } from '@/components/shared/AIBriefingPopover';
import { GuidedTour } from '@/components/shared/GuidedTour';
import { HelpButton } from '@/components/shared/HelpButton';
import { MODULES, moduleForPath } from '@/content/guide';
import { useThemeStore } from '@/store/themeStore';
import { useRole } from '@/hooks/useRole';
import { useAuthStore } from '@/store/authStore';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, FileText, BarChart3, AlertTriangle,
  Globe, Scale, Clock, Settings, ChevronRight, Activity, ScrollText, Shield, Sun, Moon, TrendingUp, Users, Building2,
  Leaf, LineChart, FolderSearch, Globe2, Gavel, LogOut
} from 'lucide-react';

// Friendly labels, official names and module codes all come from the
// content layer (guide.ts) so wording stays consistent across the app.
interface NavItemDef { to: string; icon: LucideIcon; exact: boolean; }

const NAV_ITEMS: NavItemDef[] = [
  { to: '/',             icon: LayoutDashboard, exact: true  },
  { to: '/agreements',   icon: FileText,        exact: false },
  { to: '/negotiation',  icon: Scale,           exact: false },
  { to: '/performance',  icon: BarChart3,       exact: false },
  { to: '/risk',         icon: AlertTriangle,   exact: false },
  { to: '/transparency', icon: Globe,           exact: false },
  { to: '/scenarios',    icon: TrendingUp,      exact: false },
  { to: '/ownership',    icon: Users,           exact: false },
  { to: '/local-content',icon: Building2,       exact: false },
  { to: '/esg',          icon: Leaf,            exact: false },
  { to: '/market',       icon: LineChart,       exact: false },
  { to: '/documents',    icon: FolderSearch,    exact: false },
  { to: '/public-data',  icon: Globe2,          exact: false },
  { to: '/regulatory',   icon: Gavel,           exact: false },
];

const ADMIN_NAV: NavItemDef = { to: '/admin', icon: Settings,   exact: false };
const AUDIT_NAV: NavItemDef = { to: '/audit', icon: ScrollText, exact: false };

const SIDEBAR_MIN = 240;
const SIDEBAR_MAX = 460;       // hard ceiling / fallback before content is measured
const SIDEBAR_DEFAULT = 280;
const SIDEBAR_LEFT_INSET = 16; // matches the p-4 padding around the floating sidebar

const COUNTRY_LABELS: Record<string, string> = {
  ALL: 'West Africa Region',
  GIN: 'Republic of Guinea',
  GHA: 'Republic of Ghana',
  CIV: "Republic of Côte d'Ivoire",
};

function NavItem({ item }: { item: NavItemDef }) {
  const guide = MODULES[item.to];
  const plainName = guide?.plainName ?? item.to;
  const official = guide?.official;
  const code = guide?.moduleCode;
  return (
    <NavLink
      to={item.to}
      end={item.exact}
      title={guide?.tagline}
      className={({ isActive }) =>
        'group flex items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all duration-200 border-l-[3px] ' +
        (isActive
          ? 'bg-white/[0.09] text-white border-gold-500'
          : 'text-white/65 border-transparent hover:bg-white/[0.06] hover:text-white')
      }
    >
      {({ isActive }) => (
        <>
          <span className="flex items-center gap-3 min-w-0">
            <item.icon size={15} className={'shrink-0 transition-all duration-200 ' + (isActive ? 'opacity-100 text-gold-400' : 'opacity-70 group-hover:opacity-100')} />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="min-w-0 truncate">{plainName}</span>
              {official && (
                <span className={'min-w-0 truncate text-[10px] font-normal ' + (isActive ? 'text-white/45' : 'text-white/35')}>
                  {official}
                </span>
              )}
            </span>
          </span>
          {code ? (
            <span
              className={
                'shrink-0 text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-full border transition-colors ' +
                (isActive
                  ? 'text-forest-900 border-gold-500/50 bg-gold-500'
                  : 'text-white/40 border-white/10 bg-white/[0.04] group-hover:text-white/60')
              }
              aria-hidden
            >
              {code}
            </span>
          ) : (
            <ChevronRight size={11} className={isActive ? 'opacity-60' : 'opacity-25 group-hover:opacity-50'} />
          )}
        </>
      )}
    </NavLink>
  );
}

export function Layout() {
  const { selectedCountry } = useCountry();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const [now, setNow] = useState(new Date());
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [maxWidth, setMaxWidth] = useState(SIDEBAR_MAX);
  const [isResizing, setIsResizing] = useState(false);
  const draggingRef = useRef(false);
  const maxWidthRef = useRef(SIDEBAR_MAX);
  const navRef = useRef<HTMLElement>(null);

  // ── Custom sidebar scrollbar ──────────────────────────────────────────────
  // The native scrollbar is hidden (macOS overlay scrollbars can't be reliably
  // themed via ::-webkit-scrollbar across browsers/OS settings), so we render
  // our own thumb whose size and position mirror the nav's scroll state.
  const [thumb, setThumb] = useState({ top: 0, height: 0, visible: false });
  const thumbDragRef = useRef<{ startY: number; startScroll: number; thumbH: number } | null>(null);
  const SB_INSET = 8; // top/bottom breathing room for the thumb track

  const updateThumb = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const { scrollTop, scrollHeight, clientHeight } = nav;
    if (scrollHeight <= clientHeight + 1) {
      setThumb((t) => (t.visible ? { ...t, visible: false } : t));
      return;
    }
    const track = clientHeight - SB_INSET * 2;
    const height = Math.max(32, (clientHeight / scrollHeight) * track);
    const top = SB_INSET + (scrollTop / (scrollHeight - clientHeight)) * (track - height);
    setThumb({ top, height, visible: true });
  }, []);

  // Recompute when the nav resizes (window resize) or its item set changes.
  useLayoutEffect(() => {
    updateThumb();
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(updateThumb);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [updateThumb, isAdmin]);

  const onThumbDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nav = navRef.current;
    if (!nav) return;
    thumbDragRef.current = { startY: e.clientY, startScroll: nav.scrollTop, thumbH: thumb.height };
    document.body.style.userSelect = 'none';
  };
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = thumbDragRef.current;
      const nav = navRef.current;
      if (!d || !nav) return;
      const { scrollHeight, clientHeight } = nav;
      const range = clientHeight - SB_INSET * 2 - d.thumbH;
      if (range <= 0) return;
      const dy = e.clientY - d.startY;
      nav.scrollTop = d.startScroll + (dy / range) * (scrollHeight - clientHeight);
    };
    const onUp = () => {
      if (thumbDragRef.current) {
        thumbDragRef.current = null;
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Measure the natural width of the navigation so the sidebar can never be
  // dragged wider than the point at which the longest label is fully visible.
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const clone = nav.cloneNode(true) as HTMLElement;
    Object.assign(clone.style, {
      position: 'absolute', left: '-9999px', top: '0',
      visibility: 'hidden', width: 'max-content', maxWidth: 'none',
      height: 'auto', overflow: 'visible',
    });
    // Let every truncated label expand to its full text for the measurement.
    clone.querySelectorAll<HTMLElement>('.truncate').forEach((el) => {
      el.style.overflow = 'visible';
      el.style.textOverflow = 'clip';
      el.style.whiteSpace = 'nowrap';
    });
    document.body.appendChild(clone);
    const needed = clone.scrollWidth;
    document.body.removeChild(clone);
    // +16 leaves room for the vertical scrollbar gutter so text never re-truncates.
    const measured = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_DEFAULT, Math.ceil(needed) + 16));
    maxWidthRef.current = measured;
    setMaxWidth(measured);
  }, [isAdmin]);

  useEffect(() => {
    let raf = 0;
    let lastX = 0;
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      lastX = e.clientX;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setSidebarWidth(Math.min(maxWidthRef.current, Math.max(SIDEBAR_MIN, lastX - SIDEBAR_LEFT_INSET)));
      });
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    setIsResizing(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  const formatTime = (date: Date, countryId: string) => {
    const day   = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
    const year  = date.getFullYear();
    const isGMT = countryId === 'GIN' || countryId === 'GHA' || countryId === 'CIV';
    const tzName = isGMT ? 'GMT' : 'WAT';
    const tz     = isGMT ? 'UTC' : 'Africa/Lagos';
    const time   = date.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return `${day} ${month} ${year}  ${time} ${tzName}`;
  };

  const crumb = moduleForPath(location.pathname);
  const getBreadcrumb = () => crumb?.plainName ?? 'Platform';


  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-5 focus:py-2.5 focus:rounded-xl focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-bold focus:shadow-pop"
      >
        Skip to main content
      </a>

      {/* ── Floating Sidebar — original forest/gold palette ────────────── */}
      <div className="h-full p-4 pr-0 shrink-0 flex items-center relative z-20">
        <aside
          className={
            'h-full flex flex-col rounded-3xl overflow-hidden shadow-lg relative ' +
            (isResizing ? '' : 'transition-[width] duration-300 ease-out')
          }
          style={{ width: Math.min(sidebarWidth, maxWidth), background: '#011F14' }}
        >
          {/* Subtle radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(600px circle at 80% 0%, rgba(1,105,64,0.16), transparent 55%)' }}
          />
          {/* Top gold rule */}
          <div className="h-[2px] w-full shrink-0 bg-gold-500/80 relative z-10" />

          {/* Drag handle */}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            onMouseDown={startResize}
            onDoubleClick={() => setSidebarWidth(SIDEBAR_DEFAULT)}
            title="Drag to resize · double-click to reset"
            className="absolute top-0 -right-2 z-30 h-full w-4 cursor-col-resize bg-transparent group flex items-center justify-center"
          >
            <div className="h-12 w-[3px] rounded-full bg-white/10 group-hover:bg-gold-500/50 transition-colors" />
          </div>

          {/* Ministry identity */}
          <div className="px-5 pt-5 pb-4 relative z-10 border-b border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gold-500 shadow-sm">
                <span className="font-extrabold text-[11px] tracking-tight" style={{ color: '#011F14' }}>MoM</span>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none text-gold-500">
                  Ministries of Mining
                </div>
                <div className="text-[10px] tracking-wide leading-none mt-1.5 text-white/45">
                  West Africa
                </div>
              </div>
            </div>
            <div className="text-[11px] font-semibold leading-snug mb-2.5 text-white/80">
              National Compliance Intelligence Platform
            </div>
            <div className="text-[10px] font-mono px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 text-white/60 bg-white/[0.06] border border-white/[0.10]">
              <span className="w-1 h-1 rounded-full pulse-live bg-emerald-400" />
              {COUNTRY_LABELS[selectedCountry]}
            </div>
          </div>

          {/* Navigation — native scrollbar hidden; custom themed thumb overlaid */}
          <div className="relative flex-1 min-h-0">
            <nav
              ref={navRef}
              onScroll={updateThumb}
              className="h-full px-3 py-3 space-y-0.5 overflow-y-auto sidebar-scroll relative z-10"
              aria-label="Primary"
            >
              <div className="px-2 pb-1.5 pt-0.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">Modules</span>
              </div>

              {NAV_ITEMS.map((item) => <NavItem key={item.to} item={item} />)}

              {isAdmin && (
                <>
                  <div className="mx-2 my-3 h-px bg-white/[0.08]" />
                  <div className="px-2 pb-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">System</span>
                  </div>
                  {[ADMIN_NAV, AUDIT_NAV].map((item) => <NavItem key={item.to} item={item} />)}
                </>
              )}
            </nav>

            {/* Custom scrollbar thumb — drag to scroll, gold on hover. */}
            {thumb.visible && (
              <div
                role="presentation"
                onMouseDown={onThumbDown}
                className="absolute right-[3px] z-20 w-1.5 cursor-pointer rounded-full bg-white/20 transition-colors hover:bg-gold-400/70 active:bg-gold-400/80"
                style={{ top: thumb.top, height: thumb.height }}
              />
            )}
          </div>

          {/* Sidebar footer */}
          <div className="px-4 py-4 space-y-2 relative z-10 border-t border-white/[0.08]">
            <div className="flex items-center gap-2 text-white/45">
              <Clock size={10} className="shrink-0" />
              <span className="text-[10px] font-mono tabular-nums leading-none">
                {formatTime(now, selectedCountry)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/30">
              <Activity size={9} className="shrink-0" />
              <span className="text-[9px] tracking-wide">PEB-0526 · Secure Government Platform</span>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Main content area ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Floating Header */}
        <div className="pt-4 px-6 pb-2 shrink-0 z-40 sticky top-0">
          <header className="app-header flex items-center justify-between h-16 px-6 glass-card !overflow-visible shadow-sm border border-line-soft rounded-2xl">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                 <Shield size={16} className="text-primary" />
              </div>
              <div className="header-title-text min-w-0 overflow-hidden">
                <div className="text-[14px] font-bold tracking-tight text-foreground truncate">Platform Dashboard</div>
                <div className="header-subtitle text-[11px] font-medium text-ink-4 truncate">
                  Adaptive Continuous Compliance Intelligence
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
                <GlobalSearch />
                <span className="w-px h-6 bg-line-strong shrink-0" />
                <CountrySelector />
                <span className="w-px h-6 bg-line-strong shrink-0" />
                <AIAssistant />
                <span className="w-px h-6 bg-line-strong shrink-0" />
                <AlertCenter />
                <span className="w-px h-6 bg-line-strong shrink-0" />
                <HelpButton />
              </div>

              <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-line-strong shrink-0">
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-2 border border-line-soft text-ink-3 transition-all hover:bg-foreground/10 hover:text-foreground group shrink-0"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? (
                    <Sun size={16} className="shrink-0 transition-transform group-hover:rotate-45" />
                  ) : (
                    <Moon size={16} className="shrink-0 transition-transform group-hover:-rotate-12" />
                  )}
                </button>
                <span
                  className={
                    'header-role text-[10px] font-bold px-3 py-1.5 rounded-xl border tracking-[0.1em] uppercase whitespace-nowrap transition-colors hidden sm:inline-block shrink-0 ' +
                    (isAdmin
                      ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-surface-2 text-ink-4 border-line-soft')
                  }
                >
                  {isAdmin ? 'Admin' : 'Read-Only'}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-2 border border-line-soft text-ink-3 transition-all hover:bg-status-danger/10 hover:text-status-danger hover:border-status-danger/30 group shrink-0"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut size={16} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </header>
        </div>

        {/* Breadcrumb bar */}
        <div className="px-8 py-1 flex items-center gap-3 shrink-0 overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-4 shrink-0">Section</span>
          <ChevronRight size={10} className="text-line-strong shrink-0" />
          <span className="text-[12px] font-semibold text-foreground tracking-wide truncate min-w-0">{getBreadcrumb()}</span>
          {crumb?.official && (
            <span className="hidden lg:inline text-[11px] font-medium text-ink-4 truncate min-w-0">
              {crumb.moduleCode ? `${crumb.moduleCode} · ` : ''}{crumb.official}
            </span>
          )}
          <span className="mx-2 text-[12px] text-line-strong opacity-50 shrink-0">|</span>
          <span className="text-[11px] font-medium text-primary shrink-0 whitespace-nowrap">{COUNTRY_LABELS[selectedCountry]}</span>
          <span className="ml-auto flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
             <span className="text-[10px] font-mono font-medium uppercase tracking-[0.15em] text-ink-4">
              Restricted — Government Use Only
            </span>
          </span>
        </div>

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6 pt-4 fade-in"
          data-ai-region={getBreadcrumb().toLowerCase().replace(/\s+/g, '-')}
        >
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>

      {/* Global AI surface — right-click anywhere to invoke. */}
      <AIContextMenu />
      <AIBriefingPopover />

      {/* First-run orientation (also re-openable from the header Help button). */}
      <GuidedTour />
    </div>
  );
}
