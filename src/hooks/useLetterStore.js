import { useState, useEffect, useCallback } from 'react';
import { generateId } from '../utils/helpers';

const STORAGE_KEY = 'axim_demand_letter_draft_v2';

export const useLetterStore = (initialDataOrFn) => {
  const [formData, setFormData] = useState(initialDataOrFn);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: Ensure all items have IDs
        if (parsed.items && Array.isArray(parsed.items)) {
          parsed.items = parsed.items.map(item => ({
            ...item,
            id: item.id || generateId()
          }));
        }
        setFormData(parsed);
      } catch (error) {
        // Silently ignore parsing errors
      }
    }
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

  const addItem = useCallback(() => {
    setFormData(prev => ({ ...prev, items: [...(prev.items || []), { id: generateId(), description: '', amount: '' }] }));
  }, []);

  const removeItem = useCallback((index) => {
    setFormData(prev => {
      const currentItems = prev.items || [];
      return { ...prev, items: currentItems.filter((_, i) => i !== index) };
    });
  }, []);

  const resetForm = useCallback(() => {
    const newState = typeof initialDataOrFn === 'function' ? initialDataOrFn() : initialDataOrFn;
    setFormData(newState);
    localStorage.removeItem(STORAGE_KEY);
  }, [initialDataOrFn]);

  return { formData, updateField, addItem, removeItem, resetForm, isInitialized };
};
