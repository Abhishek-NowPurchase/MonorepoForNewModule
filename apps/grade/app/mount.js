import { createRoot } from "react-dom/client";
import React from "react";
import { Provider } from "react-redux";
import App from "./App.jsx";


let root = null;

export async function mount(container, props) {
  try {
    const { store } = props;
    
    if (!root) {
      root = createRoot(container);
    }

    const AppComponent = store 
      ? React.createElement(Provider, { store }, React.createElement(App, props))
      : React.createElement(App, props);
    
    root.render(AppComponent);

    return () => {
      if (root) {
        root.unmount();
        root = null;
      }
    };
  } catch (error) {
    console.error('Mount error:', error);

    if (!root) {
      root = createRoot(container);
    }
    
    const { store } = props;
    const AppComponent = store 
      ? React.createElement(Provider, { store }, React.createElement(App, props))
      : React.createElement(App, props);
    
    root.render(AppComponent);

    return () => {
      if (root) {
        root.unmount();
        root = null;
      }
    };
  }
}


