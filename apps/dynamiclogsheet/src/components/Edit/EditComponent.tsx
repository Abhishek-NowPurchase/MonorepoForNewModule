import React from "react";
import {
  formEngineRsuiteCssLoader,
  ltrCssLoader,
  rsAutoComplete,
  rsBreadcrumb,
  rsButton,
  rsCalendar,
  rsCard,
  rsCheckbox,
  rsContainer,
  rsDatePicker,
  rsDivider,
  rsDropdown,
  rsErrorMessage,
  rsHeader,
  rsImage,
  rsInput,
  rsLabel,
  rsLink,
  rsMenu,
  rsMessage,
  rsModal,
  rsModalLayout,
  rsNumberFormat,
  rsPatternFormat,
  rsPlaceholderGraph,
  rsPlaceholderGrid,
  rsPlaceholderParagraph,
  rsProgressCircle,
  rsProgressLine,
  rsRadioGroup,
  rsSearch,
  rsStaticContent,
  rsTab,
  rsTagPicker,
  rsTextArea,
  rsTimePicker,
  rsToggle,
  rsTooltip,
  rsUploader,
  rsWizard,
  rsWizardStep,
  RsLocalizationWrapper,
} from "@react-form-builder/components-rsuite";
import {
  BiDi,
  buildForm,
  createView,
  FormViewer,
} from "@react-form-builder/core";
import { useMemo, useState, useEffect, useRef } from "react";
import { LogSheet, LogSheetSection } from "../../pages/Edit/types";
import { FormData } from "../../pages/Edit/hooks";
import { Loader } from "../../../../shared/component";
import "../../pages/Edit/Edit.scss";

const components = [
  rsAutoComplete,
  rsBreadcrumb,
  rsButton,
  rsCalendar,
  rsCard,
  rsCheckbox,
  rsContainer,
  rsDatePicker,
  rsDivider,
  rsDropdown,
  rsErrorMessage,
  rsHeader,
  rsImage,
  rsInput,
  rsLabel,
  rsLink,
  rsMenu,
  rsMessage,
  rsModal,
  rsModalLayout,
  rsNumberFormat,
  rsPatternFormat,
  rsPlaceholderGraph,
  rsPlaceholderGrid,
  rsPlaceholderParagraph,
  rsProgressCircle,
  rsProgressLine,
  rsRadioGroup,
  rsSearch,
  rsStaticContent,
  rsTab,
  rsTagPicker,
  rsTextArea,
  rsTimePicker,
  rsToggle,
  rsTooltip,
  rsUploader,
  rsWizard,
  rsWizardStep,
].map((def) => def.build().model);

const viewWithCss = createView(components)
  .withViewerWrapper(RsLocalizationWrapper)
  .withCssLoader(BiDi.LTR, ltrCssLoader)
  .withCssLoader("common", formEngineRsuiteCssLoader);

interface EditComponentProps {
  logSheet: LogSheet | null;
  formData: FormData;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  onInputChange: (field: keyof FormData, value: string) => void;
  onCancel: () => void;
  onSave: (structuredFormData?: Record<string, any>) => void;
}

