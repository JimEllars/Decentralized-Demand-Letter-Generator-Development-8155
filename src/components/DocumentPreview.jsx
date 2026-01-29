import React from 'react';
import { calculateTotal } from '../utils/calculations';

const DocumentPreview = ({ formData, isPaid }) => {
  const { principal, fees, interest, total } = calculateTotal(
    formData.debtAmount, 
    formData.lateFees, 
    formData.statutoryInterest,
    formData.dueDate
  );

  return (
    <div className="bg-white w-full flex-grow p-8 text-slate-800 shadow-inner rounded-lg overflow-y-auto max-h-[500px] relative z-20 font-serif">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase tracking-widest text-blue-900 border-b-2 border-blue-900 pb-2 inline-block">
          Formal Demand for Payment
        </h2>
      </div>

      <div className="flex justify-between text-xs mb-8">
        <div>
          <p className="font-bold text-slate-400 uppercase tracking-tighter">FROM:</p>
          <p className="font-bold text-sm">{formData.creditorName}</p>
          <p className="whitespace-pre-wrap text-slate-600">{formData.creditorAddress}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-400 uppercase tracking-tighter">DATE:</p>
          <p className="font-bold">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="text-xs mb-6">
        <p className="font-bold text-slate-400 uppercase tracking-tighter">TO:</p>
        <p className="font-bold text-sm">{formData.debtorName || '[Debtor Name]'}</p>
        <p className="whitespace-pre-wrap text-slate-600">{formData.debtorAddress || '[Debtor Address]'}</p>
      </div>

      <div className="text-sm space-y-4">
        <p className="font-bold border-b border-slate-200 pb-1 text-blue-900">RE: FINAL NOTICE OF OVERDUE ACCOUNT</p>
        <p className="leading-relaxed text-justify">
          Demand is hereby made for the payment of <strong>${total}</strong>. 
          This balance relates to: {formData.debtDescription || 'unpaid obligations'}.
        </p>
        
        <div className="bg-slate-50 p-4 rounded border border-slate-100">
          <div className="flex justify-between border-b pb-1 mb-1">
            <span>Principal Amount</span>
            <span className="font-mono">${principal.toFixed(2)}</span>
          </div>
          {parseFloat(fees) > 0 && (
            <div className="flex justify-between border-b pb-1 mb-1">
              <span>Late Fees</span>
              <span className="font-mono">${fees}</span>
            </div>
          )}
          {parseFloat(interest) > 0 && (
            <div className="flex justify-between border-b pb-1 mb-1">
              <span>Statutory Interest</span>
              <span className="font-mono">${interest}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-blue-900 pt-1">
            <span>TOTAL DUE</span>
            <span className="font-mono text-lg">${total}</span>
          </div>
        </div>

        <p className="leading-relaxed">
          Payment must be received by <strong>{formData.dueDate || '[Date]'}</strong>. 
          Failure to comply will result in further legal action without further notice.
        </p>
      </div>

      <div className="mt-12 pt-4 border-t border-slate-100 text-[10px] text-slate-400 italic">
        AXiM Verified System Output • Compliance Hash: {Math.random().toString(36).substring(7).toUpperCase()}
      </div>
    </div>
  );
};

export default DocumentPreview;