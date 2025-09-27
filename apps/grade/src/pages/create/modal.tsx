import {
  FormModel,
  FieldSection,
  SectionedFormModel,
} from "@dynamic_forms/react";
import { mockData } from "../../mockData/create";
import { createApiOptions } from "./apiOptions";

export const gradeConfigurationModel: FormModel = [
  {
    key: "spectroModule",
    type: "checkbox",
    label: "SPECTRO",
    defaultValue: true,
    section: { sectionId: "moduleSelection", order: 1 },
    meta: {
      helpText: "Provides precise chemical composition analysis",
    },
  },
  {
    key: "ifKioskModule",
    type: "checkbox",
    label: "IF Kiosk",
    defaultValue: false,
    section: { sectionId: "moduleSelection", order: 2 },
    meta: {
      helpText: "Optimizes induction furnace charge preparation",
    },
  },

  {
    key: "tagId",
    type: "text",
    label: "Tag ID",
    defaultValue: "",
    validators: {
      required: true,
      // min: 6,
      // max: 6,
    },
    section: { sectionId: "gradeOverview", order: 1 },
    meta: {
      helpText: "Unique alphanumeric identifier for spectrometer integration",
    },
  },
  {
    key: "gradeName",
    type: "text",
    label: "Grade Name",
    defaultValue: "",
    validators: {
      required: true,
      min: 2,
    },
    section: { sectionId: "gradeOverview", order: 2 },
    meta: {
      helpText: "Descriptive name for the grade specification",
    },
  },
  {
    key: "gradeCode",
    type: "text",
    label: "Grade Code",
    defaultValue: "",
    validators: {
      required: true,
    },
    section: { sectionId: "gradeOverview", order: 3 },
    meta: {
      helpText: "Standard code representing the grade properties",
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
    meta: { helpText: "Select the material type for this grade" },
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
    dependencies: [
      {
        field: "gradeType",
        condition: (value: any) => value === "DI",
        overrides: {
          hidden: false,
          validators: {
            required: true,
            //  min: 1000, max: 2000
          },
          meta: {
            helpText:
              "Minimum tapping temperature for DI processing (1000-2000°C)",
          },
        },
      },
    ],
    meta: {
      subsection: "diParameters",
      showHeader: true,
      headerTitle: "DI Specific Parameters",
      headerDescription: "Configuration for Ductile Iron processing",
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
    dependencies: [
      {
        field: "gradeType",
        condition: (value: any) => value === "DI",
        overrides: {
          hidden: false,
          validators: {
            required: true,
          },
          meta: {
            helpText:
              "Maximum tapping temperature for DI processing (must be > min temp)",
          },
        },
      },
    ],
    meta: { subsection: "diParameters" },
  },
  {
    key: "mgTreatmentTime",
    type: "number",
    label: "Mg Treatment Time (minutes)",
    defaultValue: 1,
    validators: {
      required: true,
    },
    hidden: true,
    section: { sectionId: "gradeOverview", order: 7 },
    dependencies: [
      {
        field: "gradeType",
        condition: (value: any) => value === "DI",
        overrides: { hidden: false, validators: { required: true } },
      },
    ],
    meta: { subsection: "diParameters" },
  },

  {
    key: "bathChemistry",
    type: "select",
    label: "Bath Chemistry",
    defaultValue: "",
    options: async () => [
      { value: "", label: "Select Bath Chemistry" },
      { value: "with", label: "With Bath Chemistry" },
      { value: "without", label: "Without Bath Chemistry" },
    ],
    validators: { required: true },
    section: { sectionId: "bathChemistry", order: 1 },
    meta: { helpText: "Choose whether to include bath chemistry analysis" },
  },
  {
    key: "rememberChoice",
    type: "checkbox",
    label: "Remember my choice for similar grades",
    defaultValue: false,
    section: { sectionId: "bathChemistry", order: 2 },
    dependencies: [
      {
        field: "bathChemistry",
        condition: (value: any) => value !== null && value !== undefined,
        overrides: {
          meta: {
            helpText:
              "Save this preference for future similar grade configurations",
            enabled: true,
          },
        },
      },
    ],
    meta: {
      helpText: "Save this preference for future similar grade configurations",
    },
  },

  {
    key: "targetChemistry",
    type: "array",
    label: "Target Chemistry Elements",
    defaultValue: [
      {
        element: "C",
        bathMin: 3.4,
        bathMax: 3.6,
        finalMin: 3.45,
        finalMax: 3.55,
        toleranceMin: 0.05,
        toleranceMax: 0.05,
        isDefault: true,
      },
      {
        element: "Si",
        bathMin: 3.4,
        bathMax: 3.6,
        finalMin: 2.3,
        finalMax: 2.35,
        toleranceMin: 0.05,
        toleranceMax: 0.05,
        isDefault: true,
      },
    ],
    hidden: true,
    dependencies: [
      {
        field: "bathChemistry",
        condition: (value: any) => value === "with",
        overrides: {
          hidden: false,
          meta: {
            helpText:
              "Define chemical composition ranges with bath chemistry analysis",
            showBathColumns: true,
          },
        },
      },
      {
        field: "bathChemistry",
        condition: (value: any) => value === "without",
        overrides: {
          hidden: false,
          meta: {
            helpText:
              "Define final chemistry ranges only (bath chemistry disabled)",
            showBathColumns: false,
          },
        },
      },
    ],
    section: { sectionId: "targetChemistry", order: 1 },
    meta: {
      helpText: "Define chemical composition ranges for this grade",
      customRenderer: "TargetChemistryTable",
      tableConfig: {
        title: "Target Chemistry Elements",
        description: "Define chemical composition ranges for this grade",
        allowAdd: true,
        selectField: "selectedElement",
        addLabel: "Element",
        addOptions: mockData.addOptions,
        uniqueKey: "element",
        columns: [
          { key: "element", label: "Element", type: "readonly" },
          {
            key: "bathMin",
            label: "Bath Min (%)",
            type: "number",
            min: 0,
            max: 100,
            step: 0.01,
            hidden: true,
          },
          {
            key: "bathMax",
            label: "Bath Max (%)",
            type: "number",
            min: 0,
            max: 100,
            step: 0.01,
            hidden: true,
          },
          {
            key: "finalMin",
            label: "Final Min (%)",
            type: "number",
            min: 0,
            max: 100,
            step: 0.01,
          },
          {
            key: "finalMax",
            label: "Final Max (%)",
            type: "number",
            min: 0,
            max: 100,
            step: 0.01,
          },
        ],
        createItem: (selectedElementId: string) => {
          // Find the element object from elementsData using the selected ID
          const elementsData = (window as any).elementsData;
          const elementObj = elementsData?.find(
            (el: any) => el.id === selectedElementId
          );

          return {
            element: elementObj?.symbol || selectedElementId, // Use symbol if available, fallback to ID
            elementId: selectedElementId, // Store the ID for reference
            elementName: elementObj?.name || "", // Store the name for reference
            bathMin: 0,
            bathMax: 0,
            finalMin: 0,
            finalMax: 0,
          };
        },
        helpText: "Select an element to add to the chemistry table",
      },
    },
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
    defaultValue: "Mn",
    hidden: true,
    options: (formValues: any) => {
      if (!formValues) return [];

      const elementsData = (window as any).elementsData;
      const targetChemistry = formValues.targetChemistry || [];

      if (!elementsData || !Array.isArray(elementsData)) {
        return [];
      }

      // Get already selected element IDs
      const selectedElementIds = targetChemistry.map(
        (item: any) => item.elementId || item.element
      );

      // Filter out already selected elements
      return elementsData
        .filter((element: any) => !selectedElementIds.includes(element.id))
        .map((element: any) => ({
          value: element.id,
          label: element.symbol,
        }));
    },
    section: { sectionId: "targetChemistry", order: 2 },
    dependencies: [
      {
        field: "bathChemistry",
        condition: (value: any) => value === "with" || value === "without",
        overrides: { hidden: false },
      },
    ],
    meta: {
      helpText: "Select an element to add to the chemistry table",
      searchable: true,
      searchPlaceholder: "Search elements...",
    },
  },

  {
    key: "addElementAction",
    type: "text",
    label: "",
    defaultValue: "",
    hidden: true,
    section: { sectionId: "targetChemistry", order: 3 },
    dependencies: [
      {
        field: "bathChemistry",
        condition: (value: any) => value === "with" || value === "without",
        overrides: { hidden: false },
      },
    ],
    meta: {
      customRenderer: "AddElementButton",
      hideLabel: true,
    },
  },

  {
    key: "toleranceSettings",
    type: "text",
    label: "Set Final-Chemistry Tolerance",
    defaultValue: "",
    hidden: true,
    section: { sectionId: "targetChemistry", order: 4 },
    dependencies: [
      {
        field: "bathChemistry",
        condition: (value: any) => value === "with" || value === "without",
        overrides: { hidden: false },
      },
    ],
    meta: {
      customRenderer: "ToleranceSection",
      helpText: "Configure tolerance ranges for final chemistry analysis",
    },
  },

  {
    key: "additionElements",
    type: "array",
    label: "Elements for Addition/Dilution",
    defaultValue: [],
    hidden: true,
    section: { sectionId: "additionDilution", order: 1 },
    dependencies: [
      {
        field: "spectroModule",
        condition: (value: any) => value === true,
        overrides: { hidden: false },
      },
    ],
    validators: {
      custom: (value: any) => {
        if (Array.isArray(value) && value.length === 0) {
          return ["Select at least one element for Addition/Dilution"];
        }
        return [];
      },
    },
    meta: {
      helpText:
        "Select elements to be considered for Addition/Dilution suggestions",
      getOptions: (formValues: any) => {
        if (!formValues) return [];

        const targetChemistry = formValues.targetChemistry || [];

        return targetChemistry
          .filter((element: any) => element.element) // Filter out elements without element field
          .map((element: any) => {
            // Just show the element symbol, no percentage data
            const elementValue = element.element;

            return {
              value: elementValue,
              label: elementValue,
            };
          });
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
    dependencies: [
      {
        field: "spectroModule",
        condition: (value: any) => value === true,
        overrides: { hidden: false },
      },
    ],
    meta: {
      customRenderer: "RawMaterialsTable",
      helpText:
        "Add raw materials with min/max percentage for addition/dilution",
      tableConfig: {
        title: "Raw Materials",
        description:
          "Configure raw materials with min/max percentage for addition/dilution",
        allowAdd: true,
        selectField: "selectedRawMaterial",
        addLabel: "Raw Material",
        addOptions: mockData.rawMaterials,
        uniqueKey: "material",
        columns: [
          { key: "material", label: "Material", type: "readonly" },
          {
            key: "minPercent",
            label: "Min %",
            type: "number",
            min: 0,
            max: 100,
            step: 0.01,
          },
          {
            key: "maxPercent",
            label: "Max %",
            type: "number",
            min: 0,
            max: 100,
            step: 0.01,
          },
        ],
        createItem: (selectedMaterialId: string) => {
          // Find the material object from itemInventoryData using the selected ID
          const itemInventoryData = (window as any).itemInventoryData;
          const materialObj = itemInventoryData?.results?.find(
            (item: any) => item.id === selectedMaterialId
          );

          return {
            material: materialObj?.name || selectedMaterialId, // Use name if available, fallback to ID
            materialId: selectedMaterialId, // Store the ID for reference
            materialSlug: materialObj?.slug || "", // Store the slug for reference
            minPercent: 0,
            maxPercent: 0,
          };
        },
        helpText: "Select a raw material to add to the table",
      },
    },
  },

  {
    key: "selectedRawMaterial",
    type: "select",
    label: "Select Raw Material",
    defaultValue: "",
    options: (formValues: any) => {
      if (!formValues) return [];

      const itemInventoryData = (window as any).itemInventoryData;
      const rawMaterials = formValues.rawMaterials || [];

      if (
        !itemInventoryData?.results ||
        !Array.isArray(itemInventoryData.results)
      ) {
        return [];
      }

      // Get already selected material IDs
      const selectedMaterialIds = rawMaterials.map(
        (item: any) => item.materialId || item.material
      );

      // Filter out already selected materials
      return itemInventoryData.results
        .filter((material: any) => !selectedMaterialIds.includes(material.id))
        .map((material: any) => ({
          value: material.id,
          label: material.name,
        }));
    },
    hidden: true,
    section: { sectionId: "additionDilution", order: 3 },
    dependencies: [
      {
        field: "spectroModule",
        condition: (value: any) => value === true,
        overrides: { hidden: false },
      },
    ],
    meta: {
      helpText: "Choose a raw material to add",
      searchable: true,
      searchPlaceholder: "Search materials...",
    },
  },

  {
    key: "rawMaterialMinPercent",
    type: "number",
    label: "Min %",
    defaultValue: 0,
    hidden: true,
    section: { sectionId: "additionDilution", order: 4 },
    dependencies: [
      {
        field: "spectroModule",
        condition: (value: any) => value === true,
        overrides: { hidden: false },
      },
    ],
    validators: {
      min: 0,
      max: 100,
    },
  },

  {
    key: "rawMaterialMaxPercent",
    type: "number",
    label: "Max %",
    defaultValue: 0,
    hidden: true,
    section: { sectionId: "additionDilution", order: 5 },
    dependencies: [
      {
        field: "spectroModule",
        condition: (value: any) => value === true,
        overrides: { hidden: false },
      },
    ],
    validators: {
      required: true,
    },
  },

  {
    key: "addRawMaterialAction",
    type: "text",
    label: "",
    defaultValue: "",
    hidden: true,
    section: { sectionId: "additionDilution", order: 6 },
    dependencies: [
      {
        field: "spectroModule",
        condition: (value: any) => value === true,
        overrides: { hidden: false },
      },
    ],
    meta: {
      customRenderer: "AddRawMaterialButton",
      hideLabel: true,
    },
  },

  {
    key: "chargemixMaterials",
    type: "array",
    label: "Chargemix Materials",
    defaultValue: [],
    hidden: true,
    section: { sectionId: "chargemixData", order: 1 },
    dependencies: [
      {
        field: "ifKioskModule",
        condition: (value: any) => value === true,
        overrides: { hidden: false },
      },
    ],
    meta: {
      customRenderer: "ChargemixMaterialsTable",
      helpText:
        "Add raw materials with min/max percentage for chargemix configuration",
      tableConfig: {
        title: "Chargemix Materials",
        description:
          "Configure raw materials with min/max percentage for chargemix configuration",
        allowAdd: true,
        selectField: "selectedChargemixMaterial",
        addLabel: "Raw Material",
        addOptions: mockData.chargemixMaterials,
        uniqueKey: "material",
        columns: [
          { key: "material", label: "Material", type: "readonly" },
          {
            key: "minPercent",
            label: "Min %",
            type: "number",
            min: 0,
            max: 100,
            step: 0.01,
          },
          {
            key: "maxPercent",
            label: "Max %",
            type: "number",
            min: 0,
            max: 100,
            step: 0.01,
          },
        ],
        createItem: (selectedMaterialId: string) => {
          // Find the material object from itemInventoryData using the selected ID
          const itemInventoryData = (window as any).itemInventoryData;

          const materialObj = itemInventoryData?.results?.find(
            (item: any) => item.id === selectedMaterialId
          );

          return {
            material: materialObj?.name || selectedMaterialId, // Use name if available, fallback to ID
            materialId: selectedMaterialId, // Store the ID for reference
            materialSlug: materialObj?.slug || "", // Store the slug for reference
            minPercent: 0,
            maxPercent: 0,
          };
        },
        // Helper function to fix existing items that might have IDs instead of names
        fixExistingItems: (items: any[]) => {
          const itemInventoryData = (window as any).itemInventoryData;
          if (!itemInventoryData?.results) return items;

          return items.map((item: any) => {
            // If material is a number (ID), try to find the name
            if (
              typeof item.material === "number" ||
              /^\d+$/.test(item.material)
            ) {
              const materialObj = itemInventoryData.results.find(
                (m: any) => m.id == item.material
              );
              if (materialObj) {
                return {
                  ...item,
                  material: materialObj.name,
                  materialId: item.material,
                  materialSlug: materialObj.slug || "",
                };
              }
            }
            return item;
          });
        },
        helpText: "Select a raw material to add to the chargemix table",
      },
    },
  },

  {
    key: "selectedChargemixMaterial",
    type: "select",
    label: "Select Raw Material",
    defaultValue: "",
    hidden: true,
    options: (formValues: any) => {
      if (!formValues) return [];

      const itemInventoryData = (window as any).itemInventoryData;
      const chargemixMaterials = formValues.chargemixMaterials || [];

      if (
        !itemInventoryData?.results ||
        !Array.isArray(itemInventoryData.results)
      ) {
        return [];
      }

      // Get already selected material IDs
      const selectedMaterialIds = chargemixMaterials.map(
        (item: any) => item.materialId || item.material
      );

      // Filter out already selected materials
      return itemInventoryData.results
        .filter((material: any) => !selectedMaterialIds.includes(material.id))
        .map((material: any) => ({
          value: material.id,
          label: material.name,
        }));
    },
    section: { sectionId: "chargemixData", order: 2 },
    dependencies: [
      {
        field: "ifKioskModule",
        condition: (value: any) => value === true,
        overrides: { hidden: false },
      },
    ],
    meta: {
      helpText: "Choose a raw material to add to chargemix configuration",
      searchable: true,
      searchPlaceholder: "Search materials...",
    },
  },

  {
    key: "chargemixMaterialMinPercent",
    type: "number",
    label: "Min %",
    defaultValue: 0,
    hidden: true,
    section: { sectionId: "chargemixData", order: 3 },
    dependencies: [
      {
        field: "ifKioskModule",
        condition: (value: any) => value === true,
        overrides: { hidden: false },
      },
    ],
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
    dependencies: [
      {
        field: "ifKioskModule",
        condition: (value: any) => value === true,
        overrides: { hidden: false },
      },
    ],
    validators: {
      required: true,
    },
  },

  {
    key: "addChargemixMaterialAction",
    type: "text",
    label: "",
    defaultValue: "",
    hidden: true,
    section: { sectionId: "chargemixData", order: 5 },
    dependencies: [
      {
        field: "ifKioskModule",
        condition: (value: any) => value === true,
        overrides: { hidden: false },
      },
    ],
    meta: {
      customRenderer: "AddChargemixMaterialButton",
      hideLabel: true,
    },
  },
];

export const gradeConfigurationSections: FieldSection[] = [
  {
    id: "moduleSelection",
    title: "Module Selection",
    description:
      "SPECTRO module is enabled by default. Select IF Kiosk if charge mixture management is required.",
    collapsible: false,
    layout: {
      columns: 2,
      gap: "1rem",
      className: "module-selection-grid",
    },
  },
  {
    id: "gradeOverview",
    title: "Grade Overview & Identification",
    description: "Define the basic properties and parameters for this grade",
    collapsible: false,
    layout: {
      columns: 1,
      gap: "1rem",
      className: "grade-overview-form",
    },
  },
  {
    id: "bathChemistry",
    title: "Bath Chemistry Decision",
    description: "Configure bath chemistry analysis preferences",
    collapsible: false,
    layout: {
      columns: 1,
      gap: "1rem",
      className: "bath-chemistry-section",
    },
  },
  {
    id: "targetChemistry",
    title: "Target Chemistry",
    description: "Define chemical composition ranges and tolerance settings",
    collapsible: false,
    layout: {
      columns: 1,
      gap: "1rem",
      className: "target-chemistry-section",
    },
  },
  {
    id: "additionDilution",
    title: "Addition/Dilution Settings",
    description:
      "Configure suggestion generation parameters and raw material constraints",
    collapsible: true,
    layout: {
      columns: 1,
      gap: "1rem",
      className: "addition-dilution-section",
    },
  },
  {
    id: "chargemixData",
    title: "Chargemix Data Configuration",
    description:
      "Configure raw material selection and quantities for heat plan creation in the kiosk",
    collapsible: true,
    layout: {
      columns: 1,
      gap: "1rem",
      className: "chargemix-data-section",
    },
  },
];

export const gradeConfigurationSectionedModel: SectionedFormModel = {
  sections: gradeConfigurationSections,
  fields: gradeConfigurationModel,
};
