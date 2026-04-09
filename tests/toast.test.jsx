import { test, describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import Toast from '../src/components/Toast.jsx';

describe('Toast Component', () => {
  afterEach(() => {
    cleanup();
    mock.timers.reset();
  });

  it('renders a success toast correctly', () => {
    const { container } = render(
      <Toast id="1" message="Success message" type="success" onClose={() => {}} />
    );

    assert.ok(screen.getByText('Success message'));
    // We should check that the icon is rendered
    const iconWrapper = container.querySelector('.text-emerald-500');
    assert.ok(iconWrapper, 'Should render success icon');
  });

  it('renders an error toast correctly', () => {
    const { container } = render(
      <Toast id="2" message="Error message" type="error" onClose={() => {}} />
    );

    assert.ok(screen.getByText('Error message'));
    const iconWrapper = container.querySelector('.text-red-500');
    assert.ok(iconWrapper, 'Should render error icon');
  });

  it('renders an info toast correctly', () => {
    const { container } = render(
      <Toast id="3" message="Info message" type="info" onClose={() => {}} />
    );

    assert.ok(screen.getByText('Info message'));
    const iconWrapper = container.querySelector('.text-blue-500');
    assert.ok(iconWrapper, 'Should render info icon');
  });

  it('renders correctly with default type (info) when type is missing', () => {
    const { container } = render(
      <Toast id="3" message="Default info message" onClose={() => {}} />
    );

    assert.ok(screen.getByText('Default info message'));
    const iconWrapper = container.querySelector('.text-blue-500');
    assert.ok(iconWrapper, 'Should render default info icon');
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = mock.fn();
    const { container } = render(
      <Toast id="4" message="Click me" type="info" onClose={onCloseMock} />
    );

    const closeButton = container.querySelector('button');
    assert.ok(closeButton);

    fireEvent.click(closeButton);
    assert.strictEqual(onCloseMock.mock.callCount(), 1);
    assert.deepStrictEqual(onCloseMock.mock.calls[0].arguments, ['4']);
  });

  it('auto-closes after 5000ms', () => {
    mock.timers.enable({ apis: ['setTimeout'] });
    const onCloseMock = mock.fn();

    render(
      <Toast id="5" message="Auto close me" type="info" onClose={onCloseMock} />
    );

    assert.strictEqual(onCloseMock.mock.callCount(), 0);

    mock.timers.tick(4999);
    assert.strictEqual(onCloseMock.mock.callCount(), 0);

    mock.timers.tick(1);
    assert.strictEqual(onCloseMock.mock.callCount(), 1);
    assert.deepStrictEqual(onCloseMock.mock.calls[0].arguments, ['5']);
  });

  it('clears timeout on unmount', () => {
    mock.timers.enable({ apis: ['setTimeout'] });
    const onCloseMock = mock.fn();

    const { unmount } = render(
      <Toast id="6" message="Unmount me" type="info" onClose={onCloseMock} />
    );

    assert.strictEqual(onCloseMock.mock.callCount(), 0);

    unmount();

    mock.timers.tick(5000);
    // Since component is unmounted, timer should have been cleared and onClose should not be called
    assert.strictEqual(onCloseMock.mock.callCount(), 0);
  });
});
