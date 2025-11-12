# React Router Setup & Tools Folder Guide

This guide explains how to set up React Router in the monorepo and how to use the shared tools folder for webpack configuration.

---

## 📚 Table of Contents

1. [React Router Setup in Monorepo](#react-router-setup-in-monorepo)
2. [Tools Folder Usage](#tools-folder-usage)
3. [Module Federation Routing](#module-federation-routing)
4. [Best Practices](#best-practices)
5. [Examples](#examples)

---

## 🔀 React Router Setup in Monorepo

### Overview

In this monorepo, each module (microfrontend) has its own routing setup. The routing is handled at two levels:
1. **Module Level**: Each module defines its own routes in `src/routes.tsx`
2. **Host App Level**: The host application (Agnipariksha) manages routing between modules

### Step-by-Step Setup

#### 1. Create Routes File (`src/routes.tsx`)

Each module should have a `routes.tsx` file that exports:
- An array of route objects
- A default route path

```typescript
// apps/grade/src/routes.tsx
import GradeCreate from './pages/create';
import GradeList from './pages/list';

export const routes = [
  { path: '/grades/add', component: GradeCreate },
  { path: '/grades/:id/edit', component: GradeCreate },
  { path: '/grades/list', component: GradeList },
];

export const defaultRoute = '/grades/list';
```

**Route Object Structure:**
```typescript
{
  path: string;        // Route path (supports :id for dynamic segments)
  component: Component; // React component to render
}
```

#### 2. Create App Component (`app/App.jsx`)

The `App.jsx` file handles route matching and component rendering:

```jsx
// apps/grade/app/App.jsx
import React from 'react';
import { routes, defaultRoute } from '../src/routes';

function App() {
  const currentPath = window.location.pathname;
  
  // Find matching route
  const route = routes.find(r => {
    if (r.path.includes(':id')) {
      // For dynamic routes like /grades/:id/edit
      const routePattern = r.path.replace(':id', '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(currentPath);
    }
    return currentPath === r.path;
  }) || routes.find(r => r.path === defaultRoute);
  
  const Component = route?.component;
  
  // Extract dynamic parameters from URL
  let id = null;
  if (currentPath.includes('/grades/') && currentPath.includes('/edit')) {
    const pathParts = currentPath.split('/');
    const gradesIndex = pathParts.indexOf('grades');
    if (gradesIndex !== -1 && pathParts[gradesIndex + 1]) {
      id = pathParts[gradesIndex + 1];
    }
  }
  
  return Component ? <Component id={id} /> : <div>Route not found</div>;
}

export default App;
```

**Key Features:**
- Matches routes based on current URL pathname
- Supports dynamic route segments (`:id`)
- Extracts parameters from URL and passes them as props
- Falls back to default route if no match found

#### 3. Create Mount File (`app/mount.js`)

The mount file exposes the module to Module Federation:

```jsx
// apps/grade/app/mount.js
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

**Parameters:**
- `container`: DOM element where the app will be mounted
- `props`: Optional props including Redux store

#### 4. Route Patterns

**Static Routes:**
```typescript
{ path: '/grades/add', component: GradeCreate }
```

**Dynamic Routes:**
```typescript
{ path: '/grades/:id/edit', component: GradeEdit }
```

**Multiple Dynamic Segments:**
```typescript
{ path: '/grades/:gradeId/elements/:elementId', component: ElementDetail }
```

#### 5. Handling Route Parameters

Extract parameters from URL in `App.jsx`:

```jsx
// Extract single parameter
const pathParts = currentPath.split('/');
const id = pathParts[2]; // For /grades/123/edit

// Extract multiple parameters
const gradeId = pathParts[2];
const elementId = pathParts[4]; // For /grades/123/elements/456
```

---

## 🛠️ Tools Folder Usage

### Overview

The `tools/` folder contains shared webpack configurations that can be reused across all modules in the monorepo. This eliminates duplication and ensures consistent build setup.

### Available Tools

#### 1. `webpack-smart.config.js` (Recommended)

**Features:**
- ✅ Auto-discovers all modules in `apps/` directory
- ✅ Auto-assigns ports (starting from 3105)
- ✅ Checks port availability before assignment
- ✅ Supports TypeScript out of the box
- ✅ Smart module detection

**Usage:**

In your module's `package.json`:
```json
{
  "scripts": {
    "dev": "webpack serve --config ../../tools/webpack-smart.config.js",
    "build": "webpack --config ../../tools/webpack-smart.config.js"
  }
}
```

**How It Works:**

1. **Module Discovery:**
   ```javascript
   // Scans apps/ directory for valid modules
   const modules = discoverModules();
   // Validates: package.json exists, app/mount.js exists
   ```

2. **Port Assignment:**
   ```javascript
   // Auto-assigns ports starting from 3105
   // Checks if port is in use before assigning
   const portMap = assignPorts(allModules);
   // grade module -> 3105
   // next module -> 3106
   // etc.
   ```

3. **Current Module Detection:**
   ```javascript
   // Uses process.cwd() to determine current module
   // Validates module structure
   const config = getCurrentModuleConfig();
   ```

#### 2. `webpack.config.js` (Legacy)

**Features:**
- ⚠️ Manual port configuration
- ⚠️ Requires explicit module name mapping
- ✅ Simpler for single module setup

**Usage:**

```json
{
  "scripts": {
    "dev": "webpack serve --config ../../tools/webpack.config.js",
    "build": "webpack --config ../../tools/webpack.config.js"
  }
}
```

**Port Mapping:**
```javascript
// Must manually update in webpack.config.js
const portMap = {
  'grade': 3106,
  'grade_v2': 3106
};
```

### Setting Up a New Module with Tools Folder

#### Step 1: Create Module Structure

```
apps/
  └── your-module/
      ├── app/
      │   ├── App.jsx
      │   └── mount.js
      ├── src/
      │   ├── routes.tsx
      │   └── pages/
      ├── public/
      │   └── index.html
      └── package.json
```

#### Step 2: Configure package.json

```json
{
  "name": "your-module",
  "scripts": {
    "dev": "webpack serve --config ../../tools/webpack-smart.config.js",
    "build": "webpack --config ../../tools/webpack-smart.config.js",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "webpack": "^5.93.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.0.4"
  }
}
```

#### Step 3: Run Development Server

```bash
cd apps/your-module
npm run dev
```

**Expected Output:**
```
🔍 Discovered 3 modules: grade, your-module, another-module
📍 grade assigned to port 3105
📍 your-module assigned to port 3106
📍 another-module assigned to port 3107
🚀 Building module: your-module on port 3106
✅ Module your-module running on http://localhost:3106
🔗 Remote entry: http://localhost:3106/remoteEntry.js
```

### Tools Folder Benefits

1. **DRY Principle:** One config file, multiple modules
2. **Consistency:** All modules use same webpack setup
3. **Auto-Discovery:** No manual port assignment needed
4. **TypeScript Support:** Built-in TS/TSX support
5. **Easy Updates:** Update tools once, all modules benefit

---

## 🔌 Module Federation Routing

### How Modules Are Loaded

#### From Host Application (Agnipariksha)

The host app loads modules dynamically:

```javascript
// In host app routing
const GradeModule = lazy(() => import('grade/mount'));

// In route definition
<Route 
  path="/grades/*" 
  element={
    <Suspense fallback={<Loader />}>
      <GradeModule />
    </Suspense>
  } 
/>
```

#### Module Exports

Each module exposes its mount function via Module Federation:

```javascript
// webpack config in tools folder
new ModuleFederationPlugin({
  name: 'grade',
  filename: 'remoteEntry.js',
  exposes: { 
    './mount': './app/mount' 
  }
})
```

### Route Coordination

**Host App Routes:**
```javascript
// Agnipariksha routes
/grades/*          -> Grade Module
/orders/*          -> Order Module
/dashboard/*       -> Dashboard Module
```

**Module Internal Routes:**
```javascript
// Inside Grade Module
/grades/add        -> Create page
/grades/:id/edit   -> Edit page
/grades/list       -> List page
```

---

## ✅ Best Practices

### 1. Route Naming

✅ **Good:**
```typescript
{ path: '/grades/add', component: GradeCreate }
{ path: '/grades/:id/edit', component: GradeEdit }
```

❌ **Bad:**
```typescript
{ path: '/add-grade', component: GradeCreate } // Not namespace prefixed
{ path: '/grade/:id', component: GradeEdit }   // Ambiguous
```

### 2. Component Organization

```
src/
  ├── routes.tsx          # Route definitions
  ├── pages/
  │   ├── create/
  │   │   ├── index.tsx
  │   │   ├── api.tsx
  │   │   └── hooks.tsx
  │   └── list/
  │       └── index.tsx
  └── components/
      └── ...
```

### 3. Parameter Extraction

**Centralized in App.jsx:**
```jsx
// Extract all parameters at once
const extractParams = (path, route) => {
  const params = {};
  const routeParts = route.path.split('/');
  const pathParts = path.split('/');
  
  routeParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1);
      params[paramName] = pathParts[index];
    }
  });
  
  return params;
};
```

### 4. Error Handling

```jsx
function App() {
  // ... route matching logic
  
  if (!route) {
    return <ErrorPage message="Route not found" />;
  }
  
  if (!Component) {
    return <ErrorPage message="Component not found" />;
  }
  
  return <Component {...params} />;
}
```

### 5. Using Tools Folder

✅ **Always use `webpack-smart.config.js`:**
```json
"dev": "webpack serve --config ../../tools/webpack-smart.config.js"
```

❌ **Avoid copying webpack config:**
```json
// Don't do this
"dev": "webpack serve --config webpack.config.js"
```

---

## 📝 Examples

### Example 1: Simple Static Route

```typescript
// src/routes.tsx
import Dashboard from './pages/dashboard';

export const routes = [
  { path: '/dashboard', component: Dashboard },
];

export const defaultRoute = '/dashboard';
```

### Example 2: Dynamic Route with Multiple Parameters

```typescript
// src/routes.tsx
import OrderDetail from './pages/order-detail';

export const routes = [
  { path: '/orders/:orderId/items/:itemId', component: OrderDetail },
];
```

```jsx
// app/App.jsx
function App() {
  const currentPath = window.location.pathname;
  const route = routes.find(r => {
    // Match pattern: /orders/:orderId/items/:itemId
    const pattern = r.path
      .replace(':orderId', '[^/]+')
      .replace(':itemId', '[^/]+');
    return new RegExp(`^${pattern}$`).test(currentPath);
  });
  
  // Extract parameters
  const pathParts = currentPath.split('/');
  const orderId = pathParts[2];
  const itemId = pathParts[4];
  
  return route?.component 
    ? <route.component orderId={orderId} itemId={itemId} />
    : <div>Not found</div>;
}
```

### Example 3: Query Parameters

```jsx
// app/App.jsx
function App() {
  const currentPath = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  
  const route = routes.find(/* ... */);
  
  // Pass query params as props
  const Component = route?.component;
  return Component 
    ? <Component 
        {...routeParams}
        searchParams={searchParams}
      />
    : <div>Not found</div>;
}
```

### Example 4: Nested Routes

```typescript
// src/routes.tsx
export const routes = [
  { 
    path: '/grades', 
    component: GradeLayout,
    children: [
      { path: '/grades/add', component: GradeCreate },
      { path: '/grades/list', component: GradeList },
    ]
  },
];
```

---

## 🔍 Troubleshooting

### Port Already in Use

**Problem:**
```
⚠️  Port 3105 is occupied, trying next port...
```

**Solution:**
```bash
# Kill process on port
lsof -ti:3105 | xargs kill -9

# Or use different port
PORT=3108 npm run dev
```

### Module Not Found

**Problem:**
```
❌ Not in a valid module directory
```

**Solution:**
- Ensure you're in `apps/your-module/` directory
- Verify `app/mount.js` exists
- Check `package.json` exists

### Route Not Matching

**Problem:** Routes not matching correctly

**Solution:**
1. Check route paths in `routes.tsx`
2. Verify URL pathname matches pattern
3. Add console.log for debugging:
   ```jsx
   console.log('Current path:', currentPath);
   console.log('Routes:', routes);
   console.log('Matched route:', route);
   ```

---

## 📚 Additional Resources

- [Module Federation Documentation](https://webpack.js.org/concepts/module-federation/)
- [React Router v6](https://reactrouter.com/)
- [Webpack Configuration](https://webpack.js.org/configuration/)

---

**Last Updated:** 2025-01-30  
**Maintained By:** Development Team

