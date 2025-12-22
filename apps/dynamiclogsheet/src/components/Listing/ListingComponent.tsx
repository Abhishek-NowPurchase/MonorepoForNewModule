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
  page: number;
  pageSize: number;
  totalCount: number;
  onTemplateChange: (template: Template) => void;
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
  page,
  pageSize,
  totalCount,
  onTemplateChange,
  onPageChange,
  onPageSizeChange,
  onRowClick
}) => {
  return (
    <div className="page-container-listing">
      <div className="header-section">
        <Header
          templates={templates}
          selectedTemplate={selectedTemplate}
          onTemplateChange={onTemplateChange}
        />
      </div>
      
      <div className="table-section">
        <ListingTable
          logSheets={logSheets}
          fieldConfigs={fieldConfigs}
          isLoading={isLoading}
          onRowClick={onRowClick}
        />
      </div>

      <div className="pagination-section">
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
    </div>
  );
};

export default ListingComponent;

