import React from 'react';
import { FiBriefcase, FiUser, FiDollarSign } from 'react-icons/fi';
import FormSection from './FormSection';

const LetterForm = ({ formData, onUpdate }) => {
  const handleChange = (e) => onUpdate(e.target.name, e.target.value);

  return (
    <div className="p-6 space-y-8">
      <FormSection title="Creditor Information" icon={FiBriefcase}>
        <input 
          name="creditorName"
          placeholder="Your Name / Company"
          value={formData.creditorName}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
        />
        <textarea 
          name="creditorAddress"
          placeholder="Business Address"
          rows="2"
          value={formData.creditorAddress}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
        />
      </FormSection>

      <FormSection title="Debtor Information" icon={FiUser}>
        <input 
          name="debtorName"
          placeholder="Debtor Full Name"
          value={formData.debtorName}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
        />
        <textarea 
          name="debtorAddress"
          placeholder="Physical or mailing address"
          rows="2"
          value={formData.debtorAddress}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
        />
      </FormSection>

      <FormSection title="Debt Specifics" icon={FiDollarSign}>
        <div className="grid grid-cols-2 gap-4">
          <input 
            name="debtAmount"
            type="number"
            placeholder="Principal ($)"
            value={formData.debtAmount}
            onChange={handleChange}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          />
          <input 
            name="lateFees"
            type="number"
            placeholder="Late Fees ($)"
            value={formData.lateFees}
            onChange={handleChange}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Interest Rate (%)</label>
            <input 
              name="statutoryInterest"
              type="number"
              value={formData.statutoryInterest}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Deadline Date</label>
            <input 
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>
        <input 
          name="debtDescription"
          placeholder="Reason for debt (e.g. Invoice #123)"
          value={formData.debtDescription}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
        />
      </FormSection>
    </div>
  );
};

export default LetterForm;