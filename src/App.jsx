import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DemandGenerator from './components/DemandGenerator';
import DemandLanding from './components/DemandLanding';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/demand-letter" element={<DemandLanding />} />
        <Route path="/app/demand-generator" element={<DemandGenerator />} />
        <Route path="*" element={<Navigate to="/demand-letter" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
