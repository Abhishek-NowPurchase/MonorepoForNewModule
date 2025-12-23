// Centralized API utility for all API calls
import { getToken } from './tokenUtils';

/**
 * Automatically detects the API base URL based on the current hostname.
 * 
 * Mapping:
 * - test.nowpurchase.com → https://test-api.nowpurchase.com (Staging)
 * - app.nowpurchase.com → https://api.nowpurchase.com (Production)
 * - localhost → https://test-api.nowpurchase.com (Local Development)
 * - Any other hostname → https://api.nowpurchase.com (Production - safe fallback)
 */
const getApiBaseUrl = (): string => {
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
  } = {},
  customBaseUrl?: string // Optional custom base URL override
) => {
  const baseUrl = customBaseUrl || BASE_URL;
  const url = `${baseUrl}${endpoint}`;
  
  const headers = {
    ...DEFAULT_HEADERS,
    ...options.headers
  };

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
    mode: 'cors', // Explicitly set CORS mode
    credentials: 'omit' // Don't send cookies for cross-origin requests
  };

  // Add body for POST/PUT/PATCH requests
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    // Check if response is ok
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // If not JSON, return text
      return response.text();
    }
  } catch (error: any) {
    // Handle network errors and CORS errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to ${baseUrl}. This could be a CORS issue or the server is down.`);
    }
    // Re-throw other errors
    throw error;
  }
};

// Authenticated API call wrapper with automatic token handling
export const authenticatedApiCall = async (
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    baseUrl?: string; // Optional custom base URL
  } = {}
) => {
  // If custom authorization header is provided, use it directly without adding default token
  if (options.headers?.authorization) {
    return apiFetch(endpoint, '', {
      ...options,
      headers: options.headers
    }, options.baseUrl);
  }
  
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
      }, options.baseUrl);
    }
    
    throw new Error('No authentication token found. Please login first.');
  }
  
  return apiFetch(endpoint, token, {
    ...options,
    headers: {
      ...options.headers,
      'authorization': `Token ${token}`
    }
  }, options.baseUrl);
};
