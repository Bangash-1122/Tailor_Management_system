import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  X,
  CheckCheck,
  LayoutDashboard,
  Users,
  Ruler,
  ShoppingBag,
  CreditCard,
  WalletCards,
  Receipt,
  UserRound,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/customers': 'Customers',
  '/measurements': 'Measurements',
  '/orders': 'Orders',
  '/payments': 'Payments',
  '/ledger': 'Ledger',
  '/expenses': 'Expenses',
  '/staff': 'Staff',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const SEARCH_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Measurements', path: '/measurements', icon: Ruler },
  { label: 'Orders', path: '/orders', icon: ShoppingBag },
  { label: 'Payments', path: '/payments', icon: CreditCard },
  { label: 'Ledger', path: '/ledger', icon: WalletCards },
  { label: 'Expenses', path: '/expenses', icon: Receipt },
  { label: 'Staff', path: '/staff', icon: UserRound },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New order created',
    message: 'A new tailoring order has been added.',
    time: '5 minutes ago',
    unread: true,
    path: '/orders',
  },
  {
    id: 2,
    title: 'Measurement saved',
    message: 'A customer measurement sheet was updated.',
    time: '18 minutes ago',
    unread: true,
    path: '/measurements',
  },
  {
    id: 3,
    title: 'Payment received',
    message: 'A customer payment has been recorded.',
    time: '1 hour ago',
    unread: false,
    path: '/payments',
  },
];

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  const searchInputRef = useRef(null);
  const notificationRef = useRef(null);

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) =>
      path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(path)
    )?.[1] || 'Tailor Pro';

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return SEARCH_ITEMS;

    return SEARCH_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const unreadCount = notifications.filter((item) => item.unread).length;

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
        setNotificationsOpen(false);
      }

      if (event.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const navigateTo = (path) => {
    navigate(path);
    setSearchOpen(false);
    setNotificationsOpen(false);
  };

  const openNotification = (notification) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, unread: false } : item
      )
    );

    if (notification.path) navigate(notification.path);
    setNotificationsOpen(false);
  };

  const markAllRead = () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, unread: false }))
    );
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 glass-card border-b border-white/8 flex-shrink-0 relative z-40">
        <div>
          <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString('en-PK', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="navbar-search-btn"
            type="button"
            onClick={() => {
              setSearchOpen(true);
              setNotificationsOpen(false);
            }}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 bg-white/5 hover:bg-white/8 border border-white/8 transition-colors"
          >
            <Search size={15} />
            <span>Quick search…</span>
            <kbd className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-slate-500">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Open quick search"
          >
            <Search size={18} />
          </button>

          <div ref={notificationRef} className="relative">
            <button
              id="navbar-notifications-btn"
              type="button"
              onClick={() => {
                setNotificationsOpen((value) => !value);
                setSearchOpen(false);
              }}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell size={18} />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0c1220] shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Notifications
                    </h2>
                    <p className="text-xs text-slate-500">
                      {unreadCount} unread
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      <CheckCheck size={14} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={`w-full px-4 py-3 text-left border-b border-white/5 hover:bg-white/5 transition-colors ${
                        notification.unread ? 'bg-indigo-500/[0.06]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            notification.unread
                              ? 'bg-indigo-500'
                              : 'bg-slate-700'
                          }`}
                        />

                        <div>
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold select-none">
              {getInitials(user?.name || 'Admin')}
            </div>

            <div className="hidden md:block">
              <p className="text-xs font-semibold text-white leading-none">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-indigo-400 capitalize">
                {user?.role || 'admin'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSearchOpen(false);
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c1220] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search size={18} className="text-slate-500" />

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search pages..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5"
                aria-label="Close search"
              >
                <X size={17} />
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-2">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigateTo(item.path)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                        <Icon size={17} />
                      </span>

                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-slate-600">{item.path}</p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  No page found for “{searchQuery}”
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}