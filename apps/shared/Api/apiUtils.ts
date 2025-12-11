// Centralized API utility for all API calls
import { getToken } from './tokenUtils';

/**
 * Automatically detects the API base URL based on the current hostname.
 * 
 * Mapping:
 * - test.nowpurchase.com → https://test-api.nowpurchase.com (Staging)
 * - app.nowpurchase.com → https://api.nowpurchase.com (Production)
 * - localhost → https://test-api.nowpurchase.com (Local Development)
 * 
 * Can be overridden with REACT_APP_API_BASE_URL environment variable for local development.
 */
const getApiBaseUrl = (): string => {
  // Allow manual override via environment variable (useful for local development)
  if (process.env.REACT_APP_API_BASE_URL) {
    console.log('[API Config] Using environment variable override:', process.env.REACT_APP_API_BASE_URL);
    return process.env.REACT_APP_API_BASE_URL;
  }

  // Handle server-side rendering or build-time (window is not available)
  if (typeof window === 'undefined') {
    // Default to production API during build/SSR
    console.log('[API Config] Build/SSR mode: Defaulting to production API');
    return 'https://api.nowpurchase.com';
  }

  // Get current hostname (normalize to lowercase for comparison)
  const hostname = window.location.hostname.toLowerCase().trim();

  // Explicit mapping for staging environment
  if (hostname === 'test.nowpurchase.com') {
    console.log('[API Config] Staging detected:', hostname, '→ Using test-api.nowpurchase.com');
    return 'https://test-api.nowpurchase.com';
  }

  // Explicit mapping for production environment
  if (hostname === 'app.nowpurchase.com') {
    console.log('[API Config] Production detected:', hostname, '→ Using api.nowpurchase.com');
    return 'https://api.nowpurchase.com';
  }

  // Explicit mapping for localhost (local development)
  if (hostname === 'localhost') {
    console.log('[API Config] Localhost detected:', hostname, '→ Using test-api.nowpurchase.com');
    return 'https://test-api.nowpurchase.com';
  }

  // Fallback: for any other hostname, default to production
  // This ensures we never accidentally use staging API in production
  console.log('[API Config] Unknown hostname:', hostname, '→ Defaulting to production API');
  return 'https://api.nowpurchase.com';
};

const BASE_URL = getApiBaseUrl();

const DEFAULT_HEADERS = {
  'accept': 'application/json',
  'content-type': 'application/json'
};

// Generic API fetch function
export const apiFetch = async (
  endpoint: string, 
  token: string, 
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    ...DEFAULT_HEADERS,
    ...options.headers
  };

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers
  };

  // Add body for POST/PUT/PATCH requests
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Authenticated API call wrapper with automatic token handling
export const authenticatedApiCall = async (
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
) => {
  const token = getToken();
  
  if (!token) {
    // Try to get tokenv2 as fallback
    const tokenV2 = localStorage.getItem('tokenv2');
    
    if (tokenV2) {
      return apiFetch(endpoint, tokenV2, {
        ...options,
        headers: {
          ...options.headers,
          'authorization': `Token ${tokenV2}`
        }
      });
    }
    
    throw new Error('No authentication token found. Please login first.');
  }
  
  return apiFetch(endpoint, token, {
    ...options,
    headers: {
      ...options.headers,
      'authorization': `Token ${token}`
    }
  });
};
