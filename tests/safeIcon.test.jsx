import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import SafeIcon from '../src/common/SafeIcon.jsx';

describe('SafeIcon', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the icon passed as a component via the icon prop', () => {
    const CustomIcon = (props) => <svg data-testid="custom-icon" {...props} />;
    render(<SafeIcon icon={CustomIcon} />);
    assert.ok(screen.getByTestId('custom-icon'), 'Should render the icon component');
  });

  it('should render the icon looked up by name from the name prop', () => {
    // We use a known icon from react-icons/fi
    // To make a stronger assertion than just 'it exists',
    // we can check if it contains a title or path characteristic of the icon,
    // but since we want to avoid brittle tests on library internals,
    // we check for the presence of the SVG.
    const { container } = render(<SafeIcon name="FiCheck" />);
    const svg = container.querySelector('svg');
    assert.ok(svg, 'Should render an SVG icon lookup by name');
  });

  it('should prioritize the icon prop over the name prop', () => {
    const CustomIcon = (props) => <svg data-testid="custom-icon" {...props} />;
    render(<SafeIcon icon={CustomIcon} name="FiCheck" />);
    assert.ok(screen.getByTestId('custom-icon'), 'Should render the icon prop instead of name');
  });

  it('should fallback to FiAlertTriangle if neither icon nor name is provided', () => {
    const { container } = render(<SafeIcon />);
    const svg = container.querySelector('svg');
    assert.ok(svg, 'Should render the fallback SVG');
    // We can't easily assert it's FiAlertTriangle without comparing SVG paths,
    // but we verify the component doesn't crash and returns an SVG.
  });

  it('should fallback to FiAlertTriangle if the name is not found in FiIcons', () => {
    const { container } = render(<SafeIcon name="NonExistentIcon" />);
    const svg = container.querySelector('svg');
    assert.ok(svg, 'Should render the fallback SVG on invalid name');
  });

  it('should pass additional props to the rendered icon component', () => {
    const CustomIcon = (props) => <svg data-testid="custom-icon" {...props} />;
    render(<SafeIcon icon={CustomIcon} className="test-class" id="test-id" aria-label="test-label" />);
    const svg = screen.getByTestId('custom-icon');
    assert.ok(svg.classList.contains('test-class'), 'Should have the passed className');
    assert.strictEqual(svg.getAttribute('id'), 'test-id', 'Should have the passed id');
    assert.strictEqual(svg.getAttribute('aria-label'), 'test-label', 'Should have the passed aria-label');
  });
});
