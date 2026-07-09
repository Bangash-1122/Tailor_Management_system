import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Ruler, ShoppingBag, CreditCard,
  BookOpen, Receipt, UserCog, BarChart3, Settings, Scissors,
  ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers',   icon: Users,           label: 'Customers' },
  { to: '/measurements',icon: Ruler,           label: 'Measurements' },
  { to: '/orders',      icon: ShoppingBag,     label: 'Orders' },
  { to: '/payments',    icon: CreditCard,      label: 'Payments' },
  { to: '/ledger',      icon: BookOpen,        label: 'Ledger' },
  { to: '/expenses',    icon: Receipt,         label: 'Expenses' },
  { to: '/staff',       icon: UserCog,         label: 'Staff' },
  { to: '/reports',     icon: BarChart3,       label: 'Reports' },
  { to: '/settings',    icon: Settings,        label: 'Settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={`relative flex flex-col h-screen transition-all duration-300 ease-in-out glass-card border-r border-white/8 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
      style={{ minWidth: collapsed ? '72px' : '256px' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-indigo">
          <Scissors size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <p className="text-sm font-bold text-white leading-none">Tailor Pro</p>
            <p className="text-xs text-slate-400 mt-0.5">Management System</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        id="sidebar-toggle"
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-indigo-600 border border-indigo-400 flex items-center justify-center text-white hover:bg-indigo-500 transition-colors z-10 shadow-lg"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              id={`nav-${label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 glow-indigo border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon
                size={18}
                className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-indigo-400' : ''
                }`}
              />
              {!collapsed && (
                <span className="animate-fade-in truncate">{label}</span>
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">
                  {label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-white/8 p-3 space-y-2">
        {!collapsed && user && (
          <div className="animate-fade-in px-2 pb-1">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-indigo-400 capitalize">{user.role}</p>
          </div>
        )}
        <button
          id="logout-btn"
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 group"
          aria-label="Logout"
        >
          <LogOut size={18} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
