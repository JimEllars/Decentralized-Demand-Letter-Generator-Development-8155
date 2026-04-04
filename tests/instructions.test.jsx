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
});
