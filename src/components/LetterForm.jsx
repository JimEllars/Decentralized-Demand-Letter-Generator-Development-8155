import React, { memo } from 'react';
import { FiUser, FiDollarSign, FiEdit3, FiPlus } from 'react-icons/fi';
import FormSection from './FormSection';
import LetterItem from './LetterItem';
import SafeIcon from '../common/SafeIcon';
import { useLegalStatutes } from '../hooks/useLegalStatutes';
import { generateId, getLocalDateString } from '../utils/helpers';
import { toTitleCase, formatAddress } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

const LetterForm = memo(({ formData, onUpdate, errors = {}, currentStep, calculatedValues }) => {
  const { data: legalStatutes } = useLegalStatutes();

  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate(name, value);
  };

  const handleSetToday = (field) => {
    onUpdate(field, getLocalDateString());
  };

  const handleSetPastDate = (field, daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];
    onUpdate(field, dateString);
  };

  const handleAddItem = () => {
    onUpdate('items', (prevItems) => [
      ...(Array.isArray(prevItems) ? prevItems : []),
      { id: generateId(), description: '', amount: '' }
    ]);
  };

  const handleAddLateFee = () => {
    if (!calculatedValues || !calculatedValues.principal) return;
    const feeAmount = (calculatedValues.principal * 0.05).toFixed(2);
    onUpdate('items', (prevItems) => [
      ...(Array.isArray(prevItems) ? prevItems : []),
      { id: generateId(), description: '5% Late Fee per Contract Terms', amount: feeAmount }
    ]);
  };

  const handleRemoveItem = (index) => {
    onUpdate('items', (prevItems) => {
      const items = Array.isArray(prevItems) ? prevItems : [];
      if (items.length <= 1) return items;
      return items.filter((_, i) => i !== index);
    });
  };

  const handleItemChange = (index, field, value) => {
    onUpdate('items', (prevItems) => {
      const items = Array.isArray(prevItems) ? prevItems : [];
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const getInputClass = (fieldName, value, isRequired = false) => {
    const baseClass = "bg-black/50 border text-white font-mono text-sm p-3 w-full rounded-sm transition-all outline-none placeholder:text-zinc-600 focus:ring-1";
    if (errors[fieldName]) return `${baseClass} border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5`;
    if (isRequired && !value) return `${baseClass} border-subtle focus:border-axim-teal focus:ring-axim-teal/20`;
    return `${baseClass} border-active focus:border-axim-teal focus:ring-axim-teal/20`;
  };

  const ErrorMessage = ({ error, id }) => {
    if (!error) return null;
    return (
      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} id={id} className="text-red-400 text-[0.65rem] mt-1.5 font-mono uppercase tracking-wide flex items-center gap-1">
        <SafeIcon name="FiAlertCircle" className="w-3 h-3" /> {error}
      </motion.p>
    );
  };

  const itemErrorsMap = new Map();
  if (errors.itemErrors) {
    errors.itemErrors.forEach(({ index, errors }) => {
      itemErrorsMap.set(index, errors);
    });
  }

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <FormSection
                    title="Parties"
                    icon={FiUser}
                    description="Enter the exact legal names and valid mailing addresses for both parties. This ensures proper legal service."
                >
                    <div className="space-y-4">
                    <div>
                        <label htmlFor="creditorName" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Creditor Name</label>
                        <input maxLength="2000"
                        id="creditorName"
                        name="creditorName"
                        placeholder="e.g., John Doe LLC"
                        value={formData.creditorName}
                        onChange={handleChange}
                        onBlur={(e) => {
                          const fieldName = e.target.name;
                          const isAddress = fieldName.toLowerCase().includes('address');
                          const cleanedValue = isAddress ? formatAddress(e.target.value) : toTitleCase(e.target.value);
                          onUpdate(fieldName, cleanedValue);
                        }}

                        className={getInputClass('creditorName', formData.creditorName, true)}
                        aria-invalid={!!errors.creditorName}
                        aria-describedby={errors.creditorName ? "creditorName-error" : undefined}
                        />
                        <ErrorMessage id="creditorName-error" error={errors.creditorName} />
                    </div>
                    <div>
                        <label htmlFor="creditorAddress" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Creditor Address</label>
                        <textarea maxLength="2000"
                        id="creditorAddress"
                        name="creditorAddress"
                        placeholder="e.g., 123 Main St, Suite 100, Austin, TX 78701"
                        rows="2"
                        value={formData.creditorAddress}
                        onChange={handleChange}
                        onBlur={(e) => {
                          const fieldName = e.target.name;
                          const isAddress = fieldName.toLowerCase().includes('address');
                          const cleanedValue = isAddress ? formatAddress(e.target.value) : toTitleCase(e.target.value);
                          onUpdate(fieldName, cleanedValue);
                        }}

                        className={`${getInputClass('creditorAddress', formData.creditorAddress, true)} resize-none`}
                        aria-invalid={!!errors.creditorAddress}
                        aria-describedby={errors.creditorAddress ? "creditorAddress-error" : undefined}
                        />
                        <ErrorMessage id="creditorAddress-error" error={errors.creditorAddress} />
                    </div>
                    <div>
                        <label htmlFor="debtorName" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Debtor Name</label>
                        <input maxLength="2000"
                        id="debtorName"
                        name="debtorName"
                        placeholder="e.g., John Doe LLC"
                        value={formData.debtorName}
                        onChange={handleChange}
                        onBlur={(e) => {
                          const fieldName = e.target.name;
                          const isAddress = fieldName.toLowerCase().includes('address');
                          const cleanedValue = isAddress ? formatAddress(e.target.value) : toTitleCase(e.target.value);
                          onUpdate(fieldName, cleanedValue);
                        }}

                        className={getInputClass('debtorName', formData.debtorName, true)}
                        aria-invalid={!!errors.debtorName}
                        aria-describedby={errors.debtorName ? "debtorName-error" : undefined}
                        />
                        <ErrorMessage id="debtorName-error" error={errors.debtorName} />
                    </div>
                    <div>
                        <label htmlFor="debtorAddress" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Debtor Address</label>
                        <textarea maxLength="2000"
                        id="debtorAddress"
                        name="debtorAddress"
                        placeholder="e.g., 123 Main St, Suite 100, Austin, TX 78701"
                        rows="2"
                        value={formData.debtorAddress}
                        onChange={handleChange}
                        onBlur={(e) => {
                          const fieldName = e.target.name;
                          const isAddress = fieldName.toLowerCase().includes('address');
                          const cleanedValue = isAddress ? formatAddress(e.target.value) : toTitleCase(e.target.value);
                          onUpdate(fieldName, cleanedValue);
                        }}

                        className={`${getInputClass('debtorAddress', formData.debtorAddress, true)} resize-none`}
                        aria-invalid={!!errors.debtorAddress}
                        aria-describedby={errors.debtorAddress ? "debtorAddress-error" : undefined}
                        />
                        <ErrorMessage id="debtorAddress-error" error={errors.debtorAddress} />
                    </div>
                    </div>
                </FormSection>
            </motion.div>
        )}

        {currentStep === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <FormSection
                    title="Itemized Debt Specifics"
                    icon={FiDollarSign}
                    description="List the unpaid invoices, services, or damages. You can easily apply a late fee if applicable."
                >
                    <div id="items-section" className="space-y-3">
                    {(formData.items || []).map((item, index) => (
                        <LetterItem
                        key={item.id}
                        item={item}
                        index={index}
                        onChange={handleItemChange}
                        onRemove={handleRemoveItem}
                        showRemove={(formData.items || []).length > 1}
                        itemErrors={itemErrorsMap.get(index)}
                        />
                    ))}
                    {errors.items && <p className="font-mono text-[0.65rem] text-red-400 tracking-wide text-center">{errors.items}</p>}
                    <div className="flex gap-2">
                        <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex-1 py-3 border border-subtle border-dashed rounded-sm font-inter text-xs font-semibold tracking-wider text-zinc-400 hover:border-axim-teal hover:text-axim-teal transition-all flex items-center justify-center gap-2 uppercase"
                        >
                        <SafeIcon icon={FiPlus} /> ADD LINE ITEM
                        </button>
                        <button
                        type="button"
                        onClick={handleAddLateFee}
                        className="flex-shrink-0 px-4 py-3 border border-subtle border-dashed rounded-sm font-inter text-xs font-semibold tracking-wider text-zinc-400 hover:border-axim-gold hover:text-axim-gold transition-all flex items-center justify-center gap-2 uppercase"
                        title="Add 5% Late Fee"
                        >
                        <SafeIcon icon={FiPlus} /> +5% FEE
                        </button>
                    </div>
                    </div>
                    <div className="pt-4 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="dueDate" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Original Due Date <span className="text-zinc-500 font-normal normal-case">(Used for interest calc)</span>
                        </label>
                        <button
                            onClick={() => handleSetPastDate('dueDate', 30)}
                            className="font-inter text-[0.65rem] font-bold text-axim-teal hover:text-white uppercase transition-colors tracking-wide"
                            type="button"
                        >
                            Set to 30 Days Ago
                        </button>
                    </div>
                    <input maxLength="2000"
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.dueDate}
                        onChange={handleChange}
                        className={getInputClass('dueDate', formData.dueDate, true)}
                        aria-invalid={!!errors.dueDate}
                        aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
                    />
                    <ErrorMessage id="dueDate-error" error={errors.dueDate} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="space-y-1">
                            <label htmlFor="jurisdiction" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Governing Law (State)</label>
                            <select
                            id="jurisdiction"
                            name="jurisdiction"
                            value={formData.jurisdiction}
                            onChange={handleChange}
                            className="bg-black/50 border border-subtle text-white font-mono text-sm p-3 w-full rounded-sm focus:border-axim-gold focus:outline-none transition-colors"
                            >
                            {Object.entries(legalStatutes.details).map(([code, details]) => (
                                <option key={code} value={code} className="bg-black text-white">
                                {details.name} ({details.rate}%)
                                </option>
                            ))}
                            </select>
                            {formData.jurisdiction && legalStatutes.details[formData.jurisdiction] && (
                            <p className="font-mono text-[0.65rem] tracking-widest text-zinc-400 mt-1 flex items-center gap-1 bg-black/40 p-1.5 rounded-sm border border-subtle">
                                <SafeIcon name="FiInfo" className="text-axim-teal w-3 h-3" />
                                Legal Basis: {legalStatutes.details[formData.jurisdiction].statute}
                            </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="statutoryInterest" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">
                            Custom Interest Rate Override <span className="text-zinc-500 font-normal normal-case">(Optional)</span>
                            </label>
                            <div className="relative">
                                <input maxLength="2000"
                                id="statutoryInterest"
                                type="number"
                                name="statutoryInterest"
                                placeholder={`Current Default: ${legalStatutes.details[formData.jurisdiction]?.rate || 6}%`}
                                value={formData.statutoryInterest}
                                onChange={handleChange}
                                className="bg-black/50 border border-subtle text-white font-mono text-sm p-3 w-full rounded-sm focus:border-axim-gold focus:outline-none transition-colors placeholder:text-zinc-600 pr-8"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-zinc-500 pointer-events-none font-mono">
                                    %
                                </div>
                            </div>
                        </div>
                    </div>
                </FormSection>
            </motion.div>
        )}

        {currentStep === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <FormSection
                    title="Tone & Configuration"
                    icon={FiEdit3}
                    description="Finalize the tone and date of your letter."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="tone" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Document Tone</label>
                            <select
                            id="tone"
                            name="tone"
                            value={formData.tone}
                            onChange={handleChange}
                            className="bg-black/50 border border-subtle text-white font-mono text-sm p-3 w-full rounded-sm focus:border-axim-gold focus:outline-none transition-colors"
                            >
                            <option value="soft" className="bg-black text-white">Friendly Reminder</option>
                            <option value="professional" className="bg-black text-white">Professional</option>
                            <option value="firm" className="bg-black text-white">Firm / Standard</option>
                            <option value="aggressive" className="bg-black text-white">Aggressive / Intent to Sue</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="letterDate" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                Letter Date
                                </label>
                                <button
                                onClick={() => handleSetToday('letterDate')}
                                className="font-inter text-[0.65rem] font-bold text-axim-teal hover:text-white uppercase transition-colors tracking-wide"
                                type="button"
                                >
                                Set to Today
                                </button>
                            </div>
                            <input maxLength="2000"
                            id="letterDate"
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            name="letterDate"
                            value={formData.letterDate || ''}
                            onChange={handleChange}
                            className={getInputClass('letterDate', formData.letterDate, true)}
                            aria-invalid={!!errors.letterDate}
                            aria-describedby={errors.letterDate ? "letterDate-error" : undefined}
                            />
                            <ErrorMessage id="letterDate-error" error={errors.letterDate} />
                        </div>
                    </div>

                    </FormSection>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

LetterForm.displayName = 'LetterForm';

export default LetterForm;
