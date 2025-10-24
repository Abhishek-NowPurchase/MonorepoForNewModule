import { authenticatedApiCall } from '../apiUtils';

// User API endpoints
const USER_ENDPOINTS = {
  USER_DETAILS: '/api/user-detail/',
} as const;

// User Details API - automatically gets token from localStorage
export const getUserDetails = async () => {
  return authenticatedApiCall(USER_ENDPOINTS.USER_DETAILS, { 
    method: 'GET'
  });
};