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

/**
 * Converts an ISO date string to a Date object
 * 
 * @param value - The value to convert (can be string, Date, null, undefined, or any other type)
 * @returns Date object if value is a valid ISO date string, otherwise returns the original value
 * 
 * @example
 * ```typescript
 * convertStringToDate("2025-11-18T17:27:54.421780+05:30")
 * // Returns: Date object
 * 
 * convertStringToDate("invalid")
 * // Returns: "invalid" (original value)
 * 
 * convertStringToDate(new Date())
 * // Returns: Date object (already a Date)
 * ```
 */
export function convertStringToDate(value: any): any {
  // Return as-is if null, undefined, or empty string
  if (value === null || value === undefined || value === "") {
    return value;
  }

  // If already a Date object, return as-is
  if (value instanceof Date) {
    return value;
  }

  // If it's a string, try to parse as ISO date
  if (typeof value === "string") {
    try {
      const date = new Date(value);
      // Check if the date is valid
      if (!isNaN(date.getTime())) {
        return date;
      } else {
        return value; // Return original if invalid
      }
    } catch (e) {
      return value; // Return original on error
    }
  }

  // Return as-is if not a string
  return value;
}

/**
 * Converts a Date object to an ISO string
 * 
 * @param value - The value to convert (can be Date, string, or any other type)
 * @returns ISO string if value is a Date object, otherwise returns the original value
 * 
 * @example
 * ```typescript
 * convertDateToISOString(new Date())
 * // Returns: "2025-11-18T12:00:00.000Z"
 * 
 * convertDateToISOString("2025-11-18")
 * // Returns: "2025-11-18" (original value)
 * ```
 */
export function convertDateToISOString(value: any): any {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value; // Return as-is if not a Date
}

/**
 * Converts date values in an object based on a set of date field keys
 * 
 * @param data - Object containing key-value pairs
 * @param dateFieldKeys - Set of keys that should be treated as date fields
 * @returns New object with date strings converted to Date objects for specified keys
 * 
 * @example
 * ```typescript
 * const data = { name: "John", birthDate: "2025-11-18T12:00:00.000Z" };
 * const dateKeys = new Set(["birthDate"]);
 * convertDatesInObject(data, dateKeys)
 * // Returns: { name: "John", birthDate: Date object }
 * ```
 */
export function convertDatesInObject(
  data: Record<string, any>,
  dateFieldKeys: Set<string>
): Record<string, any> {
  const converted: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (dateFieldKeys.has(key)) {
      converted[key] = convertStringToDate(value);
    } else {
      converted[key] = value;
    }
  });
  
  return converted;
}

/**
 * Converts Date objects to ISO strings in an object based on a set of date field keys
 * 
 * @param data - Object containing key-value pairs
 * @param dateFieldKeys - Set of keys that should be treated as date fields
 * @returns New object with Date objects converted to ISO strings for specified keys
 * 
 * @example
 * ```typescript
 * const data = { name: "John", birthDate: new Date() };
 * const dateKeys = new Set(["birthDate"]);
 * convertDatesToISOInObject(data, dateKeys)
 * // Returns: { name: "John", birthDate: "2025-11-18T12:00:00.000Z" }
 * ```
 */
export function convertDatesToISOInObject(
  data: Record<string, any>,
  dateFieldKeys: Set<string>
): Record<string, any> {
  const converted: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (dateFieldKeys.has(key)) {
      converted[key] = convertDateToISOString(value);
    } else {
      converted[key] = value;
    }
  });
  
  return converted;
}

