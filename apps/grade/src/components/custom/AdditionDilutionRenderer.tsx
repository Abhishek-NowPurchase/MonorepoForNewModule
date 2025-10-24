// ============================================
// IMPORTS
// ============================================
import React, { useEffect } from "react";
import {
  Autocomplete,
  TextField,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import "../../styles/addition-dilution.css";
import { MetalcloudMeltingFurnaceLine, SystemErrorWarningLine } from "now-design-icons";

// Triangle Alert Icon for validation errors
const TriangleAlertIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#f59f0a" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
    <path d="M12 9v4"></path>
    <path d="M12 17h.01"></path>
  </svg>
);

// ============================================
// TYPESCRIPT TYPES
// ============================================
interface AdditionElement {
  element: string;
  elementId: string | number;
  minPercent: number | string;
  maxPercent: number | string;
  category: string; // ADDITIVES, LADLE, or NODULARIZER
  fullMaterialData?: any;
}

interface ElementOption {
  value: string | number;
  label: string;
}

interface FormField {
  key: string;
  type: string;
  options?: (values: any, inputValue?: string) => Promise<ElementOption[]>;
  meta?: {
    autoSelectFirst?: boolean;
  };
  validators?: {
    required?: boolean;
  };
}

interface FormValues {
  targetChemistry: Array<{
    element: string;
    symbol?: string;
  }>;
  additionElements: AdditionElement[];
  selectedAdditionElement: string | number;
  elementMinPercent: number | string;
  elementMaxPercent: number | string;
  includeCarbon?: boolean;
  includeSilicon?: boolean;
  rawMaterials?: AdditionElement[];
  [key: string]: any;
}

interface AdditionDilutionRendererProps {
  fields: FormField[];
  form: {
    values: FormValues;
    setValue: (key: string, value: any) => void;
    errors?: Record<string, string[]>;
  };
  section: {
    title: string;
    collapsed?: boolean;
  };
}

interface AdditionInputProps {
  value: number | string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  hasError?: boolean;
}

