import { useState, useEffect } from 'react';
import { generateId } from '../utils/helpers';

const STORAGE_KEY = 'axim_demand_letter_draft_v2';

export const useLetterStore = (initialData) => {
  const [formData, setFormData] = useState(() => {
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
        return parsed;
      } catch (error) {
        console.error('Failed to parse saved state:', error);
        return initialData;
      }
    }
    return initialData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialData);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { formData, updateField, resetForm };
};