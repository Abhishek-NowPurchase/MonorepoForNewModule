/**
 * Generic utility for creating URL query strings from parameter objects
 * @param params - Object containing query parameters (string, number, boolean, or undefined values)
 * @returns Query string (e.g., "key1=value1&key2=value2")
 */
export function createQueryParam(params: Record<string, string | number | boolean | undefined>): string {
  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlParams.append(key, String(value));
    }
  });

  return urlParams.toString();
}

