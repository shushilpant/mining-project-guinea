import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CountryProvider } from '@/context/CountryContext';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Login } from '@/pages/Login';

// Route-level code splitting — heavy deps (recharts, leaflet, xlsx) load on demand.
const Dashboard           = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const AgreementsPage      = lazy(() => import('@/pages/Agreements').then(m => ({ default: m.AgreementsPage })));
const AgreementDetailPage = lazy(() => import('@/pages/Agreements').then(m => ({ default: m.AgreementDetailPage })));
const PerformancePage     = lazy(() => import('@/pages/Performance').then(m => ({ default: m.PerformancePage })));
const OperatorDetailPage  = lazy(() => import('@/pages/Performance').then(m => ({ default: m.OperatorDetailPage })));
const RiskPage            = lazy(() => import('@/pages/Risk').then(m => ({ default: m.RiskPage })));
const RiskFlagDetailPage  = lazy(() => import('@/pages/Risk').then(m => ({ default: m.RiskFlagDetailPage })));
const TransparencyPage    = lazy(() => import('@/pages/Transparency').then(m => ({ default: m.TransparencyPage })));
const NegotiationPage     = lazy(() => import('@/pages/Negotiation').then(m => ({ default: m.NegotiationPage })));
const AdminPage           = lazy(() => import('@/pages/Admin').then(m => ({ default: m.AdminPage })));
const AuditMonitorPage    = lazy(() => import('@/pages/AuditMonitor').then(m => ({ default: m.AuditMonitorPage })));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-32" role="status" aria-live="polite">
      <span className="w-6 h-6 border-2 border-line-strong border-t-brand-600 rounded-full animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CountryProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Suspense fallback={<RouteFallback />}><Dashboard /></Suspense>} />
              <Route path="agreements" element={<Suspense fallback={<RouteFallback />}><AgreementsPage /></Suspense>} />
              <Route path="agreements/:id" element={<Suspense fallback={<RouteFallback />}><AgreementDetailPage /></Suspense>} />
              <Route path="performance" element={<Suspense fallback={<RouteFallback />}><PerformancePage /></Suspense>} />
              <Route path="performance/:operatorId" element={<Suspense fallback={<RouteFallback />}><OperatorDetailPage /></Suspense>} />
              <Route path="risk" element={<Suspense fallback={<RouteFallback />}><RiskPage /></Suspense>} />
              <Route path="risk/:flagId" element={<Suspense fallback={<RouteFallback />}><RiskFlagDetailPage /></Suspense>} />
              <Route path="transparency" element={<Suspense fallback={<RouteFallback />}><TransparencyPage /></Suspense>} />
              <Route path="negotiation" element={<Suspense fallback={<RouteFallback />}><NegotiationPage /></Suspense>} />
              <Route path="admin" element={<Suspense fallback={<RouteFallback />}><AdminPage /></Suspense>} />
              <Route path="audit" element={<Suspense fallback={<RouteFallback />}><AuditMonitorPage /></Suspense>} />
            </Route>
          </Route>
        </Routes>
      </CountryProvider>
    </BrowserRouter>
  );
}

export default App;
