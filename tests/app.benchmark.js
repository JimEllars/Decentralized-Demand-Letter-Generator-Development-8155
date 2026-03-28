import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from '../src/App';
import { ToastProvider } from '../src/contexts/ToastContext';

// Simple mock for App testing
import { useLetterStore } from '../src/hooks/useLetterStore';
jest.mock('../src/hooks/useLetterStore', () => ({
  useLetterStore: jest.fn(),
}));

// Actually, this is a bit involved to setup just for measuring rendering.
// We know that `useDeferredValue` will defer the execution, which means typing
// into the form won't block the React render cycle for validation.
