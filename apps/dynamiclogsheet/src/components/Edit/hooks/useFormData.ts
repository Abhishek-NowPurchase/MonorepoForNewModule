import { useMemo, useState, useEffect } from "react";
import { LogSheet } from "../../../../../shared/Api/dynamicLogSheet";

interface UseFormDataProps {
  logSheet: LogSheet | null;
  isMultiStep: boolean;
  selectedSectionIndex: number;
  getAllSectionsJson: any[];
}

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

  // Get initial data for current section (multi-step) or entire form (single)
  const getInitialDataForCurrentForm = useMemo(() => {
    return (): Record<string, any> => {
      if (isMultiStep) {
        // For multi-step, get data for current section only
        const currentSection = getAllSectionsJson[selectedSectionIndex];
        if (!currentSection || !logSheet?.form_data) {
          return {};
        }

        const sectionData = logSheet.form_data[currentSection.section_id];
        if (sectionData?.data) {
          // Return data as-is - FormViewer handles normalization
          return { ...sectionData.data };
        }
        return {};
      } else {
        // For single form, return all flattened data
        return getInitialFormData();
      }
    };
  }, [
    isMultiStep,
    getAllSectionsJson,
    selectedSectionIndex,
    logSheet?.form_data,
    getInitialFormData,
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
