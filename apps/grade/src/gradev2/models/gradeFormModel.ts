import { FormModel, FieldSection, SectionedFormModel } from '@dynamic_forms/react';
import { mockData } from '../data/mockData';


export const gradeFormModel: FormModel = [
    // Module Selection Section
    {
        key: 'spectroModule',
        type: 'checkbox',
        label: 'SPECTRO',
        defaultValue: true,
        section: { sectionId: 'moduleSelection', order: 1 },
        meta: {
            helpText: 'Provides precise chemical composition analysis'
        },
    },
    {
        key: 'ifKioskModule',
        type: 'checkbox',
        label: 'IF Kiosk',
        defaultValue: false,
        section: { sectionId: 'moduleSelection', order: 2 },
        meta: {
            helpText: 'Optimizes induction furnace charge preparation'
        },
    },

    // Grade Overview & Identification Section
    {
        key: 'tagId',
        type: 'text',
        label: 'Tag ID',
        defaultValue: 'DI-001',
        validators: {
            required: true,
            custom: (value: any) => {
                if (typeof value === 'string' && value.length < 3) {
                    return ['Tag ID must be at least 3 characters'];
                }
                return [];
            }
        },
        section: { sectionId: 'gradeOverview', order: 1 },
        meta: { helpText: 'Unique alphanumeric identifier for spectrometer integration' },
    },
    {
        key: 'gradeName',
        type: 'text',
        label: 'Grade Name',
        defaultValue: 'Ductile 60-40-18',
        validators: {
            required: true,
            custom: (value: any) => {
                if (typeof value === 'string' && value.length < 2) {
                    return ['Grade name must be at least 2 characters'];
                }
                return [];
            }
        },
        section: { sectionId: 'gradeOverview', order: 2 },
        meta: { helpText: 'Descriptive name for the grade specification' },
    },
    {
        key: 'gradeCode',
        type: 'text',
        label: 'Grade Code',
        defaultValue: '60-40-18',
        validators: {
            required: true,
            pattern: /^[\w-]+$/,
        },
        section: { sectionId: 'gradeOverview', order: 3 },
        meta: { helpText: 'Standard code representing the grade properties' },
    },
    {
        key: 'gradeType',
        type: 'select',
        label: 'Grade Type',
        defaultValue: 'DI',
        validators: { required: true },
        options: async () => mockData.gradeTypes,
        section: { sectionId: 'gradeOverview', order: 4 },
        meta: { helpText: 'Select the material type for this grade' },
    },

    // DI Specific Parameters (conditional fields)
    {
        key: 'tappingTempMin',
        type: 'number',
        label: 'Tapping Temperature Min (°C)',
        defaultValue: 1500,
        validators: {
            required: true,
            min: 1000,
        },
        hidden: true,
        section: { sectionId: 'gradeOverview', order: 5 },
        dependencies: [
            {
                field: 'gradeType',
                condition: (value: any) => value === 'DI',
                overrides: { hidden: false, validators: { required: true, min: 1000 } }
            }
        ],
        meta: { 
            subsection: 'diParameters',
            showHeader: true,
            headerTitle: 'DI Specific Parameters',
            headerDescription: 'Configuration for Ductile Iron processing'
        }
    },
    {
        key: 'tappingTempMax',
        type: 'number',
        label: 'Tapping Temperature Max (°C)',
        defaultValue: 1540,
        validators: {
            required: true,
            custom: (value: any) => {
                if (typeof value === 'number' && value < 1000) {
                    return ['Maximum temperature should be at least 1000°C'];
                }
                return [];
            }
        },
        hidden: true,
        section: { sectionId: 'gradeOverview', order: 6 },
        dependencies: [
            {
                field: 'gradeType',
                condition: (value: any) => value === 'DI',
                overrides: { hidden: false, validators: { required: true, min: 1000 } }
            }
        ],
        meta: { subsection: 'diParameters' }
    },
    {
        key: 'mgTreatmentTime',
        type: 'number',
        label: 'Mg Treatment Time (minutes)',
        defaultValue: 1,
        validators: {
            required: true,
            min: 0.1,
            max: 60,
        },
        hidden: true,
        section: { sectionId: 'gradeOverview', order: 7 },
        dependencies: [
            {
                field: 'gradeType',
                condition: (value: any) => value === 'DI',
                overrides: { hidden: false, validators: { required: true, min: 0.1, max: 60 } }
            }
        ],
        meta: { subsection: 'diParameters' }
    },

    // Bath Chemistry Decision Section
    {
        key: 'bathChemistry',
        type: 'select',
        label: 'Bath Chemistry',
        defaultValue: 'with',
        options: async () => [
            { value: 'with', label: 'With Bath Chemistry' },
            { value: 'without', label: 'Without Bath Chemistry' }
        ],
        validators: { required: true },
        section: { sectionId: 'bathChemistry', order: 1 },
        meta: { helpText: 'Choose whether to include bath chemistry analysis', fieldType: 'radio' },
    },
    {
        key: 'rememberChoice',
        type: 'checkbox',
        label: 'Remember my choice for similar grades',
        defaultValue: false,
        section: { sectionId: 'bathChemistry', order: 2 },
        meta: { helpText: 'Save this preference for future similar grade configurations' },
    },

    // Target Chemistry Section - Dynamic Array Field
    {
        key: 'targetChemistry',
        type: 'array',
        label: 'Target Chemistry Elements',
        defaultValue: [
            // Default elements (C and Si)
            {
                element: 'C',
                bathMin: 3.40,
                bathMax: 3.60,
                finalMin: 3.45,
                finalMax: 3.55,
                toleranceMin: 0.05,
                toleranceMax: 0.05,
                isDefault: true
            },
            {
                element: 'Si',
                bathMin: 3.40,
                bathMax: 3.60,
                finalMin: 2.30,
                finalMax: 2.35,
                toleranceMin: 0.05,
                toleranceMax: 0.05,
                isDefault: true
            }
        ],
        section: { sectionId: 'targetChemistry', order: 1 },
        meta: {
            helpText: 'Define chemical composition ranges for this grade',
            customRenderer: 'TargetChemistryTable',
            // 🚀 DYNAMIC TABLE CONFIGURATION - Based on bathChemistry field
            getTableConfig: (formValues: any) => {
                const hasBathChemistry = formValues.bathChemistry === 'with';
                
                // Base columns that are always shown
                const baseColumns = [
                    { key: 'element', label: 'Element', type: 'readonly' }
                ];
                
                // Bath chemistry columns (conditional)
                const bathColumns = hasBathChemistry ? [
                    { key: 'bathMin', label: 'Bath Min (%)', type: 'number', min: 0, max: 100, step: 0.01 },
                    { key: 'bathMax', label: 'Bath Max (%)', type: 'number', min: 0, max: 100, step: 0.01 }
                ] : [];
                
                // Final chemistry columns (always shown)
                const finalColumns = [
                    { key: 'finalMin', label: 'Final Min (%)', type: 'number', min: 0, max: 100, step: 0.01 },
                    { key: 'finalMax', label: 'Final Max (%)', type: 'number', min: 0, max: 100, step: 0.01 }
                ];
                
                // Combine all columns
                const columns = [...baseColumns, ...bathColumns, ...finalColumns];
                
                return {
                    title: 'Target Chemistry Elements',
                    description: 'Define chemical composition ranges for this grade',
                    allowAdd: true,
                    selectField: 'selectedElement',
                    addLabel: 'Element',
                    addOptions: mockData.addOptions,
                    uniqueKey: 'element',
                    columns: columns,
                    createItem: (selectedElement: string) => {
                        const baseItem = { element: selectedElement };
                        if (hasBathChemistry) {
                            return { ...baseItem, bathMin: 0, bathMax: 0, finalMin: 0, finalMax: 0 };
                        } else {
                            return { ...baseItem, finalMin: 0, finalMax: 0 };
                        }
                    },
                    helpText: 'Select an element to add to the chemistry table'
                };
            }
        },
        validators: {
            custom: (value: any) => {
                const errors: string[] = [];
                if (Array.isArray(value)) {
                    value.forEach((element: any, index: number) => {
                        // Validate final chemistry (always required)
                        if (element.finalMin >= element.finalMax) {
                            errors.push(`Element ${element.element}: Final Max must be greater than Final Min`);
                        }
                        // Note: Bath chemistry validation will be handled by the table renderer
                        // since we can't access form values in the validator
                    });
                }
                return errors;
            }
        }
    },

    // Available elements for dropdown
    {
        key: 'selectedElement',
        type: 'select',
        label: 'Select Element',
        defaultValue: 'Mn',
        options: async () => mockData.chemistryElements,
        section: { sectionId: 'targetChemistry', order: 2 },
        meta: {
            helpText: 'Select an element to add to the chemistry table'
        }
    },

    // Add Element Action Button
    {
        key: 'addElementAction',
        type: 'text',
        label: '',
        defaultValue: '',
        section: { sectionId: 'targetChemistry', order: 3 },
        meta: {
            customRenderer: 'AddElementButton',
            hideLabel: true
        }
    },

  // Set Final-Chemistry Tolerance Section
  {
    key: 'toleranceSettings',
    type: 'text',
    label: 'Set Final-Chemistry Tolerance',
    defaultValue: '',
    section: { sectionId: 'targetChemistry', order: 4 },
    meta: { 
      customRenderer: 'ToleranceSection',
      helpText: 'Configure tolerance ranges for final chemistry analysis'
    },
  },



  // Selected Elements for Addition/Dilution Suggestions
  {
    key: 'additionElements',
    type: 'array',
    label: 'Elements for Addition/Dilution',
    defaultValue: [], // Will be populated from targetChemistry
    section: { sectionId: 'additionDilution', order: 1 },
    dependencies: [
      {
        field: 'spectroModule',
        condition: (value: any) => value === true,
        overrides: { hidden: false }
      },
    ],
    meta: {
      helpText: 'Select elements to be considered for Addition/Dilution suggestions',
      // 🚀 DYNAMIC OPTIONS - Get from targetChemistry table
      getOptions: (formValues: any) => {
        const targetChemistry = formValues.targetChemistry || [];
        return targetChemistry.map((element: any) => ({
          value: element.element,
          label: element.element
        }));
      }
    },
  },

  // Raw Materials Array
  {
    key: 'rawMaterials',
    type: 'array',
    label: 'Raw Materials',
    defaultValue: [],
    section: { sectionId: 'additionDilution', order: 2 },
    dependencies: [
      {
        field: 'spectroModule',
        condition: (value: any) => value === true,
        overrides: { hidden: false }
      },
    ],
    meta: {
      customRenderer: 'RawMaterialsTable',
      helpText: 'Add raw materials with min/max percentage for addition/dilution',
      tableConfig: {
        title: 'Raw Materials',
        description: 'Configure raw materials with min/max percentage for addition/dilution',
        allowAdd: true,
        selectField: 'selectedRawMaterial',
        addLabel: 'Raw Material',
        addOptions: mockData.rawMaterials,
        uniqueKey: 'material',
        columns: [
          { key: 'material', label: 'Material', type: 'readonly' },
          { key: 'minPercent', label: 'Min %', type: 'number', min: 0, max: 100, step: 0.01 },
          { key: 'maxPercent', label: 'Max %', type: 'number', min: 0, max: 100, step: 0.01 }
        ],
        createItem: (selectedMaterial: string) => ({
          material: selectedMaterial,
          minPercent: 0,
          maxPercent: 0
        }),
        helpText: 'Select a raw material to add to the table'
      }
    },
  },

  // Add New Raw Material - Material Selection
  {
    key: 'selectedRawMaterial',
    type: 'select',
    label: 'Select Raw Material',
    defaultValue: '',
    options: async () => mockData.rawMaterials,
    section: { sectionId: 'additionDilution', order: 3 },
    dependencies: [
      {
        field: 'spectroModule',
        condition: (value: any) => value === true,
        overrides: { hidden: false }
      },
    ],
    meta: {
      helpText: 'Choose a raw material to add'
    },
  },

  // Raw Material Min Percentage
  {
    key: 'rawMaterialMinPercent',
    type: 'number',
    label: 'Min %',
    defaultValue: 0,
    section: { sectionId: 'additionDilution', order: 4 },
    dependencies: [
      {
        field: 'spectroModule',
        condition: (value: any) => value === true,
        overrides: { hidden: false }
      },
    ],
    validators: {
      min: 0,
      max: 100
    },
  },

  // Raw Material Max Percentage
  {
    key: 'rawMaterialMaxPercent',
    type: 'number',
    label: 'Max %',
    defaultValue: 0,
    section: { sectionId: 'additionDilution', order: 5 },
    dependencies: [
      {
        field: 'spectroModule',
        condition: (value: any) => value === true,
        overrides: { hidden: false }
      },
    ],
    validators: {
      min: 0,
      max: 100,
      custom: (value: any) => {
        // Note: FormCraft custom validators don't have access to formValues in this format
        if (value <= 0) {
          return ['Max % must be greater than 0'];
        }
        return [];
      }
    },
  },

  // Add Raw Material Action
  {
    key: 'addRawMaterialAction',
    type: 'text',
    label: '',
    defaultValue: '',
    section: { sectionId: 'additionDilution', order: 6 },
    dependencies: [
      {
        field: 'spectroModule',
        condition: (value: any) => value === true,
        overrides: { hidden: false }
      },
    ],
    meta: {
      customRenderer: 'AddRawMaterialButton',
      hideLabel: true
    },
  },

  // Chargemix Data Configuration Section (only visible when ifKioskModule is selected)
  // Header field removed - section header is handled by form library

  // Use custom values checkbox removed - not needed

  // Chargemix Materials Array (Table)
  {
    key: 'chargemixMaterials',
    type: 'array',
    label: 'Chargemix Materials',
    defaultValue: [],
    section: { sectionId: 'chargemixData', order: 1 },
    dependencies: [
      {
        field: 'ifKioskModule',
        condition: (value: any) => value === true,
        overrides: { hidden: false }
      }
    ],
    meta: {
      customRenderer: 'ChargemixMaterialsTable',
      helpText: 'Add raw materials with min/max percentage for chargemix configuration',
      tableConfig: {
        title: 'Chargemix Materials',
        description: 'Configure raw materials with min/max percentage for chargemix configuration',
        allowAdd: true,
        selectField: 'selectedChargemixMaterial',
        addLabel: 'Raw Material',
        addOptions: mockData.chargemixMaterials,
        uniqueKey: 'material',
        columns: [
          { key: 'material', label: 'Material', type: 'readonly' },
          { key: 'minPercent', label: 'Min %', type: 'number', min: 0, max: 100, step: 0.01 },
          { key: 'maxPercent', label: 'Max %', type: 'number', min: 0, max: 100, step: 0.01 }
        ],
        createItem: (selectedMaterial: string) => ({
          material: selectedMaterial,
          minPercent: 0,
          maxPercent: 0
        }),
        helpText: 'Select a raw material to add to the chargemix table'
      }
    },
  },

  // Chargemix Material Selection
  {
    key: 'selectedChargemixMaterial',
    type: 'select',
    label: 'Select Raw Material',
    defaultValue: '',
    options: async () => mockData.chargemixMaterials,
    section: { sectionId: 'chargemixData', order: 2 },
    dependencies: [
      {
        field: 'ifKioskModule',
        condition: (value: any) => value === true,
        overrides: { hidden: false }
      }
    ],
    meta: {
      helpText: 'Choose a raw material to add to chargemix configuration'
    },
  },

  // Chargemix Material Min Percentage
  {
    key: 'chargemixMaterialMinPercent',
    type: 'number',
    label: 'Min %',
    defaultValue: 0,
    section: { sectionId: 'chargemixData', order: 3 },
    dependencies: [
      {
        field: 'ifKioskModule',
        condition: (value: any) => value === true,
        overrides: { hidden: false }
      }
    ],
    validators: {
      min: 0,
      max: 100
    },
  },

  // Chargemix Material Max Percentage
  {
    key: 'chargemixMaterialMaxPercent',
    type: 'number',
    label: 'Max %',
    defaultValue: 0,
    section: { sectionId: 'chargemixData', order: 4 },
    dependencies: [
      {
        field: 'ifKioskModule',
        condition: (value: any) => value === true,
        overrides: { hidden: false }
      }
    ],
    validators: {
      min: 0,
      max: 100,
      custom: (value: any) => {
        if (value <= 0) {
          return ['Max % must be greater than 0'];
        }
        return [];
      }
    },
  },

  // Add Chargemix Material Action
  {
    key: 'addChargemixMaterialAction',
    type: 'text',
    label: '',
    defaultValue: '',
    section: { sectionId: 'chargemixData', order: 5 },
    dependencies: [
      {
        field: 'ifKioskModule',
        condition: (value: any) => value === true,
        overrides: { hidden: false }
      }
    ],
    meta: {
      customRenderer: 'AddChargemixMaterialButton',
      hideLabel: true
    },
  },
];

