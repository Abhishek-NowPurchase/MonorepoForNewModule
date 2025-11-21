import React from 'react';
import { LogSheet } from '../../pages/Listing/types';
import { formatDate } from '../../../../shared/utils';
import './ListingTable.scss';

interface ListingTableProps {
  logSheets: LogSheet[];
  isLoading: boolean;
  onRowClick: (logSheet: LogSheet) => void;
}

interface Column {
  key: string;
  label: string;
}

const ListingTable: React.FC<ListingTableProps> = ({ logSheets, isLoading, onRowClick }) => {
  // Define columns configuration
  const columns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'created_by', label: 'CREATED BY' },
    { key: 'created_at', label: 'CREATED AT' },
    { key: 'modified_at', label: 'MODIFIED AT' },
    { key: 'status', label: 'STATUS' }
  ];

  // Calculate equal width for each column
  const columnWidth = `${100 / columns.length}%`;

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

  const renderCellContent = (column: Column, logSheet: LogSheet): string | number => {
    switch (column.key) {
      case 'id':
        return logSheet.id;
      case 'created_by':
        return logSheet.created_by || '-';
      case 'created_at':
        return formatDate(logSheet.created_at);
      case 'modified_at':
        return formatDate(logSheet.modified_at);
      case 'status':
        return logSheet.status || '-'
      default:
        return '-';
    }
  };

  return (
    <div className="table-container">
      {/* Header */}
      <div className="table-header">
        {columns.map((column) => (
          <div
            key={column.key}
            className="table-header-cell"
            style={{ width: columnWidth }}
          >
            {column.label}
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
            {columns.map((column) => (
              <div
                key={column.key}
                className="table-cell"
                style={{ width: columnWidth }}
              >
                {renderCellContent(column, logSheet)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingTable;
