import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Home, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileModal } from './ProfileModal';
import notificationsData from '@/mock/notifications.json';
import type { Role } from '@/types';

const roleLabels: Record<Role, string> = {
  super_admin:     'Super Admin',
  training_admin:  'Training Admin',
  content_manager: 'Content Manager',
  instructor:      'Instructor',
  org_admin:       'Organization Admin',
  learner:         'Learner',
};

type OpenPanel = 'role' | 'notifications' | 'profile' | null;

function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);
  const formatLabel = (s: string) =>
    s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link to="/dashboard" className="text-gray-400 hover:text-navy-800 transition-colors flex-shrink-0">
        <Home className="w-4 h-4" />
      </Link>
      {pathnames.map((segment, index) => {
        const path = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            {isLast ? (
              <span className="font-semibold text-gray-800">{formatLabel(segment)}</span>
            ) : (
              <Link to={path} className="text-gray-400 hover:text-navy-800 transition-colors">
                {formatLabel(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function Header() {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const roleRef      = useRef<HTMLDivElement>(null);
  const notifRef     = useRef<HTMLDivElement>(null);
  const profileRef   = useRef<HTMLDivElement>(null);

  const closeAll = useCallback(() => setOpenPanel(null), []);

  const toggle = (panel: OpenPanel) =>
    setOpenPanel(prev => (prev === panel ? null : panel));

  // 1. Close on route change
  useEffect(() => { closeAll(); }, [location.pathname, closeAll]);

  // 2. Close on Escape key
  useEffect(() => {
    if (!openPanel) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAll(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openPanel, closeAll]);

  // 3. Close on outside click — single listener covering all three panels
  useEffect(() => {
    if (!openPanel) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const insideRole    = roleRef.current?.contains(target);
      const insideNotif   = notifRef.current?.contains(target);
      const insideProfile = profileRef.current?.contains(target);
      if (!insideRole && !insideNotif && !insideProfile) closeAll();
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [openPanel, closeAll]);

  const unreadCount = notificationsData.filter(n => !n.read).length;
  const handleLogout = () => { closeAll(); logout(); navigate('/login'); };

  if (!user) return null;

  return (
    <>
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-5">

      {/* Left — Logo + Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-gold-500 rounded-md flex items-center justify-center">
            <span className="text-navy-900 font-black text-[9px] leading-none">DT</span>
          </div>
          <span className="text-sm font-bold text-navy-900 hidden md:block">DynamicTI</span>
        </Link>
        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
        <Breadcrumb />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Role Switcher */}
        <div ref={roleRef} className="relative">
          <button
            onClick={() => toggle('role')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-800/5 hover:bg-navy-800/10 text-navy-800 border border-navy-800/10 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            {roleLabels[user.role]}
            <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${openPanel === 'role' ? 'rotate-180' : ''}`} />
          </button>

          {openPanel === 'role' && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Switch Role</p>
              {Object.entries(roleLabels).map(([role, label]) => (
                <button
                  key={role}
                  onClick={() => { switchRole(role as Role); closeAll(); }}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${user.role === role ? 'text-navy-800 font-semibold bg-navy-800/3' : 'text-gray-600'}`}
                >
                  {label}
                  {user.role === role && <span className="w-2 h-2 bg-gold-500 rounded-full" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => toggle('notifications')}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {openPanel === 'notifications' && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notificationsData.slice(0, 6).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => { navigate((notif as any).route || '/notifications'); closeAll(); }}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50/40' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.read && (
                        <div className="w-1.5 h-1.5 bg-navy-800 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                      <div className={!notif.read ? '' : 'pl-3.5'}>
                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100">
                <button
                  onClick={() => { navigate('/notifications'); closeAll(); }}
                  className="text-xs text-navy-800 font-semibold hover:underline w-full text-center"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => toggle('profile')}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-gray-400 leading-tight">{roleLabels[user.role]}</p>
            </div>
            <div className="w-8 h-8 bg-navy-800 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user.firstName[0]}{user.lastName[0]}</span>
            </div>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${openPanel === 'profile' ? 'rotate-180' : ''}`} />
          </button>

          {openPanel === 'profile' && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowProfileModal(true); closeAll(); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-gray-400" /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>

    {/* Profile Modal */}
    <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
  </>
  );
}
