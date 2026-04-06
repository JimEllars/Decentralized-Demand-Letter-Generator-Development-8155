import React, { useMemo } from 'react';
import { render } from '@testing-library/react';
import test from 'node:test';
import assert from 'node:assert';
import { performance } from 'node:perf_hooks';

// Mocking STATE_OPTIONS array for benchmark
const STATE_OPTIONS = Array.from({ length: 50 }, (_, i) => ({ code: `S${i}`, name: `State ${i} (5%)` }));

// Current Implementation
const CurrentSelect = ({ formData, onChange }) => {
  return (
    <select
      id="jurisdiction"
      name="jurisdiction"
      value={formData.jurisdiction}
      onChange={onChange}
    >
      {STATE_OPTIONS.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
      <option value="DEFAULT">Other / International (6%)</option>
    </select>
  );
};

// Proposed Implementation using pre-computed JSX
const precomputedOptions = (
  <>
    {STATE_OPTIONS.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
    <option value="DEFAULT">Other / International (6%)</option>
  </>
);

const ProposedSelectPrecomputed = ({ formData, onChange }) => {
  return (
    <select
      id="jurisdiction"
      name="jurisdiction"
      value={formData.jurisdiction}
      onChange={onChange}
    >
      {precomputedOptions}
    </select>
  );
};

test('Benchmark Select Options', () => {
  const data1 = { jurisdiction: 'S1' };
  const data2 = { jurisdiction: 'S2' };

  const ITERATIONS = 10000;

  let start = performance.now();
  const { rerender: rerenderCurrent } = render(<CurrentSelect formData={data1} onChange={() => {}} />);
  for (let i = 0; i < ITERATIONS; i++) {
    rerenderCurrent(<CurrentSelect formData={i % 2 === 0 ? data1 : data2} onChange={() => {}} />);
  }
  const currentDuration = performance.now() - start;

  start = performance.now();
  const { rerender: rerenderPrecomputed } = render(<ProposedSelectPrecomputed formData={data1} onChange={() => {}} />);
  for (let i = 0; i < ITERATIONS; i++) {
    rerenderPrecomputed(<ProposedSelectPrecomputed formData={i % 2 === 0 ? data1 : data2} onChange={() => {}} />);
  }
  const precomputedDuration = performance.now() - start;

  console.log(`Current Render: ${currentDuration.toFixed(2)}ms`);
  console.log(`Precomputed Render: ${precomputedDuration.toFixed(2)}ms`);
});
