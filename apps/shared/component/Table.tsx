import React from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import Pagination from './Pagination';
import './Table.css';

export interface TableColumn<T = any> {
  id: string;
  header: string | any;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  style?: any;
  headerStyle?: any;
  data: (row: T) => any;
  cell?: (data: any, row?: T) => any;
  disableClickHandler?: boolean;
}

export interface TableProps<T = any> {
  tableSchema: TableColumn<T>[];
  tableData: T[];
  tableCount?: number;
  onRowClick?: (event: any, row: T) => void;
  changeRowStyle?: (row: T) => string;
  limit?: number;
  headerClassNames?: string;
  customTableContainerClass?: string;
  customTableId?: string;
  stickyHeader?: boolean;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  // Pagination props
  pagination?: boolean;
  page?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * renderCellData renders the cell data for a given row and column.
 */
function renderCellData<T>(row: T, column: TableColumn<T>): any {
  const data = column.data(row);
  return column.cell ? column.cell(data, row) : data ?? '-';
}

const TableHeadComponent = <T extends Record<string, any> = any>({
  tableSchema,
  headerClassNames,
}: {
  tableSchema: TableColumn<T>[];
  headerClassNames?: string;
}) => (
  <TableHead>
    <TableRow className={`table-header-row ${headerClassNames || ''}`}>
      {tableSchema.map((column) => (
        <TableCell
          key={column.id}
          align={column.align}
          className="table-header-cell"
          style={{ ...column?.headerStyle, ...column.style }}
        >
          {column.header}
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
);

const TableBodyComponent = <T extends Record<string, any> = any>({
  tableSchema,
  tableData,
  onRowClick,
  changeRowStyle,
}: {
  tableSchema: TableColumn<T>[];
  tableData: T[];
  onRowClick?: (event: any, row: T) => void;
  changeRowStyle?: (row: T) => string;
}) => (
  <TableBody>
    {(tableData || []).map((row, index) => (
      <TableRow
        key={index}
        className={`table-row ${onRowClick ? 'table-row-clickable' : ''} ${changeRowStyle ? changeRowStyle(row) : ''}`}
        onClick={(e) => onRowClick?.(e, row)}
      >
        {tableSchema.map((column) => {
          return (
            <TableCell
              key={column.id}
              align={column.align}
              style={
                column.width
                  ? { width: column.width, ...column.style }
                  : { ...column.style }
              }
              onClick={(e) =>
                !column.disableClickHandler ? onRowClick?.(e, row) : null
              }
              className="table-cell"
            >
              {renderCellData(row, column)}
            </TableCell>
          );
        })}
      </TableRow>
    ))}
  </TableBody>
);

/**
 * A generic listing table component for displaying data in a table format.
 * Matches the design and functionality of Agnipariksha's ListingTable component.
 */
const Table = <T extends Record<string, any> = any>({
  tableSchema,
  tableData,
  tableCount,
  onRowClick,
  changeRowStyle,
  limit = 50,
  headerClassNames,
  customTableContainerClass,
  customTableId,
  stickyHeader = false,
  className = '',
  emptyMessage = 'No Data Found',
  loading = false,
  pagination = true,
  page = 1,
  onPageChange,
  onPageSizeChange,
}: TableProps<T>) => {
  return (
    <TableContainer
      component={Paper}
      className={`table-container ${customTableContainerClass || ''}`}
      id={customTableId}
      sx={stickyHeader ? { maxHeight: '100%', height: '100%' } : {}}
    >
      <MuiTable
        stickyHeader={stickyHeader}
        className={`table ${className}`}
      >
        <TableHeadComponent
          tableSchema={tableSchema}
          headerClassNames={headerClassNames}
        />
        {loading ? (
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={tableSchema.length}
                align="center"
                className="table-loading-cell"
              >
                Loading...
              </TableCell>
            </TableRow>
          </TableBody>
        ) : tableData.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={tableSchema.length}
                align="center"
                className="table-empty-cell"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBodyComponent
            tableSchema={tableSchema}
            tableData={tableData}
            changeRowStyle={changeRowStyle}
            onRowClick={onRowClick}
          />
        )}
      </MuiTable>
      {pagination && tableCount !== undefined && (
        <Pagination
          page={page}
          pageSize={limit}
          totalCount={tableCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </TableContainer>
  );
};

export default Table;
