import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import DemandLanding from './components/DemandLanding';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

const DemandGenerator = lazy(() => import('./components/DemandGenerator'));
const SuccessPage = lazy(() => import('./components/SuccessPage'));
const Terms = lazy(() => import('./components/Terms'));
const Privacy = lazy(() => import('./components/Privacy'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ContentAnalytics = lazy(() => import('./components/admin/ContentAnalytics'));

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-bg-void">
        <main className="flex-grow">
          <Suspense fallback={
            <div className="flex flex-col h-screen items-center justify-center bg-bg-void">
              <div className="w-12 h-12 border-4 border-zinc-800 border-t-axim-teal rounded-full animate-spin mb-4"></div>
              <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Loading Workspace</div>
            </div>
          }>
            <Routes>
              <Route path="/start" element={<DemandLanding />} />
              <Route path="/state/:stateId" element={<DemandLanding />} />
              <Route path="/app/demand-generator" element={<DemandGenerator />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/analytics" element={<ContentAnalytics />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/test-success" element={<Navigate to="/success?session_id=AXM-12345" replace />} />
              <Route path="*" element={<Navigate to="/start" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </Router>
  );
};

export default App;
