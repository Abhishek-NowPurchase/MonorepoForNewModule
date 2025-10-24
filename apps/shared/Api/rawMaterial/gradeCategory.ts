import { authenticatedApiCall } from '../apiUtils';

// Raw Material API endpoints
const RAW_MATERIAL_ENDPOINTS = {
  GRADE_CATEGORY: '/api/c/grade_category/',
} as const;

// Grade Category API - automatically gets token from localStorage
export const getGradeCategory = async () => {
  return authenticatedApiCall(RAW_MATERIAL_ENDPOINTS.GRADE_CATEGORY, { 
    method: 'GET'
  });
};
