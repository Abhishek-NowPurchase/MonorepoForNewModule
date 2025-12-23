import { authenticatedApiCall } from '../../../../shared/Api/apiUtils';
import { createQueryParam } from '../../../../shared/utils';
import { TemplateListResponse, TemplateListParams, TemplateDetailResponse, TemplateDetailParams, TemplateLogSheetsResponse, TemplateLogSheetsParams, LogsheetDetailResponse, LogsheetSubmitRequest, LogsheetSubmitResponse } from './types';

// Base URL for all dynamiclogsheet APIs
const DLMS_BASE_URL = 'https://dlms-api.iotnp.com';

const ENDPOINTS = {
  TEMPLATE_LIST: '/api/v1/templates',
  TEMPLATE_DETAIL: '/api/v1/templates',
  TEMPLATE_LOGSHEETS: '/api/v1/templates',
  TEMPLATE_PREVIEW: '/api/v1',
} as const;

// Hardcoded JWT token for all DLMS API endpoints (temporary)
const DLMS_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMTU4LCJuYW1lIjoiTWFuaGFyIEJoYXJkd2FqIiwibW9iaWxlIjoiKzkxNzk3OTc1NzkwNSIsImN1c3RvbWVyX2lkIjo0NDEsImN1c3RvbWVyX25hbWUiOiJUSVRBR0FSSCBSQUlMIFNZU1RFTVMgTElNSVRFRCIsImV4cCI6MTc2NjU1OTEyNn0.LdBoVA5vu6_IQBHWgNSE7Q5J4I6BKL10ri6Rb0luc8g';

/**
 * Fetches a list of templates from the new API endpoint.
 * 
 * @param params - Optional query parameters for filtering templates
 * @returns Array of templates from the API.
 */
export async function fetchTemplateList(params?: TemplateListParams): Promise<TemplateListResponse[]> {
  // Build query parameters
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  
  if (params?.status) {
    queryParams.status = params.status;
  }
  if (params?.is_active !== undefined) {
    queryParams.is_active = params.is_active;
  }
  if (params?.platform) {
    queryParams.platform = params.platform;
  }
  if (params?.page_no !== undefined) {
    queryParams.page_no = params.page_no;
  }
  if (params?.page_size !== undefined) {
    queryParams.page_size = params.page_size;
  }
  
  // Default to showing only active templates (latest versions)
  if (params?.is_active === undefined) {
    queryParams.is_active = true;
  }
  
  const queryString = createQueryParam(queryParams);
  const endpoint = queryString
    ? `${ENDPOINTS.TEMPLATE_LIST}?${queryString}`
    : ENDPOINTS.TEMPLATE_LIST;

  // Use hardcoded JWT token for this specific endpoint
  const response = await authenticatedApiCall(endpoint, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${DLMS_JWT_TOKEN}`
    },
    baseUrl: DLMS_BASE_URL
  });

  // The new API returns an array directly
  return Array.isArray(response) ? response : [];
}

/**
 * Fetches a template by ID from the new API endpoint.
 * 
 * @param templateId - The ID of the template to fetch (can be number or string).
 * @param params - Optional parameters including version query parameter.
 * @returns Response from the API containing template data with config and form_json.
 */
export async function fetchDynamicForm(
  templateId: number | string,
  params?: TemplateDetailParams
): Promise<TemplateDetailResponse> {
  // Build endpoint with template_id as path parameter
  let endpoint = `${ENDPOINTS.TEMPLATE_DETAIL}/${templateId}`;
  
  // Add optional version query parameter if provided
  if (params?.version) {
    const queryParams = createQueryParam({ version: params.version });
    endpoint = `${endpoint}?${queryParams}`;
  }
  
  // Use hardcoded JWT token for template detail endpoint
  const response = await authenticatedApiCall(endpoint, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${DLMS_JWT_TOKEN}`
    },
    baseUrl: DLMS_BASE_URL
  });

  return response;
}

/**
 * Fetches logsheets for a specific template from the new API endpoint.
 * 
 * @param templateId - The template_id (UUID) of the template to fetch logsheets for.
 * @param params - Optional query parameters for filtering and pagination.
 * @returns Response from the API containing logsheets with label-value pairs.
 */
