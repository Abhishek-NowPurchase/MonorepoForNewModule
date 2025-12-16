import React from 'react';
import Listing from './pages/Listing';
import Detail from './pages/Detail';
import Edit from './pages/Edit';
import NewPage from './pages/NewPage';

// Minimal route config – one entry per unique path.
export const routes: Array<{ path: string; component: React.ComponentType }> = [
  { path: '/dynamic-log-sheet', component: Listing },
  { path: '/dynamic-log-sheet/new', component: NewPage },
  { path: '/dynamic-log-sheet/:id/edit', component: Edit },
  { path: '/dynamic-log-sheet/:id', component: Detail },
];

export const defaultRoute = '/dynamic-log-sheet';

