import React, { useMemo } from "react";
import { LogSheet, FieldConfig } from "../../pages/Listing/types";
import { formatDate } from "../../../../shared/utils";
import { Table, TableColumn } from "../../../../shared/component";

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

  // Convert FieldConfig to TableColumn format for shared Table component
  const tableSchema: TableColumn<LogSheet>[] = useMemo(() => {
    if (visibleColumns.length === 0) {
      return [];
    }

    // Calculate equal width for each column
    const columnWidth = `${100 / visibleColumns.length}%`;

    return visibleColumns.map((fieldConfig) => ({
      id: fieldConfig.field_key,
      header: fieldConfig.label,
      align: 'center' as const,
      width: columnWidth,
      data: (row: LogSheet) => {
        const value = (row as any)[fieldConfig.field_key];
        
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
      },
    }));
  }, [visibleColumns]);

  // Determine empty message based on state
  const emptyMessage = useMemo(() => {
    if (visibleColumns.length === 0) {
      return "No columns configured for this template. Please configure field settings.";
    }
    return "No log sheets found";
  }, [visibleColumns.length]);

  return (
    <Table<LogSheet>
      tableSchema={tableSchema}
      tableData={logSheets}
      onRowClick={(_, row) => onRowClick(row)}
      loading={isLoading}
      emptyMessage={emptyMessage}
      pagination={false}
    />
  );
};

export default ListingTable;
