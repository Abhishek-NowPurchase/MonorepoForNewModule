/**
 * Validates if a string is valid JSON
 * 
 * @param json - JSON string to validate
 * @returns true if valid JSON, false otherwise
 * 
 * @example
 * ```typescript
 * validateFormJson('{"form": {...}}') // Returns: true
 * validateFormJson('invalid') // Returns: false
 * ```
 */
export const validateFormJson = (json: string): boolean => {
  if (!json || json.trim() === "") {
    return false;
  }

  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Parses a JSON string or object into an object
 * 
 * @param json - JSON string or object to parse
 * @returns Parsed object or null if invalid
 * 
 * @example
 * ```typescript
 * parseFormJson('{"form": {...}}') // Returns: { form: {...} }
 * parseFormJson({ form: {...} }) // Returns: { form: {...} }
 * parseFormJson('invalid') // Returns: null
 * ```
 */
export const parseFormJson = (json: string | object): object | null => {
  if (!json) {
    return null;
  }

  // If already an object, return as-is
  if (typeof json === "object") {
    return json;
  }

  // If it's a string, try to parse it
  if (typeof json === "string") {
    if (json.trim() === "") {
      return null;
    }

    try {
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  return null;
};

/**
 * Stringifies a JSON object to a string
 * 
 * @param json - Object to stringify
 * @returns JSON string or empty string if invalid
 * 
 * @example
 * ```typescript
 * stringifyFormJson({ form: {...} }) // Returns: '{"form": {...}}'
 * stringifyFormJson(null) // Returns: ''
 * ```
 */
export const stringifyFormJson = (json: object | null | undefined): string => {
  if (!json) {
    return "";
  }

  try {
    return JSON.stringify(json);
  } catch (e) {
    return "";
  }
};

