import React from 'react';

const DocumentPreview = ({ formData }) => {
  return (
    <div className="w-full overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm mt-6">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Document Preview</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <tbody className="divide-y divide-slate-200">
            {(formData.items || []).map((item, i) => (
              // Optimization: Use item.id as key instead of index to improve rendering performance and avoid reconciliation issues
              <tr key={item.id || i}>
                <td className="px-3 py-2 text-slate-700">{item.description || 'General Debt'}</td>
                <td className="px-3 py-2 text-right text-slate-600 font-medium">
                  {item.amount ? `$${item.amount}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentPreview;
