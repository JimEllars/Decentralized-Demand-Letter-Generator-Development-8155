import { test, describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LetterForm from '../src/components/LetterForm.jsx';
import { STATE_OPTIONS } from '../src/utils/constants.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const Wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('LetterForm', () => {
  afterEach(() => {
    cleanup();
    mock.restoreAll();
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

  test('renders FormSections for all 3 steps based on currentStep', async () => {
    const { rerender } = render(<LetterForm formData={defaultFormData} onUpdate={() => {}} currentStep={1} />, { wrapper: Wrapper });
    assert.ok(screen.getByText('Parties'));

    rerender(<LetterForm formData={defaultFormData} onUpdate={() => {}} currentStep={2} />, { wrapper: Wrapper });
    await waitFor(() => {
        assert.ok(screen.getByText('Itemized Debt Specifics'));
    });

    rerender(<LetterForm formData={defaultFormData} onUpdate={() => {}} currentStep={3} />, { wrapper: Wrapper });
    await waitFor(() => {
        assert.ok(screen.getByText('Tone & Configuration'));
    });
  });

  test('handles input changes in Step 1', async () => {
    const onUpdateMock = mock.fn();
    render(<LetterForm formData={defaultFormData} onUpdate={onUpdateMock} currentStep={1} />, { wrapper: Wrapper });

    await waitFor(() => {
        const creditorNameInput = screen.getByPlaceholderText('Your Name / Company');
        fireEvent.change(creditorNameInput, { target: { name: 'creditorName', value: 'John Doe' } });
    });

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'creditorName');
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[1], 'John Doe');
  });

  test('handles jurisdiction and tone changes in Step 2/3', async () => {
    const onUpdateMock = mock.fn();
    const { rerender } = render(<LetterForm formData={defaultFormData} onUpdate={onUpdateMock} currentStep={2} />, { wrapper: Wrapper });

    await waitFor(() => {
        const jurisdictionSelect = screen.getByLabelText(/Governing Law/);
        fireEvent.change(jurisdictionSelect, { target: { name: 'jurisdiction', value: 'NY' } });
    });
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'jurisdiction');
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[1], 'NY');

    rerender(<LetterForm formData={defaultFormData} onUpdate={onUpdateMock} currentStep={3} />, { wrapper: Wrapper });

    await waitFor(() => {
        const toneSelect = screen.getByLabelText('Document Tone');
        fireEvent.change(toneSelect, { target: { name: 'tone', value: 'firm' } });
    });
    assert.strictEqual(onUpdateMock.mock.calls[1].arguments[0], 'tone');
    assert.strictEqual(onUpdateMock.mock.calls[1].arguments[1], 'firm');
  });

  test('handles "Set to Today" button in Step 3', async () => {
    const onUpdateMock = mock.fn();
    render(<LetterForm formData={defaultFormData} onUpdate={onUpdateMock} currentStep={3} />, { wrapper: Wrapper });

    await waitFor(() => {
        const setTodayBtn = screen.getByText('Set to Today');
        fireEvent.click(setTodayBtn);
    });

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'letterDate');
    assert.ok(onUpdateMock.mock.calls[0].arguments[1]);
  });

  test('handles "Set to 30 Days Ago" button in Step 2', async () => {
    const onUpdateMock = mock.fn();
    render(<LetterForm formData={defaultFormData} onUpdate={onUpdateMock} currentStep={2} />, { wrapper: Wrapper });

    await waitFor(() => {
        const set30DaysBtn = screen.getByText('Set to 30 Days Ago');
        fireEvent.click(set30DaysBtn);
    });

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'dueDate');
    assert.ok(onUpdateMock.mock.calls[0].arguments[1]);
  });

  test('handles "ADD LINE ITEM" button in Step 2', async () => {
    const onUpdateMock = mock.fn();
    render(<LetterForm formData={defaultFormData} onUpdate={onUpdateMock} currentStep={2} />, { wrapper: Wrapper });

    await waitFor(() => {
        const addItemBtn = screen.getByText('ADD LINE ITEM');
        fireEvent.click(addItemBtn);
    });

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'items');
    const updateFn = onUpdateMock.mock.calls[0].arguments[1];
    const newItems = typeof updateFn === 'function' ? updateFn(defaultFormData.items) : updateFn;
    assert.strictEqual(newItems.length, 2);
    assert.strictEqual(newItems[1].description, '');
    assert.strictEqual(newItems[1].amount, '');
  });

  test('handles "+5% FEE" button in Step 2', async () => {
    const onUpdateMock = mock.fn();
    render(<LetterForm formData={defaultFormData} onUpdate={onUpdateMock} currentStep={2} calculatedValues={{ principal: 100 }} />, { wrapper: Wrapper });

    await waitFor(() => {
        const addFeeBtn = screen.getByText('+5% FEE');
        fireEvent.click(addFeeBtn);
    });

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'items');
    const updateFn = onUpdateMock.mock.calls[0].arguments[1];
    const newItems = typeof updateFn === 'function' ? updateFn(defaultFormData.items) : updateFn;
    assert.strictEqual(newItems.length, 2);
    assert.strictEqual(newItems[1].description, '5% Late Fee per Contract Terms');
    assert.strictEqual(newItems[1].amount, '5.00');
  });

  test('handles child LetterItem onChange in Step 2', async () => {
    const onUpdateMock = mock.fn();
    render(<LetterForm formData={defaultFormData} onUpdate={onUpdateMock} currentStep={2} />, { wrapper: Wrapper });

    await waitFor(() => {
        const descInput = screen.getByLabelText('Description for item 1');
        fireEvent.change(descInput, { target: { value: 'Updated Item' } });
    });

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'items');
    const updateFn = onUpdateMock.mock.calls[0].arguments[1];
    const newItems = typeof updateFn === 'function' ? updateFn(defaultFormData.items) : updateFn;
    assert.strictEqual(newItems[0].description, 'Updated Item');
  });

  test('handles child LetterItem onRemove in Step 2', async () => {
    const onUpdateMock = mock.fn();
    const dataWithTwoItems = {
      ...defaultFormData,
      items: [
        { id: '1', description: 'Item 1', amount: '100.00' },
        { id: '2', description: 'Item 2', amount: '50.00' }
      ]
    };
    render(<LetterForm formData={dataWithTwoItems} onUpdate={onUpdateMock} currentStep={2} />, { wrapper: Wrapper });

    await waitFor(() => {
        const removeBtns = screen.getAllByLabelText('Remove item');
        fireEvent.click(removeBtns[0]);
    });

    assert.strictEqual(onUpdateMock.mock.callCount(), 1);
    assert.strictEqual(onUpdateMock.mock.calls[0].arguments[0], 'items');
    const updateFn = onUpdateMock.mock.calls[0].arguments[1];
    const newItems = typeof updateFn === 'function' ? updateFn(dataWithTwoItems.items) : updateFn;
    assert.strictEqual(newItems.length, 1);
    assert.strictEqual(newItems[0].id, '2');
  });

  test('renders errors correctly', async () => {
    const errors = {
      creditorName: 'Creditor Name is required',
    };
    render(<LetterForm formData={defaultFormData} onUpdate={() => {}} errors={errors} currentStep={1} />, { wrapper: Wrapper });

    await waitFor(() => {
        assert.ok(screen.getByText('Creditor Name is required'));
    });

    const creditorNameInput = screen.getByLabelText('Creditor Name');
    assert.strictEqual(creditorNameInput.getAttribute('aria-invalid'), 'true');
  });
});
