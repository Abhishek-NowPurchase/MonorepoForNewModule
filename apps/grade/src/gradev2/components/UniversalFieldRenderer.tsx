import React from "react";
import { TextInput, MinMax, Select, RadioGroup } from 'now-design-molecules';
import Checkbox from 'now-design-atoms/dist/checkbox';
import Button from 'now-design-atoms/dist/button';

// ===== UNIVERSAL FIELD RENDERER =====
// Handles ALL standard field types in one place to eliminate duplication
interface UniversalFieldProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
  error?: string[];
  fieldPath: string;
  form: any;
  sectionContext?: string; // For section-specific styling
}

// 🚀 FUNDAMENTAL FIX: Convert to proper React component
const UniversalFieldRenderer = ({ field, value, onChange, error, fieldPath, form, sectionContext = '' }: UniversalFieldProps) => {
  // 🚀 HOOKS AT TOP LEVEL - Always called consistently
  const [selectOptions, setSelectOptions] = React.useState([]);

  React.useEffect(() => {
    if (field.type === 'select' && field.options) {
      field.options().then(setSelectOptions);
    }
  }, [field.type, field.options, field]);

  // 🚀 Handle visibility inside component
  const isVisible = form.isFieldVisible(fieldPath);
  if (!isVisible) {
    return null;
  }

  // Handle field headers (for grouped fields like DI parameters)
  const renderFieldWithHeader = (fieldContent: JSX.Element) => {
    if (field.meta?.showHeader) {
      return (
        <div className={`${sectionContext}-field-with-header`}>
          <div className="field-header">
            <h3 className="subsection-title">{field.meta.headerTitle}</h3>
            <p className="subsection-description">{field.meta.headerDescription}</p>
          </div>
          <div className="field-content">
            {fieldContent}
          </div>
        </div>
      );
    }
    return fieldContent;
  };


  // 🎯 CUSTOM RENDERER HANDLER - Handles all custom renderers through configuration
  const handleCustomRenderer = () => {
    const customRenderer = field.meta?.customRenderer;
    
    // 🚀 DRY APPROACH - All table renderers use the same GenericTableRenderer
    const tableRenderers = ["TargetChemistryTable", "ChargemixMaterialsTable", "RawMaterialsTable"];
    if (tableRenderers.includes(customRenderer)) {
      const GenericTableRenderer = require("./GenericTableRenderer").default;
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
    
    
    if (customRenderer === "ToleranceSection") {
      // Import and render ToleranceSectionRenderer
      const ToleranceSectionRenderer = require("./ToleranceSectionRenderer").default;
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
    
    if (customRenderer === "AddElementButton") {
      // 🎯 ADD ELEMENT BUTTON - Uses selectedElement field value
      const handleAddElement = () => {
        const selectedElement = form.values.selectedElement;
        if (!selectedElement) return;

        const currentElements = form.values.targetChemistry || [];
        
        // Check if element already exists
        const elementExists = currentElements.some((item: any) => item.element === selectedElement);
        if (elementExists) return;

        // Create new element based on bath chemistry setting
        const hasBathChemistry = form.values.bathChemistry === 'with';
        const newElement = {
          element: selectedElement,
          ...(hasBathChemistry ? { bathMin: 0, bathMax: 0 } : {}),
          finalMin: 0,
          finalMax: 0
        };

        form.setValue('targetChemistry', [...currentElements, newElement]);
        form.setValue('selectedElement', ''); // Clear selection
      };

      return (
        <div className="add-element-button-container">
          <Button
            type="button"
            variant="primary"
            onClick={handleAddElement}
            disabled={!form.values.selectedElement}
          >
            Add Element
          </Button>
        </div>
      );
    }
    
    if (customRenderer === "AddRawMaterialButton") {
      // 🎯 ADD RAW MATERIAL BUTTON - Uses selectedRawMaterial field value
      const handleAddRawMaterial = () => {
        const selectedMaterial = form.values.selectedRawMaterial;
        const minPercent = form.values.rawMaterialMinPercent;
        const maxPercent = form.values.rawMaterialMaxPercent;
        
        if (!selectedMaterial || minPercent === undefined || maxPercent === undefined) return;

        const currentMaterials = form.values.rawMaterials || [];
        
        // Check if material already exists
        const materialExists = currentMaterials.some((item: any) => item.material === selectedMaterial);
        if (materialExists) return;

        // Create new material
        const newMaterial = {
          material: selectedMaterial,
          minPercent: minPercent,
          maxPercent: maxPercent
        };

        form.setValue('rawMaterials', [...currentMaterials, newMaterial]);
        form.setValue('selectedRawMaterial', ''); // Clear selection
        form.setValue('rawMaterialMinPercent', 0); // Reset min
        form.setValue('rawMaterialMaxPercent', 0); // Reset max
      };

      return (
        <div className="add-raw-material-button-container">
          <Button
            type="button"
            variant="primary"
            onClick={handleAddRawMaterial}
            disabled={!form.values.selectedRawMaterial}
          >
            Add
          </Button>
        </div>
      );
    }
    
    if (customRenderer === "AddChargemixMaterialButton") {
      // 🎯 ADD CHARGEMIX MATERIAL BUTTON - Uses selectedChargemixMaterial field value
      const handleAddChargemixMaterial = () => {
        const selectedMaterial = form.values.selectedChargemixMaterial;
        const minPercent = form.values.chargemixMaterialMinPercent;
        const maxPercent = form.values.chargemixMaterialMaxPercent;
        
        if (!selectedMaterial || minPercent === undefined || maxPercent === undefined) return;

        const currentMaterials = form.values.chargemixMaterials || [];
        
        // Check if material already exists
        const materialExists = currentMaterials.some((item: any) => item.material === selectedMaterial);
        if (materialExists) return;

        // Create new material
        const newMaterial = {
          material: selectedMaterial,
          minPercent: minPercent,
          maxPercent: maxPercent
        };

        form.setValue('chargemixMaterials', [...currentMaterials, newMaterial]);
        form.setValue('selectedChargemixMaterial', ''); // Clear selection
        form.setValue('chargemixMaterialMinPercent', 0); // Reset min
        form.setValue('chargemixMaterialMaxPercent', 0); // Reset max
      };

      return (
        <div className="add-chargemix-material-button-container">
          <Button
            type="button"
            variant="primary"
            onClick={handleAddChargemixMaterial}
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

  // Handle all standard field types
  switch (field.type) {
    case 'text':
      return renderFieldWithHeader(
        <div className={`${sectionContext}-text-field ${error ? "error" : ""}`}>
          <TextInput
            label={field.label}
            value={(value || '').toString()}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.label}
            error={error && error.length > 0 ? error.join(', ') : undefined}
            helpText={field.meta?.helpText}
            id={fieldPath}
          />
        </div>
      );

    case 'number':
      return renderFieldWithHeader(
        <div className={`${sectionContext}-number-field ${error ? "error" : ""}`}>
          <TextInput
            label={field.label}
            type="number"
            value={(value || '').toString()}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={field.label}
            error={error && error.length > 0 ? error.join(', ') : undefined}
            helpText={field.meta?.helpText}
            id={fieldPath}
            min={field.validators?.min}
            max={field.validators?.max}
          />
        </div>
      );

    case 'select':
      const selectFieldOptions = [
        { value: "", label: field.label },
        ...selectOptions.map((option: any) => ({
          value: option.value,
          label: option.label
        }))
      ];

      return renderFieldWithHeader(
        <div className={`${sectionContext}-select-field ${error ? "error" : ""}`}>
          <label className="form-label">{field.label}</label>
          <select
            value={(value || "").toString()}
            onChange={(e) => onChange(e.target.value)}
            className={`form-input ${error ? "error" : ""}`}
            id={fieldPath}
          >
            {selectFieldOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {field.meta?.helpText && (
            <div className="help-text">{field.meta.helpText}</div>
          )}
          {error && error.length > 0 && (
            <div className="error-message">{error.join(', ')}</div>
          )}
        </div>
      );

    case 'checkbox':
      return renderFieldWithHeader(
        <div className={`${sectionContext}-checkbox-field ${error ? "error" : ""}`}>
          <Checkbox
            id={fieldPath}
            checked={!!value}
            onChange={(checked) => onChange(checked)}
            disabled={field.disabled}
          >
            {field.label}
          </Checkbox>
          {error && error.length > 0 && (
            <div className="error-message">{error.join(', ')}</div>
          )}
          {field.meta?.helpText && (
            <div className="help-text">{field.meta.helpText}</div>
          )}
        </div>
      );

    case 'array':
      // 🚀 DYNAMIC OPTIONS - Support both static and dynamic options
      const getArrayOptions = () => {
        if (field.meta?.getOptions) {
          // Dynamic options based on form values
          return field.meta.getOptions(form.values);
        }
        // Static options
        return field.meta?.options || [];
      };
      
      const arrayOptions = getArrayOptions();
      
      return renderFieldWithHeader(
        <div className={`${sectionContext}-array-field ${error ? "error" : ""}`}>
          <div className="array-field-label">{field.label}</div>
          {field.meta?.helpText && (
            <div className="help-text">{field.meta.helpText}</div>
          )}
          <div className="array-checkboxes">
            {arrayOptions.map((option: any) => (
              <div key={option.value} className="array-checkbox-item">
                <Checkbox
                  id={`${fieldPath}-${option.value}`}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(checked) => {
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
          {error && error.length > 0 && (
            <div className="error-message">{error.join(', ')}</div>
          )}
        </div>
      );

    case 'range':
    case 'minmax':
      // Handle both single value and range value
      const rangeValue = typeof value === 'object' ? value : { min: value, max: value };
      
      const handleRangeChange = (range: { min?: number; max?: number }) => {
        if (field.meta?.isRange) {
          onChange(range);
        } else {
          // For single value fields, use the min value
          onChange(range.min);
        }
      };

      return renderFieldWithHeader(
        <div className={`${sectionContext}-range-field ${error ? "error" : ""}`}>
          <MinMax
            id={field.key}
            label={field.label}
            value={rangeValue}
            onChange={handleRangeChange}
            error={error && error.length > 0 ? error.join(", ") : undefined}
            helpText={field.meta?.helpText}
            min={field.validators?.min || 1000}
            max={field.validators?.max || 2000}
            step={field.validators?.step || 10}
            unit={field.meta?.unit || "°C"}
          />
        </div>
      );

    case 'button':
      return renderFieldWithHeader(
        <div className={`${sectionContext}-button-field ${error ? "error" : ""}`}>
          <button
            type="button"
            onClick={() => onChange(!value)}
            className="simple-button"
          >
            {field.label}
          </button>
          {error && error.length > 0 && (
            <div className="error-message">{error.join(', ')}</div>
          )}
          {field.meta?.helpText && (
            <div className="help-text">{field.meta.helpText}</div>
          )}
        </div>
      );

    default:
      // Fallback for unknown field types
      return renderFieldWithHeader(
        <div className={`${sectionContext}-unknown-field fallback-field`}>
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
          </div>
        </div>
      );
  }
};

export default UniversalFieldRenderer;
export type { UniversalFieldProps };
