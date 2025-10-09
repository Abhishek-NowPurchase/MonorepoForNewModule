import React from "react";
import Button from 'now-design-atoms/dist/button';
import { TextInput } from 'now-design-molecules';
import { SystemDeleteBin7Line } from 'now-design-icons';

interface GenericTableRendererProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
  error?: string[];
  form: any;
  fieldPath: string;
}

const GenericTableRenderer = ({
  field,
  value,
  onChange,
  error,
  form,
  fieldPath
}: GenericTableRendererProps) => {
  const getTableConfig = () => {
    if (field.meta?.getTableConfig) {
      return field.meta.getTableConfig(form.values);
    }
    return field.meta?.tableConfig;
  };
  
  const tableConfig = getTableConfig();
  const items = Array.isArray(value) ? value : [];

  const getVisibleColumns = () => {
    if (!tableConfig?.columns) return [];
    
    return tableConfig.columns.filter((column: any) => {
      if (column.hidden) {
        if (column.key === 'bathMin' || column.key === 'bathMax') {
          return form.values.bathChemistry === 'with';
        }
        return false;
      }
      return true;
    });
  };

  const visibleColumns = getVisibleColumns();

  if (items.length === 0) {
    return null;
  }

  const handleAddItem = () => {
    const selectedItem = form.values[tableConfig?.selectField || 'selectedItem'];
    if (!selectedItem) return;

    const itemExists = items.some((item: any) => 
      item[tableConfig?.uniqueKey || 'id'] === selectedItem
    );
    if (itemExists) return;

    form.addArrayItem(fieldPath);
    
    setTimeout(() => {
      const updatedArray = form.values[fieldPath] || [];
      const newIndex = updatedArray.length - 1;
      
      const newItem = tableConfig?.createItem 
        ? tableConfig.createItem(selectedItem, form.values)
        : { [tableConfig?.uniqueKey || 'id']: selectedItem };
      
      const finalArray = [...updatedArray];
      finalArray[newIndex] = newItem;
      form.setValue(fieldPath, finalArray);
      
      if (tableConfig?.selectField) {
        form.setValue(tableConfig.selectField, "");
      }
      
    }, 0);
  };

  const handleRemoveItem = (index: number) => {
    form.removeArrayItem(fieldPath, index);
  };

  const handleUpdateItem = (index: number, property: string, newValue: any) => {
    const newItems = items.map((item: any, i: number) => 
      i === index ? { ...item, [property]: newValue } : item
    );
    onChange(newItems);
  };

  const renderCell = (item: any, column: any, index: number) => {
    const value = item[column.key];
    
    const createInput = (type: string, props: any = {}) => (
      <TextInput
        type={type}
        label={column.label || ''}
        value={value !== undefined && value !== null ? value.toString() : ''}
        onChange={(e) => {
          const newValue = type === 'number' ? 
            (e.target.value === '' ? null : Number(e.target.value)) : 
            e.target.value;
          handleUpdateItem(index, column.key, newValue);
        }}
        placeholder={column.placeholder || column.label}
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
              <th className="table-header-cell" style={{ textAlign: 'center', width: '120px' }}>Actions</th>
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
                <td className="table-cell" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  {/* Hide Remove button for default elements */}
                  {!item.isDefault && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleRemoveItem(index)}
                      title="Remove item"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px',
                        minWidth: '40px',
                        height: '40px'
                      }}
                    >
                      <SystemDeleteBin7Line width={16} height={16} />
                    </Button>
                  )}
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
