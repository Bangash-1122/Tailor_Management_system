import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const PAGE_TITLES = {
  '/':             'Dashboard',
  '/customers':    'Customers',
  '/measurements': 'Measurements',
  '/orders':       'Orders',
  '/payments':     'Payments',
  '/ledger':       'Ledger',
  '/expenses':     'Expenses',
  '/staff':        'Staff',
  '/reports':      'Reports',
  '/settings':     'Settings',
};

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1] || 'Tailor Pro';

  return (
    <header className="h-16 flex items-center justify-between px-6 glass-card border-b border-white/8 flex-shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
        <p className="text-xs text-slate-500">
          {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search hint */}
        <button
          id="navbar-search-btn"
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 bg-white/5 hover:bg-white/8 border border-white/8 transition-colors"
        >
          <Search size={15} />
          <span>Quick search…</span>
          <kbd className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-slate-500">⌘K</kbd>
        </button>

        {/* Notification bell */}
        <button
          id="navbar-notifications-btn"
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse-glow" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold select-none">
            {getInitials(user?.name || 'Admin')}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-white leading-none">{user?.name || 'Admin'}</p>
            <p className="text-xs text-indigo-400 capitalize">{user?.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
