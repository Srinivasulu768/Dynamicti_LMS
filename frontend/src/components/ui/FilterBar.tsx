import { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  placeholder: string;
  options: FilterOption[];
}

interface FilterBarProps {
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onSearchChange?: (value: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  className?: string;
}

export function FilterBar({
  searchPlaceholder = 'Search...',
  filters = [],
  onSearchChange,
  onFilterChange,
  className,
}: FilterBarProps) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Close filter panel on outside click
  useEffect(() => {
    if (!filtersOpen) return;
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setFiltersOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [filtersOpen]);

  const handleSearch = (val: string) => {
    setSearch(val);
    onSearchChange?.(val);
  };

  const handleFilter = (key: string, val: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: val }));
    onFilterChange?.(key, val);
  };

  const clearFilter = (key: string) => {
    setActiveFilters(prev => { const n = { ...prev }; delete n[key]; return n; });
    onFilterChange?.(key, '');
  };

  const activeCount = Object.values(activeFilters).filter(v => v && v !== 'all').length;

  return (
    <div ref={barRef} className={cn('space-y-2', className)}>
      {/* Main bar */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
        {/* Search */}
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent min-w-0"
        />

        {/* Inline dropdown filters */}
        {filters.length > 0 && (
          <div className="flex items-center gap-2 border-l border-gray-200 pl-2 flex-shrink-0">
            {filters.map(filter => (
              <div key={filter.key} className="relative">
                <select
                  value={activeFilters[filter.key] || 'all'}
                  onChange={e => handleFilter(filter.key, e.target.value)}
                  className={cn(
                    'text-xs font-medium pl-2 pr-6 py-1.5 rounded-lg border appearance-none cursor-pointer outline-none transition-colors',
                    activeFilters[filter.key] && activeFilters[filter.key] !== 'all'
                      ? 'bg-navy-800 text-white border-navy-800'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                  )}
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="all">{filter.placeholder}</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {/* Custom chevron */}
                <span className={cn(
                  'absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]',
                  activeFilters[filter.key] && activeFilters[filter.key] !== 'all' ? 'text-white' : 'text-gray-400'
                )}>▾</span>
              </div>
            ))}
          </div>
        )}

        {/* Filter toggle icon */}
        {filters.length > 0 && (
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors flex-shrink-0',
              activeCount > 0 || filtersOpen
                ? 'bg-gold-500 text-navy-900 border-gold-500'
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
            )}
            title="Toggle filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {activeCount > 0 && (
              <span className="bg-navy-900 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        )}

        {/* Clear search */}
        {search && (
          <button onClick={() => handleSearch('')} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Active filters:</span>
          {filters.map(filter => {
            const val = activeFilters[filter.key];
            if (!val || val === 'all') return null;
            const label = filter.options.find(o => o.value === val)?.label || val;
            return (
              <span key={filter.key} className="inline-flex items-center gap-1 px-2 py-0.5 bg-navy-800/10 text-navy-800 text-xs font-medium rounded-full">
                {filter.placeholder}: {label}
                <button onClick={() => clearFilter(filter.key)} className="hover:text-red-500 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          <button
            onClick={() => { setActiveFilters({}); filters.forEach(f => onFilterChange?.(f.key, '')); }}
            className="text-xs text-red-500 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
