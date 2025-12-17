import { useMemo, useState, useEffect } from "react";
import { LogSheet } from "../../../../../shared/Api/dynamicLogSheet";

interface UseFormDataProps {
  logSheet: LogSheet | null;
  isMultiStep: boolean;
  selectedSectionIndex: number;
  getAllSectionsJson: any[];
  getCurrentSectionFormJson?: () => string; // For multi-step forms
  getFormJson?: string; // For single form
}

/**
 * Extract file upload field keys from form JSON
 * File upload fields cannot have their value set programmatically
 */
const getFileUploadFieldKeys = (formJson: string): Set<string> => {
  const fileUploadKeys = new Set<string>();
  const FILE_UPLOAD_TYPES = ["RsUploader", "rsUploader", "Uploader", "uploader", "file", "File"];

  try {
    if (!formJson) return fileUploadKeys;

    const parsed = typeof formJson === 'string' ? JSON.parse(formJson) : formJson;
    const form = parsed?.form || parsed;

    const extractFileFields = (children: any[]) => {
      if (!Array.isArray(children)) return;
      
      children.forEach((child: any) => {
        if (child?.type && FILE_UPLOAD_TYPES.includes(child.type) && child?.key) {
          fileUploadKeys.add(child.key);
        }
        if (child?.children && Array.isArray(child.children)) {
          extractFileFields(child.children);
        }
      });
    };

    if (form?.children && Array.isArray(form.children)) {
      extractFileFields(form.children);
    }
  } catch (error) {
    // If parsing fails, return empty set
    console.warn('Error parsing form JSON for file upload fields:', error);
  }

  return fileUploadKeys;
};

/**
 * Filter out file upload field values from initialData
 * File inputs can only have empty string as value
 */
const filterFileUploadFields = (
  data: Record<string, any>,
  fileUploadKeys: Set<string>
): Record<string, any> => {
  const filtered: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (!fileUploadKeys.has(key)) {
      filtered[key] = value;
    }
    // File upload fields are excluded - they will be empty by default
  });

  return filtered;
};

/**
 * Hook to manage form data for prefilling
 * FormViewer handles all normalization and date conversion for initialData
 * We only need to flatten form_data structure
 */
export const useFormData = ({
  logSheet,
  isMultiStep,
  selectedSectionIndex,
  getAllSectionsJson,
  getCurrentSectionFormJson,
  getFormJson,
}: UseFormDataProps) => {
  // Accumulate form data per section for multi-step forms
  // Format: { sectionId: { field1: value1, field2: value2 }, ... }
  const [formValues, setFormValues] = useState<Record<string, Record<string, any>>>({});

  // Flatten all form_data from all sections (for single form or initial load)
  const getInitialFormData = useMemo(() => {
    return (): Record<string, any> => {
      if (!logSheet?.form_data) {
        return {};
      }

      const flattened: Record<string, any> = {};

      // Flatten all form_data from all sections
      // No date conversion needed - FormViewer handles it via initialData
      Object.values(logSheet.form_data).forEach((section: any) => {
        if (section?.data && typeof section.data === "object") {
          Object.assign(flattened, section.data);
        }
      });

      return flattened;
    };
  }, [logSheet?.form_data]);

  // Get form JSON to extract file upload field keys
  const formJson = useMemo(() => {
    if (isMultiStep && getCurrentSectionFormJson) {
      // For multi-step, get current section's form JSON
      return getCurrentSectionFormJson();
    } else if (getFormJson) {
      // For single form, use provided form JSON
      return getFormJson;
    } else if (logSheet?.form_json) {
      // Fallback: try to get from logSheet
      try {
        return typeof logSheet.form_json === 'string' 
          ? logSheet.form_json 
          : JSON.stringify(logSheet.form_json);
      } catch {
        return '';
      }
    }
    return '';
  }, [isMultiStep, getCurrentSectionFormJson, getFormJson, logSheet?.form_json, selectedSectionIndex]);

  // Extract file upload field keys from form JSON
  const fileUploadKeys = useMemo(() => {
    return getFileUploadFieldKeys(formJson);
  }, [formJson]);

  // Get initial data for current section (multi-step) or entire form (single)
  const getInitialDataForCurrentForm = useMemo(() => {
    return (): Record<string, any> => {
      let data: Record<string, any> = {};
      
      if (isMultiStep) {
        // For multi-step, get data for current section only
        const currentSection = getAllSectionsJson[selectedSectionIndex];
        if (!currentSection || !logSheet?.form_data) {
          return {};
        }

        const sectionData = logSheet.form_data[currentSection.section_id];
        if (sectionData?.data) {
          data = { ...sectionData.data };
        }
      } else {
        // For single form, return all flattened data
        data = getInitialFormData();
      }

      // Filter out file upload fields - they cannot have values set programmatically
      return filterFileUploadFields(data, fileUploadKeys);
    };
  }, [
    isMultiStep,
    getAllSectionsJson,
    selectedSectionIndex,
    logSheet?.form_data,
    getInitialFormData,
    fileUploadKeys,
  ]);

  // Initialize formValues when logSheet changes - structure per section for multi-step
  useEffect(() => {
    if (logSheet?.form_data) {
      if (isMultiStep) {
        // For multi-step, structure data per section
        const sectionedData: Record<string, Record<string, any>> = {};
        Object.entries(logSheet.form_data).forEach(([sectionId, section]: [string, any]) => {
          if (section?.data) {
            sectionedData[sectionId] = { ...section.data };
          }
        });
        setFormValues(sectionedData);
      } else {
        // For single form, flatten all data
        const flattened = getInitialFormData();
        setFormValues({ default: flattened });
      }
    }
  }, [logSheet?.form_data, isMultiStep, getInitialFormData]);

  return {
    formValues,
    setFormValues,
    getInitialFormData,
    getInitialDataForCurrentForm,
  };
};
