import { getToken } from '../../../../shared/Api/tokenUtils';
import { LogSheet } from './types';

const BASE_URL = 'https://test-api.nowpurchase.com';
const ENDPOINT = '/api/admin/dynamic_logsheet/';

/**
 * Fetches the detail of a log sheet from the API endpoint.
 *
 * @param id - ID of the log sheet to be fetched.
 * @returns Response from the API.
 */
export async function fetchLogSheetDetail(id: number | string): Promise<LogSheet> {
  const token = getToken() || localStorage.getItem('tokenv2');
  
  if (!token) {
    throw new Error('No authentication token found. Please login first.');
  }

  const response = await fetch(`${BASE_URL}${ENDPOINT}${id}/`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': `Token ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetches the HTML preview of a log sheet template.
 *
 * @param templateId - ID of the template to be fetched.
 * @returns HTML string from the API.
 */
export async function fetchLogSheetPreview(templateId: number | string): Promise<string> {
  const token = getToken() || localStorage.getItem('tokenv2');
  
  if (!token) {
    throw new Error('No authentication token found. Please login first.');
  }

  const response = await fetch(`${BASE_URL}/api/admin/dynamic_logsheet/preview/?template_id=${templateId}`, {
    method: 'GET',
    headers: {
      'accept': '*/*',
      'authorization': `Token ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.text();
}

