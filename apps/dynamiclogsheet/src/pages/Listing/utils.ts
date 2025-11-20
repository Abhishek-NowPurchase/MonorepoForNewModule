import { ApiParams } from './types';
export { formatDate } from '../../../../shared/utils';

/**
 * Creates a URL query string from API parameters
 * @param apiParams - Object containing query parameters
 * @returns Query string
 */
export function createQueryParam(apiParams: ApiParams): string {
  const params = new URLSearchParams();

  if (apiParams.template !== undefined) {
    params.append('template', apiParams.template.toString());
  }
  if (apiParams.status) {
    params.append('status', apiParams.status);
  }
  if (apiParams.search) {
    params.append('search', apiParams.search);
  }
  if (apiParams.page !== undefined) {
    params.append('page', apiParams.page.toString());
  }
  if (apiParams.page_size !== undefined) {
    params.append('page_size', apiParams.page_size.toString());
  }

  return params.toString();
}

// formatDate is now imported from shared/utils
// This file only contains Listing-specific utilities

