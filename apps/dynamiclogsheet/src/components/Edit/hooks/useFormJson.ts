import { useMemo } from "react";
import { LogSheet, LogSheetSection } from "../../../../../shared/Api/dynamicLogSheet";
import { parseFormJson, stringifyFormJson, validateFormJson } from "../../../../../shared/utils";

interface UseFormJsonProps {
  logSheet: LogSheet | null;
  getAllSectionsJson: LogSheetSection[];
  selectedSectionIndex: number;
}

/**
 * Hook to extract and parse form JSON from LogSheet structure
 * Uses shared formJsonUtils for parsing/validation
 */
export const useFormJson = ({
  logSheet,
  getAllSectionsJson,
  selectedSectionIndex,
}: UseFormJsonProps) => {
  // Get form JSON for single form - extract the actual form definition
  const getFormJson = useMemo(() => {
    const formJson = logSheet?.form_json;
    if (!formJson) {
      return "";
    }

    // Parse using shared utility
    const parsed = parseFormJson(formJson);
    if (!parsed) {
      return "";
    }

    // If it's an object, check if it has a 'form' property (single form) or 'sections' (multi-step)
    if (typeof parsed === "object") {
      // For single form, the form definition is in form_json.form
      if ("form" in parsed) {
        return stringifyFormJson(parsed);
      }

      // If it has sections, it's a multi-step form, so we shouldn't use this for single form
      if ("sections" in parsed) {
        return "";
      }

      // Otherwise, stringify the whole object
      return stringifyFormJson(parsed);
    }

    return "";
  }, [logSheet]);

  // Get form JSON for a specific section
  const getSectionFormJson = useMemo(() => {
    return (section: LogSheetSection): string => {
      if (!section?.form_json) {
        return "";
      }

      // Parse and validate using shared utilities
      const parsed = parseFormJson(section.form_json);
      if (!parsed) {
        return "";
      }

      // If already a string and valid, return it
      if (typeof section.form_json === "string" && validateFormJson(section.form_json)) {
        return section.form_json;
      }

      // Otherwise, stringify the parsed object
      return stringifyFormJson(parsed);
    };
  }, []);

  // Get form function for single form
  const getForm = useMemo(() => {
    return () => {
      return getFormJson;
    };
  }, [getFormJson]);

  // Get form function for current section
  const getCurrentSectionForm = useMemo(() => {
    return () => {
      const sections = getAllSectionsJson;

      if (sections.length > 0 && sections[selectedSectionIndex]) {
        const section = sections[selectedSectionIndex];
        return getSectionFormJson(section);
      }
      return "";
    };
  }, [getAllSectionsJson, selectedSectionIndex, getSectionFormJson]);

  return {
    getForm,
    getCurrentSectionForm,
    getFormJson,
  };
};
