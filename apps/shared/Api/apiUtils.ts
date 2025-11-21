// Centralized API utility for all API calls
import { getToken } from './tokenUtils';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!BASE_URL) {
  throw new Error(
    'Missing REACT_APP_API_BASE_URL. Please configure it in apps/dynamiclogsheet/.env'
  );
}

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
