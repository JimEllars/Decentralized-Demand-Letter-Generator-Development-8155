import { useState, useEffect } from 'react';

const STORAGE_KEY = 'axim_demand_letter_draft_v2';

export const useLetterStore = (initialData) => {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialData;
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