const EditComponent: React.FC<EditComponentProps> = ({
  logSheet,
  formData,
  isLoading,
  isSaving,
  error,
  onInputChange,
  onCancel,
  onSave,
}) => {
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  
  // Debug logging
  useEffect(() => {
  console.log("=== EditComponent Debug ===");
  console.log("logSheet:", logSheet);
  console.log("logSheet?.form_type:", logSheet?.form_type);
  console.log("logSheet?.form_json:", logSheet?.form_json);
  console.log("logSheet?.form_data:", logSheet?.form_data);
    console.log("logSheet?.form_json type:", typeof logSheet?.form_json);
    if (logSheet?.form_json && typeof logSheet.form_json === "object") {
      console.log("form_json keys:", Object.keys(logSheet.form_json));
      console.log("form_json.sections:", (logSheet.form_json as any)?.sections);
      console.log("form_json.form:", (logSheet.form_json as any)?.form);
    }
  }, [logSheet]);

  // Date field types that need conversion from ISO strings to Date objects
  const DATE_FIELD_TYPES = ['RsDatePicker', 'RsCalendar', 'RsTimePicker'];
  
  // Extract all date field keys from form_json structure
  const getDateFieldKeys = useMemo(() => {
    return (): Set<string> => {
      const dateKeys = new Set<string>();
      
      try {
        const formJson = logSheet?.form_json;
        if (!formJson) {
          console.log("getDateFieldKeys - No form_json found");
          return dateKeys;
        }

        // Handle multi-step form
        if (typeof formJson === "object" && "sections" in formJson) {
          const sections = (formJson as any).sections;
          if (Array.isArray(sections)) {
            sections.forEach((section: any) => {
              if (section?.form_json) {
                const sectionFormJson = typeof section.form_json === 'string' 
                  ? JSON.parse(section.form_json) 
                  : section.form_json;
                const form = sectionFormJson?.form;
                if (form?.children && Array.isArray(form.children)) {
                  form.children.forEach((child: any) => {
                    if (child?.type && DATE_FIELD_TYPES.includes(child.type) && child?.key) {
                      dateKeys.add(child.key);
                      console.log(`getDateFieldKeys - Found date field: ${child.key} (type: ${child.type})`);
                    }
                  });
                }
              }
            });
          }
        } 
        // Handle single form
        else if (typeof formJson === "object" && "form" in formJson) {
          const form = (formJson as any).form;
          if (form?.children && Array.isArray(form.children)) {
            form.children.forEach((child: any) => {
              if (child?.type && DATE_FIELD_TYPES.includes(child.type) && child?.key) {
                dateKeys.add(child.key);
                console.log(`getDateFieldKeys - Found date field: ${child.key} (type: ${child.type})`);
              }
            });
          }
        }
        // Handle string form_json
        else if (typeof formJson === "string") {
          try {
            const parsed = JSON.parse(formJson);
            if (parsed?.form?.children) {
              parsed.form.children.forEach((child: any) => {
                if (child?.type && DATE_FIELD_TYPES.includes(child.type) && child?.key) {
                  dateKeys.add(child.key);
                  console.log(`getDateFieldKeys - Found date field: ${child.key} (type: ${child.type})`);
                }
              });
            }
          } catch (e) {
            console.error("getDateFieldKeys - Error parsing string form_json:", e);
          }
        }

        console.log("getDateFieldKeys - Total date fields found:", dateKeys.size);
        console.log("getDateFieldKeys - Date field keys:", Array.from(dateKeys));
      } catch (error) {
        console.error("getDateFieldKeys - Error extracting date fields:", error);
      }

      return dateKeys;
    };
  }, [logSheet?.form_json]);

  // Helper function to convert ISO date string to Date object
  const convertDateStringToDate = (value: any, fieldKey: string, dateFieldKeys: Set<string>): any => {
    if (!dateFieldKeys.has(fieldKey)) {
      return value; // Not a date field, return as-is
    }

    if (value === null || value === undefined || value === '') {
      return value; // Empty value, return as-is
    }

    // If already a Date object, return as-is
    if (value instanceof Date) {
      console.log(`convertDateStringToDate - ${fieldKey} is already a Date object`);
      return value;
    }

    // If it's a string, try to parse as ISO date
    if (typeof value === 'string') {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          console.log(`convertDateStringToDate - Converted ${fieldKey} from "${value}" to Date:`, date);
          return date;
    } else {
          console.warn(`convertDateStringToDate - Invalid date string for ${fieldKey}: "${value}"`);
          return value; // Return original if invalid
        }
      } catch (e) {
        console.error(`convertDateStringToDate - Error converting ${fieldKey}:`, e);
        return value; // Return original on error
      }
    }

    return value; // Return as-is if not a string
  };

  // Helper function to convert Date object to ISO string for API
  const convertDateToISOString = (value: any): any => {
    if (value instanceof Date) {
      const isoString = value.toISOString();
      console.log(`convertDateToISOString - Converted Date to ISO string: ${isoString}`);
      return isoString;
    }
    return value; // Return as-is if not a Date
  };

  // Get all sections sorted by order - check form_json.sections first, then logSheet.sections
  const getAllSectionsJson = useMemo((): LogSheetSection[] => {
    // Check if sections are in form_json.sections (multi-step form structure)
    const formJson = logSheet?.form_json;
    if (formJson && typeof formJson === "object" && "sections" in formJson) {
      const sections = (formJson as any).sections;
      console.log(
        "getAllSectionsJson - Found sections in form_json.sections:",
        sections
      );
      if (Array.isArray(sections) && sections.length > 0) {
        const sorted = [...sections].sort(
          (a: LogSheetSection, b: LogSheetSection) => a.order - b.order
        );
        console.log(
          "getAllSectionsJson - Sorted sections from form_json:",
          sorted
        );
        return sorted;
      }
    }

    // Fallback to logSheet.sections if it exists
    if (logSheet?.sections && Array.isArray(logSheet.sections)) {
      console.log(
        "getAllSectionsJson - Found sections in logSheet.sections:",
        logSheet.sections
      );
      const sorted = [...logSheet.sections].sort((a, b) => a.order - b.order);
      console.log(
        "getAllSectionsJson - Sorted sections from logSheet:",
        sorted
      );
      return sorted;
    }

    console.log(
      "getAllSectionsJson - No sections found, returning empty array"
    );
    return [];
  }, [logSheet]);

  // Extract and flatten form_data for prefilling with date conversion
  const getInitialFormData = useMemo(() => {
    return (): Record<string, any> => {
      console.log("=== getInitialFormData CALLED ===");
      
      if (!logSheet?.form_data) {
        console.log("getInitialFormData - No form_data found");
        return {};
      }

      // Get date field keys
      const dateFieldKeys = getDateFieldKeys();
      console.log("getInitialFormData - Date field keys:", Array.from(dateFieldKeys));

      const flattened: Record<string, any> = {};
      
      // Flatten all form_data from all sections
      Object.values(logSheet.form_data).forEach((section: any) => {
        if (section?.data && typeof section.data === 'object') {
          Object.entries(section.data).forEach(([key, value]) => {
            // Convert date strings to Date objects
            const convertedValue = convertDateStringToDate(value, key, dateFieldKeys);
            flattened[key] = convertedValue;
            console.log(`getInitialFormData - Field ${key}: ${typeof value} -> ${typeof convertedValue}`, {
              original: value,
              converted: convertedValue
            });
          });
        }
      });

      console.log("getInitialFormData - Flattened form data (with date conversion):", flattened);
      console.log("getInitialFormData - Flattened keys:", Object.keys(flattened));
      console.log("=== getInitialFormData COMPLETED ===");
      return flattened;
    };
  }, [logSheet?.form_data, getDateFieldKeys]);

  // Detect multi-step: check if form_json has sections array, or form_type is 'multi-step'
  const isMultiStep = useMemo(() => {
    const formJson = logSheet?.form_json;
    const hasSectionsInFormJson =
      formJson &&
      typeof formJson === "object" &&
      "sections" in formJson &&
      Array.isArray((formJson as any).sections) &&
      (formJson as any).sections.length > 0;
    const hasFormType = logSheet?.form_type === "multi-step";
    const hasSections = getAllSectionsJson.length > 0;

    const result = (hasFormType || hasSectionsInFormJson) && hasSections;
    return result;
  }, [logSheet?.form_type, logSheet?.form_json, getAllSectionsJson.length]);

  // Get initial data for current section (multi-step) or entire form (single) with date conversion
  const getInitialDataForCurrentForm = useMemo(() => {
    return (): Record<string, any> => {
      console.log("=== getInitialDataForCurrentForm CALLED ===");
      console.log("getInitialDataForCurrentForm - isMultiStep:", isMultiStep);
      console.log("getInitialDataForCurrentForm - selectedSectionIndex:", selectedSectionIndex);
      
      // Get date field keys
      const dateFieldKeys = getDateFieldKeys();
      console.log("getInitialDataForCurrentForm - Date field keys:", Array.from(dateFieldKeys));
      
      if (isMultiStep) {
        // For multi-step, get data for current section only
        const currentSection = getAllSectionsJson[selectedSectionIndex];
        if (!currentSection || !logSheet?.form_data) {
          console.log("getInitialDataForCurrentForm - No current section or form_data");
          return {};
        }

        const sectionData = logSheet.form_data[currentSection.section_id];
        if (sectionData?.data) {
          console.log(`getInitialDataForCurrentForm - Section ${currentSection.section_id} raw data:`, sectionData.data);
          
          // Convert date strings to Date objects
          const convertedData: Record<string, any> = {};
          Object.entries(sectionData.data).forEach(([key, value]) => {
            const convertedValue = convertDateStringToDate(value, key, dateFieldKeys);
            convertedData[key] = convertedValue;
            if (dateFieldKeys.has(key)) {
              console.log(`getInitialDataForCurrentForm - Converted date field ${key}:`, {
                original: value,
                converted: convertedValue,
                originalType: typeof value,
                convertedType: typeof convertedValue
              });
            }
          });
          
          console.log(`getInitialDataForCurrentForm - Section ${currentSection.section_id} converted data:`, convertedData);
          console.log("=== getInitialDataForCurrentForm COMPLETED (multi-step) ===");
          return convertedData;
        }
        console.log("getInitialDataForCurrentForm - No section data found");
        return {};
      } else {
        // For single form, return all flattened data (already has date conversion)
        const data = getInitialFormData();
        console.log("getInitialDataForCurrentForm - Single form data:", data);
        console.log("=== getInitialDataForCurrentForm COMPLETED (single) ===");
        return data;
      }
    };
  }, [isMultiStep, getAllSectionsJson, selectedSectionIndex, logSheet?.form_data, getInitialFormData, getDateFieldKeys]);

  // Initialize formValues when logSheet changes
  useEffect(() => {
    if (logSheet?.form_data) {
      const initialData = getInitialFormData();
      console.log("=== INITIALIZING formValues ===");
      console.log("Initial formValues from form_data:", initialData);
      console.log("Initial formValues keys:", Object.keys(initialData));
      console.log("Initial formValues count:", Object.keys(initialData).length);
      setFormValues(initialData);
      console.log("=== formValues INITIALIZED ===");
    }
  }, [logSheet?.form_data, getInitialFormData]);

  // Log formValues changes
  useEffect(() => {
    console.log("=== formValues STATE CHANGED ===");
    console.log("Current formValues:", formValues);
    console.log("formValues keys:", Object.keys(formValues));
    console.log("formValues count:", Object.keys(formValues).length);
    console.log("formValues entries:", Object.entries(formValues));
    console.log("=== formValues STATE LOGGED ===");
  }, [formValues]);

  // Reset selected section index when sections change
  useEffect(() => {
    if (
      getAllSectionsJson.length > 0 &&
      selectedSectionIndex >= getAllSectionsJson.length
    ) {
      setSelectedSectionIndex(0);
    }
  }, [getAllSectionsJson.length, selectedSectionIndex]);

  // Get form JSON for single form - extract the actual form definition
  const getFormJson = useMemo(() => {
    try {
      const formJson = logSheet?.form_json;
      console.log("getFormJson - formJson:", formJson);
      console.log("getFormJson - formJson type:", typeof formJson);

      if (!formJson) {
        console.log("getFormJson - No form_json, returning empty string");
        return "";
      }

      // If it's already a string, try to parse it first to validate
      if (typeof formJson === "string") {
        if (formJson.trim() === "") {
          console.log("getFormJson - Empty string, returning empty string");
          return "";
        }
        try {
          // Validate it's valid JSON
          JSON.parse(formJson);
          console.log("getFormJson - Valid JSON string, returning as is");
          return formJson;
        } catch (e) {
          console.error("getFormJson - Invalid JSON string:", e);
          return "";
        }
      }

      // If it's an object, check if it has a 'form' property (single form) or 'sections' (multi-step)
      if (typeof formJson === "object") {
        // For single form, the form definition is in form_json.form
        if ("form" in formJson) {
          const formDefinition = (formJson as any).form;
          console.log(
            "getFormJson - Found form property, extracting form definition"
          );
          try {
            const stringified = JSON.stringify(formJson); // Return the whole form_json object
            console.log(
              "getFormJson - Stringified form_json with form property, length:",
              stringified.length
            );
            return stringified;
          } catch (e) {
            console.error("getFormJson - Error stringifying form object:", e);
            return "";
          }
        }

        // If it has sections, it's a multi-step form, so we shouldn't use this for single form
        if ("sections" in formJson) {
          console.log(
            "getFormJson - form_json has sections (multi-step), returning empty for single form"
          );
          return "";
        }

        // Otherwise, stringify the whole object
        try {
          const stringified = JSON.stringify(formJson);
          console.log(
            "getFormJson - Stringified object, length:",
            stringified.length
          );
          return stringified;
        } catch (e) {
          console.error("getFormJson - Error stringifying object:", e);
          return "";
        }
      }

      return "";
    } catch (error) {
      console.error("getFormJson - Unexpected error:", error);
      return "";
    }
  }, [logSheet]);

  // Get form JSON for a specific section
  const getSectionFormJson = useMemo(() => {
    return (section: LogSheetSection): string => {
      try {
        console.log("getSectionFormJson - section:", section);
        if (!section?.form_json) {
          console.log("getSectionFormJson - No form_json in section");
          return "";
        }

        const formJson = section.form_json;
        console.log("getSectionFormJson - formJson type:", typeof formJson);

        // If it's already a string, validate it
        if (typeof formJson === "string") {
          if (formJson.trim() === "") {
            return "";
          }
          try {
            JSON.parse(formJson);
            return formJson;
          } catch (e) {
            console.error("getSectionFormJson - Invalid JSON string:", e);
            return "";
          }
        }

        // If it's an object, stringify it
        try {
          return JSON.stringify(formJson);
        } catch (e) {
          console.error("getSectionFormJson - Error stringifying:", e);
          return "";
        }
      } catch (error) {
        console.error("getSectionFormJson - Unexpected error:", error);
        return "";
      }
    };
  }, []);

  // Get form function for single form
  const getForm = useMemo(() => {
    return () => {
      const form = getFormJson;
      console.log("getForm called - returning form, length:", form.length);
      return form;
    };
  }, [getFormJson]);

  // Get form function for current section
  const getCurrentSectionForm = useMemo(() => {
    return () => {
      const sections = getAllSectionsJson;
      console.log(
        "getCurrentSectionForm called - selectedSectionIndex:",
        selectedSectionIndex
      );
      console.log("getCurrentSectionForm - sections.length:", sections.length);

      if (sections.length > 0 && sections[selectedSectionIndex]) {
        const section = sections[selectedSectionIndex];
        console.log("getCurrentSectionForm - section:", section);
        const sectionForm = getSectionFormJson(section);
        console.log(
          "getCurrentSectionForm - sectionForm length:",
          sectionForm.length
        );
        return sectionForm;
      }
      console.log(
        "getCurrentSectionForm - No section found, returning empty string"
      );
      return "";
    };
  }, [getAllSectionsJson, selectedSectionIndex, getSectionFormJson]);

  // Structure form data back to API format with date conversion to ISO strings
  const structureFormDataForAPI = useMemo(() => {
    return (allFormData: Record<string, any>): Record<string, any> => {
      console.log("=== structureFormDataForAPI CALLED ===");
      console.log("structureFormDataForAPI - Input allFormData:", allFormData);
      console.log("structureFormDataForAPI - isMultiStep:", isMultiStep);
      
      // Get date field keys for conversion
      const dateFieldKeys = getDateFieldKeys();
      console.log("structureFormDataForAPI - Date field keys:", Array.from(dateFieldKeys));
      
      // Helper to convert Date objects to ISO strings in data object
      const convertDatesToISO = (data: Record<string, any>): Record<string, any> => {
        const converted: Record<string, any> = {};
        Object.entries(data).forEach(([key, value]) => {
          if (dateFieldKeys.has(key)) {
            converted[key] = convertDateToISOString(value);
            console.log(`structureFormDataForAPI - Converted date field ${key}:`, {
              original: value,
              converted: converted[key],
              originalType: typeof value,
              convertedType: typeof converted[key]
            });
          } else {
            converted[key] = value;
          }
        });
        return converted;
      };
      
      if (isMultiStep) {
        // For multi-step, structure data by section_id
        const structured: Record<string, any> = {};
        
        getAllSectionsJson.forEach((section) => {
          const sectionData: Record<string, any> = {};
          
          // Get existing data for this section first (to preserve any data not in current form)
          const existingSection = logSheet?.form_data?.[section.section_id];
          if (existingSection?.data) {
            Object.assign(sectionData, existingSection.data);
          }
          
          // Extract data for this section's fields from allFormData
          if (section.form_json && typeof section.form_json === 'object') {
            const formDef = (section.form_json as any).form;
            if (formDef?.children && Array.isArray(formDef.children)) {
              formDef.children.forEach((child: any) => {
                const fieldKey = child.key;
                if (fieldKey && allFormData[fieldKey] !== undefined) {
                  sectionData[fieldKey] = allFormData[fieldKey];
                }
              });
            }
          }
          
          // Convert Date objects to ISO strings before saving
          const convertedSectionData = convertDatesToISO(sectionData);
          
          structured[section.section_id] = {
            data: convertedSectionData,
            order: section.order,
            section_name: section.section_name
          };
          
          console.log(`structureFormDataForAPI - Section ${section.section_id} structured:`, structured[section.section_id]);
        });
        
        console.log("structureFormDataForAPI - Multi-step structured data:", structured);
        console.log("=== structureFormDataForAPI COMPLETED (multi-step) ===");
        return structured;
      } else {
        // For single form, structure all data under a single section or use existing structure
        const structured: Record<string, any> = {};
        
        // Convert Date objects to ISO strings before saving
        const convertedFormData = convertDatesToISO(allFormData);
        
        // Try to preserve existing section structure if available
        if (logSheet?.form_data && Object.keys(logSheet.form_data).length > 0) {
          // Use the first section_id from existing form_data
          const firstSectionId = Object.keys(logSheet.form_data)[0];
          const existingSection = logSheet.form_data[firstSectionId];
          
          structured[firstSectionId] = {
            data: convertedFormData,
            order: existingSection?.order || 1,
            section_name: existingSection?.section_name || 'Form'
          };
        } else {
          // Create a default section
          structured['section_1'] = {
            data: convertedFormData,
            order: 1,
            section_name: 'Form'
          };
        }
        
        console.log("structureFormDataForAPI - Single form structured data:", structured);
        console.log("=== structureFormDataForAPI COMPLETED (single) ===");
        return structured;
      }
    };
  }, [isMultiStep, getAllSectionsJson, logSheet?.form_data, getDateFieldKeys]);

  // Refs to prevent infinite loops
  const isUpdatingRef = useRef(false);
  const lastFormDataStringRef = useRef<string>('');
  
  // Handle real-time form data changes via onFormDataChange
  const handleFormDataChange = useMemo(() => {
    return (formData: any) => {
      // Prevent infinite loops - skip if already updating
      if (isUpdatingRef.current) {
        console.log("onFormDataChange - Update in progress, skipping duplicate call");
        return;
      }
      
      try {
        console.log("=== onFormDataChange TRIGGERED ===");
        console.log("onFormDataChange - Full formData object:", formData);
        console.log("onFormDataChange - formData type:", typeof formData);
        console.log("onFormDataChange - formData keys:", formData ? Object.keys(formData) : "null");
        
        // Extract the actual form data from IFormData interface
        const currentFormData = formData?.data || {};
        
        // Create normalized string representation for comparison
        // Sort keys to ensure consistent comparison even if order changes
        const sortedKeys = Object.keys(currentFormData).sort();
        const normalizedData: Record<string, any> = {};
        sortedKeys.forEach(key => {
          // Handle Date objects by converting to ISO string for comparison
          const value = currentFormData[key];
          normalizedData[key] = value instanceof Date ? value.toISOString() : value;
        });
        const currentFormDataString = JSON.stringify(normalizedData);
        
        // Only update if data actually changed
        if (lastFormDataStringRef.current === currentFormDataString) {
          console.log("onFormDataChange - Data unchanged, skipping update");
          return;
        }
        
        console.log("onFormDataChange - Data changed! Extracted currentFormData:", currentFormData);
        console.log("onFormDataChange - currentFormData keys:", Object.keys(currentFormData));
        console.log("onFormDataChange - currentFormData values:", Object.entries(currentFormData));
        
        // Set flag to prevent re-entry
        isUpdatingRef.current = true;
        lastFormDataStringRef.current = currentFormDataString;
        
        // Use functional update to avoid dependency on formValues
        setFormValues((prevFormValues) => {
          console.log("onFormDataChange - Previous formValues:", prevFormValues);
          console.log("onFormDataChange - Previous formValues keys:", Object.keys(prevFormValues));
          
          // Merge with existing form values to maintain all field data
          const updatedFormValues = {
            ...prevFormValues,
            ...currentFormData
          };
          
          console.log("onFormDataChange - Merged updatedFormValues:", updatedFormValues);
          console.log("onFormDataChange - Updated formValues keys:", Object.keys(updatedFormValues));
          console.log("onFormDataChange - Updated formValues count:", Object.keys(updatedFormValues).length);
          console.log("=== onFormDataChange COMPLETED ===");
          
          // Reset flag after state update is queued (use setTimeout to allow React to process)
          setTimeout(() => {
            isUpdatingRef.current = false;
            console.log("onFormDataChange - Update flag reset, ready for next change");
          }, 100);
          
          return updatedFormValues;
        });
      } catch (error) {
        console.error("=== onFormDataChange ERROR ===");
        console.error("onFormDataChange - Error handling form data change:", error);
        console.error("onFormDataChange - Error stack:", error instanceof Error ? error.stack : "No stack");
        isUpdatingRef.current = false;
      }
    };
  }, []); // No dependencies - uses functional update pattern

  const onSubmit = (e: any) => {
    console.log("=== onSubmit TRIGGERED ===");
    console.log("onSubmit - Full event object:", e);
    console.log("onSubmit - Event data received:", e.data);
    console.log("onSubmit - Event data type:", typeof e.data);
    console.log("onSubmit - Event data keys:", e.data ? Object.keys(e.data) : "null");
    
    // Log each field in event data with type
    if (e.data) {
      Object.entries(e.data).forEach(([key, value]) => {
        console.log(`onSubmit - Event data[${key}]:`, {
          value,
          type: typeof value,
          isDate: value instanceof Date,
          stringified: value instanceof Date ? value.toISOString() : value
        });
      });
    }
    
    // Merge with existing form values
    console.log("onSubmit - Current formValues before merge:", formValues);
    console.log("onSubmit - Current formValues keys:", Object.keys(formValues));
    console.log("onSubmit - Current formValues count:", Object.keys(formValues).length);
    
    // Log each field in current formValues with type
    Object.entries(formValues).forEach(([key, value]) => {
      console.log(`onSubmit - formValues[${key}]:`, {
        value,
        type: typeof value,
        isDate: value instanceof Date,
        stringified: value instanceof Date ? value.toISOString() : value
      });
    });
    
    const updatedFormValues = {
      ...formValues,
      ...e.data
    };
    
    console.log("onSubmit - Updated formValues after merge:", updatedFormValues);
    console.log("onSubmit - Updated formValues keys:", Object.keys(updatedFormValues));
    console.log("onSubmit - Updated formValues count:", Object.keys(updatedFormValues).length);
    
    // Log each field after merge with type
    Object.entries(updatedFormValues).forEach(([key, value]) => {
      console.log(`onSubmit - updatedFormValues[${key}]:`, {
        value,
        type: typeof value,
        isDate: value instanceof Date,
        stringified: value instanceof Date ? value.toISOString() : value
      });
    });
    
    setFormValues(updatedFormValues);
    
    // Structure the data for API
    console.log("onSubmit - Structuring data for API...");
    const structuredData = structureFormDataForAPI(updatedFormValues);
    
    console.log("onSubmit - Structured form data:", structuredData);
    console.log("onSubmit - Structured data keys:", Object.keys(structuredData));
    
    // Log each section's data with detailed field information
    Object.entries(structuredData).forEach(([sectionId, sectionData]: [string, any]) => {
      console.log(`onSubmit - Structured section ${sectionId}:`, sectionData);
      if (sectionData?.data) {
        console.log(`onSubmit - Section ${sectionId} data keys:`, Object.keys(sectionData.data));
        Object.entries(sectionData.data).forEach(([key, value]) => {
          console.log(`onSubmit - Section ${sectionId} data[${key}]:`, {
            value,
            type: typeof value,
            isDate: value instanceof Date,
            stringified: value instanceof Date ? value.toISOString() : value
          });
        });
      }
    });
    
    console.log("onSubmit - Calling onSave with structured data...");
    console.log("=== onSubmit COMPLETED ===");
    
    // Call onSave with structured data
    onSave(structuredData);
  };

  const actions = useMemo(() => ({ onSubmit }), [formValues, structureFormDataForAPI, onSave]);

  const currentSection = getAllSectionsJson[selectedSectionIndex];

  // Debug logging for current section
  useEffect(() => {
    console.log("currentSection:", currentSection);
    console.log("selectedSectionIndex:", selectedSectionIndex);
  }, [currentSection, selectedSectionIndex]);

  // Show loader while loading
  if (isLoading) {
    return (
      <Loader
        size="medium"
        message="Loading form data..."
        fullScreen={true}
      />
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        paddingBottom: "80px", // Space for fixed footer
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        backgroundColor: "#fff",
      }}
    >
      {isMultiStep ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Horizontal Stepper */}
          <div
            style={{
            //   backgroundColor: "#fff",
              borderRadius: "8px",
            //   boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                width: "100%",
                maxWidth: "1200px",
                position: "relative",
              }}
            >
              {getAllSectionsJson.map((section, index) => {
                const isActive = selectedSectionIndex === index;
                const isCompleted = index < selectedSectionIndex;
                const isLast = index === getAllSectionsJson.length - 1;

                return (
                  <React.Fragment key={section.section_id}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1,
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                      {/* Step Circle */}
                      <div
                        onClick={() => setSelectedSectionIndex(index)}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor:
                            isActive || isCompleted ? "#1579BE" : "#e0e0e0",
                          color: isActive || isCompleted ? "#FFFFFF" : "#999",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                          fontSize: "14px",
                          lineHeight: "1",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          border: isActive
                            ? "2px solid #1579BE"
                            : "2px solid transparent",
                          boxShadow: isActive
                            ? "0 0 0 2px rgba(21, 121, 190, 0.1)"
                            : "none",
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        {isCompleted ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
            <path
                              d="M16.6667 5L7.50004 14.1667L3.33337 10"
              stroke="currentColor"
                              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
                        ) : (
                          index + 1
                        )}
      </div>

                      {/* Step Label */}
                      <div
                        style={{
                          marginTop: "12px",
                          textAlign: "center",
                          maxWidth: "150px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "13px",
                            fontFamily: "Oxanium, sans-serif",
                            fontWeight: isActive ? 600 : 400,
                            color: isActive
                              ? "#1579BE"
                              : isCompleted
                              ? "#1579BE"
                              : "#999",
                            transition: "all 0.3s ease",
                            lineHeight: "1.4",
                          }}
                        >
                      {section.section_name}
                    </div>
                  </div>
              </div>

                    {/* Connecting Line - Centered with circles */}
                    {!isLast && (
                      <div
                        style={{
                          flex: 1,
                          height: "0",
                          borderTop: "1px dashed #aaa",
                          margin: "0 8px",
                          marginTop: "12px", // Center of 24px circle (24/2 = 12px)
                          alignSelf: "flex-start",
                          zIndex: 0,
                          transition: "all 0.3s ease",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Section Content Area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            //   backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "24px",
            //   boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minHeight: 0,
              overflowY: "auto",
            }}
          >
            {currentSection && (
              <>
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                  }}
                >
                  {(() => {
                    const formData = getCurrentSectionForm();
                    console.log(
                      "Rendering FormViewer for section - formData length:",
                      formData?.length || 0
                    );
                    if (!formData || formData.trim() === "") {
                      return (
                        <div
                          style={{
                            padding: "24px",
                            textAlign: "center",
                            color: "#666",
                          }}
                        >
                          <p>No form data available for this section.</p>
                  </div>
                      );
                    }
                    try {
                      // Validate JSON before rendering
                      JSON.parse(formData);
                      return (
                    <FormViewer
                      view={viewWithCss}
                          formName={currentSection.section_name}
                          getForm={getCurrentSectionForm}
                      actions={actions}
                      initialData={getInitialDataForCurrentForm()}
                      onFormDataChange={handleFormDataChange}
                    />
                      );
                    } catch (e) {
                      console.error("Invalid JSON in section form:", e);
                      return (
                        <div
                          style={{
                            padding: "24px",
                            textAlign: "center",
                            color: "#d32f2f",
                          }}
                        >
                          <p>Error: Invalid form data format.</p>
                          <pre
                            style={{
                              marginTop: "16px",
                              fontSize: "12px",
                              textAlign: "left",
                            }}
                          >
                            {String(e)}
                          </pre>
                  </div>
                      );
                    }
                  })()}
                </div>
              </>
              )}
            </div>
          </div>
      ) : (
        <div
          style={{
            flex: 1,
            // backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "24px",
            // boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {(() => {
            const formData = getFormJson;
            console.log(
              "Rendering FormViewer for single form - formData length:",
              formData?.length || 0
            );
            if (!formData || formData.trim() === "") {
              return (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "#666",
                  }}
                >
                  <p>No form data available.</p>
                </div>
              );
            }
            try {
              // Validate JSON before rendering
              JSON.parse(formData);
              return (
                <FormViewer
                  view={viewWithCss}
                  formName={logSheet?.["from-name"] || logSheet?.name || "Form"}
                  getForm={getForm}
                  actions={actions}
                  initialData={getInitialDataForCurrentForm()}
                  onFormDataChange={handleFormDataChange}
                />
              );
            } catch (e) {
              console.error("Invalid JSON in single form:", e);
              return (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "#d32f2f",
                  }}
                >
                  <p>Error: Invalid form data format.</p>
                  <pre
                    style={{
                      marginTop: "16px",
                      fontSize: "12px",
                      textAlign: "left",
                    }}
                  >
                    {String(e)}
                  </pre>
                </div>
              );
            }
          })()}
        </div>
      )}

      {/* Footer with buttons */}
      <div className="edit-form-footer">
        <button
          data-variant="secondary"
          data-active="false"
          aria-busy={isSaving ? "true" : "false"}
          className="edit-form-btn edit-form-btn--secondary"
          type="button"
          aria-label="Creation cancelled"
          onClick={onCancel}
          disabled={isSaving}
        >
          <i className="ri-close-line"></i>
          CANCEL
        </button>
        <button
          data-variant="primary"
          data-active="false"
          aria-busy={isSaving ? "true" : "false"}
          className="edit-form-btn edit-form-btn--primary"
          type="button"
          onClick={() => {
            if (isMultiStep && selectedSectionIndex < getAllSectionsJson.length - 1) {
              // Move to next step
              console.log("=== MOVING TO NEXT STEP ===");
              console.log("Current step index:", selectedSectionIndex);
              console.log("Total steps:", getAllSectionsJson.length);
              console.log("Current formValues before step change:", formValues);
              setSelectedSectionIndex(selectedSectionIndex + 1);
            } else {
              // Submit the form - structure the latest formValues
              console.log("=== SUBMIT BUTTON CLICKED ===");
              console.log("Submit button - Current formValues:", formValues);
              console.log("Submit button - formValues keys:", Object.keys(formValues));
              console.log("Submit button - formValues count:", Object.keys(formValues).length);
              console.log("Submit button - formValues entries:", Object.entries(formValues));
              console.log("Submit button - Is multi-step:", isMultiStep);
              console.log("Submit button - Current section index:", selectedSectionIndex);
              
              // Structure the data for API
              console.log("Submit button - Structuring data for API...");
              const structuredData = structureFormDataForAPI(formValues);
              
              console.log("Submit button - Final structured data:", structuredData);
              console.log("Submit button - Structured data keys:", Object.keys(structuredData));
              console.log("Submit button - Calling onSave...");
              console.log("=== SUBMIT BUTTON PROCESSING COMPLETED ===");
              
              onSave(structuredData);
            }
          }}
          disabled={isSaving || isLoading}
        >
          {isSaving ? (
            <>
              <i
                className="ri-loader-4-line"
                style={{ animation: "spin 1s linear infinite" }}
              ></i>
              SAVING...
            </>
          ) : isMultiStep &&
            selectedSectionIndex < getAllSectionsJson.length - 1 ? (
            <>
              <i className="ri-check-line"></i>
              CONTINUE TO STEP {selectedSectionIndex + 2}
            </>
          ) : (
            <>
              <i className="ri-check-line"></i>
              SUBMIT
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditComponent;
