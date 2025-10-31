import { authenticatedApiCall } from '../../../../shared/Api/apiUtils';
import { GradeFormData } from './types';
import { transformFormDataToPayload } from './utils';


const GRADE_ENDPOINTS = {
  TAG_ID: '/api/cm/metalgrade/gen_grade_tag_id/',
  CREATE_GRADE: '/api/c/grades_add_api/',
  GET_GRADE: '/api/c/grades/',
} as const;


export const getGradeTagId = async (): Promise<any> => {
  return authenticatedApiCall(GRADE_ENDPOINTS.TAG_ID, {
    method: 'GET'
  });
};

export const getGrade = async (gradeId: string): Promise<any> => {
  return authenticatedApiCall(`${GRADE_ENDPOINTS.GET_GRADE}${gradeId}/`, {
    method: 'GET'
  });
};

export const createGrade = async (formData: GradeFormData, customerId: number = 243): Promise<any> => {
  const payload = transformFormDataToPayload(formData, customerId);

  const result = await authenticatedApiCall(GRADE_ENDPOINTS.CREATE_GRADE, {
    method: 'POST',
    body: payload
  });
  return result;
};

export const updateGrade = async (gradeId: string, formData: GradeFormData, customerId: number = 243): Promise<any> => {
  const payload = transformFormDataToPayload(formData, customerId);

  const result = await authenticatedApiCall(`${GRADE_ENDPOINTS.CREATE_GRADE}${gradeId}/`, {
    method: 'PATCH',
    body: payload
  });
  return result;
};
