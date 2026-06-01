import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CountryProvider } from '@/context/CountryContext';
import { Layout } from '@/components/Layout';

// Route-level code splitting — heavy deps (recharts, leaflet, xlsx) load on demand.
const Dashboard           = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const AgreementsPage      = lazy(() => import('@/pages/Agreements').then(m => ({ default: m.AgreementsPage })));
const AgreementDetailPage = lazy(() => import('@/pages/Agreements').then(m => ({ default: m.AgreementDetailPage })));
const PerformancePage     = lazy(() => import('@/pages/Performance').then(m => ({ default: m.PerformancePage })));
const OperatorDetailPage  = lazy(() => import('@/pages/Performance').then(m => ({ default: m.OperatorDetailPage })));
const RiskPage            = lazy(() => import('@/pages/Risk').then(m => ({ default: m.RiskPage })));
const RiskFlagDetailPage  = lazy(() => import('@/pages/Risk').then(m => ({ default: m.RiskFlagDetailPage })));
const TransparencyPage    = lazy(() => import('@/pages/Transparency').then(m => ({ default: m.TransparencyPage })));
const ScenariosPage       = lazy(() => import('@/pages/Scenarios').then(m => ({ default: m.ScenariosPage })));
const NegotiationPage     = lazy(() => import('@/pages/Negotiation').then(m => ({ default: m.NegotiationPage })));
const AdminPage           = lazy(() => import('@/pages/Admin').then(m => ({ default: m.AdminPage })));
const AuditMonitorPage    = lazy(() => import('@/pages/AuditMonitor').then(m => ({ default: m.AuditMonitorPage })));
const OwnershipPage       = lazy(() => import('@/pages/Ownership').then(m => ({ default: m.OwnershipPage })));
const LocalContentPage    = lazy(() => import('@/pages/LocalContent').then(m => ({ default: m.LocalContentPage })));
const ESGPage                = lazy(() => import('@/pages/ESG').then(m => ({ default: m.ESGPage })));
const MarketIntelligencePage = lazy(() => import('@/pages/MarketIntelligence').then(m => ({ default: m.MarketIntelligencePage })));
const DocumentsPage          = lazy(() => import('@/pages/Documents').then(m => ({ default: m.DocumentsPage })));
const PublicPortalPage       = lazy(() => import('@/pages/PublicPortal').then(m => ({ default: m.PublicPortalPage })));
const RegulatoryTrackerPage  = lazy(() => import('@/pages/RegulatoryTracker').then(m => ({ default: m.RegulatoryTrackerPage })));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-32" role="status" aria-live="polite">
      <span className="w-6 h-6 border-2 border-line-strong border-t-brand-600 rounded-full animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

import { useThemeStore } from '@/store/themeStore';
import { useEffect } from 'react';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}

function App() {
  return (
    <ThemeWrapper>
      <BrowserRouter>
        <CountryProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Suspense fallback={<RouteFallback />}><Dashboard /></Suspense>} />
              <Route path="agreements" element={<Suspense fallback={<RouteFallback />}><AgreementsPage /></Suspense>} />
              <Route path="agreements/:id" element={<Suspense fallback={<RouteFallback />}><AgreementDetailPage /></Suspense>} />
              <Route path="performance" element={<Suspense fallback={<RouteFallback />}><PerformancePage /></Suspense>} />
              <Route path="performance/:operatorId" element={<Suspense fallback={<RouteFallback />}><OperatorDetailPage /></Suspense>} />
              <Route path="risk" element={<Suspense fallback={<RouteFallback />}><RiskPage /></Suspense>} />
              <Route path="risk/:flagId" element={<Suspense fallback={<RouteFallback />}><RiskFlagDetailPage /></Suspense>} />
              <Route path="transparency" element={<Suspense fallback={<RouteFallback />}><TransparencyPage /></Suspense>} />
              <Route path="scenarios" element={<Suspense fallback={<RouteFallback />}><ScenariosPage /></Suspense>} />
              <Route path="negotiation" element={<Suspense fallback={<RouteFallback />}><NegotiationPage /></Suspense>} />
              <Route path="ownership" element={<Suspense fallback={<RouteFallback />}><OwnershipPage /></Suspense>} />
              <Route path="local-content" element={<Suspense fallback={<RouteFallback />}><LocalContentPage /></Suspense>} />
              <Route path="esg" element={<Suspense fallback={<RouteFallback />}><ESGPage /></Suspense>} />
              <Route path="market" element={<Suspense fallback={<RouteFallback />}><MarketIntelligencePage /></Suspense>} />
              <Route path="documents" element={<Suspense fallback={<RouteFallback />}><DocumentsPage /></Suspense>} />
              <Route path="public-data" element={<Suspense fallback={<RouteFallback />}><PublicPortalPage /></Suspense>} />
              <Route path="regulatory" element={<Suspense fallback={<RouteFallback />}><RegulatoryTrackerPage /></Suspense>} />
              <Route path="admin" element={<Suspense fallback={<RouteFallback />}><AdminPage /></Suspense>} />
              <Route path="audit" element={<Suspense fallback={<RouteFallback />}><AuditMonitorPage /></Suspense>} />
            </Route>
          </Routes>
        </CountryProvider>
      </BrowserRouter>
    </ThemeWrapper>
  );
}

export default App;
