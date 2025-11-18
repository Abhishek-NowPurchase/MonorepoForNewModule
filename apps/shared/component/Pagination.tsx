import React from 'react';
import {
  FormControl,
  Pagination as MuiPagination,
  PaginationItem,
} from '@mui/material';
import Select from './Select';
import './Pagination.css';

// Custom SVG Icons for pagination arrows (matching MUI ArrowBackIosNew and ArrowForwardIos)
const ArrowBackIcon = ({
  color = '#1976d2',
  fontSize = '30px',
}: {
  color?: string;
  fontSize?: string;
}) => (
  <svg
    width={fontSize}
    height={fontSize}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ color, display: 'block' }}
  >
    <path
      d="M17.77 3.77 16 2 6 12l10 10 1.77-1.77L9.54 12z"
      fill="currentColor"
    />
  </svg>
);

const ArrowForwardIcon = ({
  color = '#1976d2',
  fontSize = '30px',
}: {
  color?: string;
  fontSize?: string;
}) => (
  <svg
    width={fontSize}
    height={fontSize}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ color, display: 'block' }}
  >
    <path
      d="M6.23 20.23 8 22l10-10L8 2 6.23 3.77 14.46 12z"
      fill="currentColor"
    />
  </svg>
);

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  siblingsCount?: number;
}

const Pagination = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 30, 40, 50],
  siblingsCount = 1,
}) => {
  const pagesCount = Math.ceil(totalCount / pageSize);

  const handlePageChange = (event: any, value: number) => {
    if (onPageChange) {
      onPageChange(value);
    }
  };

  const handlePageSizeChange = (value: number | string) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(value));
    }
  };

  const getPaginationStyles = (item: any) => {
    return item.selected || item.type === 'previous' || item.type === 'next'
      ? {
          border: '1px solid rgba(25, 118, 210, 0.5)',
          backgroundColor: 'rgba(25, 118, 210, 0.12)',
          fontWeight: 'bolder',
        }
      : {};
  };

  return (
    <div className="pagination-wrapper">
      <div className="pagination-rows-per-page">
        <span className="pagination-rows-label">Rows per page:</span>
        <Select
          value={pageSize}
          options={pageSizeOptions.map((opt) => ({
            value: opt,
            label: String(opt),
          }))}
          onChange={handlePageSizeChange}
          className="pagination-select"
          containerClassName="pagination-select-container"
        />
      </div>
      <div className="pagination-controls">
        <MuiPagination
          page={page}
          count={pagesCount}
          siblingCount={siblingsCount}
          boundaryCount={1}
          onChange={handlePageChange}
          variant="outlined"
          color="primary"
          renderItem={(item) => (
            <PaginationItem
              {...item}
              key={item.page}
              style={getPaginationStyles(item)}
              variant="outlined"
              className="pagination-item"
              components={{
                previous: () => <ArrowBackIcon color="#1976d2" fontSize="30px" />,
                next: () => <ArrowForwardIcon color="#1976d2" fontSize="30px" />,
              }}
            />
          )}
        />
      </div>
    </div>
  );
};

export default Pagination;

