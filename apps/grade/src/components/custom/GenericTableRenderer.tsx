import React from "react";
import Button from 'now-design-atoms/dist/button';
import { TextInput } from 'now-design-molecules';

interface GenericTableRendererProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
  error?: string[];
  form: any;
  fieldPath: string;
}

/**
 * 🚀 GENERIC TABLE RENDERER - THE ULTIMATE TABLE SOLUTION
 * 
 * This single component replaces ALL table renderers:
 * - TargetChemistryTableRenderer.tsx
 * - ChargemixMaterialsTableRenderer.tsx
 * - RawMaterialsTableRenderer.tsx
 * 
 * Configuration-driven approach using field metadata for all table customizations.
 * Supports: add/remove items, custom columns, validation, and styling.
 */
const GenericTableRenderer = ({
  field,
  value,
  onChange,
  error,
  form,
  fieldPath
}: GenericTableRendererProps) => {
  // 🚀 DYNAMIC TABLE CONFIG - Support both static and dynamic configurations
  const getTableConfig = () => {
    if (field.meta?.getTableConfig) {
      // Dynamic configuration based on form values
      return field.meta.getTableConfig(form.values);
    }
    // Static configuration
    return field.meta?.tableConfig;
  };
  
  const tableConfig = getTableConfig();
  const items = Array.isArray(value) ? value : [];

  // 🎯 FILTER COLUMNS BASED ON VISIBILITY CONDITIONS
  const getVisibleColumns = () => {
    if (!tableConfig?.columns) return [];
    
    return tableConfig.columns.filter((column: any) => {
      // If column has hidden property, check the condition
      if (column.hidden) {
        // For bath chemistry columns, show only when bathChemistry is 'with'
        if (column.key === 'bathMin' || column.key === 'bathMax') {
          return form.values.bathChemistry === 'with';
        }
        // For other hidden columns, you can add more conditions here
        return false;
      }
      // Show all non-hidden columns
      return true;
    });
  };

  const visibleColumns = getVisibleColumns();

  // 🎯 HIDE TABLE WHEN NO DATA
  if (items.length === 0) {
    return null; // Don't render anything when table is empty
  }

  // 🎯 ENHANCED ADD ITEM HANDLER - Uses form.addArrayItem with custom logic
  const handleAddItem = () => {
    const selectedItem = form.values[tableConfig?.selectField || 'selectedItem'];
    if (!selectedItem) return;

    // Check if item already exists
    const itemExists = items.some((item: any) => 
      item[tableConfig?.uniqueKey || 'id'] === selectedItem
    );
    if (itemExists) return;


    // 🎯 STEP 1: Use form.addArrayItem to add empty object
    form.addArrayItem(fieldPath);
    
    // 🎯 STEP 2: Wait for next tick to ensure the item is added
    setTimeout(() => {
      const updatedArray = form.values[fieldPath] || [];
      const newIndex = updatedArray.length - 1;
      
      
      // 🎯 STEP 3: Create the complete item
      const newItem = tableConfig?.createItem 
        ? tableConfig.createItem(selectedItem, form.values)
        : { [tableConfig?.uniqueKey || 'id']: selectedItem };
      
      
      // 🎯 STEP 4: Replace the empty object with complete item
      const finalArray = [...updatedArray];
      finalArray[newIndex] = newItem;
      form.setValue(fieldPath, finalArray);
      
      // 🎯 STEP 5: Clear selection
      if (tableConfig?.selectField) {
        form.setValue(tableConfig.selectField, "");
      }
      
    }, 0);
  };

  // 🎯 ENHANCED REMOVE ITEM HANDLER - Uses form.removeArrayItem with custom logic
  const handleRemoveItem = (index: number) => {
    
    // Use form.removeArrayItem for consistency
    form.removeArrayItem(fieldPath, index);
    
  };

  // 🎯 GENERIC UPDATE ITEM HANDLER
  const handleUpdateItem = (index: number, property: string, newValue: any) => {
    const newItems = items.map((item: any, i: number) => 
      i === index ? { ...item, [property]: newValue } : item
    );
    onChange(newItems);
  };

  // 🎯 GENERIC CELL RENDERER - Consolidated cell rendering logic
  const renderCell = (item: any, column: any, index: number) => {
    const value = item[column.key];
    
    // 🎯 GENERIC INPUT HANDLER - Consolidated input handling
    const createInput = (type: string, props: any = {}) => (
      <TextInput
        type={type}
        value={(value || '').toString()}
        onChange={(e) => {
          const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
          handleUpdateItem(index, column.key, newValue);
        }}
        placeholder={column.placeholder || column.label}
        hideLabel={true}
        size="small"
        style={{
          width: '100%',
          minWidth: '80px',
          maxWidth: column.type === 'number' ? '120px' : '150px',
          padding: '4px 8px',
        }}
        {...props}
      />
    );
    
    switch (column.type) {
      case 'text':
        return createInput('text');
      
      case 'number':
        return createInput('number', {
          min: column.min,
          max: column.max,
          step: column.step
        });
      
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleUpdateItem(index, column.key, e.target.value)}
            className="table-select"
          >
            <option value="">Select {column.label}</option>
            {column.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'readonly':
        return <span className="table-readonly">{value || '-'}</span>;
      
      default:
        return <span>{value || '-'}</span>;
    }
  };

  return (
    <div className="generic-table-container">
      {/* Table Header */}
      {tableConfig?.title && (
        <div className="table-header">
          <h3 className="table-title">{tableConfig.title}</h3>
          {tableConfig.description && (
            <p className="table-description">{tableConfig.description}</p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <table className="generic-table">
          <thead>
            <tr>
              {visibleColumns.map((column: any) => (
                <th key={column.key} className="table-header-cell">
                  {column.label}
                </th>
              ))}
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: number) => (
              <tr key={index} className="table-row">
                {visibleColumns.map((column: any) => (
                  <td key={column.key} className="table-cell">
                    {renderCell(item, column, index)}
                  </td>
                ))}
                <td className="table-cell">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleRemoveItem(index)}
                    title="Remove item"
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Add Controls - Handled by form builder */}

      {/* Error Display */}
      {error && error.length > 0 && (
        <div className="table-error">
          {error.join(', ')}
        </div>
      )}
    </div>
  );
};

export default GenericTableRenderer;
