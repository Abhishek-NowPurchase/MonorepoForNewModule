// 🎯 COMPREHENSIVE GRADE FORM MODEL - ALL SECTIONS & BUSINESS LOGIC
// This model includes all fields, dependencies, and business logic from the GradeManager system

import { 
  AVAILABLE_ELEMENTS, 
  GRADE_TYPES, 
  MODULE_CONFIG, 
  RAW_MATERIALS_DATA,
  BUSINESS_CONSTANTS,
  UI_CONSTANTS 
} from '../constants/gradeConstants';

// 🎯 MAIN COMPREHENSIVE FORM MODEL
export const comprehensiveGradeFormModel = {
  // 📋 SECTION 1: MODULE SELECTION
  moduleSelection: {
    type: 'object',
    label: 'Module Selection',
    description: 'Select modules for grade configuration',
    fields: {
      selectedModules: {
        type: 'array',
        required: true,
        label: 'Selected Modules',
        description: 'SPECTRO is required, IF Kiosk is optional',
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
        validation: {
          minItems: 1,
          custom: (value) => {
            return value.includes('SPECTRO') || 'SPECTRO module is required';
          }
        },
        dependencies: {
          // IF module selection affects chargemix visibility
          'chargemixData.visible': (value) => value.includes('IF'),
          // SPECTRO module affects advanced options visibility
          'advancedSpectroOptions.visible': (value) => value.includes('SPECTRO')
        }
      }
    }
  },

  // 📊 SECTION 2: GRADE OVERVIEW & IDENTIFICATION
  gradeOverview: {
    type: 'object',
    label: 'Grade Overview & Identification',
    description: 'Basic grade information and metallurgical parameters',
    fields: {
      tagId: {
        type: 'text',
        required: true,
        label: 'Tag ID',
        placeholder: 'e.g., DI-001',
        helperText: 'Unique alphanumeric identifier for spectrometer integration',
        validation: {
          pattern: /^[A-Za-z0-9-]+$/,
          minLength: 2,
          maxLength: 30
        },
        className: 'w-full'
      },

      gradeName: {
        type: 'text',
        required: true,
        label: 'Grade Name',
        placeholder: 'e.g., Ductile 60-40-18',
        helperText: 'Descriptive name for the grade',
        validation: {
          minLength: 2,
          maxLength: 50,
          pattern: /^[A-Za-z0-9\s\-_]+$/
        },
        className: 'w-full'
      },

      gradeCode: {
        type: 'text',
        required: true,
        label: 'Grade Code',
        placeholder: 'e.g., 60-40-18',
        helperText: 'Standard industry code for the grade',
        validation: {
          minLength: 2,
          maxLength: 20,
          pattern: /^[A-Z0-9\-_]+$/
        },
        className: 'w-full'
      },

      gradeType: {
        type: 'select',
        required: true,
        label: 'Grade Type',
        options: GRADE_TYPES,
        defaultValue: 'DI',
        className: 'w-full',
        dependencies: {
          // Grade type affects element defaults and DI-specific fields
          'elements': (value) => getDefaultElementsForGradeType(value),
          'selectedElements': (value) => Object.keys(getDefaultElementsForGradeType(value)),
          'ductileIronFields.visible': (value) => value === 'DI'
        }
      },

      // 🎯 DUCTILE IRON SPECIFIC FIELDS
      ductileIronFields: {
        type: 'object',
        label: 'DI Specific Parameters',
        visible: false, // Controlled by gradeType dependency
        fields: {
          tappingTemperatureMin: {
            type: 'number',
            label: 'Tapping Temperature Min (°C)',
            placeholder: '1500',
            min: UI_CONSTANTS.MIN_TEMPERATURE,
            max: UI_CONSTANTS.MAX_TEMPERATURE,
            step: UI_CONSTANTS.STEP_VALUES.TEMPERATURE,
            defaultValue: BUSINESS_CONSTANTS.DEFAULT_TAPPING_TEMP_MIN,
            helperText: 'Minimum tapping temperature for DI grades',
            className: 'w-32',
            validation: {
              custom: (value, formData) => {
                const max = formData.gradeOverview.ductileIronFields.tappingTemperatureMax;
                return !max || value <= max || 'Min must be less than or equal to Max';
              }
            }
          },

          tappingTemperatureMax: {
            type: 'number',
            label: 'Tapping Temperature Max (°C)',
            placeholder: '1540',
            min: UI_CONSTANTS.MIN_TEMPERATURE,
            max: UI_CONSTANTS.MAX_TEMPERATURE,
            step: UI_CONSTANTS.STEP_VALUES.TEMPERATURE,
            defaultValue: BUSINESS_CONSTANTS.DEFAULT_TAPPING_TEMP_MAX,
            helperText: 'Maximum tapping temperature for DI grades',
            className: 'w-32',
            validation: {
              custom: (value, formData) => {
                const min = formData.gradeOverview.ductileIronFields.tappingTemperatureMin;
                return !min || value >= min || 'Max must be greater than or equal to Min';
              }
            }
          },

          mgTreatmentTime: {
            type: 'number',
            label: 'Mg Treatment Time (minutes)',
            placeholder: '1',
            min: 0.1,
            max: 10,
            step: UI_CONSTANTS.STEP_VALUES.TIME,
            defaultValue: BUSINESS_CONSTANTS.DEFAULT_MG_TREATMENT_TIME,
            helperText: 'Duration between Mg treatment and beginning of pouring',
            className: 'w-32'
          }
        }
      }
    }
  },

  // 🔗 SECTION 3: BTC DECISION GATE
  btcDecision: {
    type: 'object',
    label: 'Bath Chemistry Decision',
    description: 'Choose whether to include bath chemistry in your grade',
    fields: {
      btcChoice: {
        type: 'radio',
        required: true,
        label: 'Bath Chemistry Choice',
        options: [
          { value: 'with', label: 'With Bath Chemistry', description: 'Include bath chemistry fields' },
          { value: 'without', label: 'Without Bath Chemistry', description: 'Skip bath chemistry fields' }
        ],
        dependencies: {
          'elements.bathFields.visible': (value) => value === 'with',
          'toleranceEnabled': (value) => value === 'with' ? true : false
        }
      },

      rememberChoice: {
        type: 'checkbox',
        label: 'Remember my choice for future grades',
        description: 'Save this preference in localStorage',
        defaultValue: false
      }
    }
  },

  // 🧪 SECTION 4: ELEMENT CHEMISTRY
  elements: {
    type: 'object',
    label: 'Element Chemistry',
    description: 'Define chemical elements and their ranges',
    fields: {
      selectedElements: {
        type: 'array',
        label: 'Selected Elements',
        description: 'Elements to include in the grade',
        defaultValue: ['C', 'Si'],
        validation: {
          minItems: 1,
          custom: (value, formData) => {
            const gradeType = formData.gradeOverview.gradeType;
            if (gradeType !== 'SS' && (!value.includes('C') || !value.includes('Si'))) {
              return 'C and Si are required for ferrous grades';
            }
            return true;
          }
        }
      },

      elementData: {
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
            validation: {
              custom: (value, formData, index) => {
                const selectedElements = formData.elements.selectedElements;
                return selectedElements.includes(value) || 'Element must be selected';
              }
            }
          },

          // 🎯 BATH CHEMISTRY FIELDS (conditional)
          bathFields: {
            type: 'object',
            label: 'Bath Chemistry',
            visible: false, // Controlled by btcChoice dependency
            fields: {
              bathMin: {
                type: 'number',
                label: 'Bath Min',
                placeholder: '3.40',
                min: 0,
                max: 100,
                step: 0.01,
                className: 'w-20',
                validation: {
                  custom: (value, formData, index) => {
                    const bathMax = formData.elements.elementData[index]?.bathFields?.bathMax;
                    return !bathMax || value <= bathMax || 'Bath Min must be ≤ Bath Max';
                  }
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
                validation: {
                  custom: (value, formData, index) => {
                    const bathMin = formData.elements.elementData[index]?.bathFields?.bathMin;
                    return !bathMin || value >= bathMin || 'Bath Max must be ≥ Bath Min';
                  }
                }
              }
            }
          },

          // 🎯 FINAL CHEMISTRY FIELDS (always visible)
          finalMin: {
            type: 'number',
            required: true,
            label: 'Final Min',
            placeholder: '3.20',
            min: 0,
            max: 100,
            step: 0.01,
            className: 'w-20',
            validation: {
              custom: (value, formData, index) => {
                const finalMax = formData.elements.elementData[index]?.finalMax;
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
            validation: {
              custom: (value, formData, index) => {
                const finalMin = formData.elements.elementData[index]?.finalMin;
                return !finalMin || value >= finalMin || 'Final Max must be ≥ Final Min';
              }
            }
          },

          tolerance: {
            type: 'checkbox',
            label: 'Show Tolerance',
            description: 'Display tolerance fields for this element',
            defaultValue: false
          }
        }
      },

      toleranceEnabled: {
        type: 'checkbox',
        label: 'Enable Tolerance Mode',
        description: 'Show tolerance fields for all elements',
        defaultValue: false,
        dependencies: {
          'btcDecision.btcChoice': (value) => value === 'with'
        }
      }
    }
  },

  // 🔬 SECTION 5: ADVANCED SPECTRO OPTIONS
  advancedSpectroOptions: {
    type: 'object',
    label: 'Advanced Spectro Options',
    description: 'Advanced spectrometer configuration and raw materials',
    visible: false, // Controlled by module selection dependency
    fields: {
      visible: {
        type: 'checkbox',
        label: 'Show Advanced Options',
        description: 'Display advanced spectro configuration',
        defaultValue: false
      },

      // 🎯 SPECTRO CONFIGURATION
      spectroConfig: {
        type: 'object',
        label: 'Spectro Configuration',
        visible: false, // Controlled by visible field
        fields: {
          wavelength: {
            type: 'number',
            label: 'Wavelength (nm)',
            placeholder: '589.3',
            min: 200,
            max: 1000,
            step: 0.1,
            defaultValue: 589.3,
            className: 'w-32'
          },

          slitWidth: {
            type: 'number',
            label: 'Slit Width (μm)',
            placeholder: '10',
            min: 1,
            max: 100,
            step: 1,
            defaultValue: 10,
            className: 'w-32'
          },

          integrationTime: {
            type: 'number',
            label: 'Integration Time (ms)',
            placeholder: '100',
            min: 10,
            max: 1000,
            step: 10,
            defaultValue: 100,
            className: 'w-32'
          }
        }
      },

      // 🎯 RAW MATERIALS CONFIGURATION
      rawMaterials: {
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
            validation: {
              custom: (value, formData, index) => {
                const max = formData.advancedSpectroOptions.rawMaterials[index]?.max;
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
            validation: {
              custom: (value, formData, index) => {
                const min = formData.advancedSpectroOptions.rawMaterials[index]?.min;
                return !min || value >= min || 'Max must be ≥ Min';
              }
            }
          }
        }
      }
    }
  },

  // 🔋 SECTION 6: CHARGEMIX DATA (IF Module)
  chargemixData: {
    type: 'object',
    label: 'Chargemix Data Configuration',
    description: 'Configure chargemix items for IF Kiosk module',
    visible: false, // Controlled by module selection dependency
    fields: {
      visible: {
        type: 'checkbox',
        label: 'Show Chargemix Configuration',
        description: 'Display chargemix data configuration',
        defaultValue: false
      },

      chargemixItems: {
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
            validation: {
              custom: (value, formData, index) => {
                const max = formData.chargemixData.chargemixItems[index]?.maxQtyPercentage;
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
            validation: {
              custom: (value, formData, index) => {
                const min = formData.chargemixData.chargemixItems[index]?.minQtyPercentage;
                return !min || value >= min || 'Max Qty must be ≥ Min Qty';
              }
            }
          }
        }
      }
    }
  },

  // 🎛️ SECTION 7: FORM OPTIONS
  formOptions: {
    type: 'object',
    label: 'Form Options',
    description: 'Additional form configuration options',
    fields: {
      autoValidate: {
        type: 'checkbox',
        label: 'Auto-validate on change',
        description: 'Automatically validate form fields as user types',
        defaultValue: true
      },

      rememberChoice: {
        type: 'checkbox',
        label: 'Remember my choice for new grades',
        description: 'Save preferences for future grade selections',
        defaultValue: false
      }
    }
  }
};

// 🎯 FORM SECTIONS FOR ORGANIZATION
export const comprehensiveFormSections = {
  moduleSelection: {
    title: 'Module Selection',
    description: 'Select modules for grade configuration',
    fields: ['moduleSelection'],
    order: 1
  },
  
  gradeOverview: {
    title: 'Grade Overview & Identification',
    description: 'Basic grade information and metallurgical parameters',
    fields: ['gradeOverview'],
    order: 2
  },
  
  btcDecision: {
    title: 'Bath Chemistry Decision',
    description: 'Choose whether to include bath chemistry',
    fields: ['btcDecision'],
    order: 3
  },
  
  chemistry: {
    title: 'Element Chemistry',
    description: 'Chemical composition and ranges',
    fields: ['elements'],
    order: 4
  },
  
  advancedSpectro: {
    title: 'Advanced Spectro Options',
    description: 'Advanced spectrometer configuration',
    fields: ['advancedSpectroOptions'],
    order: 5,
    conditional: true, // Only show if SPECTRO module is selected
    condition: (formData) => formData.moduleSelection.selectedModules.includes('SPECTRO')
  },
  
  chargemix: {
    title: 'Chargemix Data Configuration',
    description: 'Chargemix configuration for IF Kiosk',
    fields: ['chargemixData'],
    order: 6,
    conditional: true, // Only show if IF module is selected
    condition: (formData) => formData.moduleSelection.selectedModules.includes('IF')
  },
  
  options: {
    title: 'Form Options',
    description: 'Additional form configuration',
    fields: ['formOptions'],
    order: 7
  }
};

// 🎯 DEFAULT VALUES FOR FORM INITIALIZATION
export const defaultComprehensiveValues = {
  moduleSelection: {
    selectedModules: ['SPECTRO']
  },
  
  gradeOverview: {
    tagId: '',
    gradeName: '',
    gradeCode: '',
    gradeType: 'DI',
    ductileIronFields: {
      tappingTemperatureMin: BUSINESS_CONSTANTS.DEFAULT_TAPPING_TEMP_MIN,
      tappingTemperatureMax: BUSINESS_CONSTANTS.DEFAULT_TAPPING_TEMP_MAX,
      mgTreatmentTime: BUSINESS_CONSTANTS.DEFAULT_MG_TREATMENT_TIME
    }
  },
  
  btcDecision: {
    btcChoice: null,
    rememberChoice: false
  },
  
  elements: {
    selectedElements: ['C', 'Si'],
    elementData: [
      { symbol: 'C', finalMin: 3.45, finalMax: 3.55 },
      { symbol: 'Si', finalMin: 2.30, finalMax: 2.35 }
    ],
    toleranceEnabled: false
  },
  
  advancedSpectroOptions: {
    visible: false,
    spectroConfig: {
      wavelength: 589.3,
      slitWidth: 10,
      integrationTime: 100
    },
    rawMaterials: []
  },
  
  chargemixData: {
    visible: false,
    chargemixItems: []
  },
  
  formOptions: {
    autoValidate: true,
    rememberChoice: false
  }
};

// 🔧 BUSINESS LOGIC UTILITIES
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

// 🎯 VALIDATION RULES
export const comprehensiveValidationRules = {
  // Cross-field validation
  validateTemperatureRange: (formData) => {
    const { tappingTemperatureMin, tappingTemperatureMax } = formData.gradeOverview.ductileIronFields;
    if (tappingTemperatureMin && tappingTemperatureMax) {
      return tappingTemperatureMin <= tappingTemperatureMax || 'Min temperature must be ≤ Max temperature';
    }
    return true;
  },

  validateElementRanges: (formData) => {
    const errors = [];
    formData.elements.elementData.forEach((element, index) => {
      if (element.finalMin && element.finalMax && element.finalMin > element.finalMax) {
        errors.push(`${element.symbol}: Final Min must be ≤ Final Max`);
      }
      if (element.bathFields?.bathMin && element.bathFields?.bathMax && 
          element.bathFields.bathMin > element.bathFields.bathMax) {
        errors.push(`${element.symbol}: Bath Min must be ≤ Bath Max`);
      }
    });
    return errors.length === 0 || errors;
  },

  validateModuleDependencies: (formData) => {
    const { selectedModules } = formData.moduleSelection;
    const errors = [];
    
    if (!selectedModules.includes('SPECTRO')) {
      errors.push('SPECTRO module is required');
    }
    
    return errors.length === 0 || errors;
  }
};

// 🎯 FORM STATE MANAGEMENT
export const formStateConfig = {
  // Redux state mapping
  reduxMapping: {
    'moduleSelection.selectedModules': 'selectedModules',
    'gradeOverview': 'gradeOverview',
    'btcDecision.btcChoice': 'btcChoice',
    'btcDecision.rememberChoice': 'rememberChoice',
    'elements.elementData': 'elements',
    'elements.selectedElements': 'selectedElements',
    'elements.toleranceEnabled': 'toleranceEnabled',
    'advancedSpectroOptions.visible': 'advancedOptionsVisible',
    'advancedSpectroOptions.rawMaterials': 'rawMaterials',
    'chargemixData.visible': 'chargemixVisible',
    'chargemixData.chargemixItems': 'chargemixItems'
  },

  // Form submission mapping
  submissionMapping: {
    'moduleSelection.selectedModules': 'modules',
    'gradeOverview': 'gradeInfo',
    'btcDecision.btcChoice': 'btcEnabled',
    'elements.elementData': 'chemistry',
    'advancedSpectroOptions.rawMaterials': 'rawMaterials',
    'chargemixData.chargemixItems': 'chargemix'
  }
};

