import { test, describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import PaymentModal from '../src/components/PaymentModal.jsx';

describe('PaymentModal', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with initial state', () => {
    render(<PaymentModal isProcessing={false} onConfirm={() => {}} onCancel={() => {}} />);

    assert.ok(screen.getByText('Secure Checkout'));
    assert.ok(screen.getByText('$9.00'));
    assert.ok(screen.getByText('All sales are final. No refunds.'));
    assert.ok(screen.getByText('Pay $9.00 Now'));
    assert.ok(screen.getByText('Cancel'));

    const dialog = screen.getByRole('dialog');
    assert.strictEqual(dialog.getAttribute('aria-modal'), 'true');
    assert.strictEqual(dialog.getAttribute('aria-labelledby'), 'modal-title');
    assert.strictEqual(screen.getByRole('heading', { level: 3 }).id, 'modal-title');
  });

  it('calls onConfirm when pay button is clicked', () => {
    const onConfirm = mock.fn();
    render(<PaymentModal isProcessing={false} onConfirm={onConfirm} onCancel={() => {}} />);

    const payButton = screen.getByText('Pay $9.00 Now').closest('button');
    fireEvent.click(payButton);
    assert.strictEqual(onConfirm.mock.callCount(), 1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = mock.fn();
    render(<PaymentModal isProcessing={false} onConfirm={() => {}} onCancel={onCancel} />);

    const cancelButton = screen.getByText('Cancel').closest('button');
    fireEvent.click(cancelButton);
    assert.strictEqual(onCancel.mock.callCount(), 1);
  });

  it('shows processing state correctly', () => {
    render(<PaymentModal isProcessing={true} onConfirm={() => {}} onCancel={() => {}} />);

    assert.ok(screen.getByText(/Verifying\.\.\./));
    assert.ok(!screen.queryByText('Pay $9.00 Now'));

    const payButton = screen.getByText(/Verifying\.\.\./).closest('button');
    const cancelButton = screen.getByText('Cancel').closest('button');

    assert.ok(payButton.disabled);
    assert.ok(cancelButton.disabled);
  });
});
