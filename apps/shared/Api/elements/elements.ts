import { authenticatedApiCall } from '../apiUtils';

// Elements API endpoints
const ELEMENTS_ENDPOINTS = {
  ELEMENTS: '/api/c/elements/',
} as const;

// Elements API - automatically gets token from localStorage
export const getElements = async () => {
  return authenticatedApiCall(ELEMENTS_ENDPOINTS.ELEMENTS, { 
    method: 'GET'
  });
};
