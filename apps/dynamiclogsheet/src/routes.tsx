import React from 'react';
import DynamicLogSheet from './pages/DynamicLogSheet';

// Minimal route config – one entry per unique path.
export const routes: Array<{ path: string; component: React.ComponentType }> = [
  { path: '/orders', component: DynamicLogSheet },
  { path: '/dynamicLogSheet', component: DynamicLogSheet }
];

export const defaultRoute = '/orders';

