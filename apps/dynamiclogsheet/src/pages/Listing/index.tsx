import React from 'react';
import { useListing } from './hooks';
import ListingComponent from '../../components/Listing/ListingComponent';

const Listing: React.FC = () => {
  const {
    templates,
    selectedTemplate,
    logSheets,
    fieldConfigs,
    isLoading,
    searchValue,
    page,
    pageSize,
    totalCount,
    handleTemplateChange,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleRowClick
  } = useListing();

  return (
    <ListingComponent
      templates={templates}
      selectedTemplate={selectedTemplate}
      logSheets={logSheets}
      fieldConfigs={fieldConfigs}
      isLoading={isLoading}
      searchValue={searchValue}
      page={page}
      pageSize={pageSize}
      totalCount={totalCount}
      onTemplateChange={handleTemplateChange}
      onSearchChange={handleSearchChange}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onRowClick={handleRowClick}
    />
  );
};

export default Listing;
