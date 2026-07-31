import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { useHistoryStore } from '../hooks/useLetterStore';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const history = useHistoryStore(state => state.history) || [];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg-void py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="max-w-5xl w-full">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Vault</h1>
              <p className="mt-2 text-sm text-zinc-400">Secure access to your previously generated documents.</p>
            </div>
            <Link
              to="/app/demand-generator"
              className="px-5 py-2.5 bg-axim-teal text-black text-sm font-semibold rounded-md hover:bg-white hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300 shadow-sm"
            >
              + New Document
            </Link>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
            {history.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 border border-zinc-700">
                  <span className="text-2xl text-zinc-500">📄</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No documents generated yet</h3>
                <p className="text-sm text-zinc-400 max-w-sm mb-6">When you create a demand letter, it will securely appear here for future reference.</p>
                <Link
                  to="/app/demand-generator"
                  className="text-axim-teal text-sm font-medium hover:text-white transition-colors"
                >
                  Create your first letter &rarr;
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-800">
                  <thead className="bg-zinc-900/50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Document
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Date Created
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                    {history.map((doc, idx) => (
                      <tr key={doc.id || idx} className="hover:bg-zinc-800/50 transition-colors duration-150 group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-axim-teal/10 rounded flex items-center justify-center border border-axim-teal/20 group-hover:bg-axim-teal/20 transition-colors">
                              <span className="text-axim-teal text-sm">PDF</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{doc.type || 'Demand Letter'}</div>
                              <div className="text-xs text-zinc-500 font-mono">ID: {doc.id ? doc.id.slice(-6) : 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-zinc-300">{doc.recipient}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-300">
                          {doc.amount ? `$${Number(doc.amount).toFixed(2)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                          {new Date(doc.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-axim-teal/10 text-axim-teal border border-axim-teal/20">
                            {doc.status || 'Delivered'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
