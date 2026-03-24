import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import SummaryCard from '../src/components/SummaryCard.jsx';

describe('SummaryCard', () => {
  afterEach(() => {
    cleanup();
  });

  const mockCalculatedValues = {
    principal: 1000,
    interest: 50,
    total: 1050,
    formattedPrincipal: '$1,000.00',
    formattedInterest: '$50.00',
    formattedTotal: '$1,050.00',
    rateUsed: 5,
    daysOverdue: 30,
    statuteUsed: 'Test Statute'
  };

  const jurisdiction = 'Test State';

  it('should return null when principal <= 0', () => {
    const { container } = render(<SummaryCard calculatedValues={{...mockCalculatedValues, principal: 0}} jurisdiction={jurisdiction} />);
    assert.strictEqual(container.firstChild, null);
  });

  it('should render correctly with valid data', () => {
    render(<SummaryCard calculatedValues={mockCalculatedValues} jurisdiction={jurisdiction} />);

    assert.ok(screen.getByText('Test State Law Applied'));
    assert.ok(screen.getByText('$1,000.00'));
    assert.ok(screen.getByText('$50.00'));
    assert.ok(screen.getByText('$1,050.00'));
    assert.ok(screen.getByText(/5% per annum via/));
    assert.ok(screen.getByText('Test Statute'));
    assert.ok(screen.getByText(/30 Days/));
  });

  it('should render warning when daysOverdue <= 0', () => {
    render(<SummaryCard calculatedValues={{...mockCalculatedValues, daysOverdue: 0}} jurisdiction={jurisdiction} />);

    assert.ok(screen.getByText('No overdue days calculated'));

    // 0 Days shouldn't be shown in the normal place
    const daysBadge = screen.queryByText(/0 Days/);
    assert.strictEqual(daysBadge, null);
  });
});
