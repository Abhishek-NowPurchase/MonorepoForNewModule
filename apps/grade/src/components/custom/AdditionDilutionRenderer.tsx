import React, { useEffect } from "react";
import {
  Autocomplete,
  TextField,
  FormControl,
  FormHelperText,
} from "@mui/material";
// import Checkbox from "now-design-atoms/dist/checkbox"; // Replaced with native checkbox
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import "../../styles/addition-dilution.css";
import { MetalcloudMeltingFurnaceLine, SystemErrorWarningLine } from "now-design-icons";

// Import the search function
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

interface AdditionElement {
  element: string;
  elementId: string | number;
  minPercent: number | string;
  maxPercent: number | string;
  category: string; // ADDITIVES, LADLE, or NODULARIZER
  fullMaterialData?: any; // Complete material data from inventory
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
  ENTER_MIN_PERCENT: "Please enter a minimum percentage",
  ENTER_MAX_PERCENT: "Please enter a maximum percentage",
  MAX_MUST_BE_GREATER:
    "Maximum percentage must be greater than minimum percentage",
} as const;

const TRANSITION_DURATION = 300;

const getInputValue = (value: number | string | null | undefined): string => {
  return value !== undefined && value !== null && value !== ""
    ? String(value)
    : "";
};

const parseNumericValue = (value: string): number | string => {
  return value === "" ? "" : parseFloat(value);
};

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
    minPercent:
      typeof minPercent === "string" ? parseFloat(minPercent) : minPercent,
    maxPercent:
      typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent,
    category: category,
    fullMaterialData: fullMaterialData,
  };
};

const validateAdditionInputs = (
  selectedElement: string | number,
  minPercent: number | string,
  maxPercent: number | string,
  category: string
): string | null => {
  if (!selectedElement) return MESSAGES.SELECT_ELEMENT;

  // Category-specific validation rules
  if (category === "LADLE") {
    // LADLE: Both Min and Max are required
    if (minPercent === null || minPercent === undefined || minPercent === "") {
      return "Min % is required for LADLE materials";
    }
    if (maxPercent === null || maxPercent === undefined || maxPercent === "") {
      return "Max % is required for LADLE materials";
    }
  } else if (category === "NODULARIZER") {
    // NODULARIZER: Only Min is required
    if (minPercent === null || minPercent === undefined || minPercent === "") {
      return "Min % is required for NODULARIZER materials";
    }
  }
  // ADDITIVES: No Min/Max validation required

  // If values are provided, validate them
  if (minPercent !== "" && minPercent !== null && minPercent !== undefined) {
    const minValue = typeof minPercent === "string" ? parseFloat(minPercent) : minPercent;
    if (isNaN(minValue)) {
      return "Please enter a valid Min %";
    }
    if (minValue < 0) {
      return "Min % must be positive";
    }
  }

  if (maxPercent !== "" && maxPercent !== null && maxPercent !== undefined) {
    const maxValue = typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent;
    if (isNaN(maxValue)) {
      return "Please enter a valid Max %";
    }
    if (maxValue < 0) {
      return "Max % must be positive";
    }
  }

  // Cross-validation: Min <= Max when both are provided
  if (minPercent !== "" && maxPercent !== "" && 
      minPercent !== null && maxPercent !== null && 
      minPercent !== undefined && maxPercent !== undefined) {
    const minValue = typeof minPercent === "string" ? parseFloat(minPercent) : minPercent;
    const maxValue = typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent;
    if (minValue > maxValue) {
      return "Min % cannot be greater than Max %";
    }
  }

  return null;
};

// Category validation function (exported for use in modal.tsx)
export const validateRawMaterialsCategories = (rawMaterials: AdditionElement[]): string | null => {
  const categories = rawMaterials.map(material => material.category);
  const hasAdditives = categories.includes("ADDITIVES");
  const hasLadle = categories.includes("LADLE");
  const hasNodularizer = categories.includes("NODULARIZER");

  const missingCategories: string[] = [];
  if (!hasAdditives) missingCategories.push("ADDITIVES");
  if (!hasLadle) missingCategories.push("LADLE");
  if (!hasNodularizer) missingCategories.push("NODULARIZER");

  if (missingCategories.length > 0) {
    return `At least one material from each category is required. Missing: ${missingCategories.join(", ")}`;
  }

  return null;
};

