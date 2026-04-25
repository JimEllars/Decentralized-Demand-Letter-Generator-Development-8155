import { Component } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      fetch('https://api.axim.us.com/v1/telemetry/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app: 'demand_letter_generator',
          message: error.message,
          stack: errorInfo.componentStack,
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal
      }).catch(err => console.error("Telemetry failed:", err))
        .finally(() => clearTimeout(timeoutId));
    } catch (e) {
      console.error("Failed to send telemetry:", e);
    }
  }

  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-6 text-sm">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
               <div className="bg-slate-100 p-4 rounded-lg text-left text-xs font-mono overflow-auto max-h-40 mb-6 text-slate-700">
                 {this.state.error.toString()}
               </div>
            )}
            <button
              onClick={this.handleReset.bind(this)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
