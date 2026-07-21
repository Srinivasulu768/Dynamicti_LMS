import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface GridPaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function GridPagination({ totalItems, pageSize, currentPage, onPageChange }: GridPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalPages <= 0) return null;

  const goTo = (p: number) => {
    onPageChange(Math.max(1, Math.min(totalPages, p)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{start}–{end}</span> of <span className="font-medium text-gray-700">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => goTo(1)} disabled={currentPage === 1} className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPages().map((page, i) =>
          page === '...' ? (
            <span key={`d${i}`} className="px-2 text-gray-400 text-sm">…</span>
          ) : (
            <button
              key={page}
              onClick={() => goTo(page as number)}
              className={cn(
                'min-w-[32px] h-8 px-2 rounded-md text-sm font-medium border transition-colors',
                currentPage === page ? 'bg-navy-800 text-white border-navy-800' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
              )}
            >
              {page}
            </button>
          )
        )}
        <button onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages} className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => goTo(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
