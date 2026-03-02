
/**
 * Validation logic for the Demand Letter Generator
 */

export const validateForm = (formData) => {
  const errors = {};

  if (!formData.creditorName?.trim()) {
    errors.creditorName = "Creditor Name is required.";
  }
  if (!formData.creditorAddress?.trim()) {
    errors.creditorAddress = "Creditor Address is required.";
  }
  if (!formData.debtorName?.trim()) {
    errors.debtorName = "Debtor Name is required.";
  }
  if (!formData.debtorAddress?.trim()) {
    errors.debtorAddress = "Debtor Address is required.";
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
      let message = null;
      if (!item.description || !item.description.trim()) {
        message = "Description is required.";
      } else if (!item.amount || parseFloat(item.amount) <= 0) {
        message = "Amount must be greater than 0.";
      }
      if (message) {
        itemErrors.push({ index, message });
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
