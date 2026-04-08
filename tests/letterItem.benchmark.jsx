import React from 'react';
import { render } from '@testing-library/react';
import test from 'node:test';
import { performance } from 'node:perf_hooks';
import LetterItem from '../src/components/LetterItem.jsx';

test('Benchmark LetterItem render', () => {
  const item = { description: 'Test', amount: '10' };
  const itemErrors = { description: 'Desc error', amount: 'Amount error' };

  let start = performance.now();
  const { rerender } = render(<LetterItem item={item} index={0} onChange={() => {}} onRemove={() => {}} showRemove={true} itemErrors={itemErrors} />);

  for (let i = 0; i < 5000; i++) {
    rerender(<LetterItem item={{...item, amount: i.toString()}} index={0} onChange={() => {}} onRemove={() => {}} showRemove={true} itemErrors={itemErrors} />);
  }
  const duration = performance.now() - start;

  console.log(`Render time for 5000 rerenders: ${duration.toFixed(2)}ms`);
});
