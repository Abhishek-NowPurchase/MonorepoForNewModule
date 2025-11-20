import { useMemo } from "react";
import { LogSheet } from "../../../../../shared/Api/dynamicLogSheet";
import { DATE_FIELD_TYPES } from "../constants";

/**
 * Hook to extract date field keys from form structure
 * NOTE: This is ONLY needed for API submission (converting formatted date strings to ISO)
 * FormViewer handles date prefilling automatically via initialData - no conversion needed
 */
export const useDateFieldKeys = (logSheet: LogSheet | null) => {
  const getDateFieldKeys = useMemo(() => {
    return (): Set<string> => {
      const dateKeys = new Set<string>();

      try {
        const formJson = logSheet?.form_json;
        if (!formJson) {
          return dateKeys;
        }

        // Handle multi-step form
        if (typeof formJson === "object" && "sections" in formJson) {
          const sections = (formJson as any).sections;
          if (Array.isArray(sections)) {
            sections.forEach((section: any) => {
              if (section?.form_json) {
                const sectionFormJson =
                  typeof section.form_json === "string"
                    ? JSON.parse(section.form_json)
                    : section.form_json;
                const form = sectionFormJson?.form;
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
              }
            });
          }
        }
        // Handle single form
        else if (typeof formJson === "object" && "form" in formJson) {
          const form = (formJson as any).form;
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
        }
        // Handle string form_json
        else if (typeof formJson === "string") {
          try {
            const parsed = JSON.parse(formJson);
            if (parsed?.form?.children) {
              parsed.form.children.forEach((child: any) => {
                if (
                  child?.type &&
                  DATE_FIELD_TYPES.includes(child.type) &&
                  child?.key
                ) {
                  dateKeys.add(child.key);
                }
              });
            }
          } catch (e) {
            // Error parsing string form_json
          }
        }
      } catch (error) {
        // Error extracting date fields
      }

      return dateKeys;
    };
  }, [logSheet?.form_json]);

  return { getDateFieldKeys };
};

