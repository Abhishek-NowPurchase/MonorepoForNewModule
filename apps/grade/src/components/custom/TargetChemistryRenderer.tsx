import React from "react";
import { Autocomplete, TextField, FormControl } from "@mui/material";
import ToleranceSectionRenderer from "./ToleranceSectionRenderer";
import "../../styles/target-chemistry.css";

interface ChemistryElement {
  element: string;
  elementId: number;
  elementName: string;
  bathMin: number | string;
  bathMax: number | string;
  finalMin: number | string;
  finalMax: number | string;
  isDefault: boolean;
}

interface ElementOption {
  value: number;
  label: string;
}

interface FormField {
  key: string;
  label: string;
  options?: (values: any) => Promise<ElementOption[]>;
  meta?: {
    searchPlaceholder?: string;
    autoSelectFirst?: boolean;
  };
}

interface FormValues {
  targetChemistry: ChemistryElement[];
  selectedElement: number | string;
  toleranceSettings?: any;
  bathChemistry?: string;
}

interface TargetChemistryRendererProps {
  form: {
    fields: FormField[];
    values: FormValues;
    setValue: (key: string, value: any) => void;
    setError: (key: string, errors: string[]) => void;
    errors?: Record<string, string[]>;
  };
  section: {
    title: string;
  };
}

const FIELD_KEYS = {
  TARGET_CHEMISTRY: "targetChemistry",
  SELECTED_ELEMENT: "selectedElement",
  TOLERANCE_SETTINGS: "toleranceSettings",
} as const;

const INPUT_CONFIG = {
  STEP: 0.01,
  PLACEHOLDER_BATH_MIN: "",
  PLACEHOLDER_BATH_MAX: "",
} as const;

const MESSAGES = {
  SELECT_ELEMENT: "Please select an element",
  INVALID_ELEMENT: "Invalid element selected",
  DUPLICATE_ELEMENT: (symbol: string) =>
    `Element "${symbol}" already exists in the table`,
} as const;

const getInputValue = (value: number | string | null | undefined): string => {
  return value !== undefined && value !== null && value !== ""
    ? String(value)
    : "";
};

const isElementDuplicate = (
  elements: ChemistryElement[],
  symbol: string
): boolean => {
  return elements.some((el) => String(el.element) === String(symbol));
};

const createNewElement = (
  symbol: string,
  id: number,
  name: string
): ChemistryElement => {
  return {
    element: symbol,
    elementId: id,
    elementName: name,
    bathMin: "",
    bathMax: "",
    finalMin: "",
    finalMax: "",
    isDefault: false,
  };
};

const getElementName = (elementId: number, fallback: string): string => {
  const elementsData = (window as any).elementsData || [];
  const elementData = elementsData.find((el: any) => el.id === elementId);
  return elementData?.name || fallback;
};

interface ChemistryInputProps {
  value: number | string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
  error?: string;
}

const ChemistryInput: React.FC<ChemistryInputProps> = ({
  value,
  placeholder,
  required = false,
  onChange,
  error,
}) => {
  const [tooltipPosition, setTooltipPosition] = React.useState<'below' | 'above'>('below');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (error && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If there's less than 60px below and more space above, position above
      if (spaceBelow < 60 && spaceAbove > 60) {
        setTooltipPosition('above');
      } else {
        setTooltipPosition('below');
      }
    }
  }, [error]);

  return (
    <div className="target-chemistry-input-wrapper" ref={wrapperRef}>
      <input
        type="number"
        className={`target-chemistry-table-input ${error ? 'target-chemistry-input-error' : ''}`}
        step={INPUT_CONFIG.STEP}
        placeholder={placeholder}
        required={required}
        value={getInputValue(value)}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <div className={`target-chemistry-error-tooltip ${tooltipPosition === 'above' ? 'tooltip-above' : ''}`}>
          <div className="target-chemistry-error-icon">⚠</div>
          <span className="target-chemistry-error-message">{error}</span>
        </div>
      )}
    </div>
  );
};

