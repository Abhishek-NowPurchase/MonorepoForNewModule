import React from "react";
import { TextInput, MinMax, Select, RadioGroup } from 'now-design-molecules';
import Checkbox from 'now-design-atoms/dist/checkbox';
import Button from 'now-design-atoms/dist/button';


import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/text/text-styles.css';
import 'now-design-styles/dist/color/colorStyles.css';
import 'now-design-styles/dist/fonts/fonts.css';
import 'now-design-styles/dist/effect/effectStyles.css';
import { getFieldStyle, getFieldClassName } from '../utils/layoutUtils';


interface UniversalFieldProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
  error?: string[];
  fieldPath: string;
  form: any;
  sectionContext?: string; 
}


const UniversalFieldRenderer = ({ field, value, onChange, error, fieldPath, form, sectionContext = '' }: UniversalFieldProps) => {

  const [selectOptions, setSelectOptions] = React.useState([]);

  React.useEffect(() => {
    if (field.type === 'select' && field.options) {
      field.options().then(setSelectOptions);
    }
  }, [field.type, field.options, field]);


  const isVisible = form.isFieldVisible(fieldPath);
  if (!isVisible) {
    return null;
  }


  const renderFieldWithWrapper = (fieldContent: any, fieldType: string) => {
    const wrapperContent = (
      <div className={getFieldClassName(fieldType, sectionContext, error && error.length > 0)}>
        {fieldContent}
        {field.meta?.helpText && (
          <div className="help-text">{field.meta.helpText}</div>
        )}
        {error && error.length > 0 && (
          <div className="error-message">{error.join(', ')}</div>
        )}
      </div>
    );

    if (field.meta?.showHeader) {
      return (
        <div className={`${sectionContext}-field-with-header`}>
          <div className="field-header">
            <h3 className="subsection-title">{field.meta.headerTitle}</h3>
            <p className="subsection-description">{field.meta.headerDescription}</p>
          </div>
          <div className="field-content">
            {wrapperContent}
          </div>
        </div>
      );
    }
    return wrapperContent;
  };


  // 🎯 GENERIC BUTTON FACTORY - Eliminates redundant button creation
  const createAddButton = (config: {
    selectedField: string;
    targetArray: string;
    buttonText: string;
    containerClass: string;
    createItem: (selectedValue: any) => any;
    clearFields: string[];
  }) => {
    const handleAdd = () => {
      const selectedValue = form.values[config.selectedField];
      if (!selectedValue) return;

      const currentArray = form.values[config.targetArray] || [];
      
      // Check if item already exists
      const exists = currentArray.some((item: any) => 
        item.element === selectedValue || item.material === selectedValue
      );
      if (exists) return;

      // Create new item
      const newItem = config.createItem(selectedValue);
      form.setValue(config.targetArray, [...currentArray, newItem]);
      
      // Clear fields
      config.clearFields.forEach(field => form.setValue(field, field.includes('Percent') ? 0 : ''));
    };

    return (
      <div className={config.containerClass}>
        <Button
          type="button"
          variant="primary"
          onClick={handleAdd}
          disabled={!form.values[config.selectedField]}
        >
          {config.buttonText}
        </Button>
      </div>
    );
  };

  // 🎯 CUSTOM RENDERER HANDLER - Consolidated and DRY
  const handleCustomRenderer = () => {
    const customRenderer = field.meta?.customRenderer;
    
    // Table renderers - all use GenericTableRenderer
    const tableRenderers = ["TargetChemistryTable", "ChargemixMaterialsTable", "RawMaterialsTable"];
    if (tableRenderers.includes(customRenderer)) {
      const GenericTableRenderer = require("../components/GenericTableRenderer").default;
      return (
        <GenericTableRenderer
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          form={form}
        />
      );
    }
    
    // Tolerance section renderer
    if (customRenderer === "ToleranceSection") {
      const ToleranceSectionRenderer = require("../components/ToleranceSectionRenderer").default;
      return (
        <ToleranceSectionRenderer
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          form={form}
        />
      );
    }
    
    // Add Element Button
    if (customRenderer === "AddElementButton") {
      return createAddButton({
        selectedField: 'selectedElement',
        targetArray: 'targetChemistry',
        buttonText: 'Add Element',
        containerClass: 'add-element-button-container',
        createItem: (selectedElement) => {
          const hasBathChemistry = form.values.bathChemistry === 'with';
          return {
            element: selectedElement,
            ...(hasBathChemistry ? { bathMin: 0, bathMax: 0 } : {}),
            finalMin: 0,
            finalMax: 0
          };
        },
        clearFields: ['selectedElement']
      });
    }
    
    // Add Raw Material Button
    if (customRenderer === "AddRawMaterialButton") {
      return createAddButton({
        selectedField: 'selectedRawMaterial',
        targetArray: 'rawMaterials',
        buttonText: 'Add',
        containerClass: 'add-raw-material-button-container',
        createItem: (selectedMaterial) => ({
          material: selectedMaterial,
          minPercent: form.values.rawMaterialMinPercent,
          maxPercent: form.values.rawMaterialMaxPercent
        }),
        clearFields: ['selectedRawMaterial', 'rawMaterialMinPercent', 'rawMaterialMaxPercent']
      });
    }
    
    // Add Chargemix Material Button
    if (customRenderer === "AddChargemixMaterialButton") {
      return createAddButton({
        selectedField: 'selectedChargemixMaterial',
        targetArray: 'chargemixMaterials',
        buttonText: 'Add',
        containerClass: 'add-chargemix-material-button-container',
        createItem: (selectedMaterial) => ({
          material: selectedMaterial,
          minPercent: form.values.chargemixMaterialMinPercent,
          maxPercent: form.values.chargemixMaterialMaxPercent
        }),
        clearFields: ['selectedChargemixMaterial', 'chargemixMaterialMinPercent', 'chargemixMaterialMaxPercent']
      });
    }
  
    return null;
  };

  // 🎯 CHECK FOR CUSTOM RENDERERS FIRST
  const customRendererResult = handleCustomRenderer();
  if (customRendererResult) {
    return customRendererResult;
  }


  switch (field.type) {
    case 'text':
    case 'number':
    case 'email':
    case 'password':
    case 'tel':
    case 'url':
    
      const handleChange = (e: any) => {
        const newValue = field.type === 'number' ? Number(e.target.value) : e.target.value;
        onChange(newValue);
      };

      return renderFieldWithWrapper(
        <TextInput
          label={field.label}
          type={field.type}
          value={(value || '').toString()}
          onChange={handleChange}
          placeholder={field.label}
          status={error && error.length > 0 ? 'error' : undefined}
          id={fieldPath}
          required={field.validators?.required}
          validator={field.validators?.custom ? (value) => {
            const validationResult = field.validators.custom(value);
            return {
              valid: validationResult.length === 0,
              status: validationResult.length > 0 ? 'error' : undefined,
              message: validationResult.length > 0 ? validationResult[0] : undefined
            };
          } : undefined}
          validateOn="blur"
          inputMode={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'number' ? 'numeric' : undefined}
          minLength={field.validators?.min}
          maxLength={field.validators?.max}
          regex={field.validators?.pattern}
        />,
        field.type
      );

    case 'select':
      const selectFieldOptions = [
        { value: "", label: field.label },
        ...selectOptions.map((option: any) => ({
          value: option.value,
          label: option.label
        }))
      ].filter(option => option.value !== "" || option.label !== ""); // Remove empty options

      return renderFieldWithWrapper(
        <>
          <label className="form-label">{field.label}</label>
          <select
            value={(value || "").toString()}
            onChange={(e) => onChange(e.target.value)}
            className={`form-input ${error ? "error" : ""}`}
            id={fieldPath}
          >
            {selectFieldOptions.map((option, index) => (
              <option key={`${option.value}-${index}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>,
        'select'
      );

    case 'checkbox':
      return renderFieldWithWrapper(
        <Checkbox
          id={fieldPath}
          checked={!!value}
          onChange={(event) => onChange(event.target.checked)}
          disabled={field.disabled}
        >
          {field.label}
        </Checkbox>,
        'checkbox'
      );

    case 'array':
      
      const getArrayOptions = () => {
        if (field.meta?.getOptions) {
         
          return field.meta.getOptions(form.values);
        }
     
        return field.meta?.options || [];
      };
      
      const arrayOptions = getArrayOptions();
      
      return renderFieldWithWrapper(
        <>
          <div className="array-field-label">{field.label}</div>
          <div className="array-checkboxes">
            {arrayOptions.map((option: any) => (
              <div key={option.value} className="array-checkbox-item">
                <Checkbox
                  id={`${fieldPath}-${option.value}`}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    const currentArray = Array.isArray(value) ? value : [];
                    if (checked) {
                      onChange([...currentArray, option.value]);
                    } else {
                      onChange(currentArray.filter((item: any) => item !== option.value));
                    }
                  }}
                  disabled={field.disabled}
                >
                  {option.label}
                </Checkbox>
              </div>
            ))}
          </div>
        </>,
        'array'
      );

    case 'range':
    case 'minmax':
     
      const rangeValue = typeof value === 'object' ? value : { min: value, max: value };
      
      const handleRangeChange = (range: { min?: number; max?: number }) => {
        if (field.meta?.isRange) {
          onChange(range);
        } else {
          onChange(range.min);
        }
      };

      return renderFieldWithWrapper(
        <MinMax
          id={field.key}
          label={field.label}
          value={rangeValue}
          onChange={handleRangeChange}
          error={error && error.length > 0 ? error.join(", ") : undefined}
          min={field.validators?.min || 1000}
          max={field.validators?.max || 2000}
          step={field.validators?.step || 10}
          unit={field.meta?.unit || "°C"}
        />,
        'range'
      );

    case 'button':
      return renderFieldWithWrapper(
        <button
          type="button"
          onClick={() => onChange(!value)}
          className="simple-button"
        >
          {field.label}
        </button>,
        'button'
      );

    default:
      // Fallback 
      return renderFieldWithWrapper(
        <div className="fallback-content">
          <span className="fallback-message">
            Unknown field type: "{field.type}" for field "{field.key}"
          </span>
          <TextInput
            label={field.label || field.key}
            value={(value || '').toString()}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label || field.key}`}
            error={error && error.length > 0 ? error.join(', ') : undefined}
          />
        </div>,
        'unknown'
      );
  }
};

export default UniversalFieldRenderer;
export type { UniversalFieldProps };
