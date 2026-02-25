import React, { useCallback, useRef, memo } from 'react';
import { FiBriefcase, FiUser, FiDollarSign, FiZap, FiPlus } from 'react-icons/fi';
import FormSection from './FormSection';
import LetterItem from './LetterItem';
import SafeIcon from '../common/SafeIcon';
import { STATE_NAMES, STATE_INTEREST_RATES, STATE_LEGAL_DETAILS } from '../utils/constants';
import { generateId, getLocalDateString } from '../utils/helpers';

// Sort states alphabetically by name
const stateOptions = Object.keys(STATE_NAMES).sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b])).map(code => ({
  code,
  name: `${STATE_NAMES[code]} (${STATE_INTEREST_RATES[code]}%)`
}));

const LetterForm = memo(({ formData, onUpdate, errors = {} }) => {
  const handleChange = (e) => onUpdate(e.target.name, e.target.value);

  // Keep latest items in ref to stabilize handlers
  const itemsRef = useRef(formData.items);
  itemsRef.current = formData.items;

  const handleAddItem = useCallback(() => {
    // Generate unique ID for new item to ensure stable rendering
    const newItems = [...(itemsRef.current || []), { id: generateId(), description: '', amount: '' }];
    onUpdate('items', newItems);
  }, [onUpdate]);

  const handleAddLateFee = useCallback(() => {
    // Calculate 5% of current principal
    const principal = (itemsRef.current || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const fee = (principal * 0.05).toFixed(2);

    const newItems = [...(itemsRef.current || []), { id: generateId(), description: 'Late Payment Fee (5%)', amount: fee }];
    onUpdate('items', newItems);
  }, [onUpdate]);

  const handleRemoveItem = useCallback((index) => {
    const newItems = itemsRef.current.filter((_, i) => i !== index);
    onUpdate('items', newItems);
  }, [onUpdate]);

  const handleItemChange = useCallback((index, field, value) => {
    const newItems = itemsRef.current.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onUpdate('items', newItems);
  }, [onUpdate]);

  const handleSetToday = useCallback((field) => {
    onUpdate(field, getLocalDateString());
  }, [onUpdate]);

  const handleSetPastDate = useCallback((field, days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    onUpdate(field, getLocalDateString(date));
  }, [onUpdate]);

  const getInputClass = (field, value, required = false) => {
    const hasError = errors[field] || (required && !value);
    const base = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors";
    if (hasError) return `${base} border-red-300 bg-red-50 focus:border-red-500`;
    return `${base} border-slate-300 focus:border-blue-500`;
  };

  const ErrorMessage = ({ error, id }) => {
    if (!error) return null;
    return <p id={id} className="text-[10px] text-red-500 mt-1 font-bold">{error}</p>;
  };

  return (
    <div className="p-6 space-y-8">
      <FormSection title="Legal Strategy" icon={FiZap}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="jurisdiction" className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              Jurisdiction
              <span className="text-[9px] text-slate-300 font-normal normal-case">(Governing Law)</span>
            </label>
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
            {formData.jurisdiction && STATE_LEGAL_DETAILS[formData.jurisdiction] && (
               <p className="text-[10px] text-slate-500 italic mt-1">
                  Legal Basis: {STATE_LEGAL_DETAILS[formData.jurisdiction].statute}
               </p>
            )}
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
              Custom Interest Rate Override <span className="text-slate-300 font-normal normal-case">(Optional - leave 0 to use state default)</span>
            </label>
            <div className="relative">
                <input
                  id="statutoryInterest"
                  type="number"
                  name="statutoryInterest"
                  placeholder={`Current Default: ${STATE_INTEREST_RATES[formData.jurisdiction] || 6}%`}
                  value={formData.statutoryInterest}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 pointer-events-none font-light">
                    %
                 </div>
            </div>
        </div>

         <div className="space-y-1 mt-4">
            <div className="flex justify-between items-center">
                <label htmlFor="letterDate" className="text-[10px] font-bold text-slate-400 uppercase">
                Letter Date
                </label>
                <button
                  onClick={() => handleSetToday('letterDate')}
                  className="text-[10px] text-blue-500 hover:text-blue-700 font-bold uppercase transition-colors"
                  type="button"
                >
                  Set to Today
                </button>
            </div>
            <input
              id="letterDate"
              type="date"
              name="letterDate"
              value={formData.letterDate || ''}
              onChange={handleChange}
              className={getInputClass('letterDate', formData.letterDate, true)}
              aria-invalid={!!errors.letterDate}
              aria-describedby={errors.letterDate ? "letterDate-error" : undefined}
            />
            <ErrorMessage id="letterDate-error" error={errors.letterDate} />
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
              className={getInputClass('creditorName', formData.creditorName, true)}
              aria-invalid={!!errors.creditorName}
              aria-describedby={errors.creditorName ? "creditorName-error" : undefined}
            />
            <ErrorMessage id="creditorName-error" error={errors.creditorName} />
          </div>
          <div>
            <label htmlFor="creditorAddress" className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Creditor Address</label>
            <textarea
              id="creditorAddress"
              name="creditorAddress"
              placeholder="Your Mailing Address"
              rows="2"
              value={formData.creditorAddress}
              onChange={handleChange}
              className={`${getInputClass('creditorAddress', formData.creditorAddress, true)} resize-none`}
              aria-invalid={!!errors.creditorAddress}
              aria-describedby={errors.creditorAddress ? "creditorAddress-error" : undefined}
            />
            <ErrorMessage id="creditorAddress-error" error={errors.creditorAddress} />
          </div>
          <div>
            <label htmlFor="debtorName" className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Debtor Name</label>
            <input
              id="debtorName"
              name="debtorName"
              placeholder="Debtor Full Name"
              value={formData.debtorName}
              onChange={handleChange}
              className={getInputClass('debtorName', formData.debtorName, true)}
              aria-invalid={!!errors.debtorName}
              aria-describedby={errors.debtorName ? "debtorName-error" : undefined}
            />
            <ErrorMessage id="debtorName-error" error={errors.debtorName} />
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
              className={`${getInputClass('debtorAddress', formData.debtorAddress, true)} resize-none`}
              aria-invalid={!!errors.debtorAddress}
              aria-describedby={errors.debtorAddress ? "debtorAddress-error" : undefined}
            />
            <ErrorMessage id="debtorAddress-error" error={errors.debtorAddress} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Itemized Debt Specifics" icon={FiDollarSign}>
        <div id="items-section" className="space-y-3">
          {(formData.items || []).map((item, index) => (
            <LetterItem
              key={item.id}
              item={item}
              index={index}
              onChange={handleItemChange}
              onRemove={handleRemoveItem}
              showRemove={formData.items.length > 1}
              error={errors.itemErrors?.find(e => e.index === index)?.message}
            />
          ))}
          {errors.items && <p className="text-xs text-red-500 font-bold text-center">{errors.items}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="flex-1 py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
            >
              <SafeIcon icon={FiPlus} /> ADD LINE ITEM
            </button>
            <button
              onClick={handleAddLateFee}
              className="flex-shrink-0 px-4 py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:border-amber-400 hover:text-amber-600 transition-all flex items-center justify-center gap-2"
              title="Add 5% Late Fee"
            >
              <SafeIcon icon={FiPlus} /> +5% FEE
            </button>
          </div>
        </div>
        <div className="pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="dueDate" className="text-[10px] font-bold text-slate-400 uppercase">
              Original Due Date <span className="text-slate-300 font-normal normal-case">(Used for interest calc)</span>
            </label>
            <button
                onClick={() => handleSetPastDate('dueDate', 30)}
                className="text-[10px] text-blue-500 hover:text-blue-700 font-bold uppercase transition-colors"
                type="button"
            >
                Set to 30 Days Ago
            </button>
          </div>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            className={getInputClass('dueDate', formData.dueDate, true)}
            aria-invalid={!!errors.dueDate}
            aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
          />
          <ErrorMessage id="dueDate-error" error={errors.dueDate} />
        </div>
      </FormSection>
    </div>
  );
});

LetterForm.displayName = 'LetterForm';

export default LetterForm;
