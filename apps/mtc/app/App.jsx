import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/text/text-styles.css';
import 'now-design-styles/dist/color/colorStyles.css';
import 'now-design-styles/dist/fonts/fonts.css';
import 'now-design-styles/dist/effect/effectStyles.css';

import React from 'react';
import { routes, defaultRoute, defaultComponent } from '../src/routes';

function App({ mtcPath, currentPath: propPath }) {
  console.log('[MTC App] Received props:', { mtcPath, propPath });
  
  // Build the full MTC route path
  // If mtcPath is provided (from Agnipariksha), use it
  // Otherwise, extract from currentPath or window.location
  let routePath = null;
  
  if (mtcPath !== undefined && mtcPath !== null) {
    // Path provided from Agnipariksha (already extracted)
    // mtcPath could be: 'certificate/create', 'certificate/123/edit', 'certificate', '', etc.
    routePath = mtcPath ? `/mtc/${mtcPath}` : '/mtc';
    console.log('[MTC App] Using mtcPath from props:', routePath);
  } else {
    // Standalone mode - extract from window.location
    const currentPath = propPath || window.location.pathname;
    console.log('[MTC App] Standalone mode, currentPath:', currentPath);
    
    if (currentPath.includes('/materialtest/')) {
      // Extract path after /materialtest
      const pathAfterMaterialtest = currentPath.replace(/^\/materialtest\/?/, '');
      routePath = pathAfterMaterialtest ? `/mtc/${pathAfterMaterialtest}` : '/mtc';
    } else if (currentPath.startsWith('/mtc')) {
      // Already in MTC format
      routePath = currentPath;
    } else {
      // Default
      routePath = '/mtc';
    }
    console.log('[MTC App] Extracted routePath:', routePath);
  }
  
  // Find matching route
  // Try exact match first, then try dynamic routes
  let routeToUse = routes.find(r => {
    if (r.path === routePath) {
      return true;
    }
    return false;
  });
  
  // If no exact match, try dynamic routes (with :id)
  if (!routeToUse) {
    routeToUse = routes.find(r => {
      if (r.isDynamic && r.path.includes(':id')) {
        // Convert route pattern to regex
        // /mtc/certificate/:id/edit -> /mtc/certificate/[^/]+/edit
        const pattern = r.path.replace(/:id/g, '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(routePath)) {
          return true;
        }
      }
      return false;
    });
  }
  
  // Extract ID from path if it's a dynamic route
  let id = null;
  if (routeToUse?.isDynamic && routePath) {
    const pathParts = routePath.split('/');
    const idIndex = routeToUse.path.split('/').indexOf(':id');
    if (idIndex !== -1 && pathParts[idIndex]) {
      id = pathParts[idIndex];
      console.log('[MTC App] Extracted ID:', id);
    }
  }
  
  // Default to hardness if no route found
  if (!routeToUse) {
    console.log('[MTC App] No route found, using default');
    routeToUse = routes.find(r => r.path === defaultRoute) || { component: defaultComponent };
  }
  
  const Component = routeToUse?.component;
  
  console.log('[MTC App] Rendering component for route:', routeToUse?.path);
  
  if (!Component) {
    console.error('[MTC App] Component not found for route:', routePath);
    return <div>Route not found: {routePath}</div>;
  }
  
  // Pass ID to components that need it
  if (id && (routeToUse.path.includes(':id'))) {
    return <Component id={id} />;
  }
  
  return <Component />;
}

export default App;

