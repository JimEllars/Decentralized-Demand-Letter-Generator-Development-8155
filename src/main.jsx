import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { ThirdwebProvider } from 'thirdweb/react';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThirdwebProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThirdwebProvider>
    </ErrorBoundary>
  </StrictMode>
);