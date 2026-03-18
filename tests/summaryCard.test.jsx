import { test, describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import SummaryCard from '../src/components/SummaryCard.jsx';

describe('SummaryCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('should not render when principal is 0 or less', () => {
    const { container } = render(
      <SummaryCard
        calculatedValues={{ principal: 0 }}
        jurisdiction="California"
      />
    );
    assert.strictEqual(container.firstChild, null);

    const { container: containerNeg } = render(
      <SummaryCard
        calculatedValues={{ principal: -100 }}
        jurisdiction="California"
      />
    );
    assert.strictEqual(containerNeg.firstChild, null);
  });

  it('should render correct values when principal > 0', () => {
    const mockValues = {
      principal: 1000,
      interest: 50,
      total: 1050,
      formattedPrincipal: '$1,000.00',
      formattedInterest: '$50.00',
      formattedTotal: '$1,050.00',
      rateUsed: '5',
      daysOverdue: 30,
      statuteUsed: 'CA Civ Code § 3289'
    };

    const { container } = render(
      <SummaryCard
        calculatedValues={mockValues}
        jurisdiction="California"
      />
    );

    // Check jurisdiction label
    assert.ok(document.body.innerHTML.includes('California Law Applied'));

    // Check formatted principal
    assert.ok(document.body.innerHTML.includes('$1,000.00'));

    // Check formatted interest
    assert.ok(document.body.innerHTML.includes('$50.00'));

    // Check formatted total
    assert.ok(document.body.innerHTML.includes('$1,050.00'));

    // Check statutory info
    assert.ok(document.body.innerHTML.includes('5% per annum via'));
    assert.ok(document.body.innerHTML.includes('CA Civ Code § 3289'));

    // Check days overdue rendering
    assert.ok(document.body.innerHTML.includes('30 Days'));
  });

  it('should show alert when daysOverdue <= 0', () => {
    const mockValues = {
      principal: 1000,
      interest: 0,
      total: 1000,
      formattedPrincipal: '$1,000.00',
      formattedInterest: '$0.00',
      formattedTotal: '$1,000.00',
      rateUsed: '5',
      daysOverdue: 0,
      statuteUsed: 'CA Civ Code § 3289'
    };

    render(
      <SummaryCard
        calculatedValues={mockValues}
        jurisdiction="California"
      />
    );

    // Verify overdue alert text is present
    assert.ok(document.body.innerHTML.includes('No overdue days calculated'));

    // Make sure days block doesn't render if it's 0 days
    assert.strictEqual(document.body.innerHTML.includes('0 Days'), false);
  });
});
