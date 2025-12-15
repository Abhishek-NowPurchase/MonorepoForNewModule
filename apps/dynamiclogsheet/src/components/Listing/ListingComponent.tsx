import React from 'react';
import { Template, LogSheet, FieldConfig } from '../../pages/Listing/types';
import Header from './Header';
import ListingTable from './ListingTable';
import Pagination from '../../../../shared/component/Pagination';
import '../../pages/Listing/Listing.scss';

interface ListingComponentProps {
  templates: Template[];
  selectedTemplate: Template | null;
  logSheets: LogSheet[];
  fieldConfigs: FieldConfig[];
  isLoading: boolean;
  searchValue: string;
  page: number;
  pageSize: number;
  totalCount: number;
  onTemplateChange: (template: Template) => void;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowClick: (logSheet: LogSheet) => void;
}

const ListingComponent: React.FC<ListingComponentProps> = ({
  templates,
  selectedTemplate,
  logSheets,
  fieldConfigs,
  isLoading,
  searchValue,
  page,
  pageSize,
  totalCount,
  onTemplateChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
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
        fieldConfigs={fieldConfigs}
        isLoading={isLoading}
        onRowClick={onRowClick}
      />

      {!isLoading && totalCount > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
};

export default ListingComponent;

