import { test, describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import FormSection from '../src/components/FormSection.jsx';

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

    assert.ok(document.body.innerHTML.includes('Test Title'));
    assert.ok(document.body.innerHTML.includes('Child Content'));
  });

  it('should render with correct layout classes', () => {
    const { container } = render(
      <FormSection title="Another Title">
        <span>Content</span>
      </FormSection>
    );

    const titleElement = container.querySelector('h3');
    assert.ok(titleElement.className.includes('text-slate-500'));
    assert.ok(titleElement.className.includes('uppercase'));

    const wrapper = container.querySelector('.grid.grid-cols-1.gap-4');
    assert.ok(wrapper, 'Should render children inside a grid wrapper');
  });
});
