import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/text/text-styles.css';
import 'now-design-styles/dist/color/colorStyles.css';
import 'now-design-styles/dist/fonts/fonts.css';
import 'now-design-styles/dist/effect/effectStyles.css';

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { routes, defaultRoute } from '../src/routes';
import { DataChangeContext } from '../src/contexts/DataChangeContext';

function AppInner({ onDataChange }) {
  return (
    <DataChangeContext.Provider value={onDataChange}>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={<route.component />} />
        ))}
        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </DataChangeContext.Provider>
  );
}

function App({ onDataChange }) {
  return (
    <BrowserRouter>
      <AppInner onDataChange={onDataChange} />
    </BrowserRouter>
  );
}

export default App;

