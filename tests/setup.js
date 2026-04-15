import { GlobalRegistrator } from '@happy-dom/global-registrator';
import React from 'react';

GlobalRegistrator.register();

// Ensure React is available globally for JSX transform in tests
globalThis.React = React;
