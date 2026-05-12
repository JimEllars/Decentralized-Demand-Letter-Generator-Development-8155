import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DemandGenerator from './components/DemandGenerator';
import DemandLanding from './components/DemandLanding';
import SuccessPage from './components/SuccessPage';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-bg-void">
        <main className="flex-grow">
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
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </Router>
  );
};

export default App;
