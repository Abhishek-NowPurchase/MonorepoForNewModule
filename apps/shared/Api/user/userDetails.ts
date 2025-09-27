import { apiFetch } from '../apiUtils';
import { getToken } from '../tokenUtils';

// User API endpoints
const USER_ENDPOINTS = {
  USER_DETAILS: '/api/user-detail/',
} as const;

// User Details API - automatically gets token from localStorage
export const getUserDetails = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return apiFetch(USER_ENDPOINTS.USER_DETAILS, token, { 
    method: 'GET',
    headers: { 'authorization': `Token ${token}` }
  });
};