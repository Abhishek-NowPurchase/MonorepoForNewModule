import { useMemo } from "react";
import { LogSheet, LogSheetSection } from "../../../../shared/Api/dynamicLogSheet";
import type { StepperStep } from "../../../../shared/component";

export const useFormSections = (logSheet: LogSheet | null) => {
  // Get all sections sorted by order - check form_json.sections first, then logSheet.sections
  const getAllSectionsJson = useMemo((): LogSheetSection[] => {
    // Check if sections are in form_json.sections (multi-step form structure)
    const formJson = logSheet?.form_json;
    if (formJson && typeof formJson === "object" && "sections" in formJson) {
      const sections = (formJson as any).sections;
      if (Array.isArray(sections) && sections.length > 0) {
        const sorted = [...sections].sort(
          (a: LogSheetSection, b: LogSheetSection) => a.order - b.order
        );
        return sorted;
      }
    }

    // Fallback to logSheet.sections if it exists
    if (logSheet?.sections && Array.isArray(logSheet.sections)) {
      const sorted = [...logSheet.sections].sort((a, b) => a.order - b.order);
      return sorted;
    }

    return [];
  }, [logSheet]);

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

  // Convert sections to StepperStep format
  const stepperSteps: StepperStep[] = useMemo(() => {
    return getAllSectionsJson.map((section) => ({
      id: section.section_id,
      label: section.section_name,
    }));
  }, [getAllSectionsJson]);

  return {
    getAllSectionsJson,
    isMultiStep,
    stepperSteps,
  };
};

