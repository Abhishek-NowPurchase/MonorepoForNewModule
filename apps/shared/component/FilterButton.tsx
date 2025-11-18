import React from 'react';
import Button from './Button';
import './FilterButton.css';

export interface FilterButtonProps {
  count?: number;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  count = 0,
  onClick,
  className = '',
  active = false,
  disabled = false,
  'aria-label': ariaLabel = 'Filter',
}) => {
  const hasActiveFilters = count > 0;
  const showBadge = hasActiveFilters;

  return (
    <div className={`filter-button-wrapper ${className}`}>
      <Button
        variant="icon"
        icon="filter"
        onClick={onClick}
        active={active || hasActiveFilters}
        disabled={disabled}
        className="filter-button"
        aria-label={ariaLabel}
      />
      {showBadge && (
        <span className="filter-badge" aria-label={`${count} active filters`}>
          {count}
        </span>
      )}
    </div>
  );
};

export default FilterButton;

