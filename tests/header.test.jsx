import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import Header from '../src/components/Header.jsx';

describe('Header', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the AXiM Documents title', () => {
    render(<Header />);
    assert.ok(screen.getByText(/AXiM/i));
    assert.ok(screen.getByText(/Documents/i));
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
