import { GlobalRegistrator } from '@happy-dom/global-registrator';
import React from 'react';

GlobalRegistrator.register();
globalThis.React = React;
