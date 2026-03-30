import { test, describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import LetterItem from '../src/components/LetterItem.jsx';

describe('LetterItem', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultItem = { description: 'Test Item', amount: '100.00' };

  it('renders input values correctly', () => {
    render(
      <LetterItem
        item={defaultItem}
        index={0}
        onChange={() => {}}
        onRemove={() => {}}
        showRemove={false}
      />
    );

    const descInput = screen.getByLabelText('Description for item 1');
    const amountInput = screen.getByLabelText('Amount for item 1');

    assert.strictEqual(descInput.value, 'Test Item');
    assert.strictEqual(amountInput.value, '100.00');
  });

  it('calls onChange when description changes', () => {
    const onChangeMock = mock.fn();
    render(
      <LetterItem
        item={defaultItem}
        index={0}
        onChange={onChangeMock}
        onRemove={() => {}}
        showRemove={false}
      />
    );

    const descInput = screen.getByLabelText('Description for item 1');
    fireEvent.change(descInput, { target: { value: 'New Description' } });

    assert.strictEqual(onChangeMock.mock.callCount(), 1);
    const args = onChangeMock.mock.calls[0].arguments;
    assert.strictEqual(args[0], 0);
    assert.strictEqual(args[1], 'description');
    assert.strictEqual(args[2], 'New Description');
  });

  it('calls onChange when amount changes', () => {
    const onChangeMock = mock.fn();
    render(
      <LetterItem
        item={defaultItem}
        index={0}
        onChange={onChangeMock}
        onRemove={() => {}}
        showRemove={false}
      />
    );

    const amountInput = screen.getByLabelText('Amount for item 1');
    fireEvent.change(amountInput, { target: { value: '200.00' } });

    assert.strictEqual(onChangeMock.mock.callCount(), 1);
    const args = onChangeMock.mock.calls[0].arguments;
    assert.strictEqual(args[0], 0);
    assert.strictEqual(args[1], 'amount');
    assert.strictEqual(args[2], '200.00');
  });

  it('renders the remove button when showRemove is true and calls onRemove', () => {
    const onRemoveMock = mock.fn();
    render(
      <LetterItem
        item={defaultItem}
        index={0}
        onChange={() => {}}
        onRemove={onRemoveMock}
        showRemove={true}
      />
    );

    const removeBtn = screen.getByLabelText('Remove item');
    assert.ok(removeBtn);

    fireEvent.click(removeBtn);
    assert.strictEqual(onRemoveMock.mock.callCount(), 1);
    assert.strictEqual(onRemoveMock.mock.calls[0].arguments[0], 0);
  });

  it('does not render the remove button when showRemove is false', () => {
    render(
      <LetterItem
        item={defaultItem}
        index={0}
        onChange={() => {}}
        onRemove={() => {}}
        showRemove={false}
      />
    );

    const removeBtn = screen.queryByLabelText('Remove item');
    assert.strictEqual(removeBtn, null);
  });

  it('renders error states correctly when itemErrors is provided', () => {
    const itemErrors = { description: 'Description is required', amount: 'Amount must be greater than 0' };
    render(
      <LetterItem
        item={{ description: '', amount: '0' }}
        index={0}
        onChange={() => {}}
        onRemove={() => {}}
        showRemove={false}
        itemErrors={itemErrors}
      />
    );

    const descInput = screen.getByLabelText('Description for item 1');
    const amountInput = screen.getByLabelText('Amount for item 1');

    assert.strictEqual(descInput.getAttribute('aria-invalid'), 'true');
    assert.ok(descInput.className.includes('border-red-300'));

    assert.strictEqual(amountInput.getAttribute('aria-invalid'), 'true');
    assert.ok(amountInput.className.includes('border-red-300'));

    assert.ok(screen.getByText('Description is required'));
    assert.ok(screen.getByText('Amount must be greater than 0'));
  });

  it('does not render error states when itemErrors is empty', () => {
    render(
      <LetterItem
        item={defaultItem}
        index={0}
        onChange={() => {}}
        onRemove={() => {}}
        showRemove={false}
      />
    );

    const descInput = screen.getByLabelText('Description for item 1');
    const amountInput = screen.getByLabelText('Amount for item 1');

    assert.strictEqual(descInput.getAttribute('aria-invalid'), 'false');
    assert.ok(!descInput.className.includes('border-red-300'));

    assert.strictEqual(amountInput.getAttribute('aria-invalid'), 'false');
    assert.ok(!amountInput.className.includes('border-red-300'));
  });

  it('renders correctly with default itemErrors object', () => {
    // Tests the `itemErrors = {}` default parameter explicitly
    const { container } = render(
      <LetterItem
        item={defaultItem}
        index={0}
        onChange={() => {}}
        onRemove={() => {}}
        showRemove={false}
        itemErrors={undefined}
      />
    );

    // Should not render the error message container
    const errorContainer = container.querySelector('.text-red-500.text-right');
    assert.strictEqual(errorContainer, null);
  });

  it('renders correctly for different index values', () => {
    render(
      <LetterItem
        item={defaultItem}
        index={5}
        onChange={() => {}}
        onRemove={() => {}}
        showRemove={false}
      />
    );

    const descInput = screen.getByLabelText('Description for item 6');
    const amountInput = screen.getByLabelText('Amount for item 6');

    assert.ok(descInput);
    assert.ok(amountInput);
  });

  it('applies the correct classes for success and error states', () => {
    const itemErrors = { description: 'Error' }; // Amount has no error
    render(
      <LetterItem
        item={defaultItem}
        index={0}
        onChange={() => {}}
        onRemove={() => {}}
        showRemove={false}
        itemErrors={itemErrors}
      />
    );

    const descInput = screen.getByLabelText('Description for item 1');
    const amountInput = screen.getByLabelText('Amount for item 1');

    // Description has error
    assert.ok(descInput.className.includes('border-red-300'));
    assert.ok(descInput.className.includes('bg-red-50'));
    assert.ok(descInput.className.includes('focus:border-red-500'));
    assert.ok(!descInput.className.includes('border-slate-300'));
    assert.ok(!descInput.className.includes('focus:border-blue-500'));

    // Amount does not have error
    assert.ok(!amountInput.className.includes('border-red-300'));
    assert.ok(!amountInput.className.includes('bg-red-50'));
    assert.ok(!amountInput.className.includes('focus:border-red-500'));
    assert.ok(amountInput.className.includes('border-slate-300'));
    assert.ok(amountInput.className.includes('focus:border-blue-500'));
  });
});
