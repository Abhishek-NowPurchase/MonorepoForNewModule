import React from 'react';
import { useListing } from './hooks';
import ListingComponent from '../../components/Listing/ListingComponent';

const Listing: React.FC = () => {
  const {
    templates,
    selectedTemplate,
    logsheets,
    isLoading,
    handleTemplateChange,
    // Pagination
    pageNo,
    pageSize,
    total,
    handlePageChange,
    handlePageSizeChange,
    // Filters
    status,
    handleStatusChange,
  } = useListing();

  return (
    <ListingComponent
      templates={templates}
      selectedTemplate={selectedTemplate}
      logsheets={logsheets}
      isLoading={isLoading}
      onTemplateChange={handleTemplateChange}
      pageNo={pageNo}
      pageSize={pageSize}
      total={total}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      status={status}
      onStatusChange={handleStatusChange}
    />
  );
};

export default Listing;
