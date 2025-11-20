import { useMemo } from "react";
import { LogSheet, LogSheetSection } from "../../../../../shared/Api/dynamicLogSheet";
import { convertDatesToISOInObject } from "../../../../../shared/utils";

interface UseFormSubmissionProps {
  logSheet: LogSheet | null;
  formValues: Record<string, Record<string, any>>;
  setFormValues: (values: Record<string, Record<string, any>> | ((prev: Record<string, Record<string, any>>) => Record<string, Record<string, any>>)) => void;
  isMultiStep: boolean;
  getAllSectionsJson: LogSheetSection[];
  getDateFieldKeys: () => Set<string>;
  onSave: (structuredFormData?: Record<string, any>) => void;
  currentSectionId?: string;
}

/**
 * Hook to handle form submission and data changes
 * FormViewer already provides normalized data - we only need to:
 * 1. Track changes per section (for multi-step)
 * 2. Convert date strings to ISO for API
 * 3. Restructure data to API format
 */
export const useFormSubmission = ({
  logSheet,
  formValues,
  setFormValues,
  isMultiStep,
  getAllSectionsJson,
  getDateFieldKeys,
  onSave,
  currentSectionId,
}: UseFormSubmissionProps) => {
  // Structure form data back to API format with date conversion to ISO strings
  const structureFormDataForAPI = useMemo(() => {
    return (allFormData?: Record<string, any>): Record<string, any> => {
      // Get date field keys for conversion (FormViewer returns formatted strings, API needs ISO)
      const dateFieldKeys = getDateFieldKeys();

      if (isMultiStep) {
        // For multi-step, structure data by section_id from formValues (already per-section)
        const structured: Record<string, any> = {};

        getAllSectionsJson.forEach((section) => {
          const sectionData: Record<string, any> = {};

          // Get existing data for this section first (to preserve any data not in current form)
          const existingSection = logSheet?.form_data?.[section.section_id];
          if (existingSection?.data) {
            Object.assign(sectionData, existingSection.data);
          }

          // Get data from formValues for this section (formValues is structured per section)
          const sectionFormData = formValues[section.section_id] || {};
          Object.assign(sectionData, sectionFormData);

          // If allFormData is provided (from onSubmit), merge it (current section's data)
          if (allFormData) {
            Object.assign(sectionData, allFormData);
          }

          // Convert date strings to ISO strings before saving (FormViewer returns formatted strings)
          const convertedSectionData = convertDatesToISOInObject(
            sectionData,
            dateFieldKeys
          );

          structured[section.section_id] = {
            data: convertedSectionData,
            order: section.order,
            section_name: section.section_name,
          };
        });

        return structured;
      } else {
        // For single form, combine all formValues and structure under a single section
        const structured: Record<string, any> = {};

        // Combine all formValues (for single form, it's stored under 'default' key)
        const combinedData: Record<string, any> = {};
        Object.values(formValues).forEach((sectionData) => {
          Object.assign(combinedData, sectionData);
        });
        // If allFormData is provided (from onSubmit), merge it
        if (allFormData) {
          Object.assign(combinedData, allFormData);
        }

        // Convert date strings to ISO strings before saving
        const convertedFormData = convertDatesToISOInObject(
          combinedData,
          dateFieldKeys
        );

        // Try to preserve existing section structure if available
        if (logSheet?.form_data && Object.keys(logSheet.form_data).length > 0) {
          // Use the first section_id from existing form_data
          const firstSectionId = Object.keys(logSheet.form_data)[0];
          const existingSection = logSheet.form_data[firstSectionId];

          structured[firstSectionId] = {
            data: convertedFormData,
            order: existingSection?.order || 1,
            section_name: existingSection?.section_name || "Form",
          };
        } else {
          // Create a default section
          structured["section_1"] = {
            data: convertedFormData,
            order: 1,
            section_name: "Form",
          };
        }

        return structured;
      }
    };
  }, [isMultiStep, getAllSectionsJson, logSheet?.form_data, getDateFieldKeys, formValues]);

  // Handle real-time form data changes via onFormDataChange
  // FormViewer already provides normalized data - we just track it per section
  const handleFormDataChange = useMemo(() => {
    return (formData: any) => {
      // FormViewer provides normalized data - no normalization needed
      const currentFormData = formData?.data || {};

      if (isMultiStep && currentSectionId) {
        // For multi-step, track data per section
        setFormValues((prev) => ({
          ...prev,
          [currentSectionId]: currentFormData,
        }));
      } else {
        // For single form, track in default key
        setFormValues((prev) => ({
          ...prev,
          default: currentFormData,
        }));
      }
    };
  }, [isMultiStep, currentSectionId, setFormValues]);

  const onSubmit = (e: any) => {
    // FormViewer provides normalized data in e.data
    const currentFormData = e.data || {};

    // Update formValues with current section's data
    if (isMultiStep && currentSectionId) {
      setFormValues((prev) => ({
        ...prev,
        [currentSectionId]: currentFormData,
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        default: currentFormData,
      }));
    }

    // Combine all section data for submission
    const allFormData: Record<string, any> = {};
    Object.values(formValues).forEach((sectionData) => {
      Object.assign(allFormData, sectionData);
    });
    // Add current form data
    Object.assign(allFormData, currentFormData);

    // Structure the data for API
    const structuredData = structureFormDataForAPI(allFormData);

    // Call onSave with structured data
    onSave(structuredData);
  };

  const actions = useMemo(() => ({ onSubmit }), [
    formValues,
    structureFormDataForAPI,
    onSave,
    isMultiStep,
    currentSectionId,
    setFormValues,
  ]);

  return {
    handleFormDataChange,
    onSubmit,
    actions,
    structureFormDataForAPI,
  };
};
