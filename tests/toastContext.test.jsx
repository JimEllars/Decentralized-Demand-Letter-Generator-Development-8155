import { test, describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { useToast } from '../src/contexts/ToastContext.jsx';

describe('ToastContext', () => {
  afterEach(() => {
    cleanup();
  });

  it('throws an error when useToast is used outside of ToastProvider', () => {
    // Create a dummy component that calls the hook
    const DummyComponent = () => {
      useToast();
      return null;
    };

    // React test renderer throws errors synchronously, but since it's an error boundary or unhandled error
    // in React 18, we can suppress the error logging to console
    const originalError = console.error;
    console.error = () => {};

    try {
      assert.throws(
        () => {
          render(<DummyComponent />);
        },
        {
          name: 'Error',
          message: 'useToast must be used within a ToastProvider',
        }
      );
    } finally {
      console.error = originalError;
    }
  });
});
