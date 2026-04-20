
/**
 * Validation logic for the Demand Letter Generator
 */

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  // Strip HTML tags
  let sanitized = input.replace(/<[^>]*>?/gm, '');
  // Optionally strip non-standard special characters to prevent script injection
  // Here we allow alphanumeric, spaces, common punctuation used in addresses and names
  // but strip < > { }
  sanitized = sanitized.replace(/[<>{}|=]/g, '');
  // Replace excessive newlines
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  // Trim leading whitespace but allow trailing whitespace for typing spaces between words
  return sanitized.trimStart();
};

export const sanitizeFormData = (formData) => {
  if (!formData) return formData;
  const sanitized = { ...formData };

  if (sanitized.creditorName) sanitized.creditorName = sanitizeInput(sanitized.creditorName);
  if (sanitized.creditorAddress) sanitized.creditorAddress = sanitizeInput(sanitized.creditorAddress);
  if (sanitized.debtorName) sanitized.debtorName = sanitizeInput(sanitized.debtorName);
  if (sanitized.debtorAddress) sanitized.debtorAddress = sanitizeInput(sanitized.debtorAddress);

  if (Array.isArray(sanitized.items)) {
    sanitized.items = sanitized.items.map(item => ({
      ...item,
      description: sanitizeInput(item.description),
      amount: item.amount // assuming amount is validated numerically
    }));
  }

  return sanitized;
};

export const validateForm = (formData) => {
  const errors = {};

  if (!formData.creditorName?.trim()) {
    errors.creditorName = "Creditor Name is required.";
  } else if (formData.creditorName.length > 100) {
    errors.creditorName = "Creditor Name must be 100 characters or less.";
  }
  if (!formData.creditorAddress?.trim()) {
    errors.creditorAddress = "Creditor Address is required.";
  } else if (formData.creditorAddress.length > 500) {
    errors.creditorAddress = "Creditor Address must be 500 characters or less.";
  }
  if (!formData.debtorName?.trim()) {
    errors.debtorName = "Debtor Name is required.";
  } else if (formData.debtorName.length > 100) {
    errors.debtorName = "Debtor Name must be 100 characters or less.";
  }
  if (!formData.debtorAddress?.trim()) {
    errors.debtorAddress = "Debtor Address is required.";
  } else if (formData.debtorAddress.length > 500) {
    errors.debtorAddress = "Debtor Address must be 500 characters or less.";
  }
  if (!formData.dueDate) {
    errors.dueDate = "Original Due Date is required.";
  }
  if (!formData.letterDate) {
    errors.letterDate = "Letter Date is required.";
  }

  // Validate items
  const itemErrors = [];
  if (!formData.items || formData.items.length === 0) {
    errors.items = "At least one item is required.";
  } else {
    formData.items.forEach((item, index) => {
      const itemError = {};
      let hasError = false;
      if (!item.description || !item.description.trim()) {
        itemError.description = "Description is required.";
        hasError = true;
      } else if (item.description.length > 500) {
        itemError.description = "Description must be 500 characters or less.";
        hasError = true;
      }
      if (!item.amount || parseFloat(item.amount) <= 0) {
        itemError.amount = "Amount must be greater than 0.";
        hasError = true;
      }

      if (hasError) {
        itemErrors.push({ index, errors: itemError });
      }
    });
    if (itemErrors.length > 0) {
      errors.itemErrors = itemErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getFirstErrorFieldId = (errors) => {
  if (errors.creditorName) return 'creditorName';
  if (errors.creditorAddress) return 'creditorAddress';
  if (errors.debtorName) return 'debtorName';
  if (errors.debtorAddress) return 'debtorAddress';
  if (errors.dueDate) return 'dueDate';
  if (errors.letterDate) return 'letterDate';
  // Items are tricky, maybe scroll to the items section
  if (errors.items || errors.itemErrors) return 'items-section';
  return null;
};
