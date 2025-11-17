import { ApiParams } from './types';

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

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Gets display text for status
 * @param status - Status value
 * @returns Display text for status
 */
export function getStatusDisplay(status: string): string {
  const statusMap: Record<string, string> = {
    'Completed': 'Completed',
    'InProgress': 'In Progress',
    'PendingReview': 'Pending Review',
    'Scheduled': 'Scheduled'
  };
  return statusMap[status] || status;
}
