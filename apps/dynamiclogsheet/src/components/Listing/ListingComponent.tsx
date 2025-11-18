import React from 'react';
import { Template, LogSheet } from '../../pages/Listing/types';
import Header from './Header';
import ListingTable from './ListingTable';
import '../../pages/Listing/Listing.scss';

interface ListingComponentProps {
  templates: Template[];
  selectedTemplate: Template | null;
  logSheets: LogSheet[];
  isLoading: boolean;
  searchValue: string;
  onTemplateChange: (template: Template) => void;
  onSearchChange: (value: string) => void;
  onRowClick: (logSheet: LogSheet) => void;
}

const ListingComponent: React.FC<ListingComponentProps> = ({
  templates,
  selectedTemplate,
  logSheets,
  isLoading,
  searchValue,
  onTemplateChange,
  onSearchChange,
  onRowClick
}) => {
  return (
    <div className="page-container">
      <Header
        templates={templates}
        selectedTemplate={selectedTemplate}
        onTemplateChange={onTemplateChange}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />

      <ListingTable
        logSheets={logSheets}
        isLoading={isLoading}
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default ListingComponent;

