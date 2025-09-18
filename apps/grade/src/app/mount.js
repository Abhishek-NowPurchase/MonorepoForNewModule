import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App.jsx";


let root = null;

// Container-ready check function - ENHANCED DEBUGGING VERSION
const waitForContainer = () => {
  return new Promise((resolve) => {
    const checkStatus = () => {
      const webpackRequire = window.__webpack_require__;
      const sharedScope = webpackRequire && webpackRequire.S && webpackRequire.S.default;

      if (sharedScope) {
        return true;
      }
      return false;
    };

    if (checkStatus()) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (checkStatus()) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 500); // Increased interval for better visibility
    }
  });
};

export async function mount(container, props) {
  try {
    // Create root and render immediately without waiting for shared scope
    if (!root) {
      root = createRoot(container);
    }

    root.render(React.createElement(App, props));

    return () => {
      if (root) {
        root.unmount();
        root = null;
      }
    };
  } catch (error) {
    console.error("❌ Error in mount function:", error);

    // Fallback: render with local React if container fails
    if (!root) {
      root = createRoot(container);
    }
    root.render(React.createElement(App, props));

    return () => {
      if (root) {
        root.unmount();
        root = null;
      }
    };
  }
}


