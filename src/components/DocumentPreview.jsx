import React from 'react';
import { calculateTotal, getToneTemplate } from '../utils/calculations';

const DocumentPreview = ({ formData, isPaid }) => {
  const { principal, interest, total, rateUsed } = calculateTotal(
    formData.items,
    formData.statutoryInterest,
    formData.dueDate,
    formData.jurisdiction
  );

  const tone = getToneTemplate(formData.tone);

  return (
    <div className="bg-white w-full flex-grow p-8 text-slate-800 shadow-inner rounded-lg overflow-y-auto max-h-[500px] relative z-20 font-serif">
      <div className="text-center mb-8">
        <h2 className="text-lg font-bold uppercase tracking-widest text-blue-900 border-b-2 border-blue-900 pb-2 inline-block">
          {tone.title}
        </h2>
      </div>

      <div className="flex justify-between text-[10px] mb-8">
        <div>
          <p className="font-bold text-slate-400 uppercase">FROM:</p>
          <p className="font-bold text-sm tracking-tight">{formData.creditorName}</p>
          <p className="whitespace-pre-wrap text-slate-600 italic">Electronic Transmission</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-400 uppercase">DATE:</p>
          <p className="font-bold">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="text-[10px] mb-6">
        <p className="font-bold text-slate-400 uppercase">TO:</p>
        <p className="font-bold text-sm">{formData.debtorName || '[Debtor Name]'}</p>
        <p className="whitespace-pre-wrap text-slate-600">{formData.debtorAddress || '[Debtor Address]'}</p>
      </div>

      <div className="text-xs space-y-4">
        <p className="font-bold border-b border-slate-200 pb-1 text-blue-900 uppercase tracking-tighter">
          RE: FORMAL DEMAND FOR PAYMENT - JURISDICTION: {formData.jurisdiction}
        </p>
        
        <p className="leading-relaxed text-justify">{tone.intro}</p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-[10px]">
            <thead className="bg-slate-100 text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(formData.items || []).map((item, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">{item.description || 'General Debt'}</td>
                  <td className="px-3 py-2 text-right font-mono">${parseFloat(item.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
              {parseFloat(interest) > 0 && (
                <tr className="italic text-blue-700 bg-blue-50/30">
                  <td className="px-3 py-2">Statutory Interest ({rateUsed}%)</td>
                  <td className="px-3 py-2 text-right font-mono">${interest}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-800 text-white font-bold">
                <td className="px-3 py-2">TOTAL DEMANDED</td>
                <td className="px-3 py-2 text-right font-mono">${total}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="leading-relaxed">
          Full payment must be received by <strong>{formData.dueDate || '[Date]'}</strong>. {tone.closing}
        </p>
      </div>

      <div className="mt-12 pt-4 border-t border-slate-100 text-[9px] text-slate-400 flex justify-between italic">
        <span>AXiM Documents Self-Contained Engine v1.2.0</span>
        <span>Ref: {formData.jurisdiction}-{Math.random().toString(36).substring(7).toUpperCase()}</span>
      </div>
    </div>
  );
};

export default DocumentPreview;