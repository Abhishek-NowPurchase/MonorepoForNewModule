import { authenticatedApiCall } from '../../../../shared/Api/apiUtils';
import { createQueryParam } from '../../../../shared/utils';
import { ApiParams, LogSheetListResponse, TemplateListResponse, FieldConfig } from './types';

const LOG_SHEET_LIST = process.env.REACT_APP_LOG_SHEET_ENDPOINT;
const TEMPLATE_DROPDOWN = process.env.REACT_APP_TEMPLATE_DROPDOWN_ENDPOINT;
const FIELD_CONFIG = process.env.REACT_APP_FIELD_CONFIG_ENDPOINT;

if (!LOG_SHEET_LIST || !TEMPLATE_DROPDOWN) {
  throw new Error(
    'Missing REACT_APP_LOG_SHEET_ENDPOINT or REACT_APP_TEMPLATE_DROPDOWN_ENDPOINT. Set them in apps/dynamiclogsheet/.env'
  );
}

const ENDPOINTS = {
  LOG_SHEET_LIST,
  TEMPLATE_DROPDOWN,
  FIELD_CONFIG,
} as const;

/**
 * Fetches a list of log sheets from the API endpoint.
 *
 * @param apiParams - Parameters for filtering the log sheet list.
 * @returns Response from the API.
 */
export async function fetchLogSheetList(apiParams: ApiParams): Promise<LogSheetListResponse> {
  const queryParam = createQueryParam(apiParams);
  const endpoint = queryParam
    ? `${ENDPOINTS.LOG_SHEET_LIST}?${queryParam}`
    : ENDPOINTS.LOG_SHEET_LIST;

  const response = await authenticatedApiCall(endpoint, {
    method: 'GET'
  });

  return response;
}

/**
 * Fetches a list of templates for dropdown from the API endpoint.
 *
 * @returns Response from the API.
 */
export async function fetchTemplateList(): Promise<TemplateListResponse[]> {
  const response = await authenticatedApiCall(ENDPOINTS.TEMPLATE_DROPDOWN, {
    method: 'GET'
  });

  return response;
}

/**
 * Fetches field configurations for a specific template from the API endpoint.
 *
 * @param templateId - The ID of the template to fetch field configs for.
 * @returns Response from the API containing field configurations.
 */
export async function fetchFieldConfigs(templateId: number): Promise<FieldConfig[]> {
  if (!ENDPOINTS.FIELD_CONFIG) {
    throw new Error('REACT_APP_FIELD_CONFIG_ENDPOINT is not configured in .env file');
  }

  const endpoint = `${ENDPOINTS.FIELD_CONFIG}?template_id=${templateId}`;

  const response = await authenticatedApiCall(endpoint, {
    method: 'GET'
  });

  // API returns { config: [...] }, extract the config array
  return response.config || [];
}

/**
 * Fetches dynamic form data from the API endpoint.
 * 
 * @param formId - The ID of the dynamic form to fetch.
 * @returns Response from the API containing dynamic form data.
 */
export async function fetchDynamicForm(formId: number): Promise<any> {
  const endpoint = `/api/admin/dynamic_form/${formId}/`;
  
  const response = await authenticatedApiCall(endpoint, {
    method: 'GET'
  });

  return response;
}

