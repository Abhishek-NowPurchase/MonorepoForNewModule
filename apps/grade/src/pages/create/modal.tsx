import {
  FormModel,
  FieldSection,
  SectionedFormModel,
} from "@dynamic_forms/react";
import { createApiOptions } from "./apiOptions";
import { validateRawMaterialsCategories } from "../../components/custom/AdditionDilutionRenderer";

const loadElementsAsync = async (
  formValues: any
): Promise<{ value: any; label: string }[]> => {
  const elementsData = (window as any).elementsData;
  const targetChemistry = formValues?.targetChemistry || [];

  if (!elementsData || !Array.isArray(elementsData)) {
    return [];
  }

  const selectedElements = targetChemistry.map((item: any) => ({
    symbol: item.element || item.symbol,
    id: item.elementId || item.id,
  }));

  const options = elementsData
    .filter((element: any) => {
      const isSelectedBySymbol = selectedElements.some(
        (selected) => selected.symbol === element.symbol
      );
      const isSelectedById = selectedElements.some(
        (selected) => selected.id === element.id
      );
      return !(isSelectedBySymbol || isSelectedById);
    })
    .map((element: any) => ({
      value: element.id,
      label: element.symbol,
    }));

  return options;
};

const searchChargemixMaterialsAsync = async (
  formValues: any,
  searchQuery: string = ""
): Promise<{ value: any; label: string }[]> => {
  const itemInventoryData = (window as any).itemInventoryData;
  const chargemixMaterials = formValues?.chargemixMaterials || [];

  if (
    !itemInventoryData?.results ||
    !Array.isArray(itemInventoryData.results)
  ) {
    return [];
  }

  const selectedMaterialIds = chargemixMaterials.map(
    (item: any) => item.materialId || item.material
  );

  const options = itemInventoryData.results
    .filter((material: any) => !selectedMaterialIds.includes(material.id))
    .filter((material: any) => {
      if (searchQuery) {
        return material.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .map((material: any) => ({
      value: material.id,
      label: material.cm_type
        ? `${material.name} (${material.cm_type})`
        : material.name,
    }));

  return options;
};

const isSpectroAndBathReady = (watched: any) => {
  const result = watched.bathChemistry === "with" || watched.bathChemistry === "without";
  return result;
};

const isIfKioskAndBathReady = (watched: any) => {
  const userDetail = (window as any).userDetail;
  return (
    userDetail?.app_permissions?.heatlog?.includes("all") &&
    (watched.bathChemistry === "with" || watched.bathChemistry === "without")
  );
};

export const gradeConfigurationModel: FormModel = [
  // GRADE OVERVIEW STARTS HERE
  {
    key: "tagId",
    type: "text",
    label: "Tag ID",
    defaultValue: "",
    validators: {
      required: true,
    },
    section: { sectionId: "gradeOverview", order: 1 },
    meta: {
      helpText: "Unique alphanumeric identifier for spectrometer integration",
      placeholder: "e.g., DI-001",
    },
  },
  {
    key: "gradeName",
    type: "text",
    label: "Grade Name",
    defaultValue: "",
    validators: {
      required: true,
      custom: (value: any) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return ["Grade Name is required"];
        }
        if (value.trim().length < 2) {
          return ["Grade Name must be at least 2 characters"];
        }
        return [];
      },
    },
    section: { sectionId: "gradeOverview", order: 2 },
    meta: {
      placeholder: "e.g., Ductile 60-40-18",
    },
  },
  {
    key: "gradeCode",
    type: "text",
    label: "Grade Code",
    defaultValue: "",
    validators: {
      required: true,
      custom: (value: any) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return ["Grade Code is required"];
        }
        return [];
      },
    },
    section: { sectionId: "gradeOverview", order: 3 },
    meta: {
      placeholder: "e.g., 60-40-18",
    },
  },
  {
    key: "gradeType",
    type: "select",
    label: "Grade Type",
    defaultValue: "",
    validators: { required: true },
    options: createApiOptions("gradeCategory", "symbol", "name"),
    section: { sectionId: "gradeOverview", order: 4 },
    meta: {
      searchable: false,
    },
  },

  {
    key: "tappingTempMin",
    type: "number",
    label: "Tapping Temperature Min (°C)",
    defaultValue: null,
    validators: {
      required: true,
    },
    hidden: true,
    section: { sectionId: "gradeOverview", order: 5 },
    meta: {
      placeholder: "Min e.g., 1300",
    },
    dependencies: {
      fields: ["gradeType"],
      condition: (watched: any) => watched.gradeType === "DI",
      overrides: {
        hidden: false,
        validators: {
          required: true,
          custom: (value: any) => {
            const numValue = Number(value);
            if (isNaN(numValue)) return ["Please enter a valid number"];
            if (numValue < 1300) return ["Temperature must be at least 1300°C"];
            if (numValue > 1600) return ["Temperature must not exceed 1600°C"];
            return [];
          },
        },
        meta: {
          subsection: "diParameters",
          showHeader: true,
          helpText:
            "Minimum tapping temperature for DI processing (1300-1600°C)",
          placeholder: "Min e.g., 1300",
        },
      },
    },
  },
  {
    key: "tappingTempMax",
    type: "number",
    label: "Tapping Temperature Max (°C)",
    defaultValue: null,
    validators: {
      required: true,
    },
    hidden: true,
    section: { sectionId: "gradeOverview", order: 6 },
    meta: {
      placeholder: "Max e.g., 1600",
    },
    dependencies: {
      fields: ["gradeType"],
      condition: (watched: any) => watched.gradeType === "DI",
      overrides: {
        hidden: false,
        validators: {
          required: true,
          custom: (value: any) => {
            const numValue = Number(value);
            if (numValue < 1300) return ["Temperature must be at least 1300°C"];
            if (numValue > 1600) return ["Temperature must not exceed 1600°C"];
            return [];
          },
        },
        meta: {
          subsection: "diParameters",
          helpText:
            "Maximum tapping temperature for DI processing (1300-1600°C, must be > min temp)",
          placeholder: "Max e.g., 1600",
        },
      },
    },
  },
  {
    key: "mgTreatmentTime",
    type: "number",
    label: "Mg Treatment Time (minutes)",
    defaultValue: null,
    validators: {
      required: true,
    },
    hidden: true,
    section: { sectionId: "gradeOverview", order: 7 },
    meta: {
      placeholder: "e.g., 1",
    },
    dependencies: {
      fields: ["gradeType"],
      condition: (watched: any) => watched.gradeType === "DI",
      overrides: {
        hidden: false,
        validators: { 
          required: true,
          custom: (value: any) => {
            const numValue = Number(value);
            if (isNaN(numValue)) return ["Please enter a valid number"];
            if (numValue <= 0) return ["Treatment time must be greater than 0"];
            return [];
          },
        },
        meta: {
          subsection: "diParameters",
          helpText: "Duration between Mg treatment and beginning of pouring",
          placeholder: "e.g., 1",
        },
      },
    },
  },
  // BATH CHEMISTRY STARTS HERE
  {
    key: "bathChemistry",
    type: "radio",
    label: "Bath Chemistry",
    defaultValue: "",
    options: async () => {
      return [
        {
          value: "with",
          label: "With Bath Chemistry",
        },
        {
          value: "without",
          label: "Without Bath Chemistry",
        },
      ];
    },
    validators: { 
      required: true,
      custom: (value: any) => {
        if (!value || (value !== "with" && value !== "without")) {
          return ["Please select a Bath Chemistry option"];
        }
        return [];
      },
    },
    section: { sectionId: "bathChemistry", order: 1 },
    meta: {
      hideLabel: true,
    },
  },
  {
    key: "rememberChoice",
    type: "checkbox",
    label: "Remember my choice for new grades",
    defaultValue: false,
    hidden: true,
    section: { sectionId: "bathChemistry", order: 2 },
    dependencies: {
      fields: ["bathChemistry"],
      condition: (watched: any) =>
        watched.bathChemistry !== null && watched.bathChemistry !== undefined,
      overrides: {
        meta: {
          enabled: true,
        },
      },
    },
  },

  // TARGET CHEMISTRY STARTS HERE
  {
    key: "targetChemistry",
    type: "array",
    label: "Target Chemistry Elements",
    defaultValue: [
      {
        element: "C",
        elementId: 1, // Carbon element ID
        elementName: "Carbon",
        bathMin: "",
        bathMax: "",
        finalMin: "",
        finalMax: "",
        isDefault: true,
      },
      {
        element: "Si",
        elementId: 2, // Silicon element ID
        elementName: "Silicon",
        bathMin: "",
        bathMax: "",
        finalMin: "",
        finalMax: "",
        isDefault: true,
      },
    ],
    hidden: true,
    dependencies: {
      fields: ["bathChemistry"],
      condition: isSpectroAndBathReady,
      overrides: { hidden: false },
    },
    section: { sectionId: "targetChemistry", order: 1 },
    validators: {
      required: true,
      min: 1,
      custom: (value: any) => {
        const errors: string[] = [];
        if (Array.isArray(value)) {
          value.forEach((element: any, index: number) => {
            if (element.finalMin >= element.finalMax) {
              errors.push(
                `Element ${element.element}: Final Max must be greater than Final Min`
              );
            }
          });
        }
        return errors;
      },
    },
  },

  {
    key: "selectedElement",
    type: "select",
    label: "Select Element",
    defaultValue: "",
    hidden: true,
    options: loadElementsAsync,
    section: { sectionId: "targetChemistry", order: 2 },
    dependencies: {
      fields: ["bathChemistry"],
      condition: isSpectroAndBathReady,
      overrides: { hidden: false },
    },
    meta: {
      searchable: true,
      searchPlaceholder: "Search elements...",
      asyncMode: "loadOnOpen",
      autoSelectFirst: true,
    },
  },

  {
    key: "toleranceSettings",
    type: "array",
    label: "Set Final-Chemistry Tolerance",
    defaultValue: [],
    hidden: true,
    section: { sectionId: "targetChemistry", order: 4 },
    dependencies: {
      fields: ["bathChemistry"],
      condition: isSpectroAndBathReady,
      overrides: { hidden: false },
    },
  },
  // ADDITION DILUTION STARTS HERE
  {
    key: "additionElements",
    type: "array",
    label: "Elements for Addition/Dilution",
    defaultValue: [],
    hidden: true,
    section: { sectionId: "additionDilution", order: 1 },
    dependencies: {
      fields: ["bathChemistry"],
      condition: isSpectroAndBathReady,
      overrides: { hidden: false },
    },
    validators: {
      custom: (value: any) => {
        if (Array.isArray(value) && value.length === 0) {
          return ["Select at least one element for Addition/Dilution"];
        }
        return [];
      },
    },
  },
  {
    key: "rawMaterials",
    type: "array",
    label: "Raw Materials",
    defaultValue: [],
    hidden: true,
    section: { sectionId: "additionDilution", order: 2 },
    dependencies: {
      fields: ["bathChemistry"],
      condition: isSpectroAndBathReady,
      overrides: { hidden: false },
    },
    validators: {
      required: true,
      min: 1,
      custom: (value: any) => {
        console.log("🔍 [modal.tsx] Raw Materials Validation TRIGGERED:", {
          rawMaterialsCount: Array.isArray(value) ? value.length : 0,
          rawMaterials: value,
          timestamp: new Date().toISOString(),
          fieldKey: "rawMaterials"
        });
        
        // Check if array is empty
        if (Array.isArray(value) && value.length === 0) {
          console.warn("❌ [modal.tsx] Validation failed: Empty raw materials array");
          return ["You need to add at least 3 materials."];
        }
        
        // Check category validation (ADDITIVES, LADLE, NODULARIZER)
        if (Array.isArray(value) && value.length > 0) {
          const categoryErrors = validateRawMaterialsCategories(value);
          if (categoryErrors.length > 0) {
            console.warn("❌ [modal.tsx] Category validation failed:", categoryErrors);
            return categoryErrors;
          }
          console.log("✅ [modal.tsx] Category validation passed");
        }
        
        return [];
      },
    },
    meta: {
      customRenderer: "RawMaterialsTable",
    },
  },

  {
    key: "selectedAdditionElement",
    type: "select",
    label: "Select Element",
    defaultValue: "",
    hidden: true,
    options: searchChargemixMaterialsAsync,
    section: { sectionId: "additionDilution", order: 2 },
    dependencies: {
      fields: ["bathChemistry"],
      condition: isSpectroAndBathReady,
      overrides: { hidden: false },
    },
    meta: {
      searchable: true,
      searchPlaceholder: "Search elements...",
      asyncMode: "loadOnOpen",
    },
  },

  {
    key: "elementMinPercent",
    type: "number",
    label: "Min %",
    defaultValue: "",
    hidden: true,
    section: { sectionId: "additionDilution", order: 3 },
    dependencies: {
      fields: ["bathChemistry"],
      condition: isSpectroAndBathReady,
      overrides: { hidden: false },
    },
  },

  {
    key: "elementMaxPercent",
    type: "number",
    label: "Max % *",
    defaultValue: "",
    hidden: true,
    section: { sectionId: "additionDilution", order: 4 },
    dependencies: {
      fields: ["bathChemistry"],
      condition: isSpectroAndBathReady,
      overrides: { hidden: false },
    },
  },

  // CHARGE MIX DATA STARTS HERE
  {
    key: "chargemixMaterials",
    type: "array",
    label: "Chargemix Materials",
    defaultValue: [],
    hidden: true,
    section: { sectionId: "chargemixData", order: 1 },
    dependencies: {
      fields: ["bathChemistry"],
      condition: isIfKioskAndBathReady,
      overrides: { hidden: false },
    },
    meta: {
      customRenderer: "ChargemixMaterialsTable",
    },
  },

  {
    key: "selectedChargemixMaterial",
    type: "select",
    label: "Select Raw Material",
    defaultValue: "",
    hidden: true,
    options: searchChargemixMaterialsAsync,
    section: { sectionId: "chargemixData", order: 2 },
    dependencies: {
      fields: ["bathChemistry"],
      condition: isIfKioskAndBathReady,
      overrides: { hidden: false },
    },
    meta: {
      searchable: true,
      searchPlaceholder: "Search materials...",
      asyncMode: "loadOnOpen",
    },
  },

  {
    key: "chargemixMaterialMinPercent",
    type: "number",
    label: "Min %",
    defaultValue: 0,
    hidden: true,
    section: { sectionId: "chargemixData", order: 3 },
    dependencies: {
      fields: ["bathChemistry"],
      condition: isIfKioskAndBathReady,
      overrides: { hidden: false },
    },
    validators: {
      min: 0,
      max: 100,
    },
  },

  {
    key: "chargemixMaterialMaxPercent",
    type: "number",
    label: "Max %",
    defaultValue: 0,
    hidden: true,
    section: { sectionId: "chargemixData", order: 4 },
    dependencies: {
      fields: ["bathChemistry"],
      condition: isIfKioskAndBathReady,
      overrides: { hidden: false },
    },
    validators: {
      min: 0,
      max: 100,
    },
  },
];

