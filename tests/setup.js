import { GlobalRegistrator } from '@happy-dom/global-registrator';
import React from 'react';

GlobalRegistrator.register();

// Ensure React is available globally for JSX transform in tests
globalThis.React = React;
globalThis.import = { meta: { env: { VITE_ENABLE_WEB3: 'false' } } };
