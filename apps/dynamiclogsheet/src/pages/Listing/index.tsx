import React from 'react';
import { useListing } from './hooks';
import ListingComponent from '../../components/Listing/ListingComponent';

const Listing: React.FC = () => {
  const {
    templates,
    selectedTemplate,
    logSheets,
    isLoading,
    searchValue,
    handleTemplateChange,
    handleSearchChange,
    handleRowClick
  } = useListing();

  return (
    <ListingComponent
      templates={templates}
      selectedTemplate={selectedTemplate}
      logSheets={logSheets}
      isLoading={isLoading}
      searchValue={searchValue}
      onTemplateChange={handleTemplateChange}
      onSearchChange={handleSearchChange}
      onRowClick={handleRowClick}
    />
  );
};

export default Listing;
