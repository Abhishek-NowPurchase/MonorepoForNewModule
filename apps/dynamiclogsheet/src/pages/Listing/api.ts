import { authenticatedApiCall } from '../../../../shared/Api/apiUtils';
import { createQueryParam } from '../../../../shared/utils';
import { ApiParams, LogSheetListResponse, TemplateListResponse } from './types';

const LOG_SHEET_LIST = process.env.REACT_APP_LOG_SHEET_ENDPOINT;
const TEMPLATE_DROPDOWN = process.env.REACT_APP_TEMPLATE_DROPDOWN_ENDPOINT;

if (!LOG_SHEET_LIST || !TEMPLATE_DROPDOWN) {
  throw new Error(
    'Missing REACT_APP_LOG_SHEET_ENDPOINT or REACT_APP_TEMPLATE_DROPDOWN_ENDPOINT. Set them in apps/dynamiclogsheet/.env'
  );
}

const ENDPOINTS = {
  LOG_SHEET_LIST,
  TEMPLATE_DROPDOWN,
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

