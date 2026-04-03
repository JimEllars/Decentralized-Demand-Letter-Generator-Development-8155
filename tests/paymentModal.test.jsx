import { test, describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import PaymentModal from '../src/components/PaymentModal.jsx';

describe('PaymentModal', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render standard modal elements correctly', () => {
    render(<PaymentModal isProcessing={false} onConfirm={() => {}} onCancel={() => {}} />);

    // Renders headings and static text
    assert.ok(screen.getByText('Secure Checkout'));
    assert.ok(screen.getByText('AXiM Encryption Active'));
    assert.ok(screen.getByText('Document Access'));
    assert.ok(screen.getByText('$4.00'));

    // Renders disclaimer
    assert.ok(screen.getByText('All sales are final. No refunds.'));

    // Renders buttons
    const payButton = screen.getByText('Pay $4.00 Now');
    assert.ok(payButton);
    const cancelButton = screen.getByText('Cancel');
    assert.ok(cancelButton);

    // Dialog accessibility attributes
    const dialog = screen.getByRole('dialog');
    assert.strictEqual(dialog.getAttribute('aria-modal'), 'true');
    assert.strictEqual(dialog.getAttribute('aria-labelledby'), 'modal-title');
    assert.strictEqual(screen.getByRole('heading', { level: 3 }).id, 'modal-title');
  });

  it('should trigger onConfirm when the pay button is clicked', () => {
    const onConfirmMock = mock.fn();
    render(<PaymentModal isProcessing={false} onConfirm={onConfirmMock} onCancel={() => {}} />);

    const payButton = screen.getByText('Pay $4.00 Now').closest('button');
    fireEvent.click(payButton);
    assert.strictEqual(onConfirmMock.mock.callCount(), 1);
  });

  it('should trigger onCancel when the cancel button is clicked', () => {
    const onCancelMock = mock.fn();
    render(<PaymentModal isProcessing={false} onConfirm={() => {}} onCancel={onCancelMock} />);

    const cancelButton = screen.getByText('Cancel').closest('button');
    fireEvent.click(cancelButton);
    assert.strictEqual(onCancelMock.mock.callCount(), 1);
  });

  it('should disable buttons and show verifying text when isProcessing is true', () => {
    render(<PaymentModal isProcessing={true} onConfirm={() => {}} onCancel={() => {}} />);

    // Verifying text should be present, standard Pay text shouldn't
    assert.ok(screen.getByText(/Verifying\.\.\./));
    assert.strictEqual(screen.queryByText('Pay $4.00 Now'), null);

    const payButton = screen.getByText(/Verifying\.\.\./).closest('button');
    const cancelButton = screen.getByText('Cancel').closest('button');

    // Both buttons should be disabled
    assert.ok(payButton.disabled);
    assert.ok(cancelButton.disabled);
  });
});
