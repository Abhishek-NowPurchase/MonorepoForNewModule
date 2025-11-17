import { authenticatedApiCall } from '../../../../shared/Api/apiUtils';
import { ApiParams, LogSheetListResponse, TemplateListResponse, LogSheet, UpdateLogSheetData } from './types';
import { createQueryParam } from './utils';

const ENDPOINTS = {
  LOG_SHEET_LIST: '/api/admin/dynamic_logsheet/',
  TEMPLATE_DROPDOWN: '/api/admin/dynamic_form/template/dropdown/',
  LOG_SHEET_DETAIL: '/api/admin/dynamic_logsheet/'
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
 * Fetches the detail of a log sheet from the API endpoint.
 *
 * @param id - ID of the log sheet to be fetched.
 * @returns Response from the API.
 */
export async function fetchLogSheetDetail(id: number | string): Promise<LogSheet> {
  const response = await authenticatedApiCall(`${ENDPOINTS.LOG_SHEET_DETAIL}${id}/`, {
    method: 'GET'
  });

  return response;
}

/**
 * Updates a log sheet with the provided data.
 *
 * @param id - ID of the log sheet to be updated.
 * @param data - Data to update the log sheet with.
 * @returns Response from the API.
 */
export async function updateLogSheet(id: number | string, data: UpdateLogSheetData): Promise<LogSheet> {
  const response = await authenticatedApiCall(`${ENDPOINTS.LOG_SHEET_DETAIL}${id}/`, {
    method: 'PATCH',
    body: data
  });

  return response;
}
