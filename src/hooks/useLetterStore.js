import { useState, useEffect, useCallback } from 'react';
import { loadAndMigrateData } from '../utils/storeHelpers.js';

const STORAGE_KEY = 'axim_demand_letter_draft_v2';

export const useLetterStore = (initialDataOrFn) => {
  const [formData, setFormData] = useState(initialDataOrFn);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const data = loadAndMigrateData(saved, initialDataOrFn);
    setFormData(data);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Only save if data has been initialized from storage
    if (!isInitialized) return;

    const handler = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [formData, isInitialized]);

  const updateField = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    const newState = typeof initialDataOrFn === 'function' ? initialDataOrFn() : initialDataOrFn;
    setFormData(newState);
    localStorage.removeItem(STORAGE_KEY);
  }, [initialDataOrFn]);

  return { formData, updateField, resetForm, isInitialized };
};
