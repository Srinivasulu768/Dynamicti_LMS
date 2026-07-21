import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Search...',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = data.filter((item) =>
    searchTerm
      ? Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = String(a[sortKey] ?? '');
        const bVal = String(b[sortKey] ?? '');
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      })
    : filtered;

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push('...');
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const startItem = sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, sorted.length);

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-800/20"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    col.sortable !== false && 'cursor-pointer hover:text-gray-700 select-none'
                  )}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-navy-800">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No results found
                </td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render ? col.render(item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-700">{startItem}–{endItem}</span> of <span className="font-medium text-gray-700">{sorted.length}</span> results
          </p>

          <div className="flex items-center gap-1">
            {/* First */}
            <button
              onClick={() => goToPage(1)}
              disabled={safePage === 1}
              className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            {/* Prev */}
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, i) =>
              page === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page as number)}
                  className={cn(
                    'min-w-[32px] h-8 px-2 rounded-md text-sm font-medium border transition-colors',
                    safePage === page
                      ? 'bg-navy-800 text-white border-navy-800'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {page}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Last */}
            <button
              onClick={() => goToPage(totalPages)}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
