import { convertDatesToISOInObject } from '../../../../shared/utils';
import { parseFormJson, stringifyFormJson } from '../../../../shared/utils';
import { LogSheet } from '../../../../shared/Api/dynamicLogSheet';

const DATE_FIELD_TYPES = ["RsDatePicker", "RsCalendar", "RsTimePicker"];
const FILE_UPLOAD_TYPES = ["RsUploader", "rsUploader", "Uploader", "uploader", "file", "File"];

/**
 * Extract file upload field keys from form JSON (recursive)
 * @param formJson - The form JSON (string or object)
 * @returns Set of file upload field keys
 */
export const extractFileUploadFieldKeys = (formJson: any): Set<string> => {
  const fileUploadKeys = new Set<string>();

  try {
    if (!formJson) {
      return fileUploadKeys;
    }

    let parsed: any;

    if (typeof formJson === 'string') {
      parsed = JSON.parse(formJson);
    } else {
      parsed = formJson;
    }

    const form = parsed?.form || parsed;
    if (form?.children && Array.isArray(form.children)) {
      const extractFileFields = (children: any[]) => {
        children.forEach((child: any) => {
          if (child?.type && FILE_UPLOAD_TYPES.includes(child.type) && child?.key) {
            fileUploadKeys.add(child.key);
          }
          if (child?.children && Array.isArray(child.children)) {
            extractFileFields(child.children);
          }
        });
      };
      extractFileFields(form.children);
    }
  } catch (error) {
    // Error extracting file upload fields - continue without filtering
  }

  return fileUploadKeys;
};

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
 * Flatten form_data from log sheet and filter out file upload fields
 * @param logSheet - The log sheet data
 * @param fileUploadKeys - Set of file upload field keys to filter out
 * @returns Flattened form data without file upload fields
 */
export const flattenFormData = (
  logSheet: LogSheet | null,
  fileUploadKeys: Set<string>
): Record<string, any> => {
  if (!logSheet?.form_data) {
    return {};
  }

  const flattened: Record<string, any> = {};

  // Flatten all form_data from all sections
  Object.values(logSheet.form_data).forEach((section: any) => {
    if (section?.data && typeof section.data === "object") {
      Object.assign(flattened, section.data);
    }
  });

  // Filter out file upload fields - they cannot have values set programmatically
  const filtered: Record<string, any> = {};
  Object.entries(flattened).forEach(([key, value]) => {
    if (!fileUploadKeys.has(key)) {
      filtered[key] = value;
    }
  });

  return filtered;
};

/**
 * Structure form data for API submission (Edit mode - preserves section structure)
 * @param formValues - Current form values
 * @param logSheet - Original log sheet data
 * @param dateFieldKeys - Set of date field keys for conversion
 * @returns Structured form data ready for API
 */
export const structureFormDataForAPI = (
  formValues: Record<string, any>,
  logSheet: LogSheet | null,
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

  // Preserve existing section structure if available
  if (logSheet?.form_data && Object.keys(logSheet.form_data).length > 0) {
    // Use the first section_id from existing form_data
    const firstSectionId = Object.keys(logSheet.form_data)[0];
    const existingSection = logSheet.form_data[firstSectionId];

    structured[firstSectionId] = {
      data: convertedFormData,
      order: existingSection?.order || 1,
      section_name: existingSection?.section_name || logSheet?.template_name || "Form",
    };
  } else {
    // Create a default section
    structured["main"] = {
      data: convertedFormData,
      order: 1,
      section_name: logSheet?.template_name || "Form",
    };
  }

  return structured;
};



