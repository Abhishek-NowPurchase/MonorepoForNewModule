import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Template, TemplateLogSheetsResponse } from '../../pages/Listing/types';
import Header from './Header';
import { Table, TableColumn } from '../../../../shared/component';
import Pagination from '../../../../shared/component/Pagination';
import { getCategoryFromPath } from '../../utils/routeUtils';
import '../../pages/Listing/Listing.scss';

interface ListingComponentProps {
  templates: Template[];
  selectedTemplate: Template | null;
  logsheets: TemplateLogSheetsResponse | null;
  isLoading: boolean;
  onTemplateChange: (template: Template) => void;
  // Pagination
  pageNo: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  // Filters
  status: "pending" | "completed";
  onStatusChange: (status: "pending" | "completed") => void;
}

const ListingComponent: React.FC<ListingComponentProps> = ({
  templates,
  selectedTemplate,
  logsheets,
  isLoading,
  onTemplateChange,
  pageNo,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  status,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = getCategoryFromPath(location.pathname);

  // Generate table schema dynamically from logsheets data
  // Use keys from API response in the exact order they appear
  const tableSchema: TableColumn<Record<string, any>>[] = useMemo(() => {
    if (!logsheets || !logsheets.logsheets || logsheets.logsheets.length === 0) {
      return [];
    }

    // Get keys from the first logsheet in the exact order they appear in the API response
    const firstLogsheet = logsheets.logsheets[0];
    const keys = Object.keys(firstLogsheet); // Keep all keys, including _id and template_id

    // Calculate equal width for each column
    const columnWidth = `${100 / keys.length}%`;

    // Map keys to table columns in the same order as they appear in the response
    return keys.map((key) => ({
      id: key,
      header: key, // Use the exact key from API response as header
      align: 'center' as const,
      width: columnWidth,
      data: (row: Record<string, any>) => {
        const value = row[key];
        
        // Handle different value types
        if (value === null || value === undefined) {
          return "-";
        }

        // Handle arrays
        if (Array.isArray(value)) {
          return value.join(', ');
        }

        // Handle objects
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }

        return String(value);
      },
    }));
  }, [logsheets]);

  const handleRowClick = (_event: any, row: Record<string, any>) => {
    // Extract template_id, logsheet_id (_id), and version from the row
    const templateId = row.template_id || selectedTemplate?.template_id;
    const logsheetId = row._id;
    
    // Get version from row data if available, otherwise from selectedTemplate
    const version = row.version || selectedTemplate?.version;
    
    if (!templateId || !logsheetId) {
      console.warn('Missing template_id or logsheet_id for navigation');
      return;
    }
    
    // Build URL with path params and optional version query param
    let url = `/dynamic-log-sheet/${category}/${templateId}/${logsheetId}`;
    if (version) {
      url += `?version=${version}`;
    }
    
    navigate(url);
  };

  return (
    <div className="page-container-listing">
      <div className="header-section">
        <Header
          templates={templates}
          selectedTemplate={selectedTemplate}
          onTemplateChange={onTemplateChange}
          status={status}
          onStatusChange={onStatusChange}
        />
      </div>
      
      <div className="table-section">
        {isLoading ? (
          <div>Loading logsheets...</div>
        ) : logsheets && logsheets.logsheets ? (
          <>
            <Table<Record<string, any>>
              tableSchema={tableSchema}
              tableData={logsheets.logsheets}
              onRowClick={handleRowClick}
              loading={isLoading}
              emptyMessage="No logsheets found"
              pagination={false}
              stickyHeader={true}
            />
            {total > 0 && (
              <Pagination
                page={pageNo}
                pageSize={pageSize}
                totalCount={total}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            )}
          </>
        ) : (
          <div>No template selected or no logsheets available.</div>
        )}
      </div>
    </div>
  );
};

export default ListingComponent;

