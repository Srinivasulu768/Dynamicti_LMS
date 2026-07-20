import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, FileText,
  ClipboardCheck, UserPlus, Calendar, Building2, CreditCard,
  Award, BarChart3, MessageSquare, Bell, Video, BookMarked,
  CalendarDays, Settings, Activity, Shield, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { navigationItems } from '@/constants/navigation';
import { cn } from '@/utils/cn';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, BookOpen, GraduationCap, FileText,
  ClipboardCheck, UserPlus, Calendar, Building2, CreditCard,
  Award, BarChart3, MessageSquare, Bell, Video, BookMarked,
  CalendarDays, Settings, Activity, Shield,
};

function SidebarItem({ item, isCollapsed }: { item: typeof navigationItems[0]; isCollapsed: boolean }) {
  const Icon = iconMap[item.icon];
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTop, setTooltipTop] = useState(0);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!isCollapsed) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipTop(rect.top + rect.height / 2);
    setShowTooltip(true);
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={() => setShowTooltip(false)}>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-gold-500/10 text-gold-500'
              : 'text-gray-400 hover:text-white hover:bg-navy-800'
          )
        }
      >
        {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
        {!isCollapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
            {item.label}
          </motion.span>
        )}
      </NavLink>

      {isCollapsed && showTooltip && (
        <div
          className="fixed z-[9999] px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none"
          style={{ left: 80, top: tooltipTop, transform: 'translateY(-50%)' }}
        >
          {item.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900" />
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const { isCollapsed, toggle } = useSidebar();

  if (!user) return null;

  const visibleItems = navigationItems.filter(item => item.roles.includes(user.role));

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 260 }}
      className="fixed left-0 top-14 h-[calc(100vh-56px)] bg-navy-900 border-r border-navy-700 z-40 flex flex-col overflow-hidden"
    >
      {/* Sidebar header — toggle button always centered/visible */}
      <div className="h-10 flex items-center border-b border-navy-700 flex-shrink-0 px-2">
        {isCollapsed ? (
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center p-1.5 rounded-md hover:bg-navy-700 text-gray-400 hover:text-white transition-colors"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center justify-between w-full px-2">
            <span className="text-white font-bold text-sm">DynamicTI</span>
            <button
              onClick={toggle}
              className="p-1.5 rounded-md hover:bg-navy-700 text-gray-400 hover:text-white transition-colors flex-shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map(item => (
          <SidebarItem key={item.id} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>
    </motion.aside>
  );
}
