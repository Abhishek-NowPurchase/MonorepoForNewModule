import { useLocation, useParams } from 'react-router-dom';

/**
 * Extract category (master or operational) from the current route path
 * @param pathname - The current pathname from useLocation
 * @returns 'master' | 'operational' | 'master' (default)
 */
export const getCategoryFromPath = (pathname: string): 'master' | 'operational' => {
  if (pathname.includes('/operational')) {
    return 'operational';
  }
  return 'master'; // Default to master
};

/**
 * Hook to get category from current route
 */
export const useCategoryFromRoute = (): 'master' | 'operational' => {
  const location = useLocation();
  return getCategoryFromPath(location.pathname);
};

/**
 * Build route path with category
 */
export const buildRouteWithCategory = (
  category: 'master' | 'operational',
  path: string
): string => {
  // Remove leading /dynamic-log-sheet if present
  const cleanPath = path.replace(/^\/dynamic-log-sheet\/?/, '');
  
  // If path already has category, return as is
  if (cleanPath.startsWith('master/') || cleanPath.startsWith('operational/')) {
    return `/dynamic-log-sheet/${cleanPath}`;
  }
  
  // Add category prefix
  return `/dynamic-log-sheet/${category}/${cleanPath}`;
};

