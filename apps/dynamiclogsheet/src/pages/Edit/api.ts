import { authenticatedApiCall } from '../../../../shared/Api/apiUtils';
import { LogSheet, UpdateLogSheetData } from './types';

// const ENDPOINT = '/api/admin/dynamic_logsheet/';
const ENDPOINT = '/api/admin/dynamic_form/';

/**
 * Fetches the detail of a log sheet from the API endpoint.
 *
 * @param id - ID of the log sheet to be fetched.
 * @returns Response from the API.
 */
export async function fetchLogSheetDetail(id: number | string): Promise<LogSheet> {
  const response = await authenticatedApiCall(`${ENDPOINT}${id}/`, {
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
  const response = await authenticatedApiCall(`${ENDPOINT}${id}/`, {
    method: 'PATCH',
    body: data
  });

  return response;
}

