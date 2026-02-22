import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { STATE_SPECIFIC_CLAUSES } from '../utils/constants';

const DocumentPreview = React.memo(({ formData, calculatedValues, toneTemplate, isPaid }) => {
  if (!formData || !calculatedValues || !toneTemplate) return null;

  const { letterDate, creditorName, creditorAddress, debtorName, debtorAddress, jurisdiction, dueDate, items } = formData;
  const { formattedPrincipal, formattedInterest, formattedTotal, rateUsed, statuteUsed, daysOverdue } = calculatedValues;

  // Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const date = new Date(dateString);
    // Adjust for timezone offset to prevent off-by-one errors if input is YYYY-MM-DD
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return adjustedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formattedDate = formatDate(letterDate);
  const formattedDueDate = formatDate(dueDate);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden relative">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Document Preview</h3>
        <span className="text-[10px] text-slate-400 font-mono">LIVE RENDER</span>
      </div>

      {/* Document Container */}
      <div className="p-8 md:p-12 relative min-h-[600px] text-sm text-slate-800 leading-relaxed font-serif">

        {/* Watermark */}
        {!isPaid && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
            <div className="transform -rotate-45 text-slate-100 text-6xl md:text-9xl font-black opacity-50 select-none whitespace-nowrap">
              PREVIEW
            </div>
          </div>
        )}

        {/* Content Wrapper */}
        <div className="relative z-10 space-y-6">

            {/* Header */}
            <div className="text-center font-bold text-xl text-slate-900 border-b border-slate-200 pb-4 mb-8">
                {toneTemplate.title}
            </div>

            {/* Parties & Date */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-sans mb-1">From:</p>
                    <p className="font-bold">{creditorName || '[Creditor Name]'}</p>
                    <p className="whitespace-pre-wrap text-slate-600">{creditorAddress || '[Creditor Address]'}</p>
                </div>
                <div className="text-left md:text-right space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-sans mb-1">Date:</p>
                    <p>{formattedDate}</p>
                </div>
            </div>

            <div className="mt-6 space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-sans mb-1">To:</p>
                <p className="font-bold">{debtorName || '[Debtor Name]'}</p>
                <p className="whitespace-pre-wrap text-slate-600">{debtorAddress || '[Debtor Address]'}</p>
            </div>

            {/* Subject */}
            <div className="font-bold text-slate-900 mt-8 border-l-4 border-slate-300 pl-4 py-1">
                RE: NOTICE OF OVERDUE ACCOUNT ({jurisdiction})
            </div>

            {/* Intro */}
            <p className="mt-4">{toneTemplate.intro}</p>

            {/* Table */}
            <div className="mt-8 overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {(items || []).map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-slate-700">{item.description || 'Item'}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                          {item.amount ? formatCurrency(item.amount) : '-'}
                        </td>
                      </tr>
                    ))}
                    {/* Interest Row */}
                    <tr className="bg-slate-50/50">
                        <td className="px-4 py-3 text-slate-600 italic">
                            Statutory Interest ({rateUsed}% per annum)
                            <br/>
                            <span className="text-[10px] text-slate-400 not-italic">
                                {daysOverdue > 0 ? `${daysOverdue} days overdue` : 'Based on due date'}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                            {formattedInterest}
                        </td>
                    </tr>
                    {/* Total Row */}
                    <tr className="bg-slate-100 font-bold text-slate-900">
                        <td className="px-4 py-3">TOTAL DUE</td>
                        <td className="px-4 py-3 text-right font-mono">{formattedTotal}</td>
                    </tr>
                  </tbody>
                </table>
            </div>

            {/* Closing */}
            <p className="mt-6">
                Payment must be received by <strong>{formattedDueDate}</strong>. {toneTemplate.closing}
            </p>

            {/* Legal Authority */}
            <div className="mt-8 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans mb-1">Legal Authority & Interest Calculation</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                    This demand includes interest calculated at an annual rate of {rateUsed}% pursuant to <span className="font-semibold text-slate-700">{statuteUsed}</span>.
                </p>
                {STATE_SPECIFIC_CLAUSES[jurisdiction] && (
                  <div className="mt-4">
                     <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans mb-1">{STATE_SPECIFIC_CLAUSES[jurisdiction].label}</h4>
                     <p className="text-xs text-slate-500 leading-relaxed italic">
                        {STATE_SPECIFIC_CLAUSES[jurisdiction].text}
                     </p>
                  </div>
                )}
            </div>

            {/* Signature Area */}
            <div className="mt-12 space-y-8">
                <p>Sincerely,</p>
                <div className="border-b border-slate-300 w-64"></div>
                <p className="font-bold">{creditorName || '[Creditor Name]'}</p>
            </div>

            <div className="mt-12 text-center text-[10px] text-slate-300 font-sans uppercase tracking-widest">
                Generated via AXiM Documents Automation
            </div>
        </div>
      </div>
    </div>
  );
});

export default DocumentPreview;
