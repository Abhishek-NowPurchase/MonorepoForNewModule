import React, { useState } from 'react';
import { Template } from '../types';
import FilterDrawer from './FilterDrawer';
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
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <button className="search-button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="filter-button-container">
            <button
              className={`filter-icon-button ${filterCount > 0 ? 'active' : ''}`}
              onClick={() => setIsFilterOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 4h16M5 10h10M8 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {filterCount > 0 && <span className="filter-badge">{filterCount}</span>}
            </button>
          </div>
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
