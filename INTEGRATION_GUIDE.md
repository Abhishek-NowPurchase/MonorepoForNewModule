# Simple Integration Guide: New Module + Agnipariksha

This guide shows you exactly what files to create and what code to copy-paste.

---

## Part 1: Create Module in Agnipariksha (Wrapper Component)

### Step 1: Create Wrapper File

**Location:** `Agnipariksha/src/pages/YourModuleName/AddYourModuleV2.jsx`

**Copy-Paste this code (replace variables):**

```jsx
import React, { useEffect, useState } from 'react';
import { useStore } from 'react-redux';

export default function AddYourModuleV2() {
  const [error, setError] = useState(null);
  const store = useStore();

  useEffect(() => {
    let unmount;
    (async () => {
      try {
        // Wait for the DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        const { mount } = await import('YOUR_MODULE_NAME/mount');
        const container = document.getElementById('YOUR_MODULE_NAME-root');
        if (!container) {
          throw new Error('Container element not found');
        }
        unmount = await mount(container, { store });
      } catch (err) {
        setError(err.message);
      }
    })();

    return () => {
      if (unmount && typeof unmount === 'function') {
        unmount();
      }
    };
  }, [store]);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h3>❌ Error Loading YOUR_MODULE_NAME Module</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0px' }}>
      <div 
        id="YOUR_MODULE_NAME-root" 
        style={{ 
          minHeight: '400px'
        }} 
      />
    </div>
  );
}
```

**Variables to replace:**
- `YOUR_MODULE_NAME` → Your actual module name (e.g., `order`, `part`, `invoice`)
- `YourModuleV2` → Your component name (e.g., `AddOrderV2`, `AddPartV2`)
- `YourModuleName` → Folder name (e.g., `Orders`, `Parts`)

**Example for "Order" module:**
- `YOUR_MODULE_NAME` → `order`
- `YourModuleV2` → `AddOrderV2`
- `YourModuleName` → `Orders`
- File: `Agnipariksha/src/pages/Orders/AddOrderV2.jsx`
- Container ID: `order-root`
- Import: `await import('order/mount')`

---

## Part 2: Create New Module Structure

### Required File Structure

```
apps/
  └── your-module-name/
      ├── app/
      │   ├── App.jsx          ← CREATE THIS
      │   └── mount.js          ← CREATE THIS
      ├── src/
      │   ├── routes.tsx
      │   └── pages/
      ├── public/
      │   └── index.html
      └── package.json
```

### Step 1: Create `app/mount.js`

**Location:** `apps/your-module-name/app/mount.js`

**Copy-Paste this code:**

```jsx
import { createRoot } from "react-dom/client";
import React from "react";
import { Provider } from "react-redux";
import App from "./App.jsx";

let root = null;

export async function mount(container, props = {}) {
  if (!root) root = createRoot(container);
  
  const { store, ...appProps } = props;
  const AppComponent = store 
    ? <Provider store={store}><App {...appProps} /></Provider>
    : <App {...appProps} />;
  
  root.render(AppComponent);
  return () => { root?.unmount(); root = null; };
}
```

**What this does:**
- This is the **entry point** that Agnipariksha calls
- It mounts your React app into a container
- It handles Redux store if provided
- Exposes `mount` function for Module Federation

---

### Step 2: Create `app/App.jsx`

**Location:** `apps/your-module-name/app/App.jsx`

**Copy-Paste this boilerplate:**

```jsx
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
      // For dynamic routes like /yourmodule/:id/edit
      const routePattern = r.path.replace(':id', '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(currentPath);
    }
    return currentPath === r.path;
  }) || routes.find(r => r.path === defaultRoute);
  
  const Component = route?.component;
  
  // Extract ID from URL for edit routes
  let id = null;
  if (currentPath.includes('/yourmodule/') && currentPath.includes('/edit')) {
    const pathParts = currentPath.split('/');
    const moduleIndex = pathParts.indexOf('yourmodule');
    if (moduleIndex !== -1 && pathParts[moduleIndex + 1]) {
      id = pathParts[moduleIndex + 1];
    }
  }
  
  return Component ? <Component id={id} /> : <div>Route not found</div>;
}

export default App;
```

