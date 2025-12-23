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
  status: "pending" | "completed";
  onStatusChange: (status: "pending" | "completed") => void;
}

const Header: React.FC<HeaderProps> = ({
  templates,
  selectedTemplate,
  onTemplateChange,
  status,
  onStatusChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = getCategoryFromPath(location.pathname);

  // Handle template selection change - apply immediately
  const handleTemplateSelectChange = (value: string | number) => {
    const templateId = String(value);
    // Try to match by template_id first, then by id
    const selected = templates.find(
      t => t.template_id === templateId || String(t.id) === templateId
    );
    if (selected) {
      onTemplateChange(selected);
    }
  };

  // Check if selected template has "Web" platform (case-insensitive)
  const hasWebPlatform = selectedTemplate?.platforms?.some(
    platform => platform?.toLowerCase() === 'web'
  ) ?? false;

  // Handle status toggle change
  const handleStatusToggle = () => {
    const newStatus = status === 'pending' ? 'completed' : 'pending';
    onStatusChange(newStatus);
  };
  
  // Map status to display format (pending/complete)
  const statusDisplay = status === 'pending' ? 'pending' : 'complete';

  return (
    <div className="header-container">
      <div className="left-section">
        <div className="filter-dropdown-container">
          {/* <label className="filter-label">Template</label> */}
          <Select
            value={selectedTemplate?.template_id || selectedTemplate?.id || ''}
            options={templates.map((template) => ({
              value: template.template_id || String(template.id),
              label: template.template_name || template.name || '',
            }))}
            onChange={handleTemplateSelectChange}
            // placeholder="Select Template"
            className="inline-filter-select"
          />
        </div>
        <div className="status-toggle-container">
          <button
            type="button"
            className={`status-toggle ${statusDisplay === 'complete' ? 'complete' : 'pending'}`}
            onClick={handleStatusToggle}
            aria-label={`Filter by ${statusDisplay}`}
          >
            <span className={`status-toggle-option ${statusDisplay === 'pending' ? 'active' : ''}`}>
              Pending
            </span>
            <span className="status-toggle-divider">|</span>
            <span className={`status-toggle-option ${statusDisplay === 'complete' ? 'active' : ''}`}>
              Complete
            </span>
          </button>
        </div>
      </div>

      <div className="right-section">
        {hasWebPlatform && (
          <Button
            variant="primary"
            icon="add"
            text="New Log Sheet"
            onClick={() => {
              // Use template_id if available, otherwise use id
              const templateId = selectedTemplate?.template_id || String(selectedTemplate?.id || '');
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
