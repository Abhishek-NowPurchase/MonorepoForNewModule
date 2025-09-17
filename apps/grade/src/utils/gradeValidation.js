// 🎯 GRADE VALIDATION FUNCTIONS - MOVED FROM SCHEMAS TO UTILS

// 📊 VALIDATION UTILITIES
const isValidString = (value, minLength = 1, maxLength = 100) => {
  return typeof value === 'string' && 
         value.trim().length >= minLength && 
         value.trim().length <= maxLength;
};

const isValidNumber = (value, min = 0, max = 999999) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

const isValidElement = (element) => {
  if (!element || typeof element !== 'object') return false;
  
  const { finalMin, finalMax } = element;
  
  // Check required fields
  if (!isValidNumber(finalMin) || !isValidNumber(finalMax)) return false;
  
  // Check logical constraints
  if (finalMin >= finalMax) return false;
  
  // Check optional fields if they exist
  if (element.bathMin !== undefined && !isValidNumber(element.bathMin)) return false;
  if (element.bathMax !== undefined && !isValidNumber(element.bathMax)) return false;
  if (element.toleranceMin !== undefined && !isValidNumber(element.toleranceMin)) return false;
  if (element.toleranceMax !== undefined && !isValidNumber(element.toleranceMax)) return false;
  
  // Validate tolerance logic
  if (element.toleranceMin !== undefined && element.toleranceMin > finalMin) return false;
  if (element.toleranceMax !== undefined && element.toleranceMax < finalMax) return false;
  
  return true;
};

const isValidRawMaterial = (material) => {
  if (!material || typeof material !== 'object') return false;
  
  const { materialName, materialType, min, max } = material;
  
  return isValidString(materialName) &&
         isValidString(materialType) &&
         isValidNumber(min, 0, 100) &&
         isValidNumber(max, 0, 100) &&
         min <= max;
};

const isValidChargemixItem = (item) => {
  if (!item || typeof item !== 'object') return false;
  
  const { materialName, materialType, minQtyPercentage, maxQtyPercentage } = item;
  
  return isValidString(materialName) &&
         isValidString(materialType) &&
         isValidNumber(minQtyPercentage, 0, 100) &&
         isValidNumber(maxQtyPercentage, 0, 100) &&
         minQtyPercentage <= maxQtyPercentage;
};

// 🎯 MAIN VALIDATION FUNCTIONS

/**
 * Validate Grade Overview data
 */
