import { useState, useEffect, useCallback } from 'react';
import { loadAndMigrateData } from '../utils/storeHelpers';
import { sanitizeInput } from '../utils/validation';

const STORAGE_KEY = 'axim_demand_letter_draft';

export const useLetterStore = (initialDataOrFn) => {
  const [formData, setFormData] = useState(initialDataOrFn);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    const data = loadAndMigrateData(saved, initialDataOrFn);
    setFormData(data);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Only save if data has been initialized from storage
    if (!isInitialized) return;

    const handler = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [formData, isInitialized]);

  const updateField = useCallback((name, value) => {
    setFormData(prev => {
      let resolvedValue = typeof value === 'function' ? value(prev[name]) : value;
      // Sanitize standard text fields when updating individually
      if (['creditorName', 'creditorAddress', 'debtorName', 'debtorAddress'].includes(name) && typeof resolvedValue === 'string') {
        resolvedValue = sanitizeInput(resolvedValue);
      }
      return {
        ...prev,
        [name]: resolvedValue
      };
    });
  }, []);

  const resetForm = useCallback(() => {
    const newState = typeof initialDataOrFn === 'function' ? initialDataOrFn() : initialDataOrFn;
    setFormData(newState);
    sessionStorage.removeItem(STORAGE_KEY);
  }, [initialDataOrFn]);

  return { formData, updateField, resetForm, isInitialized };
};
