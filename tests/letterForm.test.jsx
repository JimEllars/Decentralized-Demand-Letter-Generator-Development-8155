import { test, describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import LetterForm from '../src/components/LetterForm.jsx';
import { STATE_OPTIONS } from '../src/utils/constants.js';

describe('LetterForm', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultFormData = {
    jurisdiction: 'CA',
    tone: 'professional',
    statutoryInterest: '',
    letterDate: '',
    creditorName: '',
    creditorAddress: '',
    debtorName: '',
    debtorAddress: '',
    items: [{ id: '1', description: 'Item 1', amount: '100.00' }],
    dueDate: '',
  };

  it('renders correctly with default data', () => {
    render(
      <LetterForm formData={defaultFormData} onUpdate={() => {}} />
    );

    assert.ok(screen.getByText('Legal Strategy'));
    assert.ok(screen.getByText('Parties'));
    assert.ok(screen.getByText('Itemized Debt Specifics'));
  });

  it('handles input changes', () => {
    const onUpdateMock = mock.fn();
    render(
      <LetterForm formData={defaultFormData} onUpdate={onUpdateMock} />
    );

    const creditorNameInput = screen.getByLabelText('Creditor Name');
    fireEvent.change(creditorNameInput, { target: { name: 'creditorName', value: 'John Doe' } });

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'creditorName');
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[1], 'John Doe');
  });

  it('handles jurisdiction and tone changes', () => {
    const onUpdateMock = mock.fn();
    render(
      <LetterForm formData={defaultFormData} onUpdate={onUpdateMock} />
    );

    const jurisdictionSelect = screen.getByLabelText(/Jurisdiction/);
    fireEvent.change(jurisdictionSelect, { target: { name: 'jurisdiction', value: 'NY' } });
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'jurisdiction');
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[1], 'NY');

    const toneSelect = screen.getByLabelText('Document Tone');
    fireEvent.change(toneSelect, { target: { name: 'tone', value: 'firm' } });
    assert.strictEqual(onUpdateMock.mock.calls[1].arguments[0], 'tone');
    assert.strictEqual(onUpdateMock.mock.calls[1].arguments[1], 'firm');
  });

  it('handles "Set to Today" button', () => {
    const onUpdateMock = mock.fn();
    render(
      <LetterForm formData={defaultFormData} onUpdate={onUpdateMock} />
    );

    const setTodayBtn = screen.getByText('Set to Today');
    fireEvent.click(setTodayBtn);

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'letterDate');
    assert.ok(onUpdateMock.mock.calls[0].arguments[1]); // Ensure a date string is passed
  });

  it('handles "Set to 30 Days Ago" button', () => {
    const onUpdateMock = mock.fn();
    render(
      <LetterForm formData={defaultFormData} onUpdate={onUpdateMock} />
    );

    const set30DaysBtn = screen.getByText('Set to 30 Days Ago');
    fireEvent.click(set30DaysBtn);

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'dueDate');
    assert.ok(onUpdateMock.mock.calls[0].arguments[1]); // Ensure a date string is passed
  });

  it('handles "ADD LINE ITEM" button', () => {
    const onUpdateMock = mock.fn();
    render(
      <LetterForm formData={defaultFormData} onUpdate={onUpdateMock} />
    );

    const addItemBtn = screen.getByText('ADD LINE ITEM');
    fireEvent.click(addItemBtn);

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'items');
    const newItems = onUpdateMock.mock.calls[0].arguments[1];
    assert.strictEqual(newItems.length, 2);
    assert.strictEqual(newItems[1].description, '');
    assert.strictEqual(newItems[1].amount, '');
  });

  it('handles "+5% FEE" button', () => {
    const onUpdateMock = mock.fn();
    render(
      <LetterForm formData={defaultFormData} onUpdate={onUpdateMock} />
    );

    const addFeeBtn = screen.getByText('+5% FEE');
    fireEvent.click(addFeeBtn);

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'items');
    const newItems = onUpdateMock.mock.calls[0].arguments[1];
    assert.strictEqual(newItems.length, 2);
    assert.strictEqual(newItems[1].description, 'Late Payment Fee (5%)');
    assert.strictEqual(newItems[1].amount, '5.00'); // 5% of 100.00
  });

  it('handles child LetterItem onChange', () => {
    const onUpdateMock = mock.fn();
    render(
      <LetterForm formData={defaultFormData} onUpdate={onUpdateMock} />
    );

    const descInput = screen.getByLabelText('Description for item 1');
    fireEvent.change(descInput, { target: { value: 'Updated Item' } });

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'items');
    const newItems = onUpdateMock.mock.calls[0].arguments[1];
    assert.strictEqual(newItems[0].description, 'Updated Item');
  });

  it('handles child LetterItem onRemove', () => {
    const onUpdateMock = mock.fn();
    // Render with 2 items so remove button appears
    const dataWithTwoItems = {
      ...defaultFormData,
      items: [
        { id: '1', description: 'Item 1', amount: '100.00' },
        { id: '2', description: 'Item 2', amount: '50.00' }
      ]
    };
    render(
      <LetterForm formData={dataWithTwoItems} onUpdate={onUpdateMock} />
    );

    // Click the remove button for the first item
    const removeBtns = screen.getAllByLabelText('Remove item');
    fireEvent.click(removeBtns[0]);

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'items');
    const newItems = onUpdateMock.mock.calls[0].arguments[1];
    assert.strictEqual(newItems.length, 1);
    assert.strictEqual(newItems[0].id, '2');
  });

  it('renders errors correctly', () => {
    const errors = {
      creditorName: 'Creditor Name is required',
      letterDate: 'Letter Date is required',
      itemErrors: [{ index: 0, errors: { amount: 'Amount is required' } }],
      items: 'Must have at least one item'
    };
    render(
      <LetterForm formData={defaultFormData} onUpdate={() => {}} errors={errors} />
    );

    assert.ok(screen.getByText('Creditor Name is required'));
    assert.ok(screen.getByText('Letter Date is required'));
    assert.ok(screen.getByText('Amount is required'));
    assert.ok(screen.getByText('Must have at least one item'));

    // Check aria-invalid
    const creditorNameInput = screen.getByLabelText('Creditor Name');
    assert.strictEqual(creditorNameInput.getAttribute('aria-invalid'), 'true');
  });
});
