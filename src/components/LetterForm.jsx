import React from 'react';
import { FiBriefcase, FiUser, FiDollarSign, FiZap, FiPlus, FiTrash2 } from 'react-icons/fi';
import FormSection from './FormSection';
import SafeIcon from '../common/SafeIcon';
import { STATE_NAMES, STATE_INTEREST_RATES } from '../utils/constants';
import { generateId } from '../utils/helpers';

// Sort states alphabetically by name
const stateOptions = Object.keys(STATE_NAMES).sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b])).map(code => ({
  code,
  name: `${STATE_NAMES[code]} (${STATE_INTEREST_RATES[code]}%)`
}));

const LetterForm = ({ formData, onUpdate }) => {
  const handleChange = (e) => onUpdate(e.target.name, e.target.value);

  const handleAddItem = () => {
    // Generate unique ID for new item to ensure stable rendering
    const newItems = [...(formData.items || []), { id: generateId(), description: '', amount: '' }];
    onUpdate('items', newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    onUpdate('items', newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = formData.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onUpdate('items', newItems);
  };

  const getInputClass = (value, required = false) => {
    const base = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors";
    if (required && !value) return `${base} border-red-300 bg-red-50 focus:border-red-500`;
    return `${base} border-slate-300 focus:border-blue-500`;
  };

  return (
    <div className="p-6 space-y-8">
      <FormSection title="Legal Strategy" icon={FiZap}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="jurisdiction" className="text-[10px] font-bold text-slate-400 uppercase">Jurisdiction</label>
            <select
              id="jurisdiction"
              name="jurisdiction"
              value={formData.jurisdiction}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {stateOptions.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
              <option value="DEFAULT">Other / International (6%)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="tone" className="text-[10px] font-bold text-slate-400 uppercase">Document Tone</label>
            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-semibold"
            >
              <option value="soft">Friendly Reminder</option>
              <option value="professional">Professional</option>
              <option value="firm">Firm / Standard</option>
              <option value="aggressive">Aggressive / Intent to Sue</option>
            </select>
          </div>
        </div>

        <div className="space-y-1 mt-4">
            <label htmlFor="statutoryInterest" className="text-[10px] font-bold text-slate-400 uppercase">
              Custom Interest Rate Override (%) <span className="text-slate-300 font-normal normal-case">(Optional - leave 0 to use state default)</span>
            </label>
            <input
              id="statutoryInterest"
              type="number"
              name="statutoryInterest"
              placeholder={`Current Default: ${STATE_INTEREST_RATES[formData.jurisdiction] || 6}%`}
              value={formData.statutoryInterest}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
        </div>

         <div className="space-y-1 mt-4">
            <label htmlFor="letterDate" className="text-[10px] font-bold text-slate-400 uppercase">
              Letter Date
            </label>
            <input
              id="letterDate"
              type="date"
              name="letterDate"
              value={formData.letterDate || ''}
              onChange={handleChange}
              className={getInputClass(formData.letterDate, true)}
            />
            {!formData.letterDate && <p className="text-[10px] text-red-400 mt-1 font-bold">REQUIRED</p>}
        </div>
      </FormSection>

      <FormSection title="Parties" icon={FiUser}>
        <div className="space-y-4">
          <div>
            <label htmlFor="creditorName" className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Creditor Name</label>
            <input
              id="creditorName"
              name="creditorName"
              placeholder="Your Name / Company"
              value={formData.creditorName}
              onChange={handleChange}
              className={getInputClass(formData.creditorName, true)}
            />
            {!formData.creditorName && <p className="text-[10px] text-red-400 mt-1 font-bold">REQUIRED</p>}
          </div>
          <div>
            <label htmlFor="debtorName" className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Debtor Name</label>
            <input
              id="debtorName"
              name="debtorName"
              placeholder="Debtor Full Name"
              value={formData.debtorName}
              onChange={handleChange}
              className={getInputClass(formData.debtorName, true)}
            />
            {!formData.debtorName && <p className="text-[10px] text-red-400 mt-1 font-bold">REQUIRED</p>}
          </div>
          <div>
            <label htmlFor="debtorAddress" className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Debtor Address</label>
            <textarea
              id="debtorAddress"
              name="debtorAddress"
              placeholder="Debtor Mailing Address"
              rows="2"
              value={formData.debtorAddress}
              onChange={handleChange}
              className={`${getInputClass(formData.debtorAddress, true)} resize-none`}
            />
            {!formData.debtorAddress && <p className="text-[10px] text-red-400 mt-1 font-bold">REQUIRED</p>}
          </div>
        </div>
      </FormSection>

      <FormSection title="Itemized Debt Specifics" icon={FiDollarSign}>
        <div className="space-y-3">
          {(formData.items || []).map((item, index) => (
            <div key={item.id} className="flex gap-2 items-start">
              <div className="flex-grow">
                 <input
                  aria-label={`Description for item ${index + 1}`}
                  placeholder="Description (e.g. Invoice #101)"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex flex-col w-24">
                <input
                  aria-label={`Amount for item ${index + 1}`}
                  type="number"
                  placeholder="0.00"
                  value={item.amount}
                  onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${!item.amount ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                />
              </div>
              {formData.items.length > 1 && (
                <button onClick={() => handleRemoveItem(index)} className="p-2 text-slate-400 hover:text-red-500" aria-label="Remove item">
                  <SafeIcon icon={FiTrash2} />
                </button>
              )}
            </div>
          ))}
          <button 
            onClick={handleAddItem}
            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <SafeIcon icon={FiPlus} /> ADD LINE ITEM
          </button>
        </div>
        <div className="pt-4 space-y-2">
          <label htmlFor="dueDate" className="text-[10px] font-bold text-slate-400 uppercase">Original Due Date</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            className={getInputClass(formData.dueDate, true)}
          />
          {!formData.dueDate && <p className="text-[10px] text-red-400 mt-1 font-bold">REQUIRED</p>}
        </div>
      </FormSection>
    </div>
  );
};

export default LetterForm;
