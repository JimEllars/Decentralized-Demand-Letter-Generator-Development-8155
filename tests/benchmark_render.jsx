import React, { useMemo } from 'react';
import { render } from '@testing-library/react';
import { validateForm } from '../src/utils/validation.js';
import test from 'node:test';
import assert from 'node:assert';
import { performance } from 'node:perf_hooks';

// Simulate a heavy form
const generateData = () => ({
  creditorName: 'ACME Corp',
  creditorAddress: '123 Business Rd',
  debtorName: 'John Doe',
  debtorAddress: '456 Default St',
  items: Array.from({ length: 50 }, (_, i) => ({ id: i, description: 'Desc', amount: '10' })),
  dueDate: '2023-01-01',
  letterDate: '2023-02-01',
  statutoryInterest: '0',
});

// Current Implementation Component
const CurrentApp = ({ formData }) => {
  const { isValid, errors } = useMemo(() => validateForm(formData), [formData]);
  return <div>{isValid ? 'Valid' : 'Invalid'}</div>;
};

// Proposed Implementation Component
import { useDeferredValue } from 'react';
const DeferredApp = ({ formData }) => {
  const deferredFormData = useDeferredValue(formData);
  const { isValid, errors } = useMemo(() => validateForm(deferredFormData), [deferredFormData]);
  return <div>{isValid ? 'Valid' : 'Invalid'}</div>;
};

test('Benchmark Render', () => {
  const data1 = generateData();
  const data2 = { ...data1, creditorName: 'New Corp' };

  let start = performance.now();
  const { rerender: rerenderCurrent } = render(<CurrentApp formData={data1} />);
  for (let i = 0; i < 1000; i++) {
    rerenderCurrent(<CurrentApp formData={{ ...data2, items: [...data2.items, { id: i, description: 'Test', amount: '5' }] }} />);
  }
  const currentDuration = performance.now() - start;

  start = performance.now();
  const { rerender: rerenderDeferred } = render(<DeferredApp formData={data1} />);
  for (let i = 0; i < 1000; i++) {
    rerenderDeferred(<DeferredApp formData={{ ...data2, items: [...data2.items, { id: i, description: 'Test', amount: '5' }] }} />);
  }
  const deferredDuration = performance.now() - start;

  console.log(`Current Render: ${currentDuration.toFixed(2)}ms`);
  console.log(`Deferred Render: ${deferredDuration.toFixed(2)}ms`);
});
