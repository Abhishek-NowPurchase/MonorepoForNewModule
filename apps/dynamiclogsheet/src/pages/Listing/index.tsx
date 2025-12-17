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
    page,
    pageSize,
    totalCount,
    handleTemplateChange,
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
      page={page}
      pageSize={pageSize}
      totalCount={totalCount}
      onTemplateChange={handleTemplateChange}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onRowClick={handleRowClick}
    />
  );
};

export default Listing;
