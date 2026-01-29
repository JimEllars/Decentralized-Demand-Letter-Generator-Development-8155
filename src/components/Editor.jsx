import React from 'react';
import { FiFileText, FiBriefcase, FiUser, FiDollarSign, FiCalendar } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Editor = ({ formData, onInputChange }) => {
  return (
    <section className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
        <h2 className="text-xl font-semibold flex items-center gap-3 text-slate-800">
          <SafeIcon icon={FiFileText} className="w-5 h-5 text-blue-600" />
          Document Details
        </h2>
        <p className="text-sm text-slate-600 mt-1 text-balance">All information is processed locally in your browser</p>
      </div>
      
      <div className="p-6 space-y-8">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <SafeIcon icon={FiBriefcase} className="w-4 h-4" />
            Creditor Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <input name="creditorName" placeholder="Your Name / Company" value={formData.creditorName} onChange={onInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            <textarea name="creditorAddress" placeholder="Business Address" rows="2" value={formData.creditorAddress} onChange={onInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" />
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <SafeIcon icon={FiUser} className="w-4 h-4" />
            Debtor Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <input name="debtorName" placeholder="Debtor Full Name" value={formData.debtorName} onChange={onInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <textarea name="debtorAddress" placeholder="Debtor Address" rows="2" value={formData.debtorAddress} onChange={onInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <SafeIcon icon={FiDollarSign} className="w-4 h-4" />
            Debt Specifics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <input name="debtAmount" type="number" placeholder="Amount ($)" value={formData.debtAmount} onChange={onInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input name="dueDate" type="date" value={formData.dueDate} onChange={onInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <input name="debtDescription" placeholder="Description (e.g. Unpaid Invoice #001)" value={formData.debtDescription} onChange={onInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
    </section>
  );
};

export default Editor;