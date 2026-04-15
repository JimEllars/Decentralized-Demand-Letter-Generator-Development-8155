import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../src/components/ErrorBoundary.jsx';

// A component that throws an error
const BuggyComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test Error');
  }
  return <div data-testid="child">Normal Content</div>;
};

describe('ErrorBoundary', () => {
  afterEach(() => {
    cleanup();
    mock.restoreAll();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    assert.ok(screen.getByTestId('child'));
    assert.strictEqual(screen.getByText('Normal Content').textContent, 'Normal Content');
  });

  it('should render fallback UI when an error is caught', () => {
    // Suppress console.error for this test to keep test output clean
    const consoleMock = mock.method(console, 'error', () => {});

    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    assert.ok(screen.getByText('Something went wrong'));
    assert.ok(screen.getByText(/We encountered an unexpected error/));
    assert.ok(screen.getByText('Error: Test Error'));
    // Ensure console.error was called
    assert.strictEqual(consoleMock.mock.callCount() >= 1, true);
  });

  it('should reload the page when the refresh button is clicked', () => {
    // Suppress console.error
    mock.method(console, 'error', () => {});

    // Mock window.location.reload
    const reloadMock = mock.fn();
    const originalLocation = globalThis.window.location;

    // Safely mock window.location using Object.defineProperty
    Object.defineProperty(globalThis.window, 'location', {
      value: { ...originalLocation, reload: reloadMock },
      configurable: true,
      writable: true
    });

    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByText('Refresh Page');
    fireEvent.click(refreshButton);

    assert.strictEqual(reloadMock.mock.callCount(), 1);

    // Restore original location
    Object.defineProperty(globalThis.window, 'location', {
      value: originalLocation,
      configurable: true,
      writable: true
    });
  });
});
