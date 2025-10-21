import React from "react";
import { 
  Autocomplete,
  TextField,
  FormControl,
  FormHelperText,
} from "@mui/material";
import "../../styles/chargemix-data.css";
import { LogosCodepenLine } from "now-design-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface ChargemixMaterial {
  material: string;
  materialId: string | number;
  minPercent: number | string;
  maxPercent: number | string;
  fullMaterialData?: {
    cm_type?: string;
    name?: string;
    slug?: string;
  };
}

interface MaterialOption {
  value: string | number;
  label: string;
}

interface FormField {
  key: string;
  type: string;
  options?: (values: any, inputValue?: string) => Promise<MaterialOption[]>;
  meta?: {
    autoSelectFirst?: boolean;
  };
  validators?: {
    required?: boolean;
  };
}

interface FormValues {
  chargemixMaterials: ChargemixMaterial[];
  selectedChargemixMaterial: string | number;
  chargemixMaterialMinPercent: number | string;
  chargemixMaterialMaxPercent: number | string;
  [key: string]: any;
}

interface ChargemixDataRendererProps {
  fields: FormField[];
  form: {
    values: FormValues;
    setValue: (key: string, value: any) => void;
    errors?: Record<string, string[]>;
  };
  section: {
    title: string;
    description: string;
    collapsed?: boolean;
  };
}

const FIELD_KEYS = {
  CHARGEMIX_MATERIALS: "chargemixMaterials",
  SELECTED_CHARGEMIX_MATERIAL: "selectedChargemixMaterial",
  CHARGEMIX_MATERIAL_MIN_PERCENT: "chargemixMaterialMinPercent",
  CHARGEMIX_MATERIAL_MAX_PERCENT: "chargemixMaterialMaxPercent",
} as const;

const INPUT_CONFIG = {
  STEP: 0.1,
  MIN: 0,
  MAX: 100,
  PLACEHOLDER: "0.0",
} as const;

