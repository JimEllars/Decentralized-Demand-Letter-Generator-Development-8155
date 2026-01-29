import { differenceInCalendarDays, parseISO, startOfToday } from 'date-fns';
import { STATE_INTEREST_RATES, TONE_TEMPLATES } from './constants';

/**
 * AXiM Statutory Interest & Calculation Engine
 */

export const calculateTotal = (items = [], interestRate, dueDate, jurisdiction = 'DEFAULT') => {
  // Calculate Principal from itemized list
  const principal = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  
  // Determine Rate
  const r = (parseFloat(interestRate) > 0) 
    ? parseFloat(interestRate) / 100 
    : (STATE_INTEREST_RATES[jurisdiction] || STATE_INTEREST_RATES['DEFAULT']) / 100;

  let interest = 0;
  let diffDays = 0;

  if (dueDate && principal > 0) {
    const due = parseISO(dueDate);
    const now = startOfToday();

    // Calculate difference in calendar days
    const diff = differenceInCalendarDays(now, due);

    if (diff > 0) {
      diffDays = diff;
      if (r > 0) {
        interest = (principal * r / 365) * diffDays;
      }
    }
  }

  return {
    principal: principal,
    interest: interest.toFixed(2),
    total: (principal + parseFloat(interest)).toFixed(2),
    rateUsed: (r * 100).toFixed(2),
    daysOverdue: diffDays
  };
};

export const getToneTemplate = (tone) => {
  return TONE_TEMPLATES[tone] || TONE_TEMPLATES.firm;
};
