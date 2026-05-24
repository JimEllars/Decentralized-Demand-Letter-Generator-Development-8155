const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

content = content.replace(
  `import DemandGenerator from './components/DemandGenerator';
import DemandLanding from './components/DemandLanding';
import SuccessPage from './components/SuccessPage';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';`,
  `import { Suspense, lazy } from 'react';
import DemandLanding from './components/DemandLanding';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

const DemandGenerator = lazy(() => import('./components/DemandGenerator'));
const SuccessPage = lazy(() => import('./components/SuccessPage'));
const Terms = lazy(() => import('./components/Terms'));
const Privacy = lazy(() => import('./components/Privacy'));`
);

content = content.replace(
  `<Routes>
            <Route path="/start" element={<DemandLanding />} />
            <Route path="/state/:stateId" element={<DemandLanding />} />
            <Route path="/app/demand-generator" element={<DemandGenerator />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/test-success" element={<Navigate to="/success?session_id=AXM-12345" replace />} />
            <Route path="*" element={<Navigate to="/start" replace />} />
          </Routes>`,
  `<Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-400">Loading...</div>}>
            <Routes>
              <Route path="/start" element={<DemandLanding />} />
              <Route path="/state/:stateId" element={<DemandLanding />} />
              <Route path="/app/demand-generator" element={<DemandGenerator />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/test-success" element={<Navigate to="/success?session_id=AXM-12345" replace />} />
              <Route path="*" element={<Navigate to="/start" replace />} />
            </Routes>
          </Suspense>`
);

fs.writeFileSync('src/App.jsx', content);
