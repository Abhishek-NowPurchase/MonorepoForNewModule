import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/text/text-styles.css';
import 'now-design-styles/dist/color/colorStyles.css';
import 'now-design-styles/dist/fonts/fonts.css';
import 'now-design-styles/dist/effect/effectStyles.css';

import React, { useEffect, useMemo, useRef, Component } from 'react';
import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { routes, defaultRoute } from '../src/routes';
import { DataChangeContext } from '../src/contexts/DataChangeContext';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h3>Something went wrong</h3>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function RouterSync({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSyncingRef = useRef(false);

  const syncToParent = (path) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    window.history.pushState(null, '', path);
    setTimeout(() => { isSyncingRef.current = false; }, 50);
  };

  const syncToChild = (path) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    navigate(path, { replace: true });
    setTimeout(() => { isSyncingRef.current = false; }, 50);
  };

  // Sync child navigation to parent URL
  useEffect(() => {
    const currentPath = location?.pathname || '';
    const windowPath = window.location.pathname;
    
    if (currentPath && currentPath !== windowPath && currentPath.startsWith('/dynamic-log-sheet')) {
      syncToParent(currentPath);
    }
  }, [location?.pathname]);

  // Listen to parent navigation and sync to child
  useEffect(() => {
    const handleLocationChange = () => {
      const windowPath = window.location.pathname;
      const memoryPath = location?.pathname || '';
      
      if (windowPath !== memoryPath && windowPath.startsWith('/dynamic-log-sheet')) {
        syncToChild(windowPath);
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    const interval = setInterval(handleLocationChange, 200);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, [navigate, location?.pathname]);

  return children;
}

function App({ onDataChange }) {
  const initialLocation = useMemo(() => {
    const path = window.location.pathname.startsWith('/dynamic-log-sheet')
      ? window.location.pathname
      : defaultRoute;
    return [{ pathname: path, search: window.location.search, hash: window.location.hash }];
  }, []);

  return (
    <ErrorBoundary>
      <MemoryRouter initialEntries={initialLocation} initialIndex={0}>
        <RouterSync>
          <DataChangeContext.Provider value={onDataChange}>
            <Routes>
              {routes.map((route) => (
                <Route key={route.path} path={route.path} element={<route.component />} />
              ))}
              <Route path="*" element={<Navigate to={defaultRoute} replace />} />
            </Routes>
          </DataChangeContext.Provider>
        </RouterSync>
      </MemoryRouter>
    </ErrorBoundary>
  );
}

export default App;

