// 🎯 GRADE FORM MODEL - Following their field-centric pattern with ALL business logic preserved
// This model uses their FormModel pattern with field-centric section assignments

import { 
  AVAILABLE_ELEMENTS, 
  GRADE_TYPES, 
  MODULE_CONFIG, 
  RAW_MATERIALS_DATA,
  BUSINESS_CONSTANTS,
  UI_CONSTANTS 
} from '../constants/gradeConstants';

// 🎯 FORM MODEL - Field-centric with section assignments (Following their pattern)
export const gradeFormModel = [
  // 📋 SECTION 1: MODULE SELECTION
  {
    key: 'selectedModules',
    type: 'array',
    label: 'Selected Modules',
    description: 'SPECTRO is required, IF Kiosk is optional',
    required: true,
    options: MODULE_CONFIG.map(module => ({
      value: module.id,
      label: module.name,
      description: module.description,
      isDefault: module.isDefault,
      isRequired: module.isRequired,
      features: module.features,
      businessImpact: module.businessImpact
    })),
    defaultValue: ['SPECTRO'],
    validators: {
      required: true,
      custom: (value) => {
        return value.includes('SPECTRO') || 'SPECTRO module is required';
      }
    },
    section: { 
      sectionId: 'moduleSelection', 
      order: 1 
    },
    dependencies: {
      // IF module selection affects chargemix visibility
      'chargemixData.visible': (value) => value.includes('IF'),
      // SPECTRO module affects advanced options visibility
      'advancedSpectroOptions.visible': (value) => value.includes('SPECTRO')
    }
  },

  // 📊 SECTION 2: GRADE OVERVIEW & IDENTIFICATION
  {
    key: 'tagId',
    type: 'text',
    label: 'Tag ID',
    placeholder: 'e.g., DI-001',
    helperText: 'Unique alphanumeric identifier for spectrometer integration',
    required: true,
    validators: {
      required: true,
      pattern: /^[A-Za-z0-9-]+$/,
      minLength: 2,
      maxLength: 30
    },
    section: { 
      sectionId: 'gradeOverview', 
      order: 1 
    },
    className: 'w-full'
  },

  {
    key: 'gradeName',
    type: 'text',
    label: 'Grade Name',
    placeholder: 'e.g., Ductile 60-40-18',
    helperText: 'Descriptive name for the grade',
    required: true,
    validators: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[A-Za-z0-9\s\-_]+$/
    },
    section: { 
      sectionId: 'gradeOverview', 
      order: 2 
    },
    className: 'w-full'
  },

  {
    key: 'gradeCode',
    type: 'text',
    label: 'Grade Code',
    placeholder: 'e.g., 60-40-18',
    helperText: 'Standard industry code for the grade',
    required: true,
    validators: {
      required: true,
      minLength: 2,
      maxLength: 20,
      pattern: /^[A-Z0-9\-_]+$/
    },
    section: { 
      sectionId: 'gradeOverview', 
      order: 3 
    },
    className: 'w-full'
  },

  {
    key: 'gradeType',
    type: 'select',
    label: 'Grade Type',
    required: true,
    options: GRADE_TYPES,
    defaultValue: 'DI',
    className: 'w-full',
    section: { 
      sectionId: 'gradeOverview', 
      order: 4 
    },
    dependencies: {
      // Grade type affects element defaults and DI-specific fields
      'elements': (value) => getDefaultElementsForGradeType(value),
      'selectedElements': (value) => Object.keys(getDefaultElementsForGradeType(value)),
      'ductileIronFields.visible': (value) => value === 'DI'
    }
  },

  // 🎯 DUCTILE IRON SPECIFIC FIELDS
  {
    key: 'tappingTemperatureMin',
    type: 'number',
    label: 'Tapping Temperature Min (°C)',
    placeholder: '1500',
    min: UI_CONSTANTS.MIN_TEMPERATURE,
    max: UI_CONSTANTS.MAX_TEMPERATURE,
    step: UI_CONSTANTS.STEP_VALUES.TEMPERATURE,
    defaultValue: BUSINESS_CONSTANTS.DEFAULT_TAPPING_TEMP_MIN,
    helperText: 'Minimum tapping temperature for DI grades',
    className: 'w-32',
    section: { 
      sectionId: 'gradeOverview', 
      order: 5 
    },
    validators: {
      custom: (value, formData) => {
        const max = formData.tappingTemperatureMax;
        return !max || value <= max || 'Min must be less than or equal to Max';
      }
    },
    dependencies: {
      'gradeType': (value) => value === 'DI'
    }
  },

  {
    key: 'tappingTemperatureMax',
    type: 'number',
    label: 'Tapping Temperature Max (°C)',
    placeholder: '1540',
    min: UI_CONSTANTS.MIN_TEMPERATURE,
    max: UI_CONSTANTS.MAX_TEMPERATURE,
    step: UI_CONSTANTS.STEP_VALUES.TEMPERATURE,
    defaultValue: BUSINESS_CONSTANTS.DEFAULT_TAPPING_TEMP_MAX,
    helperText: 'Maximum tapping temperature for DI grades',
    className: 'w-32',
    section: { 
      sectionId: 'gradeOverview', 
      order: 6 
    },
    validators: {
      custom: (value, formData) => {
        const min = formData.tappingTemperatureMin;
        return !min || value >= min || 'Max must be greater than or equal to Min';
      }
    },
    dependencies: {
      'gradeType': (value) => value === 'DI'
    }
  },

  {
    key: 'mgTreatmentTime',
    type: 'number',
    label: 'Mg Treatment Time (minutes)',
    placeholder: '1',
    min: 0.1,
    max: 10,
    step: UI_CONSTANTS.STEP_VALUES.TIME,
    defaultValue: BUSINESS_CONSTANTS.DEFAULT_MG_TREATMENT_TIME,
    helperText: 'Duration between Mg treatment and beginning of pouring',
    className: 'w-32',
    section: { 
      sectionId: 'gradeOverview', 
      order: 7 
    },
    dependencies: {
      'gradeType': (value) => value === 'DI'
    }
  },

  // 🔗 SECTION 3: BTC DECISION GATE
  {
    key: 'btcChoice',
    type: 'radio',
    label: 'Bath Chemistry Choice',
    required: true,
    options: [
      { value: 'with', label: 'With Bath Chemistry', description: 'Include bath chemistry fields' },
      { value: 'without', label: 'Without Bath Chemistry', description: 'Skip bath chemistry fields' }
    ],
    section: { 
      sectionId: 'btcDecision', 
      order: 1 
    },
    dependencies: {
      'elements.bathFields.visible': (value) => value === 'with',
      'toleranceEnabled': (value) => value === 'with' ? true : false
    }
  },

  {
    key: 'rememberChoice',
    type: 'checkbox',
    label: 'Remember my choice for future grades',
    description: 'Save this preference in localStorage',
    defaultValue: false,
    section: { 
      sectionId: 'btcDecision', 
      order: 2 
    }
  },

  // 🧪 SECTION 4: ELEMENT CHEMISTRY
  {
    key: 'selectedElements',
    type: 'array',
    label: 'Selected Elements',
    description: 'Elements to include in the grade',
    defaultValue: ['C', 'Si'],
    section: { 
      sectionId: 'elementChemistry', 
      order: 1 
    },
    validators: {
      minItems: 1,
      custom: (value, formData) => {
        const gradeType = formData.gradeType;
        if (gradeType !== 'SS' && (!value.includes('C') || !value.includes('Si'))) {
          return 'C and Si are required for ferrous grades';
        }
        return true;
      }
    }
  },

  {
    key: 'elementData',
    type: 'array',
    label: 'Element Data',
    description: 'Chemical composition data for each element',
    itemModel: {
      symbol: {
        type: 'select',
        required: true,
        label: 'Element',
        options: AVAILABLE_ELEMENTS,
        className: 'w-24',
        validators: {
          custom: (value, formData, index) => {
            const selectedElements = formData.selectedElements;
            return selectedElements.includes(value) || 'Element must be selected';
          }
        }
      },
      finalMin: {
        type: 'number',
        required: true,
        label: 'Final Min',
        placeholder: '3.20',
        min: 0,
        max: 100,
        step: 0.01,
        className: 'w-20',
        validators: {
          custom: (value, formData, index) => {
            const finalMax = formData.elementData[index]?.finalMax;
            return !finalMax || value <= finalMax || 'Final Min must be ≤ Final Max';
          }
        }
      },
      finalMax: {
        type: 'number',
        required: true,
        label: 'Final Max',
        placeholder: '3.40',
        min: 0,
        max: 100,
        step: 0.01,
        className: 'w-20',
        validators: {
          custom: (value, formData, index) => {
            const finalMin = formData.elementData[index]?.finalMin;
            return !finalMin || value >= finalMin || 'Final Max must be ≥ Final Min';
          }
        }
      },
      bathMin: {
        type: 'number',
        label: 'Bath Min',
        placeholder: '3.40',
        min: 0,
        max: 100,
        step: 0.01,
        className: 'w-20',
        validators: {
          custom: (value, formData, index) => {
            const bathMax = formData.elementData[index]?.bathFields?.bathMax;
            return !bathMax || value <= bathMax || 'Bath Min must be ≤ Bath Max';
          }
        },
        dependencies: {
          'btcChoice': (value) => value === 'with'
        }
      },
      bathMax: {
        type: 'number',
        label: 'Bath Max',
        placeholder: '3.60',
        min: 0,
        max: 100,
        step: 0.01,
        className: 'w-20',
        validators: {
          custom: (value, formData, index) => {
            const bathMin = formData.elementData[index]?.bathFields?.bathMin;
            return !bathMin || value >= bathMin || 'Bath Max must be ≥ Bath Min';
          }
        },
        dependencies: {
          'btcChoice': (value) => value === 'with'
        }
      },
      tolerance: {
        type: 'checkbox',
        label: 'Show Tolerance',
        description: 'Display tolerance fields for this element',
        defaultValue: false
      }
    },
    section: { 
      sectionId: 'elementChemistry', 
      order: 2 
    }
  },

  {
    key: 'toleranceEnabled',
    type: 'checkbox',
    label: 'Enable Tolerance Mode',
    description: 'Show tolerance fields for all elements',
    defaultValue: false,
    section: { 
      sectionId: 'elementChemistry', 
      order: 3 
    },
    dependencies: {
      'btcChoice': (value) => value === 'with'
    }
  },

  // 🔬 SECTION 5: ADVANCED SPECTRO OPTIONS
  {
    key: 'advancedOptionsVisible',
    type: 'checkbox',
    label: 'Show Advanced Options',
    description: 'Display advanced spectro configuration',
    defaultValue: false,
    section: { 
      sectionId: 'advancedSpectro', 
      order: 1 
    },
    dependencies: {
      'selectedModules': (value) => value.includes('SPECTRO')
    }
  },

  {
    key: 'wavelength',
    type: 'number',
    label: 'Wavelength (nm)',
    placeholder: '589.3',
    min: 200,
    max: 1000,
    step: 0.1,
    defaultValue: 589.3,
    className: 'w-32',
    section: { 
      sectionId: 'advancedSpectro', 
      order: 2 
    },
    dependencies: {
      'advancedOptionsVisible': (value) => value === true,
      'selectedModules': (value) => value.includes('SPECTRO')
    }
  },

  {
    key: 'slitWidth',
    type: 'number',
    label: 'Slit Width (μm)',
    placeholder: '10',
    min: 1,
    max: 100,
    step: 1,
    defaultValue: 10,
    className: 'w-32',
    section: { 
      sectionId: 'advancedSpectro', 
      order: 3 
    },
    dependencies: {
      'advancedOptionsVisible': (value) => value === true,
      'selectedModules': (value) => value.includes('SPECTRO')
    }
  },

  {
    key: 'integrationTime',
    type: 'number',
    label: 'Integration Time (ms)',
    placeholder: '100',
    min: 10,
    max: 1000,
    step: 10,
    defaultValue: 100,
    className: 'w-32',
    section: { 
      sectionId: 'advancedSpectro', 
      order: 4 
    },
    dependencies: {
      'advancedOptionsVisible': (value) => value === true,
      'selectedModules': (value) => value.includes('SPECTRO')
    }
  },

  {
    key: 'rawMaterials',
    type: 'array',
    label: 'Raw Materials',
    description: 'Configure raw materials for addition/dilution',
    itemModel: {
      materialName: {
        type: 'select',
        required: true,
        label: 'Material Name',
        options: RAW_MATERIALS_DATA.map(material => ({
          value: material.name,
          label: material.name,
          description: material.type
        })),
        className: 'w-48'
      },
      materialType: {
        type: 'text',
        label: 'Material Type',
        readOnly: true,
        className: 'w-32'
      },
      min: {
        type: 'number',
        label: 'Min (%)',
        min: 0,
        max: 100,
        step: 0.01,
        className: 'w-20',
        validators: {
          custom: (value, formData, index) => {
            const max = formData.rawMaterials[index]?.max;
            return !max || value <= max || 'Min must be ≤ Max';
          }
        }
      },
      max: {
        type: 'number',
        label: 'Max (%)',
        min: 0,
        max: 100,
        step: 0.01,
        className: 'w-20',
        validators: {
          custom: (value, formData, index) => {
            const min = formData.rawMaterials[index]?.min;
            return !min || value >= min || 'Max must be ≥ Min';
          }
        }
      }
    },
    section: { 
      sectionId: 'advancedSpectro', 
      order: 5 
    },
    dependencies: {
      'selectedModules': (value) => value.includes('SPECTRO')
    }
  },

  // 🔋 SECTION 6: CHARGEMIX DATA (IF Module)
  {
    key: 'chargemixVisible',
    type: 'checkbox',
    label: 'Show Chargemix Configuration',
    description: 'Display chargemix data configuration',
    defaultValue: false,
    section: { 
      sectionId: 'chargemixData', 
      order: 1 
    },
    dependencies: {
      'selectedModules': (value) => value.includes('IF')
    }
  },

  {
    key: 'chargemixItems',
    type: 'array',
    label: 'Chargemix Items',
    description: 'Configure chargemix items for charge preparation',
    itemModel: {
      materialName: {
        type: 'select',
        required: true,
        label: 'Material Name',
        options: RAW_MATERIALS_DATA.map(material => ({
          value: material.name,
          label: material.name,
          description: material.type
        })),
        className: 'w-48'
      },
      materialType: {
        type: 'text',
        label: 'Material Type',
        readOnly: true,
        className: 'w-32'
      },
      minQtyPercentage: {
        type: 'number',
        label: 'Min Qty (%)',
        min: 0,
        max: 100,
        step: 0.01,
        className: 'w-20',
        validators: {
          custom: (value, formData, index) => {
            const max = formData.chargemixItems[index]?.maxQtyPercentage;
            return !max || value <= max || 'Min Qty must be ≤ Max Qty';
          }
        }
      },
      maxQtyPercentage: {
        type: 'number',
        label: 'Max Qty (%)',
        min: 0,
        max: 100,
        step: 0.01,
        className: 'w-20',
        validators: {
          custom: (value, formData, index) => {
            const min = formData.chargemixItems[index]?.minQtyPercentage;
            return !min || value >= min || 'Max Qty must be ≥ Min Qty';
          }
        }
      }
    },
    section: { 
      sectionId: 'chargemixData', 
      order: 2 
    },
    dependencies: {
      'selectedModules': (value) => value.includes('IF')
    }
  },

  // 🎛️ SECTION 7: FORM OPTIONS
  {
    key: 'autoValidate',
    type: 'checkbox',
    label: 'Auto-validate on change',
    description: 'Automatically validate form fields as user types',
    defaultValue: true,
    section: { 
      sectionId: 'formOptions', 
      order: 1 
    }
  },

  {
    key: 'rememberFormChoice',
    type: 'checkbox',
    label: 'Remember my choice for new grades',
    description: 'Save preferences for future grade selections',
    defaultValue: false,
    section: { 
      sectionId: 'formOptions', 
      order: 2 
    }
  }
];

