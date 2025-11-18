import React, { useState } from 'react';
import { Template } from './types';
import { Button, Select } from '../../../../shared/component';
import './FilterDrawer.scss';

interface FilterDrawerProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onApply: (templateId: number | null) => void;
  onClose: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  templates,
  selectedTemplate,
  onApply,
  onClose
}) => {
  const [tempSelectedTemplate, setTempSelectedTemplate] = useState<number | null>(
    selectedTemplate?.id || null
  );

  const handleApply = () => {
    onApply(tempSelectedTemplate);
    onClose();
  };

  const handleReset = () => {
    setTempSelectedTemplate(templates.length > 0 ? templates[0].id : null);
    onApply(templates.length > 0 ? templates[0].id : null);
    onClose();
  };

  return (
    <div className="filter-drawer">
      <button className="close-button" onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="filter-header">Filters</div>
      <div className="horizontal-line" />

      <div className="filter-body">
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
          // className="filter-select"
        />

        <div className="filter-btn-container">
          <button className="reset-button" onClick={handleReset}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Reset
          </button>
          <Button
            variant="primary"
            icon="check"
            text="Apply"
            weight="bold"
            onClick={handleApply}
            className="filter-apply-button"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;
