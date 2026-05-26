import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCountry } from '@/context/CountryContext';
import { CountrySelector } from '@/components/shared/CountrySelector';
import { NotificationPanel } from '@/components/shared/NotificationPanel';
import { GlobalSearch } from '@/components/shared/GlobalSearch';
import { useAuthStore } from '@/store/authStore';
import { useRole } from '@/hooks/useRole';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, FileText, BarChart3, AlertTriangle,
  Globe, Scale, Clock, LogOut, Settings, ChevronRight, Activity, ScrollText,
} from 'lucide-react';

interface NavItemDef { to: string; label: string; icon: LucideIcon; exact: boolean; }

const NAV_ITEMS: NavItemDef[] = [
  { to: '/',             label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { to: '/agreements',   label: 'Agreements',    icon: FileText,        exact: false },
  { to: '/performance',  label: 'Performance',   icon: BarChart3,       exact: false },
  { to: '/risk',         label: 'Risk & Breach', icon: AlertTriangle,   exact: false },
  { to: '/transparency', label: 'Transparency',  icon: Globe,           exact: false },
  { to: '/negotiation',  label: 'Negotiation',   icon: Scale,           exact: false },
];

const ADMIN_NAV: NavItemDef = { to: '/admin', label: 'Administration',  icon: Settings,   exact: false };
const AUDIT_NAV: NavItemDef = { to: '/audit', label: 'Audit & Activity', icon: ScrollText, exact: false };

const COUNTRY_LABELS: Record<string, string> = {
  ALL: 'West Africa Region',
  GIN: 'Republic of Guinea',
  GHA: 'Republic of Ghana',
  CIV: "Republic of Côte d'Ivoire",
};

const BREADCRUMB_LABELS: Record<string, string> = {
  '/':             'Executive Dashboard',
  '/agreements':   'Contract & Agreement Registry',
  '/performance':  'Operator Performance & Compliance',
  '/risk':         'Breach & Risk Detection',
  '/transparency': 'Transparency & EITI Reporting',
  '/negotiation':  'Negotiation Intelligence',
  '/admin':        'System Administration',
  '/audit':        'Audit Log & Activity Monitor',
};

function NavItem({ item }: { item: NavItemDef }) {
  return (
    <NavLink
      to={item.to}
      end={item.exact}
      className={({ isActive }) =>
        'group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium border-l-[3px] transition-colors duration-150 ' +
        (isActive
          ? 'bg-white/[0.09] text-white border-gold-500'
          : 'text-white/65 border-transparent hover:bg-white/[0.06] hover:text-white')
      }
    >
      {({ isActive }) => (
        <>
          <span className="flex items-center gap-3">
            <item.icon size={15} className={'shrink-0 transition-opacity ' + (isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100')} />
            {item.label}
          </span>
          <ChevronRight size={11} className={isActive ? 'opacity-60' : 'opacity-25 group-hover:opacity-50'} />
        </>
      )}
    </NavLink>
  );
}

export function Layout() {
  const { selectedCountry } = useCountry();
  const logout   = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useRole();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return BREADCRUMB_LABELS['/'];
    const base = '/' + path.split('/')[1];
    return BREADCRUMB_LABELS[base] ?? 'Platform';
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-forest-900 focus:text-white focus:text-sm focus:font-semibold focus:shadow-pop"
      >
        Skip to main content
      </a>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="w-64 flex flex-col shrink-0 z-20 relative bg-forest-900 shadow-[4px_0_28px_rgba(0,0,0,0.20)]">
        {/* Single restrained static highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(600px circle at 80% 0%, rgba(1,105,64,0.16), transparent 55%)' }}
        />
        {/* Static thin gold rule */}
        <div className="h-[2px] w-full shrink-0 bg-gold-500/80 relative z-10" />

        {/* Ministry identity */}
        <div className="px-5 pt-5 pb-4 relative z-10 border-b border-white/[0.08]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gold-500 shadow-sm">
              <span className="font-extrabold text-[11px] tracking-tight text-forest-900">MoM</span>
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

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto relative z-10" aria-label="Primary">
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

      {/* ── Main content area ─────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="sticky top-0 z-10 px-6 flex items-center justify-between shrink-0 h-14 glass border-b border-line shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-0.5 h-6 rounded-full shrink-0 bg-gold-500" />
            <div>
              <div className="text-[13px] font-bold tracking-snugger text-ink">Ministries of Mining</div>
              <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-4">
                National Compliance Intelligence Platform
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GlobalSearch />
            <span className="w-px h-5 bg-line" />
            <CountrySelector />
            <span className="w-px h-5 bg-line" />
            <NotificationPanel />
            <span className="w-px h-5 bg-line" />

            <div className="flex items-center gap-2.5">
              <span
                className={
                  'text-[10px] font-bold px-2.5 py-1 rounded-lg border tracking-[0.1em] uppercase ' +
                  (isAdmin
                    ? 'bg-brand-600 text-white border-transparent shadow-sm'
                    : 'bg-surface-2 text-ink-3 border-line')
                }
              >
                {isAdmin ? 'Admin' : 'Read-Only'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg border border-transparent text-ink-3 transition-colors hover:bg-surface-2 hover:border-line hover:text-ink"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Breadcrumb bar */}
        <div className="px-6 py-2 flex items-center gap-2.5 shrink-0 bg-surface-2/70 border-b border-line-soft">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink-4">Section</span>
          <ChevronRight size={9} className="text-line-strong" />
          <span className="text-[11px] font-semibold text-ink-2">{getBreadcrumb()}</span>
          <span className="mx-1 text-[10px] text-line-strong">|</span>
          <span className="text-[10px] font-medium text-ink-4">{COUNTRY_LABELS[selectedCountry]}</span>
          <span className="ml-auto text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-ink-4">
            Classification: Restricted — Government Use Only
          </span>
        </div>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-6 fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
