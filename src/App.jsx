import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DemandGenerator from './components/DemandGenerator';
import DemandLanding from './components/DemandLanding';
import SuccessPage from './components/SuccessPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/start" element={<DemandLanding />} />
        <Route path="/app/demand-generator" element={<DemandGenerator />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/test-success" element={<Navigate to="/success?session_id=AXM-12345" replace />} />
        <Route path="*" element={<Navigate to="/start" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