const useElementOptions = (
  selectedElementField: FormField | undefined,
  formValues: FormValues,
  setValue: (key: string, value: any) => void
) => {
  const [options, setOptions] = React.useState<ElementOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    const loadOptions = async () => {
      if (selectedElementField?.options && !loading && options.length === 0) {
        setLoading(true);
        try {
          const newOptions = await selectedElementField.options(formValues);
          setOptions(newOptions);
          if (
            selectedElementField.meta?.autoSelectFirst &&
            !formValues.selectedElement &&
            newOptions.length > 0
          ) {
            setValue(FIELD_KEYS.SELECTED_ELEMENT, newOptions[0].value);
          }
        } catch (error) {
          console.error("Error loading element options:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadOptions();
  }, [selectedElementField?.options, formValues]);

  const getAvailableOptions = () => {
    const addedElements = formValues.targetChemistry.map((el) =>
      String(el.element)
    );
    return options.filter(
      (option) => !addedElements.includes(String(option.label))
    );
  };

  const availableOptions = getAvailableOptions();

  const getDisplayValue = () => {
    if (!formValues.selectedElement) return null;
    const selectedOption = options.find(
      (option) => option.value === formValues.selectedElement
    );
    return (
      selectedOption || {
        value: formValues.selectedElement,
        label: String(formValues.selectedElement),
      }
    );
  };

  const handleAutocompleteChange = (event: any, newValue: any) => {
    setValue(FIELD_KEYS.SELECTED_ELEMENT, newValue?.value || "");
  };

  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  return {
    options,
    loading,
    inputValue,
    availableOptions,
    getDisplayValue,
    handleAutocompleteChange,
    handleInputChange,
  };
};

const TargetChemistryRenderer: React.FC<TargetChemistryRendererProps> = ({
  form,
  section,
}) => {
  const targetChemistryField = form.fields.find(
    (f) => f.key === FIELD_KEYS.TARGET_CHEMISTRY
  );
  const selectedElementField = form.fields.find(
    (f) => f.key === FIELD_KEYS.SELECTED_ELEMENT
  );
  const toleranceSettingsField = form.fields.find(
    (f) => f.key === FIELD_KEYS.TOLERANCE_SETTINGS
  );

  const {
    options,
    loading,
    inputValue,
    availableOptions,
    getDisplayValue,
    handleAutocompleteChange,
    handleInputChange,
  } = useElementOptions(selectedElementField, form.values, form.setValue);

  const handleAddElement = () => {
    const selectedValue = form.values.selectedElement;

    if (!selectedValue) {
      alert(MESSAGES.SELECT_ELEMENT);
      return;
    }

    const selectedOption = options.find(
      (option) => option.value === selectedValue
    );

    if (!selectedOption) {
      alert(MESSAGES.INVALID_ELEMENT);
      return;
    }

    const elementSymbol = selectedOption.label;
    const elementId = selectedOption.value;
    const existingElements = form.values.targetChemistry || [];

    if (isElementDuplicate(existingElements, elementSymbol)) {
      alert(MESSAGES.DUPLICATE_ELEMENT(elementSymbol));
      return;
    }

    const elementName = getElementName(elementId, elementSymbol);
    const newElement = createNewElement(elementSymbol, elementId, elementName);

    const updatedElements = [...existingElements, newElement];
    form.setValue(FIELD_KEYS.TARGET_CHEMISTRY, updatedElements);

    const newAddedElements = updatedElements.map((el) => String(el.element));
    const newAvailableOptions = options.filter(
      (option) => !newAddedElements.includes(String(option.label))
    );

    if (newAvailableOptions.length > 0) {
      form.setValue(FIELD_KEYS.SELECTED_ELEMENT, newAvailableOptions[0].value);
    } else {
      form.setValue(FIELD_KEYS.SELECTED_ELEMENT, "");
    }
  };

  const handleTableFieldChange = (index: number, field: string, value: any) => {
    const updatedElements = [...(form.values.targetChemistry || [])];
    const currentElement = updatedElements[index];
    const elementSymbol = currentElement.element;
    
    // Update the field value
    updatedElements[index] = {
      ...currentElement,
      [field]: value === "" ? "" : parseFloat(value),
    };
    
    // Validation logic
    const newElement = updatedElements[index];
    const errors: string[] = [];
    
    // 1. Mg Min validation - required for Mg, optional for others
    if (elementSymbol === "Mg" && field === "bathMin" && (value === "" || value === null || value === undefined)) {
      errors.push("Min value is required for Magnesium");
    }
    if (elementSymbol === "Mg" && field === "finalMin" && (value === "" || value === null || value === undefined)) {
      errors.push("Min value is required for Magnesium");
    }
    
    // 2. Max validation - mandatory for all elements
    if (field === "bathMax" && (value === "" || value === null || value === undefined)) {
      errors.push("Max value is required");
    }
    if (field === "finalMax" && (value === "" || value === null || value === undefined)) {
      errors.push("Max value is required");
    }
    
    // 3. Min <= Max comparison validation
    if (field === "bathMin" && value !== "" && value !== null && value !== undefined) {
      const maxValue = newElement.bathMax;
      if (maxValue !== "" && maxValue !== null && maxValue !== undefined && parseFloat(String(value)) > parseFloat(String(maxValue))) {
        errors.push("Min value cannot be greater than Max value");
      }
    }
    if (field === "bathMax" && value !== "" && value !== null && value !== undefined) {
      const minValue = newElement.bathMin;
      if (minValue !== "" && minValue !== null && minValue !== undefined && parseFloat(String(minValue)) > parseFloat(String(value))) {
        errors.push("Min value cannot be greater than Max value");
      }
    }
    if (field === "finalMin" && value !== "" && value !== null && value !== undefined) {
      const maxValue = newElement.finalMax;
      if (maxValue !== "" && maxValue !== null && maxValue !== undefined && parseFloat(String(value)) > parseFloat(String(maxValue))) {
        errors.push("Min value cannot be greater than Max value");
      }
    }
    if (field === "finalMax" && value !== "" && value !== null && value !== undefined) {
      const minValue = newElement.finalMin;
      if (minValue !== "" && minValue !== null && minValue !== undefined && parseFloat(String(minValue)) > parseFloat(String(value))) {
        errors.push("Min value cannot be greater than Max value");
      }
    }
    
    // Set validation errors if any
    if (errors.length > 0) {
      // Set form field error for this specific field
      const fieldKey = `targetChemistry.${index}.${field}`;
      form.setError(fieldKey, [errors[0]]); // Use first error message
      console.warn(`Validation errors for ${elementSymbol} ${field}:`, errors);
    } else {
      // Clear any existing errors for this field
      const fieldKey = `targetChemistry.${index}.${field}`;
      if (form.errors?.[fieldKey]) {
        delete form.errors[fieldKey];
      }
    }
    
    form.setValue(FIELD_KEYS.TARGET_CHEMISTRY, updatedElements);
  };

  const handleDeleteElement = (index: number) => {
    const elementToDelete = form.values.targetChemistry[index];
    const updatedElements = (form.values.targetChemistry || []).filter(
      (_: any, i: number) => i !== index
    );
    form.setValue(FIELD_KEYS.TARGET_CHEMISTRY, updatedElements);

    if (!form.values.selectedElement && elementToDelete) {
      form.setValue(FIELD_KEYS.SELECTED_ELEMENT, elementToDelete.element);
    }
  };

  const targetChemistry = form.values.targetChemistry || [];
  const showBathColumns = form.values.bathChemistry === "with";

    return (
    <div className="target-chemistry-card">
      <div className="target-chemistry-card-header">
        <div className="target-chemistry-card-header-content">
          <h3 className="target-chemistry-card-title">{section.title}</h3>
        </div>
      </div>

      <div className="target-chemistry-card-body">
        <div className="target-chemistry-table-container">
          <table className="target-chemistry-table">
            <thead>
              <tr className="target-chemistry-table-header-row">
                <th className="target-chemistry-th target-chemistry-th-left">
                  Element
                </th>
                {showBathColumns && (
                  <>
                    <th className="target-chemistry-th target-chemistry-th-center">
                      Bath Min
                    </th>
                    <th className="target-chemistry-th target-chemistry-th-center">
                      Bath Max
                    </th>
                  </>
                )}
                <th className="target-chemistry-th target-chemistry-th-center">
                  Final Min
                </th>
                <th className="target-chemistry-th target-chemistry-th-center">
                  Final Max
                </th>
                <th className="target-chemistry-th target-chemistry-th-center target-chemistry-th-actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {targetChemistry.map(
                (element: ChemistryElement, index: number) => (
                  <tr key={index} className="target-chemistry-table-row">
                    <td className="target-chemistry-td target-chemistry-td-element">
                      {element.element}
                    </td>
                    {showBathColumns && (
                      <>
                        <td className="target-chemistry-td">
                          <ChemistryInput
                            value={element.bathMin}
                            placeholder={
                              element.bathMin
                                ? String(element.bathMin)
                                : INPUT_CONFIG.PLACEHOLDER_BATH_MIN
                            }
                            required={element.element === "Mg"}
                            error={form.errors?.[`targetChemistry.${index}.bathMin`]?.[0]}
                            onChange={(value) =>
                              handleTableFieldChange(index, "bathMin", value)
                            }
                          />
                        </td>
                        <td className="target-chemistry-td">
                          <ChemistryInput
                            value={element.bathMax}
                            placeholder={
                              element.bathMax
                                ? String(element.bathMax)
                                : INPUT_CONFIG.PLACEHOLDER_BATH_MAX
                            }
                            required={true}
                            error={form.errors?.[`targetChemistry.${index}.bathMax`]?.[0]}
                            onChange={(value) =>
                              handleTableFieldChange(index, "bathMax", value)
                            }
                          />
                        </td>
                      </>
                    )}
                    <td className="target-chemistry-td">
                      <ChemistryInput
                        value={element.finalMin}
                        required={element.element === "Mg"}
                        error={form.errors?.[`targetChemistry.${index}.finalMin`]?.[0]}
                        onChange={(value) =>
                          handleTableFieldChange(index, "finalMin", value)
                        }
                      />
                    </td>
                    <td className="target-chemistry-td">
                      <ChemistryInput
                        value={element.finalMax}
                        required={true}
                        error={form.errors?.[`targetChemistry.${index}.finalMax`]?.[0]}
                        onChange={(value) =>
                          handleTableFieldChange(index, "finalMax", value)
                        }
                      />
                    </td>
                    <td className="target-chemistry-td target-chemistry-td-center">
                      {!element.isDefault && (
                        <button
                          className="target-chemistry-delete-button"
                          type="button"
                          onClick={() => handleDeleteElement(index)}
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="target-chemistry-add-section">
          <div className="target-chemistry-add-controls">
            {selectedElementField && (
              <FormControl className="target-chemistry-element-select">
      <Autocomplete
                  options={availableOptions}
        value={getDisplayValue()}
        inputValue={inputValue}
        onInputChange={handleInputChange}
                  onChange={handleAutocompleteChange}
        loading={loading}
        getOptionLabel={(option) => option?.label || ""}
                  isOptionEqualToValue={(option, value) =>
                    String(option?.value) === String(value?.value)
                  }
        renderInput={(params) => (
          <TextField
            {...params}
                      placeholder={
                        selectedElementField.meta?.searchPlaceholder ||
                        selectedElementField.label
                      }
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? "Loading..." : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )}
      />
              </FormControl>
            )}

            <button
              className="target-chemistry-add-btn"
              type="button"
              onClick={handleAddElement}
              disabled={!form.values.selectedElement}
            >
              Add
            </button>
      </div>
        </div>

        {toleranceSettingsField && (
          <div className="target-chemistry-tolerance-wrapper">
            <ToleranceSectionRenderer
              field={toleranceSettingsField}
              value={form.values.toleranceSettings}
              onChange={(value: any) =>
                form.setValue("toleranceSettings", value)
              }
              form={form}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetChemistryRenderer;
