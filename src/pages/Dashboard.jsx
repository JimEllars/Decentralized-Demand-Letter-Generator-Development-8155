import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

const Dashboard = () => {
  return (
    <ErrorBoundary>
      <div className="p-8 text-white">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Welcome to your portal.</p>
        {/* Intentionally left barebones to represent the "main dashboard rendering logic" */}
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
