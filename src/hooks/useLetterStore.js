import { useEffect, useRef, useState, useCallback } from 'react';
import { sanitizeInput } from '../utils/validation';
import { useToast } from '../contexts/ToastContext';

const STORAGE_KEY = 'axim_demand_letter_draft';

export const useLetterStore = (initialDataOrFn) => {
  const toast = useToast();
  const hasRestored = useRef(false);
  const isMounted = useRef(false);

  const getInitialState = () => typeof initialDataOrFn === 'function' ? initialDataOrFn() : initialDataOrFn;

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
           // We might have saved just formData or an object with formData and currentStep
           if (parsed.formData !== undefined) {
               return parsed;
           }
           // Fallback to older format where root is formData
           return { formData: parsed, currentStep: 1 };
        }
      }
    } catch {}
    return null;
  };

  const [state, setState] = useState(() => {
    const loaded = loadFromStorage();
    if (loaded) {
       return { ...loaded, isInitialized: true };
    }
    return { formData: getInitialState(), currentStep: 1, isInitialized: false };
  });

  useEffect(() => {
    if (!isMounted.current) {
        isMounted.current = true;
        const loaded = loadFromStorage();
        if (loaded && !hasRestored.current) {
            hasRestored.current = true;
            toast.success("Welcome back! We've restored your progress.");
        }
        if (!state.isInitialized) {
            setState(prev => ({ ...prev, isInitialized: true }));
        }
    }
  }, [state.isInitialized, toast]);

  useEffect(() => {
    if (state.isInitialized) {
       const timer = setTimeout(() => {
           localStorage.setItem(STORAGE_KEY, JSON.stringify({
               formData: state.formData,
               currentStep: state.currentStep
           }));
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [state.formData, state.currentStep, state.isInitialized]);

  const updateField = useCallback((name, value) => {
    setState(prev => {
      if (!prev.formData) return prev;
      let resolvedValue = typeof value === 'function' ? value(prev.formData[name]) : value;
      if (['creditorName', 'creditorAddress', 'debtorName', 'debtorAddress'].includes(name) && typeof resolvedValue === 'string') {
        resolvedValue = sanitizeInput(resolvedValue);
      }
      return {
        ...prev,
        formData: {
            ...prev.formData,
            [name]: resolvedValue
        }
      };
    });
  }, []);

  const setStep = useCallback((step) => {
      setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const resetForm = useCallback(() => {
      const initialData = getInitialState();
      setState({ formData: initialData, currentStep: 1, isInitialized: true });
      localStorage.removeItem(STORAGE_KEY);
      hasRestored.current = false;
  }, [initialDataOrFn]);

  return {
      formData: state.formData,
      currentStep: state.currentStep,
      isInitialized: state.isInitialized,
      updateField,
      setStep,
      resetForm
  };
};
