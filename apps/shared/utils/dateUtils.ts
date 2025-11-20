/**
 * Formats a date string to a readable format
 * 
 * @param dateString - ISO date string
 * @param options - Optional formatting options
 * @returns Formatted date string
 * 
 * @example
 * ```typescript
 * formatDate("2025-11-18T17:27:54.421780+05:30")
 * // Returns: "Nov 18, 2025, 05:27 PM"
 * ```
 */
export function formatDate(
  dateString: string,
  options?: {
    includeTime?: boolean;
    locale?: string;
  }
): string {
  const { includeTime = true, locale = "en-US" } = options || {};
  const date = new Date(dateString);

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  if (includeTime) {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";
  }

  return date.toLocaleDateString(locale, formatOptions);
}