export const gradeConfigurationSections: FieldSection[] = [
  {
    id: "gradeOverview",
    title: "Grade Overview & Identification",
    description:
      "Define the basic grade information and metallurgical parameters",
    collapsible: false,
    meta: {
      customRenderer: "GradeOverviewRenderer",
    },
  },
  {
    id: "bathChemistry",
    title: "Bath Chemistry Decision",
    description:
      "This choice affects melt-correction algorithms. Choose carefully based on your process requirements.", // Empty description - custom renderer handles it
    collapsible: false,
    meta: {
      customRenderer: "BathChemistryDecisionRenderer",
    },
  },
  {
    id: "targetChemistry",
    title: "Target Chemistry",
    collapsible: false,
    meta: {
      customRenderer: "TargetChemistryRenderer",
    },
  },
  {
    id: "additionDilution",
    title: "Addition/Dilution Settings",
    description:
      "Configure suggestion generation parameters and raw material constraints",
    collapsible: true,
    collapsed: true,
    meta: {
      customRenderer: "AdditionDilutionRenderer",
    },
  },
  {
    id: "chargemixData",
    title: "Chargemix Data Configuration",
    description:
      "Configure raw material selection and quantities for heat plan creation in the kiosk",
    collapsible: true,
    meta: {
      customRenderer: "ChargemixDataRenderer",
    },
  },
];

export const gradeConfigurationSectionedModel: SectionedFormModel = {
  sections: gradeConfigurationSections,
  fields: gradeConfigurationModel,
};
