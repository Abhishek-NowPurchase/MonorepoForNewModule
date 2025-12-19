import { convertDatesToISOInObject } from '../../../../shared/utils';
import { parseFormJson, stringifyFormJson } from '../../../../shared/utils';

const DATE_FIELD_TYPES = ["RsDatePicker", "RsCalendar", "RsTimePicker"];

/**
 * Extract date field keys from form JSON
 * @param formJson - The form JSON (string or object)
 * @returns Set of date field keys
 */
export const extractDateFieldKeys = (formJson: any): Set<string> => {
  const dateKeys = new Set<string>();

  try {
    if (!formJson) {
      return dateKeys;
    }

    let parsed: any;

    if (typeof formJson === 'string') {
      parsed = JSON.parse(formJson);
    } else {
      parsed = formJson;
    }

    // Handle single form
    const form = parsed?.form || parsed;
    if (form?.children && Array.isArray(form.children)) {
      form.children.forEach((child: any) => {
        if (
          child?.type &&
          DATE_FIELD_TYPES.includes(child.type) &&
          child?.key
        ) {
          dateKeys.add(child.key);
        }
      });
    }
  } catch (error) {
    // Error extracting date fields - continue without date conversion
  }

  return dateKeys;
};

/**
 * Process form JSON to string format for FormRenderer
 * @param formJson - The form JSON from API
 * @returns Processed form JSON string
 */
export const processFormJson = (formJson: any): string => {
  if (!formJson) {
    return '';
  }

  const parsed = parseFormJson(formJson);
  if (!parsed) {
    return '';
  }

  // If it's an object, check if it has a 'form' property
  if (typeof parsed === 'object') {
    if ('form' in parsed) {
      return stringifyFormJson(parsed);
    }
    // Otherwise, stringify the whole object
    return stringifyFormJson(parsed);
  }

  return '';
};

/**
 * Structure form data for API submission
 * @param formValues - Current form values
 * @param formData - Form data from API (for template_name)
 * @param dateFieldKeys - Set of date field keys for conversion
 * @returns Structured form data ready for API
 */
export const structureFormDataForAPI = (
  formValues: Record<string, any>,
  formData: any,
  dateFieldKeys: Set<string>
): Record<string, any> => {
  const structured: Record<string, any> = {};
  const combinedData: Record<string, any> = {};

  // Combine all formValues (stored under 'default' key for single form)
  Object.values(formValues).forEach((sectionData) => {
    Object.assign(combinedData, sectionData);
  });

  // Convert date strings to ISO strings before saving
  const convertedFormData = convertDatesToISOInObject(
    combinedData,
    dateFieldKeys
  );

  // Create section structure with "main" key for single forms
  structured["main"] = {
    data: convertedFormData,
    order: 1,
    section_name: formData?.template_name || "Form",
  };

  return structured;
};

