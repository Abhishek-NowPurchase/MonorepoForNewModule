import { authenticatedApiCall } from '../../../../shared/Api/apiUtils';
import { LogSheet } from './types';

const ENDPOINT = '/api/admin/dynamic_logsheet/';

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

