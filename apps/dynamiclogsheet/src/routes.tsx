import React from 'react';
import Listing from './pages/Listing';
import Detail from './pages/Detail';
import Edit from './pages/Edit';
import NewPage from './pages/NewPage';

// Route config - order matters: more specific routes first
// React Router v6 matches routes in order, so /:id/edit must come before /:id
export const routes: Array<{ path: string; component: React.ComponentType }> = [
  { path: '/dynamic-log-sheet/new/:template_id', component: NewPage },
  { path: '/dynamic-log-sheet/:id/edit', component: Edit },
  { path: '/dynamic-log-sheet/:id', component: Detail },
  { path: '/dynamic-log-sheet', component: Listing },
];

export const defaultRoute = '/dynamic-log-sheet';