// Form-level validation function for raw materials
export const validateRawMaterialsForm = (rawMaterials: AdditionElement[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // 1. Category validation
  const categoryError = validateRawMaterialsCategories(rawMaterials);
  if (categoryError) {
    errors.push(categoryError);
  }
  
  // 2. Individual material validation
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

interface AdditionInputProps {
  value: number | string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

const AdditionInput: React.FC<AdditionInputProps> = ({
  value,
  placeholder = INPUT_CONFIG.PLACEHOLDER,
  onChange,
  className = "addition-dilution-input",
}) => {
  return (
    <input
      type="number"
      className={className}
      step={INPUT_CONFIG.STEP}
      min={INPUT_CONFIG.MIN}
      max={INPUT_CONFIG.MAX}
      placeholder={placeholder}
      value={getInputValue(value)}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

interface ElementCheckboxProps {
  elementSymbol: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

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

interface AdditionElementRowProps {
  element: AdditionElement;
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onDelete: (index: number) => void;
}

const AdditionElementRow: React.FC<AdditionElementRowProps> = ({
  element,
  index,
  onUpdate,
  onDelete,
}) => {
  // Determine if fields are required based on category
  const isMinRequired = element.category === "LADLE" || element.category === "NODULARIZER";
  const isMaxRequired = element.category === "LADLE";

  // Get category badge color
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "ADDITIVES":
        return "addition-dilution-category-badge additives";
      case "LADLE":
        return "addition-dilution-category-badge ladle";
      case "NODULARIZER":
        return "addition-dilution-category-badge nodularizer";
      default:
        return "addition-dilution-category-badge";
    }
  };

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
        <AdditionInput
          value={element.minPercent}
          onChange={(value) =>
            onUpdate(index, "minPercent", parseNumericValue(value))
          }
          className={`addition-dilution-table-input ${isMinRequired && (element.minPercent === "" || element.minPercent === null || element.minPercent === undefined) ? 'addition-dilution-input-error' : ''}`}
          placeholder={isMinRequired ? "Required" : "Optional"}
        />
      </td>
      <td className="addition-dilution-td addition-dilution-td-input">
        <AdditionInput
          value={element.maxPercent}
          onChange={(value) =>
            onUpdate(index, "maxPercent", parseNumericValue(value))
          }
          className={`addition-dilution-table-input ${isMaxRequired && (element.maxPercent === "" || element.maxPercent === null || element.maxPercent === undefined) ? 'addition-dilution-input-error' : ''}`}
          placeholder={isMaxRequired ? "Required" : "Optional"}
        />
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

const AsyncAutocompleteField = ({
  field,
  value,
  onChange,
  error,
  form,
}: any) => {
  const [options, setOptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  
  // Find the selected option based on value (with type coercion)
  const selectedOption =
    options.find((option) => option.value == value) || null;

  const displayOption =
    selectedOption ||
    (value
      ? {
    value, 
          label: String(value),
        }
      : null);
  
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

  // Effect to load initial options when component mounts (only once)
  React.useEffect(() => {
    if (field.options && options.length === 0 && !loading) {
      const loadInitialOptions = async () => {
        try {
          setLoading(true);
          const optionsResult = await field.options(form.values, "");
          if (Array.isArray(optionsResult)) {
            setOptions(optionsResult);

            if (
              field.meta?.autoSelectFirst &&
              !value &&
              optionsResult.length > 0
            ) {
              onChange(optionsResult[0].value);
            }
          }
        } catch (error) {
          console.warn(
            `Failed to load initial options for ${field.key}:`,
            error
          );
        } finally {
          setLoading(false);
        }
      };
      loadInitialOptions();
    }
  }, [field.options]); // Removed form.values and options.length to prevent infinite loops

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
        getOptionLabel={(option) => {
          // For the input field, show only the material name without cm_type
          const labelParts = option.label.split(" (");
          return labelParts[0] || "";
        }}
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
          // Parse the option label to extract material name and cm_type
          const labelParts = option.label.split(" (");
          const materialName = labelParts[0];
          const cmType = labelParts[1] ? labelParts[1].replace(")", "") : null;

          return (
            <li
              {...props}
              key={option.value}
              className="chargemix-dropdown-option"
            >
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

const AdditionDilutionRenderer = ({ 
  fields, 
  form, 
  section,
}: AdditionDilutionRendererProps) => {
  const errors = form.errors || {};
  
  // 🔍 DEBUG LOG: Component render with form errors
  useEffect(() => {
    console.log("🔍 [AdditionDilution] Component rendered with:", {
      allFormErrors: form.errors,
      rawMaterialsError: form.errors?.[FIELD_KEYS.RAW_MATERIALS],
      additionElementsError: form.errors?.[FIELD_KEYS.ADDITION_ELEMENTS],
      rawMaterialsCount: form.values[FIELD_KEYS.RAW_MATERIALS]?.length || 0,
      rawMaterialsData: form.values[FIELD_KEYS.RAW_MATERIALS],
    });
  }, [form.errors]);
  
  useEffect(()=>{
    if(errors?.additionElements?.length > 0 || errors?.rawMaterials?.length > 0){
      setIsCollapsed(false);
    }
  },[errors.additionElements,errors])
  // 🔍 DEBUG LOG: Component mounted
  console.log("🔍 [AdditionDilution] Component mounted with form values:", {
    rawMaterials: form.values.rawMaterials,
    additionElements: form.values.additionElements,
    selectedAdditionElement: form.values.selectedAdditionElement,
    elementMinPercent: form.values.elementMinPercent,
    elementMaxPercent: form.values.elementMaxPercent,
  });

  // 🔧 FIX: Initialize additionElements dynamically based on targetChemistry
  React.useEffect(() => {
    const currentElements = form.values[FIELD_KEYS.ADDITION_ELEMENTS] || [];
    const targetChemistry = form.values.targetChemistry || [];

    if (currentElements.length === 0 && targetChemistry.length > 0) {
      // Initialize with elements from targetChemistry
      const defaultElements = targetChemistry.map((element: any) => ({
        element: element.element || element.symbol,
        selected: true,
      }));
      console.log(
        "🔧 [AdditionDilution] Initializing additionElements from targetChemistry:",
        {
          targetChemistry,
          defaultElements,
        }
      );
      form.setValue(FIELD_KEYS.ADDITION_ELEMENTS, defaultElements);
    }
  }, [form.values.targetChemistry]);
  
  // State for collapsible functionality
  const [isCollapsed, setIsCollapsed] = React.useState(
    section.collapsed || false
  );
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  const handleFieldChange = (fieldKey: string, value: any) => {
    console.log(`🔍 [AdditionDilution] Field changed: ${fieldKey} =`, value);
    form.setValue(fieldKey, value);
  };

  // 🔧 FIX: Handle checkbox changes to update additionElements array
  const handleElementCheckboxChange = (
    elementSymbol: string,
    checked: boolean
  ) => {
    console.log(
      `🔧 [AdditionDilution] Checkbox changed: ${elementSymbol} = ${checked}`
    );

    const currentElements = form.values[FIELD_KEYS.ADDITION_ELEMENTS] || [];
    let updatedElements;

    if (checked) {
      // Add element if not already present
      const exists = currentElements.some(
        (el: any) => el.element === elementSymbol
      );
      if (!exists) {
        updatedElements = [
          ...currentElements,
          { element: elementSymbol, selected: true },
        ];
      } else {
        updatedElements = currentElements;
      }
    } else {
      // Remove element
      updatedElements = currentElements.filter(
        (el: any) => el.element !== elementSymbol
      );
    }

    console.log(
      `🔧 [AdditionDilution] Updated additionElements:`,
      updatedElements
    );
    form.setValue(FIELD_KEYS.ADDITION_ELEMENTS, updatedElements);
  };
  
  const toggleCollapsed = () => {
    if (isTransitioning) return; // Prevent rapid clicking during transition
    
    setIsTransitioning(true);
    
    if (isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
    } else {
      setIsCollapsed(true);
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
    }
  };

  const handleAddRawMaterial = async () => {
    const selectedMaterial = form.values[FIELD_KEYS.SELECTED_ADDITION_ELEMENT];
    const minPercent = form.values[FIELD_KEYS.ELEMENT_MIN_PERCENT];
    const maxPercent = form.values[FIELD_KEYS.ELEMENT_MAX_PERCENT];

    // Get the material name, category, and full material data
    let materialName = selectedMaterial;
    let materialCategory = "ADDITIVES"; // Default category
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
          fullMaterialData = materialData; // Store the complete material data
        }
      }
    } catch (error) {
      console.warn("Failed to get material data, using defaults:", error);
    }

    // 🔍 DEBUG LOG: Adding new raw material
    console.log("🔍 [AdditionDilution] handleAddRawMaterial called with:", {
      selectedMaterial,
      minPercent,
      maxPercent,
      materialCategory,
      currentRawMaterials: form.values.rawMaterials,
      allFormValues: form.values,
    });

    const validationError = validateAdditionInputs(
      selectedMaterial,
      minPercent,
      maxPercent,
      materialCategory
    );
    if (validationError) {
      // Remove blocking alert - show error in UI instead
      console.warn("❌ [AdditionDilution] Validation error:", validationError);
      // TODO: Show error in UI instead of blocking alert
      return;
    }

    // 🔧 FIX: Add to rawMaterials array, NOT additionElements
    const existingRawMaterials = form.values[FIELD_KEYS.RAW_MATERIALS] || [];
    const newRawMaterial = createAdditionElement(
      materialName,
      minPercent,
      maxPercent,
      materialCategory,
      fullMaterialData
    );
    const updatedRawMaterials = [...existingRawMaterials, newRawMaterial];

    // Validate categories after adding the material
    const categoryValidationError = validateRawMaterialsCategories(updatedRawMaterials);
    if (categoryValidationError) {
      // Still add the material but show warning
      console.warn("Category validation warning:", categoryValidationError);
    }

    form.setValue(FIELD_KEYS.RAW_MATERIALS, updatedRawMaterials);

    // 🔍 DEBUG LOG: Raw material added successfully
    console.log("✅ [AdditionDilution] Raw material added successfully!", {
      newRawMaterial,
      updatedRawMaterials: updatedRawMaterials,
      additionElements: form.values.additionElements,
      note: "CORRECT: Adding to rawMaterials array!",
    });

    form.setValue(FIELD_KEYS.SELECTED_ADDITION_ELEMENT, "");
    form.setValue(FIELD_KEYS.ELEMENT_MIN_PERCENT, "");
    form.setValue(FIELD_KEYS.ELEMENT_MAX_PERCENT, "");
  };

  const visibleFields = fields.filter((field) =>
    [
      FIELD_KEYS.SELECTED_ADDITION_ELEMENT,
      FIELD_KEYS.ELEMENT_MIN_PERCENT,
      FIELD_KEYS.ELEMENT_MAX_PERCENT,
    ].includes(field.key as any)
  );

  const renderField = (field: any) => {
    const rawValue = form.values[field.key] || field.defaultValue || "";
    const value =
      typeof rawValue === "number" ? rawValue.toString() : rawValue || "";
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

  return (
    <div className="addition-dilution-section">
      {/* Collapsible Header Button */}
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
          <span className="addition-dilution-settings-icon"><MetalcloudMeltingFurnaceLine width={16} height={16} /></span>
          <span className="addition-dilution-header-title">
            {section.title}
          </span>
      </div>
        <div className="addition-dilution-header-badge">Power User</div>
      </button>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="addition-dilution-content">
          {/* Card Container */}
          <div className="addition-dilution-card">
            {/* Card Header */}
            <div className="addition-dilution-card-header">
              <h3 className="addition-dilution-card-title">
                <span className="addition-dilution-card-title-icon"><MetalcloudMeltingFurnaceLine width={20} height={20} /></span>
                {section.title}
              </h3>
              <p className="addition-dilution-card-description">
                Configure suggestion generation parameters and raw material
                constraints.
              </p>
            </div>

            {/* Card Body */}
            <div className="addition-dilution-card-body">
              {/* Elements Section */}
              <div className="addition-dilution-elements-section">
                <div className="addition-dilution-elements-header">
                  <label className="addition-dilution-section-label">
                    Elements
                  </label>
                  <p className="addition-dilution-section-description">
                    Select elements to be considered for Addition/Dilution
                    suggestions
                  </p>
                </div>
                <div className="addition-dilution-elements-grid">
                  {form.values.targetChemistry &&
                  form.values.targetChemistry.length > 0 ? (
                    form.values.targetChemistry.map(
                      (element: any, index: number) => {
                  const elementSymbol = element.element || element.symbol;

                        // 🔧 FIX: Check if element is in additionElements array
                        const isSelected = (
                          form.values[FIELD_KEYS.ADDITION_ELEMENTS] || []
                        ).some((el: any) => el.element === elementSymbol);
                  
                  return (
                          <ElementCheckbox
                            key={elementSymbol}
                            elementSymbol={elementSymbol}
                            checked={isSelected}
                            onChange={(checked) =>
                              handleElementCheckboxChange(
                                elementSymbol,
                                checked
                              )
                            }
                          />
                        );
                      }
                    )
                  ) : (
                    <>
                      <ElementCheckbox
                        elementSymbol="C"
                        checked={(
                          form.values[FIELD_KEYS.ADDITION_ELEMENTS] || []
                        ).some((el: any) => el.element === "C")}
                        onChange={(checked) =>
                          handleElementCheckboxChange("C", checked)
                        }
                      />
                      <ElementCheckbox
                        elementSymbol="Si"
                        checked={(
                          form.values[FIELD_KEYS.ADDITION_ELEMENTS] || []
                        ).some((el: any) => el.element === "Si")}
                        onChange={(checked) =>
                          handleElementCheckboxChange("Si", checked)
                        }
                      />
            </>
              )}
            </div>

                {/* 🔧 FIX: Display error for additionElements */}
                {form.errors?.[FIELD_KEYS.ADDITION_ELEMENTS] && (
                  <div className="addition-dilution-error-message">
                    <span className="addition-dilution-error-icon">
                      {" "}
                      <SystemErrorWarningLine width={16} height={16} />
                    </span>
                    <span className="addition-dilution-error-text">
                      {form.errors[FIELD_KEYS.ADDITION_ELEMENTS][0]}
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
                    Add raw materials with min/max percentage for
                    addition/dilution
                  </p>
          </div>

                {/* Configured Materials Table - Only show if there are materials */}
                {form.values[FIELD_KEYS.RAW_MATERIALS] &&
                  form.values[FIELD_KEYS.RAW_MATERIALS].length > 0 && (
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
                            {form.values[FIELD_KEYS.RAW_MATERIALS].map(
                              (element: any, index: number) => (
                                <AdditionElementRow
                                  key={index}
                                  element={element}
                                  index={index}
                                  onUpdate={(index, field, value) => {
                                    const updatedRawMaterials = [
                                      ...form.values[FIELD_KEYS.RAW_MATERIALS],
                                    ];
                                    updatedRawMaterials[index] = {
                                      ...updatedRawMaterials[index],
                                      [field]: value,
                                    };

                                    const updatedElement =
                                      updatedRawMaterials[index];
                                    const minValue =
                                      typeof updatedElement.minPercent ===
                                      "string"
                                        ? parseFloat(updatedElement.minPercent)
                                        : updatedElement.minPercent;
                                    const maxValue =
                                      typeof updatedElement.maxPercent ===
                                      "string"
                                        ? parseFloat(updatedElement.maxPercent)
                                        : updatedElement.maxPercent;

                                    // Remove blocking alert - let users complete their input
                                    // Validation will be handled by form-level validation instead
                                    // if (
                                    //   typeof minValue === "number" &&
                                    //   typeof maxValue === "number" &&
                                    //   !isNaN(minValue) &&
                                    //   !isNaN(maxValue) &&
                                    //   maxValue <= minValue
                                    // ) {
                                    //   alert(MESSAGES.MAX_MUST_BE_GREATER);
                                    //   return;
                                    // }

                                    form.setValue(
                                      FIELD_KEYS.RAW_MATERIALS,
                                      updatedRawMaterials
                                    );
                                  }}
                                  onDelete={(index) => {
                                    const updatedRawMaterials = form.values[
                                      FIELD_KEYS.RAW_MATERIALS
                                    ].filter(
                                      (_: any, i: number) => i !== index
                                    );
                                    form.setValue(
                                      FIELD_KEYS.RAW_MATERIALS,
                                      updatedRawMaterials
                                    );
                                  }}
                                />
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Category Validation Error Display */}
                      {(() => {
                        const categoryError = validateRawMaterialsCategories(form.values[FIELD_KEYS.RAW_MATERIALS] || []);
                        return categoryError ? (
                          <div className="addition-dilution-error-message">
                            <span className="addition-dilution-error-icon">
                              <SystemErrorWarningLine width={16} height={16} />
                            </span>
                            <span className="addition-dilution-error-text">
                              {categoryError}
                            </span>
                          </div>
                        ) : null;
                      })()}
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
                    {/* Min/Max Inputs */}
                    <div className="addition-dilution-add-inputs">
                      <label className="addition-dilution-input-label">
                        Min %:
                      </label>
                      <AdditionInput
                        value={form.values[FIELD_KEYS.ELEMENT_MIN_PERCENT]}
                        onChange={(value) =>
                          form.setValue(
                            FIELD_KEYS.ELEMENT_MIN_PERCENT,
                            parseNumericValue(value)
                          )
                        }
                        className="addition-dilution-add-input"
                      />
                    </div>
                    <div className="addition-dilution-add-inputs">
                      <label className="addition-dilution-input-label">
                        Max %:
                      </label>
                      <AdditionInput
                        value={form.values[FIELD_KEYS.ELEMENT_MAX_PERCENT]}
                        onChange={(value) =>
                          form.setValue(
                            FIELD_KEYS.ELEMENT_MAX_PERCENT,
                            parseNumericValue(value)
                          )
                        }
                        className="addition-dilution-add-input"
                      />
            </div>
                {/* Add Button */}
                  <button 
                      className="addition-dilution-add-button"
                    type="button" 
                      onClick={handleAddRawMaterial}
                      disabled={
                        !form.values[FIELD_KEYS.SELECTED_ADDITION_ELEMENT] ||
                        form.values[FIELD_KEYS.ELEMENT_MIN_PERCENT] === "" ||
                        form.values[FIELD_KEYS.ELEMENT_MIN_PERCENT] === null ||
                        form.values[FIELD_KEYS.ELEMENT_MIN_PERCENT] ===
                          undefined ||
                        form.values[FIELD_KEYS.ELEMENT_MAX_PERCENT] === "" ||
                        form.values[FIELD_KEYS.ELEMENT_MAX_PERCENT] === null ||
                        form.values[FIELD_KEYS.ELEMENT_MAX_PERCENT] ===
                          undefined
                      }
                    >
                      +
                  </button>
                  </div>
                </div>
                
                {/* Raw Materials Field Error Display */}
                {form.errors?.[FIELD_KEYS.RAW_MATERIALS] && 
                 form.errors[FIELD_KEYS.RAW_MATERIALS].length > 0 && (
                  <div className="addition-dilution-error-message" style={{ marginTop: '16px' }}>
                    <span className="addition-dilution-error-icon">
                      <SystemErrorWarningLine width={16} height={16} />
                    </span>
                    <span className="addition-dilution-error-text">
                      {form.errors[FIELD_KEYS.RAW_MATERIALS][0]}
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
