import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/text/text-styles.css';
import 'now-design-styles/dist/color/colorStyles.css';
import 'now-design-styles/dist/fonts/fonts.css';
import 'now-design-styles/dist/effect/effectStyles.css';

import React from 'react';
import { routes, defaultRoute } from '../src/routes';

function App() {
  const currentPath = window.location.pathname;
  
  const route = routes.find(r => {
    if (r.path.includes(':id')) {
      return currentPath.startsWith(r.path.split(':id')[0]);
    }
    return currentPath === r.path;
  }) || routes.find(r => r.path === defaultRoute);
  
  const Component = route?.component;
  const id = currentPath.includes('/edit/') ? currentPath.split('/').pop() : null;
  
  return Component ? <Component id={id} /> : <div>Route not found</div>;
}

export default App;