export const gradeFormSections: FieldSection[] = [
    {
        id: 'moduleSelection',
        title: 'Module Selection',
        description: 'SPECTRO module is enabled by default. Select IF Kiosk if charge mixture management is required.',
        collapsible: false,
        layout: {
            columns: 2,
            gap: '1rem',
            className: 'module-selection-grid'
        }
    },
    {
        id: 'gradeOverview',
        title: 'Grade Overview & Identification',
        description: 'Define the basic properties and parameters for this grade',
        collapsible: false,
        layout: {
            columns: 2,
            gap: '1rem',
            className: 'grade-overview-form'
        }
    },
    {
        id: 'bathChemistry',
        title: 'Bath Chemistry Decision',
        description: 'Configure bath chemistry analysis preferences',
        collapsible: false,
        layout: {
            columns: 1,
            gap: '1rem',
            className: 'bath-chemistry-section'
        }
    },
  {
    id: 'targetChemistry',
    title: 'Target Chemistry',
    description: 'Define chemical composition ranges and tolerance settings',
    collapsible: false,
    layout: {
      columns: 1,
      gap: '1rem',
      className: 'target-chemistry-section'
    }
  },
  {
    id: 'additionDilution',
    title: 'Addition/Dilution Settings',
    description: 'Configure suggestion generation parameters and raw material constraints',
    collapsible: true,
    layout: {
      columns: 1,
      gap: '1rem',
      className: 'addition-dilution-section'
    }
  },
  {
    id: 'chargemixData',
    title: 'Chargemix Data Configuration',
    description: 'Configure raw material selection and quantities for heat plan creation in the kiosk',
    collapsible: true,
    layout: {
      columns: 1,
      gap: '1rem',
      className: 'chargemix-data-section'
    }
  },
];

export const gradeFormSectionedModel: SectionedFormModel = {
    sections: gradeFormSections,
    fields: gradeFormModel,
};
