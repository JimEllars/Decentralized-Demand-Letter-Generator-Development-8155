import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import Header from '../src/components/Header.jsx';

describe('Header', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render a semantic header element with appropriate classes', () => {
    const { container } = render(<Header />);
    const headerElement = container.querySelector('header');
    assert.ok(headerElement, 'Should render a <header> element');
    assert.strictEqual(
      headerElement.className,
      'max-w-7xl mx-auto px-4 py-8 relative z-10',
      'Should have the correct layout classes'
    );
  });

  it('should render the AXiM Documents title as an h1', () => {
    const { container } = render(<Header />);
    const h1Element = container.querySelector('h1');
    assert.ok(h1Element, 'Should render an <h1> element');
    assert.ok(h1Element.textContent.includes('AXiM'), 'Title should include AXiM');
    assert.ok(h1Element.textContent.includes('Documents'), 'Title should include Documents');
    assert.strictEqual(
      h1Element.className,
      'text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white',
      'Should have correct title styling'
    );
  });

  it('should render the subtitle', () => {
    render(<Header />);
    assert.ok(screen.getByText('Professional Template Engine'));
  });

  it('should render the secure local processing badge', () => {
    render(<Header />);
    assert.ok(screen.getByText('Secure Local Processing'));
  });

  it('should render SVG icons via SafeIcon', () => {
    const { container } = render(<Header />);
    const svgElements = container.querySelectorAll('svg');
    assert.ok(svgElements.length >= 2, 'Should render at least two SVG icons (shield and check)');
  });
});
