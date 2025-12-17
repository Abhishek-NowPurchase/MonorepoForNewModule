import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Template } from '../../pages/Listing/types';
import { SearchInput, FilterButton, FilterDrawer, Button, Select } from '../../../../shared/component';
import { ResetIcon } from '../../../../shared/component/icons';
import './Header.scss';

interface HeaderProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onTemplateChange: (template: Template) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  templates,
  selectedTemplate,
  onTemplateChange,
  searchValue,
  onSearchChange
}) => {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempSelectedTemplate, setTempSelectedTemplate] = useState<number | null>(
    selectedTemplate?.id || null
  );

  const filterCount = selectedTemplate ? 1 : 0;

  const handleFilterApply = (templateId: number | null) => {
    if (templateId) {
      const selected = templates.find(t => t.id === templateId);
      if (selected) {
        onTemplateChange(selected);
      }
    }
  };

  const handleFilterClose = () => {
    setIsFilterOpen(false);
    // Reset temp state when closing
    setTempSelectedTemplate(selectedTemplate?.id || null);
  };

  const handleApply = () => {
    handleFilterApply(tempSelectedTemplate);
    handleFilterClose();
  };

  const handleReset = () => {
    setTempSelectedTemplate(templates.length > 0 ? templates[0].id : null);
    handleFilterApply(templates.length > 0 ? templates[0].id : null);
    handleFilterClose();
  };

  // Update temp state when selectedTemplate changes externally
  useEffect(() => {
    setTempSelectedTemplate(selectedTemplate?.id || null);
  }, [selectedTemplate]);

  return (
    <>
      <div className="header-container">
        <div className="template-filter-container">
          <div className="template-filter-box" data-active="true">
            <span>{selectedTemplate?.template_name || selectedTemplate?.name}</span>
          </div>
        </div>

        <div className="right-section">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search" 
          />

          <FilterButton
            count={filterCount}
            onClick={() => setIsFilterOpen(true)}
            active={filterCount > 0}
            aria-label="Filter"
          />

          <Button
            variant="primary"
            icon="add"
            text="New Log Sheet"
            onClick={() => {
              const templateId = selectedTemplate?.id;
              if (templateId) {
                navigate(`/dynamic-log-sheet/new/${templateId}`);
              } else {
                // If no template selected, show error or redirect to listing
                // You might want to show a toast/alert here instead
                console.warn('No template selected. Please select a template first.');
              }
            }}
          />
        </div>
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={handleFilterClose}
        title="Filters"
      >
        <Select
          label="Template"
          value={tempSelectedTemplate || ''}
          options={templates.map((template) => ({
            value: template.id,
            label: template.template_name || template.name || '',
          }))}
          onChange={(value) => setTempSelectedTemplate(Number(value))}
          placeholder="Select Template"
          fullWidth
          className="filter-drawer-content-select"
        />

        <div className="filter-drawer-content-btn-container">
          <button className="filter-drawer-content-reset-button" onClick={handleReset}>
            <ResetIcon width={16} height={16} strokeWidth={1.5} />
            Reset
          </button>
          <Button
            variant="primary"
            icon="check"
            text="Apply"
            weight="bold"
            onClick={handleApply}
            className="filter-drawer-content-apply-button"
          />
        </div>
      </FilterDrawer>
    </>
  );
};

export default Header;
