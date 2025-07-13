'use client';

import React, { useState, useMemo } from 'react';
import Button from '../Button/Button';
import styles from './DataTable.module.css';

export interface Column<T = Record<string, unknown>> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
  emptyText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DataTable = <T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  pagination,
  rowKey = 'id',
  onRowClick,
  emptyText = 'No data available',
  className,
  size = 'md'
}: DataTableProps<T>) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey]?.toString() || index.toString();
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    const column = columns.find(col => col.key === sortColumn);
    if (!column || !column.sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = column.dataIndex ? a[column.dataIndex] : a[sortColumn];
      const bValue = column.dataIndex ? b[column.dataIndex] : b[sortColumn];

      if (aValue === bValue) return 0;
      
      // Convert to string for comparison to handle unknown types safely
      const aString = String(aValue ?? '');
      const bString = String(bValue ?? '');
      
      const comparison = aString < bString ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection, columns]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination]);

  const renderCell = (column: Column<T>, record: T, index: number) => {
    if (column.render) {
      return column.render(column.dataIndex ? record[column.dataIndex] : record, record, index);
    }
    
    const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
    return value?.toString() || '';
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { current, pageSize, total, onChange } = pagination;
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);

    return (
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {startItem}-{endItem} of {total} items
        </div>
        <div className={styles.paginationControls}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(current - 1, pageSize)}
            disabled={current <= 1}
          >
            Previous
          </Button>
          <span className={styles.pageInfo}>
            Page {current} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(current + 1, pageSize)}
            disabled={current >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.tableWrapper}>
        <table className={`${styles.table} ${styles[size]}`}>
          <thead className={styles.thead}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${styles.th} ${styles[column.align || 'left']}`}
                  style={{ width: column.width }}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className={styles.thContent}>
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className={styles.sortIcon}>
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="18,15 12,9 6,15" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6,9 12,15 18,9" />
                            </svg>
                          )
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <polyline points="18,15 12,9 6,15" />
                            <polyline points="6,9 12,15 18,9" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  <div className={styles.empty}>
                    <div className={styles.emptyIcon}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <path d="M9 12h6" />
                        <path d="M9 16h6" />
                        <path d="M9 8h6" />
                      </svg>
                    </div>
                    <p>{emptyText}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={`${styles.tr} ${onRowClick ? styles.clickable : ''}`}
                  onClick={onRowClick ? () => onRowClick(record, index) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`${styles.td} ${styles[column.align || 'left']}`}
                    >
                      {renderCell(column, record, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
};

export default DataTable;