interface ElementCheckboxProps {
  elementSymbol: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface AdditionElementRowProps {
  element: AdditionElement;
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onDelete: (index: number) => void;
  validationError?: string;
}

// ============================================
// CONSTANTS & CONFIG
// ============================================
const FIELD_KEYS = {
  ADDITION_ELEMENTS: "additionElements",
  RAW_MATERIALS: "rawMaterials",
  SELECTED_ADDITION_ELEMENT: "selectedAdditionElement",
  ELEMENT_MIN_PERCENT: "elementMinPercent",
  ELEMENT_MAX_PERCENT: "elementMaxPercent",
  INCLUDE_CARBON: "includeCarbon",
  INCLUDE_SILICON: "includeSilicon",
} as const;

const INPUT_CONFIG = {
  STEP: 0.01,
  MIN: 0,
  MAX: 100,
  PLACEHOLDER: "0.0",
} as const;

const MESSAGES = {
  SELECT_ELEMENT: "Please select an element",
  MAX_MUST_BE_GREATER: "Maximum percentage must be greater than minimum percentage",
} as const;

const TRANSITION_DURATION = 300;

const CATEGORY_STYLES = {
  ADDITIVES: "addition-dilution-category-badge additives",
  LADLE: "addition-dilution-category-badge ladle",
  NODULARIZER: "addition-dilution-category-badge nodularizer",
  DEFAULT: "addition-dilution-category-badge",
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Checks if a value is empty (null, undefined, or empty string)
 */
const isEmpty = (value: any): boolean => {
  return value === "" || value === null || value === undefined;
};


/**
 * Converts value to string for input fields
 */
const getInputValue = (value: number | string | null | undefined): string => {
  return !isEmpty(value) ? String(value) : "";
};

/**
 * Parses string to number or returns empty string
 */
const parseNumericValue = (value: string): number | string => {
  return value === "" ? "" : parseFloat(value);
};

/**
 * Creates an AdditionElement object
 */
const createAdditionElement = (
  element: string | number,
  minPercent: number | string,
  maxPercent: number | string,
  category: string,
  fullMaterialData?: any
): AdditionElement => {
  return {
    element: String(element),
    elementId: element,
    minPercent: typeof minPercent === "string" ? parseFloat(minPercent) : minPercent,
    maxPercent: typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent,
    category: category,
    fullMaterialData: fullMaterialData,
  };
};



/**
 * Gets the appropriate CSS class for category badge
 */
const getCategoryBadgeClass = (category: string): string => {
  return CATEGORY_STYLES[category as keyof typeof CATEGORY_STYLES] || CATEGORY_STYLES.DEFAULT;
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates addition inputs based on category rules:
 * - LADLE: Both Min and Max required
 * - NODULARIZER: Only Min required
 * - ADDITIVES: Min/Max optional
 */
const validateAdditionInputs = (
  selectedElement: string | number,
  minPercent: number | string,
  maxPercent: number | string,
  category: string
): string | null => {
  if (!selectedElement) return MESSAGES.SELECT_ELEMENT;

  // Category-specific validation
  if (category === "LADLE") {
    if (isEmpty(minPercent)) return "Min % is required for LADLE materials";
    if (isEmpty(maxPercent)) return "Max % is required for LADLE materials";
  } else if (category === "NODULARIZER") {
    if (isEmpty(minPercent)) return "Min % is required for NODULARIZER materials";
  }

  // Validate Min if provided
  if (!isEmpty(minPercent)) {
    const minValue = typeof minPercent === "string" ? parseFloat(minPercent) : minPercent;
    if (isNaN(minValue)) return "Please enter a valid Min %";
    if (minValue < 0) return "Min % must be positive";
  }

  // Validate Max if provided
  if (!isEmpty(maxPercent)) {
    const maxValue = typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent;
    if (isNaN(maxValue)) return "Please enter a valid Max %";
    if (maxValue < 0) return "Max % must be positive";
  }

  // Cross-validation: Min <= Max
  if (!isEmpty(minPercent) && !isEmpty(maxPercent)) {
    const minValue = typeof minPercent === "string" ? parseFloat(minPercent) : minPercent;
    const maxValue = typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent;
    if (minValue > maxValue) return "Min % cannot be greater than Max %";
  }

  return null;
};

/**
 * Validates that all required categories are present
 */
export const validateRawMaterialsCategories = (rawMaterials: AdditionElement[]): string | null => {
  const categories = rawMaterials.map(material => material.category);
  const hasAdditives = categories.includes("ADDITIVES");
  const hasLadle = categories.includes("LADLE");
  const hasNodularizer = categories.includes("NODULARIZER");

  const missingCategories: string[] = [];
  if (!hasAdditives) missingCategories.push("Please select at least one ADDITIVES item");
  if (!hasLadle) missingCategories.push("Please select at least one LADLE item");
  if (!hasNodularizer) missingCategories.push("Please select at least one NODULARIZER item");

  if (missingCategories.length > 0) {
    return missingCategories.join("\n");
  }

  return null;
};

/**
 * Validates all raw materials in the form
 */
export const validateRawMaterialsForm = (rawMaterials: AdditionElement[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Category validation
  const categoryError = validateRawMaterialsCategories(rawMaterials);
  if (categoryError) {
    errors.push(categoryError);
  }
  
  // Individual material validation
  rawMaterials.forEach((material, index) => {
    const materialError = validateAdditionInputs(
      material.element,
      material.minPercent,
      material.maxPercent,
      material.category
    );
    if (materialError) {
      errors.push(`Material ${index + 1} (${material.element}): ${materialError}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// ============================================
// SMALL UI COMPONENTS
// ============================================

/**
 * Reusable numeric input for addition/dilution percentages
 */
const AdditionInput: React.FC<AdditionInputProps> = ({
  value,
  placeholder = INPUT_CONFIG.PLACEHOLDER,
  onChange,
  className = "addition-dilution-input",
  hasError = false,
}) => {
  return (
    <input
      type="number"
      className={`${className} ${hasError ? 'addition-dilution-input-error' : ''}`}
      step={INPUT_CONFIG.STEP}
      min={INPUT_CONFIG.MIN}
      max={INPUT_CONFIG.MAX}
      placeholder={placeholder}
      value={getInputValue(value)}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

/**
 * Checkbox for selecting elements
 */
const ElementCheckbox: React.FC<ElementCheckboxProps> = ({
  elementSymbol,
  checked,
  onChange,
}) => {
  return (
    <div className="addition-dilution-element-checkbox">
      <input
        type="checkbox"
        id={`element-${elementSymbol}`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="addition-dilution-checkbox"
      />
      <label
        htmlFor={`element-${elementSymbol}`}
        className="addition-dilution-checkbox-label"
      >
        {elementSymbol}
      </label>
    </div>
  );
};

/**
 * Table row for displaying and editing raw materials
 */
const AdditionElementRow: React.FC<AdditionElementRowProps> = ({
  element,
  index,
  onUpdate,
  onDelete,
  validationError,
}) => {
  const isMinRequired = element.category === "LADLE" || element.category === "NODULARIZER";
  const isMaxRequired = element.category === "LADLE";

  const hasMinError = isMinRequired && isEmpty(element.minPercent);
  const hasMaxError = isMaxRequired && isEmpty(element.maxPercent);
  const hasValidationError = !!validationError;

  return (
    <tr className="addition-dilution-tr">
      <td className="addition-dilution-td addition-dilution-td-material">
        {element.element || element.elementId}
      </td>
      <td className="addition-dilution-td addition-dilution-td-center">
        <span className={getCategoryBadgeClass(element.category)}>
          {element.category}
        </span>
      </td>
      <td className="addition-dilution-td addition-dilution-td-input">
        <div className={hasValidationError ? "tolerance-section-error-tooltip" : ""}>
          <AdditionInput
            value={element.minPercent}
            onChange={(value) => onUpdate(index, "minPercent", parseNumericValue(value))}
            className="addition-dilution-table-input"
            placeholder={isMinRequired ? "Required" : "Optional"}
            hasError={hasMinError || hasValidationError}
          />
          {hasValidationError && (
            <div className="tolerance-section-tooltip-content">
              <span className="tolerance-section-tooltip-icon">
                <TriangleAlertIcon />
              </span>
              <span className="tolerance-section-tooltip-message">
                {validationError}
              </span>
            </div>
          )}
        </div>
      </td>
      <td className="addition-dilution-td addition-dilution-td-input">
        <div className={hasValidationError ? "tolerance-section-error-tooltip" : ""}>
          <AdditionInput
            value={element.maxPercent}
            onChange={(value) => onUpdate(index, "maxPercent", parseNumericValue(value))}
            className="addition-dilution-table-input"
            placeholder={isMaxRequired ? "Required" : "Optional"}
            hasError={hasMaxError || hasValidationError}
          />
          {hasValidationError && (
            <div className="tolerance-section-tooltip-content">
              <span className="tolerance-section-tooltip-icon">
                <TriangleAlertIcon />
              </span>
              <span className="tolerance-section-tooltip-message">
                {validationError}
              </span>
            </div>
          )}
        </div>
      </td>
      <td className="addition-dilution-td addition-dilution-td-center">
        <button
          className="addition-dilution-delete-button"
          type="button"
          onClick={() => onDelete(index)}
        >
          ✕
        </button>
      </td>
    </tr>
  );
};

/**
 * Async autocomplete field for material selection
 */
const AsyncAutocompleteField = ({ field, value, onChange, error, form }: any) => {
  const [options, setOptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  
  const selectedOption = options.find((option) => option.value == value) || null;
  const displayOption = selectedOption || (value ? { value, label: String(value) } : null);
  
  // Load options with debounce
  React.useEffect(() => {
    const loadOptions = async () => {
      if (field.options) {
        try {
          setLoading(true);
          const optionsResult = await field.options(form.values, inputValue);
          if (Array.isArray(optionsResult)) {
            setOptions(optionsResult);
          }
        } catch (error) {
          console.warn(`Failed to load options for ${field.key}:`, error);
        } finally {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      loadOptions();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [field.options, form.values, inputValue]);

  // Load initial options on mount
  React.useEffect(() => {
    if (field.options && options.length === 0 && !loading) {
      const loadInitialOptions = async () => {
        try {
          setLoading(true);
          const optionsResult = await field.options(form.values, "");
          if (Array.isArray(optionsResult)) {
            setOptions(optionsResult);
            if (field.meta?.autoSelectFirst && !value && optionsResult.length > 0) {
              onChange(optionsResult[0].value);
            }
          }
        } catch (error) {
          console.warn(`Failed to load initial options for ${field.key}:`, error);
        } finally {
          setLoading(false);
        }
      };
      loadInitialOptions();
    }
  }, [field.options]);

  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const handleChange = (event: any, newValue: any) => {
    onChange(newValue?.value || "");
  };

  return (
    <FormControl
      fullWidth
      error={error && error.length > 0}
      required={field.validators?.required}
    >
      <Autocomplete
        id={field.key}
        options={options}
        value={displayOption}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleChange}
        getOptionLabel={(option) => option.label.split(" (")[0] || ""}
        isOptionEqualToValue={(option, value) => option.value === value?.value}
        loading={loading}
        freeSolo={false}
        disableClearable={false}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Select raw material..."
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? "Loading..." : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
        renderOption={(props, option) => {
          const labelParts = option.label.split(" (");
          const materialName = labelParts[0];
          const cmType = labelParts[1] ? labelParts[1].replace(")", "") : null;

          return (
            <li {...props} key={option.value} className="chargemix-dropdown-option">
              <span className="chargemix-option-material">{materialName}</span>
              {cmType && <span className="chargemix-type-badge">{cmType}</span>}
            </li>
          );
        }}
      />
      {error && error.length > 0 && (
        <FormHelperText error>{error.join(", ")}</FormHelperText>
      )}
    </FormControl>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const AdditionDilutionRenderer: React.FC<AdditionDilutionRendererProps> = ({ 
  fields, 
  form, 
  section,
}) => {
  const errors = form.errors || {};
  const [validationErrors, setValidationErrors] = React.useState<{[key: string]: string}>({});
  
  // Validation function for Min <= Max range
  const validateMinMaxRange = (key: string, minValue: number | string | undefined, maxValue: number | string | undefined) => {
    // Only validate when both values are provided and not empty
    if (minValue !== undefined && minValue !== null && minValue !== "" && 
        maxValue !== undefined && maxValue !== null && maxValue !== "") {
      const min = typeof minValue === "string" ? parseFloat(minValue) : minValue;
      const max = typeof maxValue === "string" ? parseFloat(maxValue) : maxValue;
      
      if (!isNaN(min) && !isNaN(max) && max <= min) {
        setValidationErrors(prev => ({
          ...prev,
          [key]: "Max % must be greater than Min %"
        }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    } else {
      // Clear error if either value is missing
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };
  
  // Auto-expand section if there are errors
  useEffect(() => {
    if (errors?.additionElements?.length > 0 || errors?.rawMaterials?.length > 0) {
      setIsCollapsed(false);
    }
  }, [errors?.additionElements, errors]);
  
  // Initialize additionElements from targetChemistry
  React.useEffect(() => {
    const currentElements = form.values[FIELD_KEYS.ADDITION_ELEMENTS] || [];
    const targetChemistry = form.values.targetChemistry || [];

    if (currentElements.length === 0 && targetChemistry.length > 0) {
      const defaultElements = targetChemistry.map((element: any) => ({
        element: element.element || element.symbol,
        selected: true,
      }));
      form.setValue(FIELD_KEYS.ADDITION_ELEMENTS, defaultElements);
    }
  }, [form.values.targetChemistry]);
  
  // Collapsible state
  const [isCollapsed, setIsCollapsed] = React.useState(section.collapsed || false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  const handleFieldChange = (fieldKey: string, value: any) => {
    form.setValue(fieldKey, value);
  };

  // Handle element checkbox changes
  const handleElementCheckboxChange = (elementSymbol: string, checked: boolean) => {
    const currentElements = form.values[FIELD_KEYS.ADDITION_ELEMENTS] || [];
    let updatedElements;

    if (checked) {
      const exists = currentElements.some((el: any) => el.element === elementSymbol);
      if (!exists) {
        updatedElements = [...currentElements, { element: elementSymbol, selected: true }];
      } else {
        updatedElements = currentElements;
      }
    } else {
      updatedElements = currentElements.filter((el: any) => el.element !== elementSymbol);
    }

    form.setValue(FIELD_KEYS.ADDITION_ELEMENTS, updatedElements);
  };
  
  const toggleCollapsed = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setIsCollapsed(!isCollapsed);
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  };

  // Add raw material handler
  const handleAddRawMaterial = async () => {
    const selectedMaterial = form.values[FIELD_KEYS.SELECTED_ADDITION_ELEMENT];
    const minPercent = form.values[FIELD_KEYS.ELEMENT_MIN_PERCENT];
    const maxPercent = form.values[FIELD_KEYS.ELEMENT_MAX_PERCENT];

    // Get material data from inventory
    let materialName = selectedMaterial;
    let materialCategory = "ADDITIVES";
    let fullMaterialData = null;
    
    try {
      const itemInventoryData = (window as any).itemInventoryData;
      if (itemInventoryData?.results) {
        const materialData = itemInventoryData.results.find(
          (material: any) => material.id == selectedMaterial
        );
        if (materialData) {
          materialName = materialData.name;
          materialCategory = materialData.cm_type || "ADDITIVES";
          fullMaterialData = materialData;
        }
      }
    } catch (error) {
      console.warn("Failed to get material data, using defaults:", error);
    }

    // Validate inputs
    const validationError = validateAdditionInputs(
      selectedMaterial,
      minPercent,
      maxPercent,
      materialCategory
    );
    if (validationError) {
      console.warn("Validation error:", validationError);
      return;
    }

    // Add to rawMaterials
    const existingRawMaterials = form.values[FIELD_KEYS.RAW_MATERIALS] || [];
    const newRawMaterial = createAdditionElement(
      materialName,
      minPercent,
      maxPercent,
      materialCategory,
      fullMaterialData
    );
    const updatedRawMaterials = [...existingRawMaterials, newRawMaterial];

    form.setValue(FIELD_KEYS.RAW_MATERIALS, updatedRawMaterials);

    // Clear input fields
    form.setValue(FIELD_KEYS.SELECTED_ADDITION_ELEMENT, "");
    form.setValue(FIELD_KEYS.ELEMENT_MIN_PERCENT, "");
    form.setValue(FIELD_KEYS.ELEMENT_MAX_PERCENT, "");
  };

  // Update raw material handler
  const handleUpdateRawMaterial = (index: number, field: string, value: any) => {
    const updatedRawMaterials = [...(form.values[FIELD_KEYS.RAW_MATERIALS] || [])];
    updatedRawMaterials[index] = {
      ...updatedRawMaterials[index],
      [field]: value,
    };
    form.setValue(FIELD_KEYS.RAW_MATERIALS, updatedRawMaterials);
    
    // Validate Min <= Max for this row
    const updatedElement = updatedRawMaterials[index];
    validateMinMaxRange(`table-${index}`, updatedElement.minPercent, updatedElement.maxPercent);
  };

  // Delete raw material handler
  const handleDeleteRawMaterial = (index: number) => {
    const updatedRawMaterials = (form.values[FIELD_KEYS.RAW_MATERIALS] || []).filter(
      (_: any, i: number) => i !== index
    );
    form.setValue(FIELD_KEYS.RAW_MATERIALS, updatedRawMaterials);
  };

  // Get visible fields for the form
  const visibleFields = fields.filter((field) =>
    [
      FIELD_KEYS.SELECTED_ADDITION_ELEMENT,
      FIELD_KEYS.ELEMENT_MIN_PERCENT,
      FIELD_KEYS.ELEMENT_MAX_PERCENT,
    ].includes(field.key as any)
  );

  // Render form field
  const renderField = (field: any) => {
    const rawValue = form.values[field.key] || field.defaultValue || "";
    const value = typeof rawValue === "number" ? rawValue.toString() : rawValue || "";
    const error = form.errors?.[field.key];
    if (field.type === "select" && field.options) {
      return (
        <AsyncAutocompleteField
          key={field.key}
          field={field}
          value={value}
          onChange={(newValue: any) => handleFieldChange(field.key, newValue)}
          error={error}
          form={form}
        />
      );
    }

    return null;
  };

  // Check if element is selected
  const isElementSelected = (elementSymbol: string) => {
    return (form.values[FIELD_KEYS.ADDITION_ELEMENTS] || []).some(
      (el: any) => el.element === elementSymbol
    );
  };

  // Get category validation error
  const categoryError = (form.values[FIELD_KEYS.RAW_MATERIALS]?.length ?? 0) > 0
    ? validateRawMaterialsCategories(form.values[FIELD_KEYS.RAW_MATERIALS] || [])
    : null;

  // Determine if fields are required based on selected material category
  const getSelectedMaterialCategory = () => {
    const selectedMaterialId = form.values[FIELD_KEYS.SELECTED_ADDITION_ELEMENT];
    if (!selectedMaterialId) return "ADDITIVES"; // Default
    
    try {
      const itemInventoryData = (window as any).itemInventoryData;
      if (itemInventoryData?.results) {
        const materialData = itemInventoryData.results.find(
          (material: any) => material.id == selectedMaterialId
        );
        return materialData?.cm_type || "ADDITIVES";
      }
    } catch (error) {
      console.warn("Failed to get material category:", error);
    }
    return "ADDITIVES"; // Default fallback
  };

  const selectedMaterialCategory = getSelectedMaterialCategory();
  const isMinRequired = selectedMaterialCategory === "LADLE" || selectedMaterialCategory === "NODULARIZER";
  const isMaxRequired = selectedMaterialCategory === "LADLE";

  // Check if add button should be disabled
  const isAddButtonDisabled = 
    !form.values[FIELD_KEYS.SELECTED_ADDITION_ELEMENT] ||
    (isMinRequired && isEmpty(form.values[FIELD_KEYS.ELEMENT_MIN_PERCENT])) ||
    (isMaxRequired && isEmpty(form.values[FIELD_KEYS.ELEMENT_MAX_PERCENT])) ||
    !!validationErrors['add-min-max'];
  return (
    <div className="addition-dilution-section">
      {/* Collapsible Header */}
      <button
        className="addition-dilution-header-button"
        type="button"
        onClick={toggleCollapsed}
      >
        <div className="addition-dilution-header-left">
          <span className="addition-dilution-chevron">
            <FontAwesomeIcon 
              icon={isCollapsed ? faChevronRight : faChevronDown} 
              style={{ color: '#1d2530' }} 
            />
          </span>
          <span className="addition-dilution-settings-icon">
            <MetalcloudMeltingFurnaceLine width={16} height={16} />
          </span>
          <span className="addition-dilution-header-title">
            {section.title}
          </span>
        </div>
        <div className="addition-dilution-header-badge">Power User</div>
      </button>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="addition-dilution-content">
          <div className="addition-dilution-card">
            {/* Card Header */}
            <div className="addition-dilution-card-header">
              <h3 className="addition-dilution-card-title">
                <span className="addition-dilution-card-title-icon">
                  <MetalcloudMeltingFurnaceLine width={20} height={20} />
                </span>
                {section.title}
              </h3>
              <p className="addition-dilution-card-description">
                Configure suggestion generation parameters and raw material constraints.
              </p>
            </div>

            {/* Card Body */}
            <div className="addition-dilution-card-body">
              {/* Elements Section */}
              <div className="addition-dilution-elements-section">
                <div className="addition-dilution-elements-header">
                  <label className="addition-dilution-section-label">Elements</label>
                  <p className="addition-dilution-section-description">
                    Select elements to be considered for Addition/Dilution suggestions
                  </p>
                </div>
                <div className="addition-dilution-elements-grid">
                  {form.values.targetChemistry && form.values.targetChemistry.length > 0 ? (
                    (form.values.targetChemistry || []).map((element: any) => {
                      const elementSymbol = element.element || element.symbol;
                      return (
                        <ElementCheckbox
                          key={elementSymbol}
                          elementSymbol={elementSymbol}
                          checked={isElementSelected(elementSymbol)}
                          onChange={(checked) => handleElementCheckboxChange(elementSymbol, checked)}
                        />
                      );
                    })
                  ) : (
                    <>
                      <ElementCheckbox
                        elementSymbol="C"
                        checked={isElementSelected("C")}
                        onChange={(checked) => handleElementCheckboxChange("C", checked)}
                      />
                      <ElementCheckbox
                        elementSymbol="Si"
                        checked={isElementSelected("Si")}
                        onChange={(checked) => handleElementCheckboxChange("Si", checked)}
                      />
                    </>
                  )}
                </div>

                {/* Addition Elements Error */}
                {form.errors?.[FIELD_KEYS.ADDITION_ELEMENTS] && (
                  <div className="addition-dilution-error-message">
                    <span className="addition-dilution-error-icon">
                      <SystemErrorWarningLine width={16} height={16} />
                    </span>
                    <span className="addition-dilution-error-text">
                      {form.errors?.[FIELD_KEYS.ADDITION_ELEMENTS]?.[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Raw Material Min/Max Section */}
              <div className="addition-dilution-materials-section">
                <div className="addition-dilution-materials-header">
                  <label className="addition-dilution-section-label">
                    Raw Material Min/Max
                  </label>
                  <p className="addition-dilution-section-description">
                    Add raw materials with min/max percentage for addition/dilution
                  </p>
                </div>

                {/* Configured Materials Table */}
                {(form.values[FIELD_KEYS.RAW_MATERIALS]?.length ?? 0) > 0 && (
                  <div className="addition-dilution-table-section">
                    <label className="addition-dilution-table-label">
                      Configured Materials
                    </label>
                    <div className="addition-dilution-table-wrapper">
                      <table className="addition-dilution-table">
                        <thead>
                          <tr>
                            <th className="addition-dilution-th addition-dilution-th-left">
                              Material
                            </th>
                            <th className="addition-dilution-th addition-dilution-th-center">
                              Category
                            </th>
                            <th className="addition-dilution-th addition-dilution-th-center">
                              Min Qty %
                            </th>
                            <th className="addition-dilution-th addition-dilution-th-center">
                              Max Qty %
                            </th>
                            <th className="addition-dilution-th addition-dilution-th-center addition-dilution-th-actions">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(form.values[FIELD_KEYS.RAW_MATERIALS] || []).map((element: any, index: number) => (
                            <AdditionElementRow
                              key={index}
                              element={element}
                              index={index}
                              onUpdate={handleUpdateRawMaterial}
                              onDelete={handleDeleteRawMaterial}
                              validationError={validationErrors[`table-${index}`]}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Category Validation Error */}
                    {categoryError && (
                      <div className="addition-dilution-error-message">
                        {/* <span className="addition-dilution-error-icon">
                          <SystemErrorWarningLine width={16} height={16} />
                        </span> */}
                        <div className="addition-dilution-error-text">
                          {categoryError.split('\n').map((line, index) => (
                            <div key={index} style={{ marginBottom: '4px' }}>
                              • {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Add New Material Section */}
                <div className="addition-dilution-add-section">
                  <label className="addition-dilution-add-label">
                    Add New Material
                  </label>
                  <div className="addition-dilution-add-controls">
                    {/* Material Select */}
                    <div className="addition-dilution-add-select">
                      {visibleFields[0] && renderField(visibleFields[0])}
                    </div>
                    {/* Min Input */}
                    <div className="addition-dilution-add-inputs">
                      <label className="addition-dilution-input-label">
                        Min %{isMinRequired ? <span style={{ color: '#ef4444' }}>{' '}*</span> : ''}:
                      </label>
                      <div className={validationErrors['add-min-max'] ? "tolerance-section-error-tooltip" : ""}>
                        <AdditionInput
                          value={form.values[FIELD_KEYS.ELEMENT_MIN_PERCENT]}
                          onChange={(value) => {
                            const newValue = parseNumericValue(value);
                            form.setValue(FIELD_KEYS.ELEMENT_MIN_PERCENT, newValue);
                            // Validate Min <= Max
                            validateMinMaxRange('add-min-max', newValue, form.values[FIELD_KEYS.ELEMENT_MAX_PERCENT]);
                          }}
                          className="addition-dilution-add-input"
                          hasError={!!validationErrors['add-min-max']}
                        />
                        {validationErrors['add-min-max'] && (
                          <div className="tolerance-section-tooltip-content">
                            <span className="tolerance-section-tooltip-icon">
                              <TriangleAlertIcon />
                            </span>
                            <span className="tolerance-section-tooltip-message">
                              {validationErrors['add-min-max']}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Max Input */}
                    <div className="addition-dilution-add-inputs">
                      <label className="addition-dilution-input-label">
                        Max %{isMaxRequired ? <span style={{ color: '#ef4444' }}>{' '}*</span> : ''}:
                      </label>
                      <div className={validationErrors['add-min-max'] ? "tolerance-section-error-tooltip" : ""}>
                        <AdditionInput
                          value={form.values[FIELD_KEYS.ELEMENT_MAX_PERCENT]}
                          onChange={(value) => {
                            const newValue = parseNumericValue(value);
                            form.setValue(FIELD_KEYS.ELEMENT_MAX_PERCENT, newValue);
                            // Validate Min <= Max
                            validateMinMaxRange('add-min-max', form.values[FIELD_KEYS.ELEMENT_MIN_PERCENT], newValue);
                          }}
                          className="addition-dilution-add-input"
                          hasError={!!validationErrors['add-min-max']}
                        />
                        {validationErrors['add-min-max'] && (
                          <div className="tolerance-section-tooltip-content">
                            <span className="tolerance-section-tooltip-icon">
                              <TriangleAlertIcon />
                            </span>
                            <span className="tolerance-section-tooltip-message">
                              {validationErrors['add-min-max']}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Add Button */}
                    <button 
                      className="addition-dilution-add-button"
                      type="button" 
                      onClick={handleAddRawMaterial}
                      disabled={isAddButtonDisabled}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Raw Materials Field Error */}
                {(form.errors?.[FIELD_KEYS.RAW_MATERIALS]?.length ?? 0) > 0 && (
                  <div className="addition-dilution-error-message" style={{ marginTop: '16px' }}>
                    <span className="addition-dilution-error-icon">
                      <SystemErrorWarningLine width={16} height={16} />
                    </span>
                    <span className="addition-dilution-error-text">
                      {form.errors?.[FIELD_KEYS.RAW_MATERIALS]?.[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionDilutionRenderer;
