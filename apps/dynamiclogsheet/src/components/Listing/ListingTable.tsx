import React, { useMemo } from "react";
import { LogSheet, FieldConfig } from "../../pages/Listing/types";
import { formatDate } from "../../../../shared/utils";
import "./ListingTable.scss";

interface ListingTableProps {
  logSheets: LogSheet[];
  fieldConfigs: FieldConfig[];
  isLoading: boolean;
  onRowClick: (logSheet: LogSheet) => void;
}

const ListingTable: React.FC<ListingTableProps> = ({
  logSheets,
  fieldConfigs,
  isLoading,
  onRowClick,
}) => {
  // Sort by order and filter visible columns
  // If no fieldConfigs, use default columns based on common log sheet fields
  const visibleColumns = useMemo(() => {
    if (fieldConfigs.length === 0 && logSheets.length > 0) {
      // Fallback: Show default columns if no field configs are available
      const defaultFields: FieldConfig[] = [
        { field_key: 'id', label: 'ID', order: 1, field_type: 'number', is_visible: true, is_filterable: false, is_sortable: true, filter_type: '', filter_options: [] },
        { field_key: 'template_name', label: 'Template', order: 2, field_type: 'string', is_visible: true, is_filterable: false, is_sortable: true, filter_type: '', filter_options: [] },
        { field_key: 'created_by', label: 'Created By', order: 3, field_type: 'string', is_visible: true, is_filterable: false, is_sortable: true, filter_type: '', filter_options: [] },
        { field_key: 'status', label: 'Status', order: 4, field_type: 'string', is_visible: true, is_filterable: false, is_sortable: true, filter_type: '', filter_options: [] },
        { field_key: 'created_at', label: 'Created At', order: 5, field_type: 'date', is_visible: true, is_filterable: false, is_sortable: true, filter_type: '', filter_options: [] },
        { field_key: 'modified_at', label: 'Modified At', order: 6, field_type: 'date', is_visible: true, is_filterable: false, is_sortable: true, filter_type: '', filter_options: [] },
      ];
      return defaultFields.filter((field) => {
        // Only show fields that exist in at least one log sheet
        return logSheets.some((sheet) => (sheet as any)[field.field_key] !== undefined);
      });
    }
    
    return fieldConfigs
      .filter((config) => config.is_visible)
      .sort((a, b) => a.order - b.order);
  }, [fieldConfigs, logSheets]);

  // Calculate equal width for each column (only if we have columns)
  const columnWidth = visibleColumns.length > 0 ? `${100 / visibleColumns.length}%` : 'auto';

  if (isLoading) {
    return (
      <div className="empty-state">
        <p>Loading log sheets...</p>
      </div>
    );
  }

  if (logSheets.length === 0) {
    return (
      <div className="empty-state">
        <p>No log sheets found</p>
      </div>
    );
  }

  // If no visible columns configured, show default columns or error message
  if (visibleColumns.length === 0) {
    return (
      <div className="empty-state">
        <p>No columns configured for this template. Please configure field settings.</p>
      </div>
    );
  }

  const renderCellContent = (
    fieldConfig: FieldConfig,
    logSheet: LogSheet
  ): string | number => {
    const value = (logSheet as any)[fieldConfig.field_key];

    // Handle different field types
    if (value === null || value === undefined) {
      return "-";
    }

    // Format dates if field type suggests it or field key contains date-related terms
    if (
      fieldConfig.field_type === "date" ||
      fieldConfig.field_key.includes("_at") ||
      fieldConfig.field_key.includes("date")
    ) {
      return formatDate(value);
    }

    return value;
  };

  return (
    <div className="table-container">
      {/* Header */}
      <div className="table-header">
        {visibleColumns.map((fieldConfig) => (
          <div
            key={fieldConfig.field_key}
            className="table-header-cell"
            style={{ width: columnWidth }}
          >
            {fieldConfig.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="table-body">
        {logSheets.map((logSheet) => (
          <div
            key={logSheet.id}
            className="table-row"
            onClick={() => onRowClick(logSheet)}
          >
            {visibleColumns.map((fieldConfig) => (
              <div
                key={fieldConfig.field_key}
                className="table-cell"
                style={{ width: columnWidth }}
              >
                {renderCellContent(fieldConfig, logSheet)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingTable;
