import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../src/components/Header.jsx';

describe('Header', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render a semantic header element with appropriate classes', () => {
    const { container } = render(<MemoryRouter><Header /></MemoryRouter>);
    const headerElement = container.querySelector('header');
    assert.ok(headerElement, 'Should render a <header> element');
    assert.strictEqual(
      headerElement.className,
      'max-w-7xl mx-auto px-4 py-8 relative z-10',
      'Should have the correct layout classes'
    );
  });

  it('should render the Demand Letter Generator title as an h1', () => {
    const { container } = render(<MemoryRouter><Header /></MemoryRouter>);
    const h1Element = container.querySelector('h1');
    assert.ok(h1Element, 'Should render an <h1> element');
    assert.ok(h1Element.textContent.includes('Demand Letter Generator'), 'Title should include Demand Letter Generator');
    assert.strictEqual(
      h1Element.className,
      'text-4xl md:text-6xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-lg',
      'Should have correct title styling'
    );
  });

  it('should render the AXiM Documents minor logo', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    // The logo text is split into two elements (AXiM and Documents), so we test for the wrapper text
    assert.ok(screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'span' && element.textContent.includes('AXiM') && element.textContent.includes('Documents');
    }));
  });

  it('should render the subtitle', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    assert.ok(screen.getByText('Professional Template Engine'));
  });

  it('should render the secure local processing badge', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    assert.ok(screen.getByText('Secure Local Processing'));
  });

  it('should render SVG icons via SafeIcon', () => {
    const { container } = render(<MemoryRouter><Header /></MemoryRouter>);
    const svgElements = container.querySelectorAll('svg');
    assert.ok(svgElements.length >= 2, 'Should render at least two SVG icons (shield and check)');
  });
});
