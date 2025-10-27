import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/text/text-styles.css';
import 'now-design-styles/dist/color/colorStyles.css';
import 'now-design-styles/dist/fonts/fonts.css';
import 'now-design-styles/dist/effect/effectStyles.css';

import React from 'react';
import { routes, defaultRoute } from '../src/routes';

function App() {
  const currentPath = window.location.pathname;
  
  // Find matching route
  const route = routes.find(r => {
    if (r.path.includes(':id')) {
      // For dynamic routes like /grades/:id/edit, check if path matches pattern
      const routePattern = r.path.replace(':id', '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(currentPath);
    }
    return currentPath === r.path;
  }) || routes.find(r => r.path === defaultRoute);
  
  const Component = route?.component;
  
  // Extract grade ID from URL for edit route
  let id = null;
  if (currentPath.includes('/grades/') && currentPath.includes('/edit')) {
    // Extract ID from /grades/{id}/edit pattern
    const pathParts = currentPath.split('/');
    const gradesIndex = pathParts.indexOf('grades');
    if (gradesIndex !== -1 && pathParts[gradesIndex + 1]) {
      id = pathParts[gradesIndex + 1];
    }
  }
  
  return Component ? <Component id={id} /> : <div>Route not found</div>;
}

export default App;


