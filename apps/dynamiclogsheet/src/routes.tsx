import React from 'react';
import { Navigate } from 'react-router-dom';
import Listing from './pages/Listing';
import Detail from './pages/Detail';
import Edit from './pages/Edit';
import NewPage from './pages/NewPage';

// Route config - order matters: more specific routes first
// React Router v6 matches routes in order, so /:id/edit must come before /:id
export const routes: Array<{ path: string; component: React.ComponentType }> = [
  // Master Data routes
  { path: '/dynamic-log-sheet/master/new/:template_id', component: NewPage },
  { path: '/dynamic-log-sheet/master/:id/edit', component: Edit },
  { path: '/dynamic-log-sheet/master/:id', component: Detail },
  { path: '/dynamic-log-sheet/master', component: Listing },
  
  // Operational Data routes
  { path: '/dynamic-log-sheet/operational/new/:template_id', component: NewPage },
  { path: '/dynamic-log-sheet/operational/:id/edit', component: Edit },
  { path: '/dynamic-log-sheet/operational/:id', component: Detail },
  { path: '/dynamic-log-sheet/operational', component: Listing },
  
  // Backward compatibility - redirect to master
  { path: '/dynamic-log-sheet', component: () => <Navigate to="/dynamic-log-sheet/master" replace /> },
];

export const defaultRoute = '/dynamic-log-sheet/master';