// 🔧 BUSINESS LOGIC UTILITIES (Preserved from original)
const getDefaultElementsForGradeType = (gradeType) => {
  switch (gradeType) {
    case 'SS': // Non-ferrous - no default elements
      return {};
    case 'DI': // Ductile Iron
    case 'GI': // Gray Iron
    default: // Ferrous grades
      return {
        C: { finalMin: 3.45, finalMax: 3.55 },
        Si: { finalMin: 2.30, finalMax: 2.35 },
      };
  }
};

// 🎯 DEFAULT VALUES FOR FORM INITIALIZATION
export const defaultGradeValues = {
  selectedModules: ['SPECTRO'],
  tagId: '',
  gradeName: '',
  gradeCode: '',
  gradeType: 'DI',
  tappingTemperatureMin: BUSINESS_CONSTANTS.DEFAULT_TAPPING_TEMP_MIN,
  tappingTemperatureMax: BUSINESS_CONSTANTS.DEFAULT_TAPPING_TEMP_MAX,
  mgTreatmentTime: BUSINESS_CONSTANTS.DEFAULT_MG_TREATMENT_TIME,
  btcChoice: null,
  rememberChoice: false,
  selectedElements: ['C', 'Si'],
  elementData: [
    { symbol: 'C', finalMin: 3.45, finalMax: 3.55 },
    { symbol: 'Si', finalMin: 2.30, finalMax: 2.35 }
  ],
  toleranceEnabled: false,
  advancedOptionsVisible: false,
  wavelength: 589.3,
  slitWidth: 10,
  integrationTime: 100,
  rawMaterials: [],
  chargemixVisible: false,
  chargemixItems: [],
  autoValidate: true,
  rememberFormChoice: false
};

// 🎯 VALIDATION RULES (Preserved from original)
export const gradeValidationRules = {
  // Cross-field validation
  validateTemperatureRange: (formData) => {
    const { tappingTemperatureMin, tappingTemperatureMax } = formData;
    if (tappingTemperatureMin && tappingTemperatureMax) {
      return tappingTemperatureMin <= tappingTemperatureMax || 'Min temperature must be ≤ Max temperature';
    }
    return true;
  },

  validateElementRanges: (formData) => {
    const errors = [];
    formData.elementData?.forEach((element, index) => {
      if (element.finalMin && element.finalMax && element.finalMin > element.finalMax) {
        errors.push(`${element.symbol}: Final Min must be ≤ Final Max`);
      }
      if (element.bathMin && element.bathMax && element.bathMin > element.bathMax) {
        errors.push(`${element.symbol}: Bath Min must be ≤ Bath Max`);
      }
    });
    return errors.length === 0 || errors;
  },

  validateModuleDependencies: (formData) => {
    const { selectedModules } = formData;
    const errors = [];
    
    if (!selectedModules?.includes('SPECTRO')) {
      errors.push('SPECTRO module is required');
    }
    
    return errors.length === 0 || errors;
  }
};