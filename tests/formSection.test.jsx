import { test, describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import FormSection from '../src/components/FormSection.jsx';
import { FiUser } from 'react-icons/fi';

describe('FormSection', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the title and children', () => {
    render(
      <FormSection title="Test Title">
        <div data-testid="child-element">Child Content</div>
      </FormSection>
    );

    assert.ok(screen.getByText('Test Title'));
    assert.ok(screen.getByTestId('child-element'));
    assert.strictEqual(screen.getByTestId('child-element').textContent, 'Child Content');
  });

  it('should render with correct layout classes', () => {
    const { container } = render(
      <FormSection title="Another Title">
        <span>Content</span>
      </FormSection>
    );

    const titleElement = container.querySelector('h3');
    assert.ok(titleElement.className.includes('font-inter'));
    assert.ok(titleElement.className.includes('text-axim-gold'));
    assert.ok(titleElement.className.includes('uppercase'));

    const wrapper = container.querySelector('.grid.grid-cols-1.gap-5');
    assert.ok(wrapper, 'Should render children inside a grid wrapper');

    const rootDiv = container.firstChild;
    assert.ok(rootDiv.className.includes('space-y-4'));
    assert.ok(rootDiv.className.includes('pt-8'));
  });

  it('should render the provided icon', () => {
    const { container } = render(
      <FormSection title="Icon Title" icon={FiUser}>
        <div>Content</div>
      </FormSection>
    );

    const svgElement = container.querySelector('svg');
    assert.ok(svgElement, 'Should render an SVG icon');

    const classNameVal = svgElement.className.baseVal || svgElement.className;
    assert.ok(classNameVal.includes('w-4'));
    assert.ok(classNameVal.includes('h-4'));
  });
});
