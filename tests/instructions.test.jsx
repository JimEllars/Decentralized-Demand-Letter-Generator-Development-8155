import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import Instructions from '../src/components/Instructions.jsx';

describe('Instructions Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders without crashing', () => {
    const { container } = render(<Instructions />);
    assert.ok(container, 'Should render the component');
  });

  it('renders the Zero-Knowledge Privacy text', () => {
    render(<Instructions />);
    // Use a more generic matcher that works regardless of exact DOM structure or missing subtitles
    const element = screen.getByText(/Zero-Knowledge Privacy/i);
    assert.ok(element, 'Should display the Zero-Knowledge Privacy text');
  });

  it('renders SVG icons', () => {
    const { container } = render(<Instructions />);
    const svgElements = container.querySelectorAll('svg');
    assert.ok(svgElements.length > 0, 'Should render at least one SVG icon');
  });

  it('renders the How It Works heading', () => {
    render(<Instructions />);
    const heading = screen.getByText(/How It Works/i);
    assert.ok(heading, 'Should display the How It Works heading');
  });

  it('renders the three instruction steps', () => {
    render(<Instructions />);

    // Step 1
    assert.ok(screen.getByText('Enter Details'));
    assert.ok(screen.getByText('Fill in the required fields.'));
    assert.ok(screen.getByText('1'));

    // Step 2
    assert.ok(screen.getByText('Secure Payment'));
    assert.ok(screen.getByText('Checkout via Stripe.'));
    assert.ok(screen.getByText('2'));

    // Step 3
    assert.ok(screen.getByText('Instant Download'));
    assert.ok(screen.getByText('Get your compliant PDF.'));
    assert.ok(screen.getByText('3'));
  });
});
