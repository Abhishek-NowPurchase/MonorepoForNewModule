import React, { useState } from 'react';
import { Template } from '../../pages/Listing/types';
import FilterDrawer from './FilterDrawer';
import { SearchInput, FilterButton } from '../../../../shared/component';
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterCount = selectedTemplate ? 1 : 0;

  const handleFilterApply = (templateId: number | null) => {
    if (templateId) {
      const selected = templates.find(t => t.id === templateId);
      if (selected) {
        onTemplateChange(selected);
      }
    }
  };

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
        </div>
      </div>

      {/* Drawer Overlay */}
      {isFilterOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setIsFilterOpen(false)} />
          <div className="drawer-container">
            <FilterDrawer
              templates={templates}
              selectedTemplate={selectedTemplate}
              onApply={handleFilterApply}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Header;
