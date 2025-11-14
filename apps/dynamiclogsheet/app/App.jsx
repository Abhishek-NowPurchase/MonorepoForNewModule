import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/text/text-styles.css';
import 'now-design-styles/dist/color/colorStyles.css';
import 'now-design-styles/dist/fonts/fonts.css';
import 'now-design-styles/dist/effect/effectStyles.css';

import React from 'react';
import { routes, defaultRoute } from '../src/routes';

function App() {
  const currentPath = window.location.pathname;

  const matchedRoute =
    routes.find(route => currentPath.startsWith(route.path)) ||
    routes.find(route => route.path === defaultRoute);

  const Component = matchedRoute?.component;
  return Component ? <Component /> : <div>Route not found</div>;
}

export default App;

