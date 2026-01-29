export const calculateTotal = (principal, fees, interestRate, dueDate) => {
  const p = parseFloat(principal || 0);
  const f = parseFloat(fees || 0);
  const r = parseFloat(interestRate || 0) / 100;
  
  // Basic statutory interest calculation (daily)
  let interest = 0;
  if (r > 0 && dueDate) {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = Math.abs(now - due);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (now > due) {
      interest = (p * r / 365) * diffDays;
    }
  }

  return {
    principal: p,
    fees: f,
    interest: interest.toFixed(2),
    total: (p + f + interest).toFixed(2)
  };
};