import React from 'react';
import { FiBriefcase, FiUser, FiDollarSign, FiZap, FiPlus, FiTrash2 } from 'react-icons/fi';
import FormSection from './FormSection';
import SafeIcon from '../common/SafeIcon';

const LetterForm = ({ formData, onUpdate }) => {
  const handleChange = (e) => onUpdate(e.target.name, e.target.value);

  const handleAddItem = () => {
    const newItems = [...(formData.items || []), { description: '', amount: '' }];
    onUpdate('items', newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    onUpdate('items', newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    onUpdate('items', newItems);
  };

  const states = [
    { code: 'CA', name: 'California (10%)' },
    { code: 'NY', name: 'New York (9%)' },
    { code: 'FL', name: 'Florida (4.75%)' },
    { code: 'TX', name: 'Texas (6%)' },
    { code: 'IL', name: 'Illinois (5%)' },
    { code: 'GA', name: 'Georgia (7%)' },
    { code: 'DEFAULT', name: 'Other State (6%)' },
  ];

  return (
    <div className="p-6 space-y-8">
      <FormSection title="Legal Strategy" icon={FiZap}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Jurisdiction</label>
            <select name="jurisdiction" value={formData.jurisdiction} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              {states.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Document Tone</label>
            <select name="tone" value={formData.tone} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-semibold">
              <option value="soft">Friendly Reminder</option>
              <option value="firm">Firm / Standard</option>
              <option value="aggressive">Aggressive / Intent to Sue</option>
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection title="Parties" icon={FiUser}>
        <div className="space-y-4">
          <input name="creditorName" placeholder="Your Name / Company" value={formData.creditorName} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <input name="debtorName" placeholder="Debtor Full Name" value={formData.debtorName} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <textarea name="debtorAddress" placeholder="Debtor Mailing Address" rows="2" value={formData.debtorAddress} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>
      </FormSection>

      <FormSection title="Itemized Debt Specifics" icon={FiDollarSign}>
        <div className="space-y-3">
          {(formData.items || []).map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input 
                placeholder="Description (e.g. Invoice #101)" 
                value={item.description} 
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="flex-grow px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <input 
                type="number" 
                placeholder="0.00" 
                value={item.amount} 
                onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              {formData.items.length > 1 && (
                <button onClick={() => handleRemoveItem(index)} className="p-2 text-slate-400 hover:text-red-500">
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
          <label className="text-[10px] font-bold text-slate-400 uppercase">Original Due Date</label>
          <input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </FormSection>
    </div>
  );
};

export default LetterForm;