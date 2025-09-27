import { apiFetch } from '../apiUtils';
import { getToken } from '../tokenUtils';

// Elements API endpoints
const ELEMENTS_ENDPOINTS = {
  ELEMENTS: '/api/c/elements/',
} as const;

// Elements API - automatically gets token from localStorage
export const getElements = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return apiFetch(ELEMENTS_ENDPOINTS.ELEMENTS, token, { 
    method: 'GET',
    headers: { 'authorization': `Token ${token}` }
  });
};
