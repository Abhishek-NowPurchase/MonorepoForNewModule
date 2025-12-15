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
  const visibleColumns = useMemo(() => {
    return fieldConfigs
      .filter((config) => config.is_visible)
      .sort((a, b) => a.order - b.order);
  }, [fieldConfigs]);

  // Calculate equal width for each column
  const columnWidth = `${100 / visibleColumns.length}%`;

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
