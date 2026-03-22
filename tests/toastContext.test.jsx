import { test, describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen, fireEvent, act } from '@testing-library/react';
import { useToast, ToastProvider } from '../src/contexts/ToastContext.jsx';

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

  it('provides the toast functions when used within ToastProvider', () => {
    const TestComponent = () => {
      const toast = useToast();

      return (
        <div>
          <button onClick={() => toast.success('Success message')} data-testid="success-btn">Success</button>
          <button onClick={() => toast.error('Error message')} data-testid="error-btn">Error</button>
          <button onClick={() => toast.info('Info message')} data-testid="info-btn">Info</button>
        </div>
      );
    };

    const { container } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Click the buttons to trigger toasts
    act(() => {
      fireEvent.click(screen.getByTestId('success-btn'));
    });
    assert.ok(screen.getByText('Success message'));

    act(() => {
      fireEvent.click(screen.getByTestId('error-btn'));
    });
    assert.ok(screen.getByText('Error message'));

    act(() => {
      fireEvent.click(screen.getByTestId('info-btn'));
    });
    assert.ok(screen.getByText('Info message'));

    // Find all close buttons inside the container (they don't have aria-label by default)
    // We can just find all buttons that are inside the toasts container (.fixed)
    const fixedContainer = container.querySelector('.fixed');
    assert.ok(fixedContainer);

    const closeButtons = fixedContainer.querySelectorAll('button');
    assert.strictEqual(closeButtons.length, 3);

    // Close the first toast
    act(() => {
      fireEvent.click(closeButtons[0]);
    });
  });
});
