import { createRoot } from "react-dom/client";
import React from "react";
import { Provider } from "react-redux";
import App from "./App.jsx";

let root = null;

export async function mount(container, props = {}) {
  if (!root) root = createRoot(container);
  
  const { store, mtcPath, currentPath, ...appProps } = props;
  
  console.log('[MTC mount] Received props:', { mtcPath, currentPath, hasStore: !!store });
  
  // Pass route information to App component
  // mtcPath: path after /materialtest (e.g., 'certificate/create', 'certificate/123/edit')
  // currentPath: full path for reference (e.g., '/materialtest/certificate/create')
  const appPropsWithRoute = {
    ...appProps,
    mtcPath,
    currentPath,
  };
  
  const AppComponent = store 
    ? <Provider store={store}><App {...appPropsWithRoute} /></Provider> 
    : <App {...appPropsWithRoute} />;
  
  root.render(AppComponent);
  return () => { root?.unmount(); root = null; };
}