**What to change:**
- Replace `/yourmodule/` with your actual module path (e.g., `/orders/`, `/parts/`)
- This file handles **route matching** based on URL
- It extracts parameters (like `id`) from URL and passes to components

**Example for "Order" module:**
- Change `/yourmodule/` → `/orders/`
- Routes like `/orders/add`, `/orders/:id/edit` will work

---

### Step 3: Create `src/routes.tsx`

**Location:** `apps/your-module-name/src/routes.tsx`

**Copy-Paste this:**

```tsx
import YourModuleCreate from './pages/create';

export const routes = [
  { path: '/yourmodule/add', component: YourModuleCreate },
  { path: '/yourmodule/:id/edit', component: YourModuleCreate },
];

export const defaultRoute = '/yourmodule/list';
```

**What to change:**
- `/yourmodule/` → Your actual route path
- `YourModuleCreate` → Import your actual page component
- Add more routes as needed

**Example for "Order" module:**
```tsx
import OrderCreate from './pages/create';

export const routes = [
  { path: '/orders/add', component: OrderCreate },
  { path: '/orders/:id/edit', component: OrderCreate },
];

export const defaultRoute = '/orders/list';
```

---

## Part 3: Webpack Configuration (Tools Folder)

### ⚠️ IMPORTANT: You DON'T Need to Modify Webpack Config!

**`tools/webpack-smart.config.js`** ← **AUTOMATIC - DON'T TOUCH THIS FILE**
- ✅ **Auto-discovers** all modules in `apps/` folder
- ✅ **Auto-assigns ports** (no manual configuration)
- ✅ **Smart** - checks port availability
- ✅ Supports TypeScript
- ✅ **Works automatically for any new module**

### How to Use Tools Folder

**In your module's `package.json`:**

```json
{
  "scripts": {
    "dev": "webpack serve --config ../../tools/webpack-smart.config.js",
    "build": "webpack --config ../../tools/webpack-smart.config.js"
  }
}
```

**What happens automatically:**
1. You run `npm run dev` from your module folder
2. Webpack reads `tools/webpack-smart.config.js`
3. It **automatically discovers** your new module (finds it in `apps/` folder)
4. It **automatically assigns a port** (e.g., first module = 3105, second = 3106, etc.)
5. Creates Module Federation setup
6. Builds your module

**✅ You don't need to:**
- ❌ Modify `webpack-smart.config.js`
- ❌ Add your module name anywhere
- ❌ Configure ports manually
- ❌ Change any webpack settings

**✅ Just create your module folder and run it!** The config handles everything automatically.

---

## Quick Checklist

### In Agnipariksha:
- [ ] Created wrapper component (e.g., `AddYourModuleV2.jsx`)
- [ ] Replaced `YOUR_MODULE_NAME` in wrapper code
- [ ] Container ID matches (e.g., `order-root`)

### In Your Module:
- [ ] Created `app/mount.js` (copy-paste code above)
- [ ] Created `app/App.jsx` (copy-paste code above, update paths)
- [ ] Created `src/routes.tsx` (copy-paste code above, update paths)
- [ ] Created first page component
- [ ] `package.json` uses `webpack-smart.config.js`

### Connection:
- [ ] Both apps running
- [ ] Module URL accessible (e.g., `http://localhost:3106`)
- [ ] Agnipariksha can load module via Module Federation

---

## Summary

**Files to create:**
1. **Agnipariksha:** `src/pages/YourModule/AddYourModuleV2.jsx` (wrapper)
2. **Your Module:** `app/mount.js` (connection point)
3. **Your Module:** `app/App.jsx` (route handler)

**Why these files:**
- `mount.js` = **How Agnipariksha loads your module** (Module Federation entry point)
- `App.jsx` = **How your module handles routes** (internal routing)
- `AddYourModuleV2.jsx` = **How Agnipariksha displays your module** (container)

**That's it!** These 3 files connect everything together.

