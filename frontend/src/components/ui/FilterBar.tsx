import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
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
  const [staged, setStaged] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});

  const handleSearch = (val: string) => {
    setSearch(val);
    onSearchChange?.(val);
  };

  const applyFilters = () => {
    setApplied({ ...staged });
    filters.forEach(f => onFilterChange?.(f.key, staged[f.key] || ''));
  };

  const clearAll = () => {
    setStaged({});
    setApplied({});
    filters.forEach(f => onFilterChange?.(f.key, ''));
  };

  const clearFilter = (key: string) => {
    const ns = { ...staged }; delete ns[key];
    const na = { ...applied }; delete na[key];
    setStaged(ns);
    setApplied(na);
    onFilterChange?.(key, '');
  };

  const activeCount = Object.values(applied).filter(v => v && v !== 'all').length;
  const hasUnapplied = Object.keys(staged).some(k => staged[k] !== (applied[k] || 'all') && staged[k] !== 'all');

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 px-4 py-2.5 min-w-0">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent min-w-0"
          />
          {search && (
            <button onClick={() => handleSearch('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns + Apply icon */}
        {filters.length > 0 && (
          <>
            <div className="w-px h-8 bg-gray-200" />

            {filters.map(filter => (
              <select
                key={filter.key}
                value={staged[filter.key] || 'all'}
                onChange={e => setStaged(prev => ({ ...prev, [filter.key]: e.target.value }))}
                className="text-xs font-medium px-3 py-2.5 bg-transparent text-gray-600 border-0 border-r border-gray-200 outline-none cursor-pointer appearance-none"
              >
                <option value="all">{filter.placeholder}</option>
                {filter.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ))}

            {/* APPLY FILTER BUTTON */}
            <button
              onClick={applyFilters}
              className={cn(
                'flex items-center justify-center px-3 py-2.5 transition-all',
                hasUnapplied
                  ? 'bg-gold-500 text-navy-900'
                  : activeCount > 0
                  ? 'bg-navy-800 text-white'
                  : 'text-gray-400 hover:text-navy-800 hover:bg-gray-50'
              )}
              title={hasUnapplied ? 'Click to apply filters' : activeCount > 0 ? 'Filters applied' : 'Apply filters'}
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* CLEAR FILTER BUTTON */}
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center justify-center px-3 py-2.5 text-red-500 hover:bg-red-50 transition-all"
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Chips */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map(filter => {
            const val = applied[filter.key];
            if (!val || val === 'all') return null;
            const label = filter.options.find(o => o.value === val)?.label || val;
            return (
              <span key={filter.key} className="inline-flex items-center gap-1 px-2 py-0.5 bg-navy-800/10 text-navy-800 text-xs font-medium rounded-full">
                {label}
                <button onClick={() => clearFilter(filter.key)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          <button onClick={clearAll} className="text-xs text-red-500 hover:underline">Clear</button>
        </div>
      )}
    </div>
  );
}
