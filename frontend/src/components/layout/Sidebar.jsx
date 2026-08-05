import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Ruler, ShoppingBag, CreditCard,
  BookOpen, Receipt, UserCog, BarChart3, Settings, Scissors,
  ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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
  const { currentThemeObj } = useTheme();
  const location = useLocation();
  const isDark = currentThemeObj?.isDark;

  return (
    <aside
      className={`relative flex flex-col h-screen transition-all duration-300 ease-in-out glass-card border-r ${
        collapsed ? 'w-18' : 'w-64'
      }`}
      style={{
        minWidth: collapsed ? '72px' : '256px',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Logo */}
      <div 
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-indigo">
          <Scissors size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-primary)' }}>Tailor Pro</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Management System</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        id="sidebar-toggle"
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full border flex items-center justify-center text-white hover:bg-indigo-500 transition-colors z-10 shadow-lg"
        style={{
          backgroundColor: 'var(--primary)',
          borderColor: 'var(--primary-hover)',
        }}
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
                isActive ? 'border' : ''
              }`}
              style={isActive ? {
                backgroundColor: 'var(--primary-soft)',
                color: 'var(--primary)',
                borderColor: 'var(--primary)',
              } : {
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
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
                <div 
                  className="absolute left-full ml-3 px-2 py-1 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border"
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#334155',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div 
        className="border-t p-3 space-y-2"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {!collapsed && user && (
          <div className="animate-fade-in px-2 pb-1">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
            <p className="text-xs capitalize" style={{ color: 'var(--primary)' }}>{user.role}</p>
          </div>
        )}
        <button
          id="logout-btn"
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group hover:bg-rose-500/10"
          style={{ color: 'var(--danger)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--danger)';
          }}
          aria-label="Logout"
        >
          <LogOut size={18} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
