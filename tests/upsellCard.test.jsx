import { test, describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import UpsellCard from '../src/components/UpsellCard.jsx';

describe('UpsellCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders standard text when total is not provided (defaults to 0)', () => {
    const { container } = render(<UpsellCard />);
    assert.ok(container.innerHTML.includes('Need Other Documents?'));
    assert.ok(!container.innerHTML.includes('High Value Debt Detected'));
  });

  it('renders standard text when total is <= 10000', () => {
    const { container } = render(<UpsellCard total={10000} />);
    assert.ok(container.innerHTML.includes('Need Other Documents?'));
    assert.ok(!container.innerHTML.includes('High Value Debt Detected'));
  });

  it('renders high value debt text when total is > 10000', () => {
    const { container } = render(<UpsellCard total={10001} />);
    assert.ok(container.innerHTML.includes('High Value Debt Detected'));
    assert.ok(!container.innerHTML.includes('Need Other Documents?'));
  });
});
