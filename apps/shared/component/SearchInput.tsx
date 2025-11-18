import React, { useState, useEffect, useRef } from 'react';
import './SearchInput.css';

export interface SearchInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  showIcon?: boolean;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
}

const SearchInput = ({
  value,
  defaultValue,
  onChange,
  onSearch,
  debounceMs = 500,
  placeholder = 'Search',
  className = '',
  containerClassName = '',
  showIcon = true,
  onFocus,
  onBlur,
  disabled,
  id,
  name,
  autoComplete,
}: SearchInputProps) => {
  const [searchActive, setSearchActive] = useState(false);
  const [internalValue, setInternalValue] = useState(
    value !== undefined ? value : defaultValue || ''
  );
  const debounceTimerRef = useRef(null);

  // Sync with controlled value
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);

    // Immediate onChange callback
    if (onChange) {
      onChange(newValue);
    }

    // Debounced onSearch callback
    if (onSearch) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);
    }
  };

  const handleFocus = (e: any) => {
    setSearchActive(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setSearchActive(false);
    onBlur?.(e);
  };

  return (
    <div className={`search-input-container ${containerClassName}`}>
      <div
        className={`search-input-form ${searchActive ? 'search-active' : ''} ${className}`}
      >
        <input
          type="search"
          value={internalValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-label="Search through site content"
          disabled={disabled}
          id={id}
          name={name}
          autoComplete={autoComplete}
        />
        {showIcon && (
          <button type="button" aria-label="Search">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.5 17.5L13.875 13.875"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;

