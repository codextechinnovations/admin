import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  searchable?: boolean;
  filterable?: boolean;
  itemsPerPage?: number;
  loading?: boolean;
  rowKey?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function DataTable({
  columns,
  data,
  searchable = true,
  filterable = false,
  itemsPerPage = 10,
  loading = false,
  rowKey = '_id',
  selectable = false,
  selectedIds = [],
  onSelectionChange
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Filter data based on search
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  // Prune selectedIds when the underlying data no longer contains them
  // (e.g. after a bulk delete or page change that drops records from view).
  useEffect(() => {
    if (!selectable || !onSelectionChange || selectedIds.length === 0) return;
    const validIds = new Set(data.map((r) => r[rowKey]));
    const stillValid = selectedIds.filter((id) => validIds.has(id));
    if (stillValid.length !== selectedIds.length) {
      onSelectionChange(stillValid);
    }
  }, [data, rowKey, selectable]);

  const isRowSelected = (id: string) => selectedIds.includes(id);
  const pageIds = paginatedData.map((r) => r[rowKey]);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const someOnPageSelected = pageIds.some((id) => selectedIds.includes(id)) && !allOnPageSelected;

  const toggleRow = (id: string) => {
    if (!onSelectionChange) return;
    if (isRowSelected(id)) {
      onSelectionChange(selectedIds.filter((x) => x !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const togglePage = () => {
    if (!onSelectionChange) return;
    if (allOnPageSelected) {
      onSelectionChange(selectedIds.filter((id) => !pageIds.includes(id)));
    } else {
      const merged = new Set(selectedIds);
      pageIds.forEach((id) => merged.add(id));
      onSelectionChange(Array.from(merged));
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-xl rounded-xl border border-border overflow-hidden">
      {/* Header */}
      {(searchable || filterable) && (
        <div className="p-4 border-b border-border flex items-center gap-4">
          {searchable && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          )}
          {filterable && (
            <button className="flex items-center gap-2 px-4 py-2 bg-input rounded-lg border border-border hover:bg-accent transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter</span>
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {selectable && (
                <th className="px-4 py-4 w-10">
                  <button
                    type="button"
                    onClick={togglePage}
                    disabled={pageIds.length === 0}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      allOnPageSelected
                        ? 'bg-primary border-primary text-primary-foreground'
                        : someOnPageSelected
                        ? 'bg-primary/40 border-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                    } disabled:opacity-40`}
                    title={allOnPageSelected ? 'Deselect page' : 'Select page'}
                  >
                    {(allOnPageSelected || someOnPageSelected) && <Check className="w-3.5 h-3.5" />}
                  </button>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    column.sortable ? 'cursor-pointer hover:bg-accent/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="text-xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => {
                const id = row[rowKey];
                const selected = isRowSelected(id);
                return (
                  <motion.tr
                    key={id || rowIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIndex * 0.05 }}
                    className={`border-b border-border transition-colors ${
                      selected ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-accent/30'
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-4 w-10">
                        <button
                          type="button"
                          onClick={() => toggleRow(id)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            selected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border hover:border-primary'
                          }`}
                          title={selected ? 'Deselect' : 'Select'}
                        >
                          {selected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 text-sm">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-muted-foreground">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white'
                      : 'hover:bg-accent'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