export const validateGradeOverview = (gradeOverview) => {
  const errors = [];
  
  // Required fields
  if (!isValidString(gradeOverview.tagId, 1, 50)) {
    errors.push('Tag ID is required and must be 1-50 characters');
  }
  
  if (!isValidString(gradeOverview.gradeName, 1, 100)) {
    errors.push('Grade Name is required and must be 1-100 characters');
  }
  
  if (!isValidString(gradeOverview.gradeCode, 1, 50)) {
    errors.push('Grade Code is required and must be 1-50 characters');
  }
  
  if (!isValidString(gradeOverview.gradeType, 1, 10)) {
    errors.push('Grade Type is required');
  }
  
  // Optional fields with validation
  if (gradeOverview.tappingTemperatureMin !== undefined) {
    if (!isValidNumber(gradeOverview.tappingTemperatureMin, 800, 2000)) {
      errors.push('Tapping Temperature Min must be between 800-2000°C');
    }
  }
  
  if (gradeOverview.tappingTemperatureMax !== undefined) {
    if (!isValidNumber(gradeOverview.tappingTemperatureMax, 800, 2000)) {
      errors.push('Tapping Temperature Max must be between 800-2000°C');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    errorCount: errors.length
  };
};

/**
 * Validate Elements data
 */
export const validateElements = (elements) => {
  const errors = [];
  
  if (!elements || !Array.isArray(elements)) {
    errors.push('Elements must be an array');
    return { isValid: false, errors, errorCount: errors.length };
  }
  
  if (elements.length === 0) {
    errors.push('At least one element must be defined');
  }
  
  elements.forEach((element, index) => {
    if (!isValidElement(element)) {
      errors.push(`Element ${index + 1} has invalid data`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    errorCount: errors.length
  };
};

/**
 * Validate Raw Materials data
 */
export const validateRawMaterials = (rawMaterials) => {
  const errors = [];
  
  if (!rawMaterials || !Array.isArray(rawMaterials)) {
    errors.push('Raw Materials must be an array');
    return { isValid: false, errors, errorCount: errors.length };
  }
  
  rawMaterials.forEach((material, index) => {
    if (!isValidRawMaterial(material)) {
      errors.push(`Raw Material ${index + 1} has invalid data`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    errorCount: errors.length
  };
};

/**
 * Validate Chargemix Items data
 */
export const validateChargemixItems = (chargemixItems) => {
  const errors = [];
  
  if (!chargemixItems || !Array.isArray(chargemixItems)) {
    errors.push('Chargemix Items must be an array');
    return { isValid: false, errors, errorCount: errors.length };
  }
  
  chargemixItems.forEach((item, index) => {
    if (!isValidChargemixItem(item)) {
      errors.push(`Chargemix Item ${index + 1} has invalid data`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    errorCount: errors.length
  };
};

/**
 * Validate complete Grade Form Data
 */
export const validateGradeForm = (formData) => {
  const errors = [];
  
  // Validate required modules
  if (!formData.selectedModules || !Array.isArray(formData.selectedModules)) {
    errors.push('Selected Modules must be an array');
  } else if (formData.selectedModules.length === 0) {
    errors.push('At least one module must be selected');
  } else if (!formData.selectedModules.includes('SPECTRO')) {
    errors.push('SPECTRO module is required');
  }
  
  // Validate Grade Overview
  const overviewValidation = validateGradeOverview(formData.gradeOverview);
  if (!overviewValidation.isValid) {
    errors.push(...overviewValidation.errors);
  }
  
  // Validate BTC Choice
  if (formData.btcChoice === null || formData.btcChoice === undefined) {
    errors.push('BTC choice must be made');
  } else if (!['with', 'without'].includes(formData.btcChoice)) {
    errors.push('BTC choice must be either "with" or "without"');
  }
  
  // Validate Elements (required for SPECTRO)
  if (formData.selectedModules.includes('SPECTRO')) {
    const elementsValidation = validateElements(formData.elements);
    if (!elementsValidation.isValid) {
      errors.push(...elementsValidation.errors);
    }
  }
  
  // Validate Raw Materials (if Advanced Options enabled)
  if (formData.advancedOptionsVisible && formData.rawMaterials.length > 0) {
    const materialsValidation = validateRawMaterials(formData.rawMaterials);
    if (!materialsValidation.isValid) {
      errors.push(...materialsValidation.errors);
    }
  }
  
  // Validate Chargemix Items (if IF module selected)
  if (formData.selectedModules.includes('IF') && formData.chargemixItems.length > 0) {
    const chargemixValidation = validateChargemixItems(formData.chargemixItems);
    if (!chargemixValidation.isValid) {
      errors.push(...chargemixValidation.errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    errorCount: errors.length
  };
};

/**
 * Validate specific field values
 */
export const validateField = (fieldName, value, context = {}) => {
  switch (fieldName) {
    case 'tagId':
      return isValidString(value, 1, 50) ? null : 'Tag ID must be 1-50 characters';
    
    case 'gradeName':
      return isValidString(value, 1, 100) ? null : 'Grade Name must be 1-100 characters';
    
    case 'gradeCode':
      return isValidString(value, 1, 50) ? null : 'Grade Code must be 1-50 characters';
    
    case 'tappingTemperatureMin':
      return isValidNumber(value, 800, 2000) ? null : 'Temperature must be 800-2000°C';
    
    case 'tappingTemperatureMax':
      return isValidNumber(value, 800, 2000) ? null : 'Temperature must be 800-2000°C';
    
    case 'mgTreatmentTime':
      return isValidNumber(value, 0.1, 10) ? null : 'Treatment time must be 0.1-10 minutes';
    
    case 'elementValue':
      return isValidNumber(value, 0, 100) ? null : 'Element value must be 0-100%';
    
    case 'percentage':
      return isValidNumber(value, 0, 100) ? null : 'Percentage must be 0-100%';
    
    default:
      return null; // No validation for unknown fields
  }
};

/**
 * Get validation summary for form
 */
export const getValidationSummary = (formData) => {
  const validation = validateGradeForm(formData);
  
  return {
    ...validation,
    summary: validation.isValid 
      ? '✅ Form is valid and ready for submission'
      : `❌ Form has ${validation.errorCount} validation errors`,
    criticalErrors: validation.errors.filter(error => 
      error.includes('required') || error.includes('must be')
    ),
    warnings: validation.errors.filter(error => 
      !error.includes('required') && !error.includes('must be')
    )
  };
};
