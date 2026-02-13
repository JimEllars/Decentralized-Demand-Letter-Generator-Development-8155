/**
 * Shared formatter instance for currency (USD)
 * Instantiating Intl.NumberFormat is expensive, so we create it once and reuse it.
 */
export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

/**
 * Formats a number as USD currency.
 * @param {number|string} amount
 * @returns {string} Formatted currency string (e.g. "$1,234.56")
 */
export const formatCurrency = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return currencyFormatter.format(isNaN(num) ? 0 : num);
};
