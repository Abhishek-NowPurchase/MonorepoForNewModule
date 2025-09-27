import React from "react";
import { TextInput, MinMax, Select, RadioGroup } from 'now-design-molecules';
import Checkbox from 'now-design-atoms/dist/checkbox';
import Button from 'now-design-atoms/dist/button';
import ReactSelect from 'react-select';


import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/text/text-styles.css';
import 'now-design-styles/dist/color/colorStyles.css';
import 'now-design-styles/dist/fonts/fonts.css';
import 'now-design-styles/dist/effect/effectStyles.css';


interface UniversalFieldProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
  error?: string[];
  fieldPath: string;
  form: any;
  sectionContext?: string; 
}


const FieldRenderer = ({ field, value, onChange, error, fieldPath, form, sectionContext = '' }: UniversalFieldProps) => {

  const [selectOptions, setSelectOptions] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (field.type === 'select' && field.options) {
      const optionsResult = field.options(form.values);
      
      // Handle both Promise-based and direct array options
      if (optionsResult && typeof optionsResult.then === 'function') {
        // Promise-based options (legacy)
        optionsResult.then((options) => {
          setSelectOptions(options);
        });
      } else if (Array.isArray(optionsResult)) {
        // Direct array options (new dynamic functions)
        setSelectOptions(optionsResult);
      }
    }
  }, [field.type, field.options, field, value, form.values]);


  const isVisible = form.isFieldVisible(fieldPath);
  if (!isVisible) {
    return null;
  }


  const renderFieldWithWrapper = (fieldContent: any, fieldType: string) => {
    const wrapperContent = (
      <div className={`${sectionContext}-${fieldType}-field${error && error.length > 0 ? ' error' : ''}`}>
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



  // 🎯 GENERIC ADD ARRAY ITEM HELPER - Completely generic, no business logic
  const addArrayItem = (config: {
    selectedField: string;
    targetArray: string;
    keyField: string;
    createItem: (value: any) => any;
    clearFields: string[];
  }) => {
    const selectedValue = form.values[config.selectedField];
    
    if (!selectedValue) {
      return;
    }

    const currentArray = form.values[config.targetArray] || [];
    const exists = currentArray.some((item: any) => item[config.keyField] === selectedValue);
    if (exists) {
      return;
    }

    // Create item using the provided createItem function
    const newItem = config.createItem(selectedValue);
    
    // Add to array
    const updatedArray = [...currentArray, newItem];
    form.setValue(config.targetArray, updatedArray);
    
    // Clear selection fields
    config.clearFields.forEach(field => form.setValue(field, field.includes('Percent') ? 0 : ''));
  };

  // 🎯 CUSTOM RENDERER HANDLER - Consolidated and DRY
  const handleCustomRenderer = () => {
    const customRenderer = field.meta?.customRenderer;
    
    // Table renderers - all use GenericTableRenderer
    const tableRenderers = ["TargetChemistryTable", "ChargemixMaterialsTable", "RawMaterialsTable"];
    if (tableRenderers.includes(customRenderer)) {
      const GenericTableRenderer = require("../custom/GenericTableRenderer").default;
      return (
        <GenericTableRenderer
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          form={form}
          fieldPath={fieldPath}
        />
      );
    }
    
    // Tolerance section renderer
    if (customRenderer === "ToleranceSection") {
      const ToleranceSectionRenderer = require("../custom/ToleranceSectionRenderer").default;
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
    
    // Add Element Button - Merged using generic helper
    if (customRenderer === "AddElementButton") {
      
      return (
        <div className="add-element-button-container">
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              addArrayItem({
                selectedField: 'selectedElement',
                targetArray: 'targetChemistry',
                keyField: 'element',
                createItem: field.meta?.tableConfig?.createItem || ((value: any) => ({ element: value })),
                clearFields: ['selectedElement']
              });
            }}
            disabled={!form.values.selectedElement}
          >
            Add Element
          </Button>
        </div>
      );
    }
    
    // Add Raw Material Button - Merged using generic helper
    if (customRenderer === "AddRawMaterialButton") {
      return (
        <div className="add-raw-material-button-container">
          <Button
            type="button"
            variant="primary"
            onClick={() => addArrayItem({
              selectedField: 'selectedRawMaterial',
              targetArray: 'rawMaterials',
              keyField: 'material',
              createItem: field.meta?.tableConfig?.createItem || ((value: any) => ({ material: value })),
              clearFields: ['selectedRawMaterial', 'rawMaterialMinPercent', 'rawMaterialMaxPercent']
            })}
            disabled={!form.values.selectedRawMaterial}
          >
            Add
          </Button>
        </div>
      );
    }
    
    // Add Chargemix Material Button - Merged using generic helper
    if (customRenderer === "AddChargemixMaterialButton") {
      return (
        <div className="add-chargemix-material-button-container">
          <Button
            type="button"
            variant="primary"
            onClick={() => addArrayItem({
              selectedField: 'selectedChargemixMaterial',
              targetArray: 'chargemixMaterials',
              keyField: 'material',
              createItem: field.meta?.tableConfig?.createItem || ((value: any) => ({ material: value })),
              clearFields: ['selectedChargemixMaterial', 'chargemixMaterialMinPercent', 'chargemixMaterialMaxPercent']
            })}
            disabled={!form.values.selectedChargemixMaterial}
          >
            Add
          </Button>
        </div>
      );
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
          // required={field.validators?.required}
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
      const selectFieldOptions = selectOptions.map((option: any) => ({
          value: option.value,
          label: option.label
      }));

      // Check if this field should use react-select (searchable)
      if (field.meta?.searchable) {
        const selectedOption = selectFieldOptions.find(option => option.value === value);
        
        return renderFieldWithWrapper(
          <>
            <label className="form-label">{field.label}</label>
            <ReactSelect
              value={selectedOption}
              onChange={(selectedOption: any) => onChange(selectedOption?.value || '')}
              options={selectFieldOptions}
              isSearchable={true}
              placeholder={field.meta?.searchPlaceholder || `Search ${field.label.toLowerCase()}...`}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base: any) => ({ ...base, zIndex: 9999 })
              }}
            />
          </>,
          'select'
        );
      }

      // Fallback to regular select for non-searchable fields
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

export default FieldRenderer;
export type { UniversalFieldProps };
