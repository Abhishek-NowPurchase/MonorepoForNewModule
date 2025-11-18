import React from 'react';
import { FormControl, Select as MuiSelect, MenuItem } from '@mui/material';
import './Select.css';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  value?: string | number;
  options: SelectOption[];
  onChange?: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  containerClassName?: string;
  error?: boolean;
  name?: string;
  id?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  value = '',
  options,
  onChange,
  placeholder = 'Select',
  required = false,
  disabled = false,
  fullWidth = false,
  className = '',
  containerClassName = '',
  error = false,
  name,
  id,
}) => {
  const handleChange = (event: any) => {
    const newValue = event.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={`select-container ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      <FormControl
        fullWidth={fullWidth}
        variant="outlined"
        className={`select-form-control ${className}`}
        error={error}
      >
        <MuiSelect
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          displayEmpty
          className="select-input"
        >
          {placeholder && (
            <MenuItem value="" disabled>
              <em>{placeholder}</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    </div>
  );
};

export default Select;

