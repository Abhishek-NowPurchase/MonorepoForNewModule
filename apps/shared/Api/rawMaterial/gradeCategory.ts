import { apiFetch } from '../apiUtils';
import { getToken } from '../tokenUtils';

// Raw Material API endpoints
const RAW_MATERIAL_ENDPOINTS = {
  GRADE_CATEGORY: '/api/c/grade_category/',
} as const;

// Grade Category API - automatically gets token from localStorage
export const getGradeCategory = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return apiFetch(RAW_MATERIAL_ENDPOINTS.GRADE_CATEGORY, token, { 
    method: 'GET',
    headers: { 'authorization': `Token ${token}` }
  });
};
