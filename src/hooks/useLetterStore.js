import { useEffect, useRef, useCallback } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sanitizeInput } from '../utils/validation';
import { useToast } from '../contexts/ToastContext';
import debounce from 'lodash.debounce';
import { encrypt, decrypt } from '../utils/crypto';

const STORAGE_KEY = 'axim_demand_draft';

// Update to use localStorage instead of sessionStorage
const secureStorage = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    try { return decrypt(str); } catch(e) { return null; }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, encrypt(value));
    } catch (e) {
      console.error('Failed to persist demand draft to localStorage:', e);
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
};


// Factory function to create the Zustand store with initial data
const createStore = (initialDataOrFn) => {
  const getInitialState = () => typeof initialDataOrFn === 'function' ? initialDataOrFn() : initialDataOrFn;

  return create(
    persist(
      (set) => ({
        formData: getInitialState(),
        currentStep: 1,
        isInitialized: false,
        _hasHydrated: false,

        setHasHydrated: (state) => set({ _hasHydrated: state }),

        updateField: (name, value) => set((state) => {
          if (!state.formData) return state;
          let resolvedValue = typeof value === 'function' ? value(state.formData[name]) : value;
          if (['creditorName', 'creditorAddress', 'debtorName', 'debtorAddress'].includes(name) && typeof resolvedValue === 'string') {
            resolvedValue = sanitizeInput(resolvedValue);
          }
          return {
            formData: {
              ...state.formData,
              [name]: resolvedValue
            }
          };
        }),

        setStep: (step) => set({ currentStep: step }),

        resetForm: () => {
            set({ formData: getInitialState(), currentStep: 1 });
            // Since we're re-assigning formData, force clear storage to avoid stale data during reload
            localStorage.removeItem(STORAGE_KEY);
        }
      }),
      {
        name: STORAGE_KEY,
        storage: createJSONStorage(() => secureStorage),
        partialize: (state) => ({
          formData: state.formData,
          currentStep: state.currentStep
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setHasHydrated(true);
            state.isInitialized = true;
          }
        }
      }
    )
  );
};

// Map to cache stores based on initialData structure (usually only one store needed per app)
const storeCache = new Map();

export const useLetterStore = (initialDataOrFn) => {
  const toast = useToast();
  const hasToastFired = useRef(false);

  // We use a cached store to avoid creating a new store instance on every render
  let useBoundStore = storeCache.get(STORAGE_KEY);
  if (!useBoundStore) {
    useBoundStore = createStore(initialDataOrFn);
    storeCache.set(STORAGE_KEY, useBoundStore);
  }

  const store = useBoundStore();

  useEffect(() => {
    // If the store hydrated and we found saved data other than the initial data
    // We display the welcome back toast, but only once.
    if (store._hasHydrated && !hasToastFired.current) {
        hasToastFired.current = true;

        // Simple heuristic to check if it's restored data vs default empty data
        // We check if the formData has been modified from default
        const isRestored = store.currentStep > 1 ||
            store.formData?.creditorName !== '' ||
            store.formData?.debtorName !== '';

        if (isRestored) {
            toast.success("Welcome back! Your document progress has been restored.");
        }
    }
  }, [store._hasHydrated, toast, store.currentStep, store.formData]);

  const resetFormWrapped = useCallback(() => {
    store.resetForm();
    hasToastFired.current = false; // allow toast to fire again if rehydrated
  }, [store]);

  return {
    formData: store.formData,
    currentStep: store.currentStep,
    isInitialized: store._hasHydrated || store.isInitialized,
    updateField: store.updateField,
    setStep: store.setStep,
    resetForm: resetFormWrapped
  };
};


export const useHistoryStore = create(
  persist(
    (set) => ({
      history: [],
      addDocument: (doc) => set((state) => ({ history: [doc, ...state.history] })),
      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'axim_document_history',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
