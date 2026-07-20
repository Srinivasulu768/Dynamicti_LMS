import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatLabel = (segment: string) =>
    segment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
      <Link to="/dashboard" className="hover:text-gray-700 transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      {pathnames.map((segment, index) => {
        const path = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900">{formatLabel(segment)}</span>
            ) : (
              <Link to={path} className="hover:text-gray-700 transition-colors">
                {formatLabel(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