export async function fetchTemplateLogSheets(
  templateId: string | number,
  params?: TemplateLogSheetsParams
): Promise<TemplateLogSheetsResponse> {
  // Build endpoint with template_id as path parameter
  let endpoint = `${ENDPOINTS.TEMPLATE_LOGSHEETS}/${templateId}/logsheets`;
  
  // Build query parameters
  const queryParams: Record<string, string | number | undefined> = {};
  
  if (params?.status) {
    queryParams.status = params.status;
  }
  if (params?.platform) {
    queryParams.platform = params.platform;
  }
  if (params?.page_no !== undefined) {
    queryParams.page_no = params.page_no;
  }
  if (params?.page_size !== undefined) {
    queryParams.page_size = params.page_size;
  }
  
  // Add query string if there are any parameters
  if (Object.keys(queryParams).length > 0) {
    const queryString = createQueryParam(queryParams);
    endpoint = `${endpoint}?${queryString}`;
  }
  
  // Use hardcoded JWT token for logsheets endpoint
  const response = await authenticatedApiCall(endpoint, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${DLMS_JWT_TOKEN}`
    },
    baseUrl: DLMS_BASE_URL
  });

  return response;
}

/**
 * Fetches the preview HTML for a template from the new API endpoint.
 * 
 * @param templateId - The template_id (UUID) of the template to fetch preview for.
 * @param params - Optional parameters including version, remove_headers, and logsheet_id.
 * @returns HTML string from the API.
 */
export async function fetchTemplatePreview(
  templateId: string | number,
  params?: { version?: string; remove_headers?: boolean; logsheet_id?: string | number }
): Promise<string> {
  // Build endpoint: /api/v1/{template_id}/preview
  let endpoint = `${ENDPOINTS.TEMPLATE_PREVIEW}/${templateId}/preview`;
  
  // Build query parameters
  const queryParams: Record<string, string | boolean | number | undefined> = {};
  
  if (params?.version) {
    queryParams.version = params.version;
  }
  if (params?.logsheet_id) {
    queryParams.logsheet_id = params.logsheet_id;
  }
  if (params?.remove_headers !== undefined) {
    queryParams.remove_headers = params.remove_headers;
  } else {
    // Default to true if not specified
    queryParams.remove_headers = true;
  }
  
  // Add query string if there are any parameters
  if (Object.keys(queryParams).length > 0) {
    const queryString = createQueryParam(queryParams);
    endpoint = `${endpoint}?${queryString}`;
  }
  
  // Use hardcoded JWT token for preview endpoint
  // Note: This API returns text/html, not JSON
  const response = await authenticatedApiCall(endpoint, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${DLMS_JWT_TOKEN}`,
      'accept': 'text/html'
    },
    baseUrl: DLMS_BASE_URL
  });

  // The API returns HTML as string
  return typeof response === 'string' ? response : String(response);
}

/**
 * Fetches logsheet detail from the new API endpoint.
 * 
 * @param templateId - The template_id (UUID) of the template.
 * @param logsheetId - The logsheet_id (MongoDB ObjectId) of the logsheet.
 * @returns LogsheetDetailResponse with full logsheet details including data, parent_data, previous_step.
 */
export async function fetchLogsheetDetail(
  templateId: string | number,
  logsheetId: string | number
): Promise<LogsheetDetailResponse> {
  // Build endpoint: /api/v1/templates/{template_id}/logsheets/{logsheet_id}
  const endpoint = `${ENDPOINTS.TEMPLATE_LOGSHEETS}/${templateId}/logsheets/${logsheetId}`;
  
  // Use hardcoded JWT token for logsheet detail endpoint
  const response = await authenticatedApiCall(endpoint, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${DLMS_JWT_TOKEN}`
    },
    baseUrl: DLMS_BASE_URL
  });

  return response;
}

/**
 * Updates an existing logsheet using the submit endpoint.
 * 
 * @param templateId - The template_id (UUID) of the template.
 * @param logsheetId - The logsheet_id (MongoDB ObjectId) of the logsheet.
 * @param request - Submit request containing status and updated data.
 * @returns SubmitResponse with status, message, and logsheet_id.
 */
export async function updateLogsheetSubmit(
  templateId: string | number,
  logsheetId: string | number,
  request: LogsheetSubmitRequest
): Promise<LogsheetSubmitResponse> {
  // Build endpoint: /api/v1/templates/{template_id}/submit/{logsheet_id}
  const endpoint = `${ENDPOINTS.TEMPLATE_LOGSHEETS}/${templateId}/submit/${logsheetId}`;
  
  // Use hardcoded JWT token for submit endpoint
  const response = await authenticatedApiCall(endpoint, {
    method: 'PATCH',
    body: request,
    headers: {
      'authorization': `Bearer ${DLMS_JWT_TOKEN}`
    },
    baseUrl: DLMS_BASE_URL
  });

  return response;
}

/**
 * Creates a new logsheet using the submit endpoint.
 * 
 * @param templateId - The template_id (UUID) of the template.
 * @param request - Submit request containing status and data.
 * @returns SubmitResponse with status, message, and logsheet_id.
 */
export async function createLogsheetSubmit(
  templateId: string | number,
  request: LogsheetSubmitRequest
): Promise<LogsheetSubmitResponse> {
  // Build endpoint: /api/v1/templates/{template_id}/submit
  const endpoint = `${ENDPOINTS.TEMPLATE_LOGSHEETS}/${templateId}/submit`;
  
  // Use hardcoded JWT token for submit endpoint
  const response = await authenticatedApiCall(endpoint, {
    method: 'POST',
    body: request,
    headers: {
      'authorization': `Bearer ${DLMS_JWT_TOKEN}`
    },
    baseUrl: DLMS_BASE_URL
  });

  return response;
}

