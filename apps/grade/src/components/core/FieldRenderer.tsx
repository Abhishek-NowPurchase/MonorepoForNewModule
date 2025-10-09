import React from "react";
import { TextInput, Select } from 'now-design-molecules';
import Checkbox from 'now-design-atoms/dist/checkbox';
import Button from 'now-design-atoms/dist/button';
import { 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel,
  Select as MuiSelect,
  MenuItem,
  InputLabel,
  FormHelperText,
  Autocomplete,
  TextField,
  CircularProgress
} from '@mui/material';


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
  
  // Async Autocomplete states
  const [asyncOpen, setAsyncOpen] = React.useState(false);
  const [asyncOptions, setAsyncOptions] = React.useState<any[]>([]);
  const [asyncLoading, setAsyncLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if ((field.type === 'select' || field.type === 'radio') && field.options) {
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

  // 🔄 ASYNC AUTOCOMPLETE: Load on Open
  React.useEffect(() => {
    if (!asyncOpen || field.meta?.asyncMode !== 'loadOnOpen') {
      return;
    }

    let active = true;

    (async () => {
      setAsyncLoading(true);
      
      try {
        if (field.options) {
          const optionsResult = field.options(form.values);
          
          if (optionsResult && typeof optionsResult.then === 'function') {
            const options = await optionsResult;
            if (active) {
              setAsyncOptions(options);
            }
          } else if (Array.isArray(optionsResult)) {
            if (active) {
              setAsyncOptions(optionsResult);
            }
          }
        }
      } catch (error) {
        console.error('Error loading async options:', error);
      } finally {
        if (active) {
          setAsyncLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [asyncOpen, field.meta?.asyncMode, field.options, form.values]); // Removed asyncOptions.length to allow re-fetching

  // 🔄 ASYNC AUTOCOMPLETE: Update options when form values change (for filtering)
  React.useEffect(() => {
    if (field.meta?.asyncMode !== 'loadOnOpen' && field.meta?.asyncMode !== 'searchAsYouType') {
      return;
    }

    // Update async options when form values change (for real-time filtering)
    if (asyncOptions.length > 0 || asyncOpen) {
      let active = true;

      (async () => {
        try {
          if (field.options) {
            const optionsResult = field.options(form.values);
            
            if (optionsResult && typeof optionsResult.then === 'function') {
              const options = await optionsResult;
              if (active) {
                setAsyncOptions(options);
              }
            } else if (Array.isArray(optionsResult)) {
              if (active) {
                setAsyncOptions(optionsResult);
              }
            }
          }
        } catch (error) {
          console.error('Error updating async options:', error);
        }
      })();

      return () => {
        active = false;
      };
    }
  }, [form.values, field.meta?.asyncMode, field.options]); // React to form value changes

  // 🔍 ASYNC AUTOCOMPLETE: Search as You Type (with debouncing)
  React.useEffect(() => {
    if (field.meta?.asyncMode !== 'searchAsYouType') {
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setAsyncLoading(true);
      
      try {
        if (field.options) {
          const optionsResult = field.options(form.values, searchQuery);
          
          if (optionsResult && typeof optionsResult.then === 'function') {
            const options = await optionsResult;
            setAsyncOptions(options);
          } else if (Array.isArray(optionsResult)) {
            setAsyncOptions(optionsResult);
          }
        }
      } catch (error) {
        console.error('Error searching async options:', error);
      } finally {
        setAsyncLoading(false);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, field.meta?.asyncMode, field.options, form.values]);


  const isVisible = form.isFieldVisible(fieldPath);
  if (!isVisible) {
    return null;
  }


  const renderFieldWithWrapper = (fieldContent: any, fieldType: string) => {
    const wrapperContent = (
      <div className={`${sectionContext}-${fieldType}-field`}>
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
      const selectFieldOptions = selectOptions.map((option: any) => ({
          value: option.value,
          label: option.label
      }));

      // Use MUI Select for non-searchable fields, otherwise use now-design-molecules Select
      const isNonSearchable = field.meta?.searchable === false;
      const isAsyncMode = field.meta?.asyncMode === 'loadOnOpen' || field.meta?.asyncMode === 'searchAsYouType';

      if (isNonSearchable) {
        // MUI Native Select for non-searchable fields - render directly without wrapper to avoid duplicate help text
        return (
          <div className={`${sectionContext}-select-field`}>
            <FormControl 
              error={error && error.length > 0}
              disabled={field.disabled}
              required={field.validators?.required}
            >
              <InputLabel id={`${fieldPath}-label`}>{field.label}</InputLabel>
              <MuiSelect
                labelId={`${fieldPath}-label`}
                id={fieldPath}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
              >
                {selectFieldOptions.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </MuiSelect>
              {field.meta?.helpText && (
                <FormHelperText>{field.meta.helpText}</FormHelperText>
              )}
              {error && error.length > 0 && (
                <FormHelperText>{error.join(', ')}</FormHelperText>
              )}
            </FormControl>
          </div>
        );
      }

      // 🚀 ASYNC AUTOCOMPLETE for searchable fields with asyncMode
      if (isAsyncMode) {
        const currentOptions = asyncOptions.length > 0 ? asyncOptions : selectFieldOptions;
        const selectedOption = currentOptions.find((opt: any) => opt.value === value) || null;

        return (
          <div className={`${sectionContext}-select-field`}>
            <Autocomplete
              id={fieldPath}
              open={asyncOpen}
              onOpen={() => setAsyncOpen(true)}
              onClose={() => setAsyncOpen(false)}
              value={selectedOption}
              onChange={(event, newValue) => {
                onChange(newValue ? newValue.value : '');
              }}
              onInputChange={(event, newInputValue, reason) => {
                if (field.meta?.asyncMode === 'searchAsYouType' && reason === 'input') {
                  setSearchQuery(newInputValue);
                }
              }}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              getOptionLabel={(option) => option.label || ''}
              options={currentOptions}
              loading={asyncLoading}
              disabled={field.disabled}
              sx={{ width: '282px' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={field.label}
                  placeholder={field.meta?.searchPlaceholder || field.meta?.placeholder}
                  error={error && error.length > 0}
                  helperText={
                    error && error.length > 0 
                      ? error.join(', ') 
                      : field.meta?.helpText
                  }
                  required={field.validators?.required}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {asyncLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
          </div>
        );
      }

      // Use the searchable Select component from now-design-molecules (default, non-async)
      return renderFieldWithWrapper(
        <Select
          id={fieldPath}
          label={field.label}
          value={value}
          onChange={onChange}
          options={selectFieldOptions}
          searchable={field.meta?.searchable !== false}
          searchInPanel={field.meta?.searchInPanel !== false}
          placeholder={field.meta?.searchPlaceholder || field.meta?.placeholder}
          disabled={field.disabled}
          status={error && error.length > 0 ? 'error' : undefined}
          helperText={field.meta?.helpText}
          styles={{width: '282px'}}
        />,
        'select'
      );


    case 'radio':
      const radioOptions = selectOptions.map((option: any) => ({
        value: option.value,
        label: option.label,
        description: option.description,
        impact: option.impact
      }));

      return renderFieldWithWrapper(
        <FormControl 
          component="fieldset" 
          disabled={field.disabled}
          required={field.validators?.required}
          error={error && error.length > 0}
        >
          <FormLabel component="legend">{field.label}</FormLabel>
          <RadioGroup
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            name={fieldPath}
          >
            {radioOptions.map((option: any) => (
              <div key={option.value} style={{ marginBottom: '16px' }}>
                <FormControlLabel
                  value={option.value}
                  control={<Radio />}
                  label={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>{option.label}</span>
                      {option.impact && (
                        <span style={{
                          backgroundColor: '#e8f5e8',
                          color: '#2e7d32',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {option.impact}
                        </span>
                      )}
                    </div>
                  }
                  style={{ marginBottom: '4px' }}
                />
                {option.description && (
                  <div style={{ 
                    marginLeft: '32px', 
                    color: '#666', 
                    fontSize: '14px',
                    marginTop: '2px'
                  }}>
                    {option.description}
                  </div>
                )}
              </div>
            ))}
          </RadioGroup>
        </FormControl>,
        'radio'
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