const MESSAGES = {
  SELECT_MATERIAL: "Please select a raw material",
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

const createChargemixMaterial = (
  material: string | number,
  minPercent: number | string,
  maxPercent: number | string,
  fullMaterialData?: any
): ChargemixMaterial => {
  return {
    material: String(material),
    materialId: material,
    minPercent:
      typeof minPercent === "string" ? parseFloat(minPercent) : minPercent,
    maxPercent:
      typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent,
    fullMaterialData: fullMaterialData || undefined,
  };
};

const validateChargemixInputs = (
  selectedMaterial: string | number,
  minPercent: number | string,
  maxPercent: number | string
): string | null => {
  if (!selectedMaterial) return MESSAGES.SELECT_MATERIAL;
  if (minPercent === null || minPercent === undefined || minPercent === "") {
    return MESSAGES.ENTER_MIN_PERCENT;
  }
  if (maxPercent === null || maxPercent === undefined || maxPercent === "") {
    return MESSAGES.ENTER_MAX_PERCENT;
  }

  const minValue =
    typeof minPercent === "string" ? parseFloat(minPercent) : minPercent;
  const maxValue =
    typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent;

  if (maxValue <= minValue) {
    return MESSAGES.MAX_MUST_BE_GREATER;
  }

  return null;
};

interface ChargemixInputProps {
  value: number | string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

const ChargemixInput: React.FC<ChargemixInputProps> = ({
  value,
  placeholder = INPUT_CONFIG.PLACEHOLDER,
  onChange,
  className = "chargemix-input",
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

interface ChargemixMaterialRowProps {
  material: ChargemixMaterial;
  index: number;
  onUpdate: (index: number, field: keyof ChargemixMaterial, value: any) => void;
  onDelete: (index: number) => void;
}

const ChargemixMaterialRow: React.FC<ChargemixMaterialRowProps> = ({
  material,
  index,
  onUpdate,
  onDelete,
}) => {
  return (
    <tr key={index} className="chargemix-tr">
      <td className="chargemix-td chargemix-td-material">
        {material.material || material.materialId}
      </td>
      <td className="chargemix-td chargemix-td-center">
        <span className="chargemix-type-badge">
          {material.fullMaterialData?.cm_type || "Material"}
        </span>
      </td>
      <td className="chargemix-td chargemix-td-input">
        <ChargemixInput
          value={material.minPercent}
          onChange={(value) =>
            onUpdate(index, "minPercent", parseNumericValue(value))
          }
        />
      </td>
      <td className="chargemix-td chargemix-td-input">
        <ChargemixInput
          value={material.maxPercent}
          onChange={(value) =>
            onUpdate(index, "maxPercent", parseNumericValue(value))
          }
        />
      </td>
      <td className="chargemix-td chargemix-td-center">
        <button
          className="chargemix-delete-button"
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
  
  // If we have a value but no selected option (options not loaded yet), create a temporary option
  // Try to find a better label by looking for the value in options or use the value itself
  const getDisplayLabel = (val: string) => {
    if (!val) return "";
    // First try to find in current options (with type coercion)
    const foundOption = options.find((option) => option.value == val);
    if (foundOption) return foundOption.label;
    
    // If options are empty but we have a value, try to load options synchronously
    if (options.length === 0 && field.options) {
      console.log("Options empty, trying to find label for value:", val);
      // For now, return a more user-friendly label
      return `Material ${val}`;
    }
    
    // If not found, return the value as is (might be a name already)
    return val;
  };
  
  const displayOption =
    selectedOption ||
    (value
      ? {
    value, 
          label: getDisplayLabel(value),
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
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }
    };
    
    // Debounce the search
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
      className="chargemix-material-select"
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

// Chargemix Data Custom Renderer - Clean UI without unwanted buttons
const ChargemixDataRenderer = ({ 
  fields, 
  form, 
  section,
}: ChargemixDataRendererProps) => {
  // State for collapsible functionality
  const [isCollapsed, setIsCollapsed] = React.useState(
    section.collapsed ?? true
  );
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  const handleFieldChange = (fieldKey: string, value: any) => {
    form.setValue(fieldKey, value);
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

  const handleAddMaterial = () => {
    const selectedMaterial =
      form.values[FIELD_KEYS.SELECTED_CHARGEMIX_MATERIAL];
    const minPercent = form.values[FIELD_KEYS.CHARGEMIX_MATERIAL_MIN_PERCENT];
    const maxPercent = form.values[FIELD_KEYS.CHARGEMIX_MATERIAL_MAX_PERCENT];

    const validationError = validateChargemixInputs(
      selectedMaterial,
      minPercent,
      maxPercent
    );
    if (validationError) {
      // Remove blocking alert - show error in UI instead
      console.warn("❌ [ChargemixData] Validation error:", validationError);
      // TODO: Show error in UI instead of blocking alert
      return;
    }

    // 🔧 FIX: Get full material data from itemInventoryData
    const itemInventoryData = (window as any).itemInventoryData;
    const fullMaterialData = itemInventoryData?.results?.find(
      (material: any) => material.id == selectedMaterial
    );

    const existingMaterials = form.values[FIELD_KEYS.CHARGEMIX_MATERIALS] || [];
    const newMaterial = createChargemixMaterial(
      selectedMaterial,
      minPercent,
      maxPercent,
      fullMaterialData
    );
    const updatedMaterials = [...existingMaterials, newMaterial];

    form.setValue(FIELD_KEYS.CHARGEMIX_MATERIALS, updatedMaterials);
    form.setValue(FIELD_KEYS.SELECTED_CHARGEMIX_MATERIAL, "");
    form.setValue(FIELD_KEYS.CHARGEMIX_MATERIAL_MIN_PERCENT, "");
    form.setValue(FIELD_KEYS.CHARGEMIX_MATERIAL_MAX_PERCENT, "");
  };

  const renderField = (field: any) => {
    const rawValue = form.values[field.key] || field.defaultValue || "";
    const value = rawValue.toString();
    const error = form.errors?.[field.key];
    
    // Only handle select field for material autocomplete
    if (field.type === "select") {
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

  const visibleFields = fields.filter(
    (field) => field.key === FIELD_KEYS.SELECTED_CHARGEMIX_MATERIAL
  );

  const chargemixMaterials = form.values[FIELD_KEYS.CHARGEMIX_MATERIALS] || [];
  return (
    <div className="chargemix-section">
      {/* Collapsible Header Button */}
      <button
        className="chargemix-header-button"
        type="button"
        onClick={toggleCollapsed}
      >
        <div className="chargemix-header-left">
          <span className="chargemix-chevron">
            <FontAwesomeIcon 
              icon={isCollapsed ? faChevronRight : faChevronDown} 
              style={{ color: '#1d2530' }} 
            />
          </span>
          <span className="chargemix-package-icon">
            <LogosCodepenLine width={16} height={16} />
          </span>
          <span className="chargemix-header-title">{section.title}</span>
      </div>
        <div className="chargemix-header-badge">LogSheet Kiosk</div>
      </button>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="chargemix-content">
          {/* Card Container */}
          <div className="chargemix-card">
            {/* Card Header */}
            <div className="chargemix-card-header">
              <h3 className="chargemix-card-title">
                <span className="chargemix-card-title-icon">
                  <LogosCodepenLine width={20} height={20} />
                </span>
                {section.title}
              </h3>
              <p className="chargemix-card-description">
          {section.description}
        </p>
            </div>
            {/* Card Body */}
            <div className="chargemix-card-body">
              {/* Configured Materials Table - Only show if there are materials */}
              {chargemixMaterials.length > 0 && (
                <div className="chargemix-table-section">
                  <label className="chargemix-table-label">
                    Configured Materials
                  </label>
                  <div className="chargemix-table-wrapper">
                    <table className="chargemix-table">
                      <thead>
                        <tr>
                          <th className="chargemix-th chargemix-th-left">
                            Material
                          </th>
                          <th className="chargemix-th chargemix-th-center">
                            Type
                          </th>
                          <th className="chargemix-th chargemix-th-center">
                            Min Qty %
                          </th>
                          <th className="chargemix-th chargemix-th-center">
                            Max Qty %
                          </th>
                          <th className="chargemix-th chargemix-th-center chargemix-th-actions">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {chargemixMaterials.map(
                          (material: any, index: number) => (
                            <ChargemixMaterialRow
                              key={index}
                              material={material}
                              index={index}
                              onUpdate={(index, field, value) => {
                                const updatedMaterials = [
                                  ...chargemixMaterials,
                                ];
                                updatedMaterials[index] = {
                                  ...updatedMaterials[index],
                                  [field]: value,
                                };

                                const updatedMaterial = updatedMaterials[index];
                                const minValue =
                                  typeof updatedMaterial.minPercent === "string"
                                    ? parseFloat(updatedMaterial.minPercent)
                                    : updatedMaterial.minPercent;
                                const maxValue =
                                  typeof updatedMaterial.maxPercent === "string"
                                    ? parseFloat(updatedMaterial.maxPercent)
                                    : updatedMaterial.maxPercent;

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
                                  FIELD_KEYS.CHARGEMIX_MATERIALS,
                                  updatedMaterials
                                );
                              }}
                              onDelete={(index) => {
                                const updatedMaterials = chargemixMaterials.filter(
                                  (_: any, i: number) => i !== index
                                );
                                form.setValue(
                                  FIELD_KEYS.CHARGEMIX_MATERIALS,
                                  updatedMaterials
                                );
                              }}
                            />
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
        </div>
      )}

      {/* Add New Material Section */}
              <div className="chargemix-add-section">
                <label className="chargemix-add-label">Add New Material</label>
                <div className="chargemix-add-controls">
                  {/* Material Select */}
                  <div className="chargemix-add-select">
                    {visibleFields[0] && renderField(visibleFields[0])}
                  </div>
                  {/* Min/Max Inputs */}
                  <div className="chargemix-add-inputs">
                    <label className="chargemix-input-label">Min %:</label>
                    <ChargemixInput
                      value={
                        form.values[FIELD_KEYS.CHARGEMIX_MATERIAL_MIN_PERCENT]
                      }
                      onChange={(value) =>
                        form.setValue(
                          FIELD_KEYS.CHARGEMIX_MATERIAL_MIN_PERCENT,
                          parseNumericValue(value)
                        )
                      }
                      className="chargemix-add-input"
                    />
                    <label className="chargemix-input-label">Max %:</label>
                    <ChargemixInput
                      value={
                        form.values[FIELD_KEYS.CHARGEMIX_MATERIAL_MAX_PERCENT]
                      }
                      onChange={(value) =>
                        form.setValue(
                          FIELD_KEYS.CHARGEMIX_MATERIAL_MAX_PERCENT,
                          parseNumericValue(value)
                        )
                      }
                      className="chargemix-add-input"
                    />
        </div>
            {/* Add Button */}
              <button 
                    className="chargemix-add-button"
                type="button" 
                onClick={handleAddMaterial}
                    disabled={
                      !form.values[FIELD_KEYS.SELECTED_CHARGEMIX_MATERIAL] ||
                      form.values[FIELD_KEYS.CHARGEMIX_MATERIAL_MIN_PERCENT] ===
                        "" ||
                      form.values[FIELD_KEYS.CHARGEMIX_MATERIAL_MIN_PERCENT] ===
                        null ||
                      form.values[FIELD_KEYS.CHARGEMIX_MATERIAL_MIN_PERCENT] ===
                        undefined ||
                      form.values[FIELD_KEYS.CHARGEMIX_MATERIAL_MAX_PERCENT] ===
                        "" ||
                      form.values[FIELD_KEYS.CHARGEMIX_MATERIAL_MAX_PERCENT] ===
                        null ||
                      form.values[FIELD_KEYS.CHARGEMIX_MATERIAL_MAX_PERCENT] ===
                        undefined
                    }
                  >
                    +
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default ChargemixDataRenderer;
