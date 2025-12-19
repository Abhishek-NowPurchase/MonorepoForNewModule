import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Template } from '../../pages/Listing/types';
import { Button, Select } from '../../../../shared/component';
import { getCategoryFromPath } from '../../utils/routeUtils';
import './Header.scss';

interface HeaderProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onTemplateChange: (template: Template) => void;
}

const Header: React.FC<HeaderProps> = ({
  templates,
  selectedTemplate,
  onTemplateChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = getCategoryFromPath(location.pathname);

  // Handle template selection change - apply immediately
  const handleTemplateSelectChange = (value: string | number) => {
    const templateId = Number(value);
    const selected = templates.find(t => t.id === templateId);
    if (selected) {
      onTemplateChange(selected);
    }
  };

  // Check if selected template has "Web" platform (case-insensitive)
  const hasWebPlatform = selectedTemplate?.platforms?.some(
    platform => platform?.toLowerCase() === 'web'
  ) ?? false;

  return (
    <div className="header-container">
      <div className="left-section">
        <div className="filter-dropdown-container">
          {/* <label className="filter-label">Template</label> */}
          <Select
            value={selectedTemplate?.id || ''}
            options={templates.map((template) => ({
              value: template.id,
              label: template.template_name || template.name || '',
            }))}
            onChange={handleTemplateSelectChange}
            // placeholder="Select Template"
            className="inline-filter-select"
          />
        </div>
      </div>

      <div className="right-section">
        {hasWebPlatform && (
          <Button
            variant="primary"
            icon="add"
            text="New Log Sheet"
            onClick={() => {
              const templateId = selectedTemplate?.id;
              if (templateId) {
                navigate(`/dynamic-log-sheet/${category}/new/${templateId}`);
              } else {
                console.warn('No template selected. Please select a template first.');
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Header;
