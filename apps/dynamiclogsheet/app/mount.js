import { createRoot } from "react-dom/client";
import React from "react";
import { Provider } from "react-redux";
import App from "./App.jsx";

let root = null;

export async function mount(container, props = {}) {
  if (!root) root = createRoot(container);
  
  const { store, ...appProps } = props;
  const AppComponent = store ? <Provider store={store}><App {...appProps} /></Provider> : <App {...appProps} />;
  
  root.render(AppComponent);
  return () => { root?.unmount(); root = null; };
}

