import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bell,
  Search,
  X,
  Phone,
  Mail,
  MapPin,
  UserRound,
  WalletCards,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials, formatDate } from '../../utils/helpers';
import { getCustomers } from '../../api/customers';
import { getPayments } from '../../api/payments';
import ThemeSwitcher from '../common/ThemeSwitcher';

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

const getCustomerName = (payment) =>
  payment?.customerId?.name ||
  payment?.customer?.name ||
  payment?.orderId?.customerId?.name ||
  'Customer';

const getPaymentAmount = (payment) =>
  payment?.amount ??
  payment?.paidAmount ??
  payment?.paymentAmount ??
  0;

export default function Navbar() {
  const { user } = useAuth();
  const { currentThemeObj } = useTheme();
  const location = useLocation();
  const isDark = currentThemeObj?.isDark;

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [paymentNotifications, setPaymentNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState([]);

  const searchInputRef = useRef(null);
  const notificationRef = useRef(null);

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) =>
      path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(path)
    )?.[1] || 'Tailor Pro';

  const unreadCount = paymentNotifications.filter(
    (item) => !readNotificationIds.includes(item.id)
  ).length;

  useEffect(() => {
    const handleShortcut = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();
        setSearchOpen(true);
        setNotificationsOpen(false);
      }

      if (event.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setSelectedCustomer(null);
      }
    };

    window.addEventListener('keydown', handleShortcut);

    return () => {
      window.removeEventListener('keydown', handleShortcut);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    } else {
      setSearchQuery('');
      setCustomers([]);
      setSelectedCustomer(null);
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

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  /*
   * Search customers without navigating away.
   * Clicking a result opens the customer's data inside the same navbar modal.
   */
  useEffect(() => {
    const query = searchQuery.trim();

    if (!searchOpen || query.length < 2) {
      setCustomers([]);
      setSearchLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true);

      try {
        const response = await getCustomers({ search: query });
        const data = response?.data?.data;

        const customerList = Array.isArray(data)
          ? data
          : data?.customers || [];

        const normalizedQuery = query.toLowerCase();

        const filtered = customerList.filter((customer) =>
          [
            customer?.name,
            customer?.customerCode,
            customer?.phone,
            customer?.email,
          ].some((value) =>
            String(value || '')
              .toLowerCase()
              .includes(normalizedQuery)
          )
        );

        setCustomers(filtered);
      } catch (error) {
        console.error('Customer search failed:', error);
        setCustomers([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchOpen, searchQuery]);

  /*
   * Load real payment notifications.
   * The latest received payments appear in the notification bell.
   */
  useEffect(() => {
    const loadPaymentNotifications = async () => {
      setNotificationsLoading(true);

      try {
        const response = await getPayments();
        const data = response?.data?.data;

        const paymentList = Array.isArray(data)
          ? data
          : data?.payments || [];

        const notifications = paymentList
          .filter((payment) => {
            const status = String(payment?.status || '').toLowerCase();

            return (
              status === 'received' ||
              status === 'paid' ||
              status === 'completed' ||
              payment?.amount ||
              payment?.paidAmount
            );
          })
          .sort(
            (a, b) =>
              new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
          )
          .slice(0, 10)
          .map((payment) => ({
            id: payment?._id,
            customerName: getCustomerName(payment),
            amount: getPaymentAmount(payment),
            method:
              payment?.method ||
              payment?.paymentMethod ||
              'Payment',
            createdAt: payment?.createdAt,
            reference:
              payment?.reference ||
              payment?.transactionId ||
              payment?.receiptNumber ||
              '',
          }));

        setPaymentNotifications(notifications);
      } catch (error) {
        console.error('Payment notifications failed:', error);
        setPaymentNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadPaymentNotifications();
  }, []);

  const fetchFreshCustomer = useCallback(async (customerId, searchValue = '') => {
    if (!customerId) return null;

    try {
      // Re-read the customer from the API so balance and quantity are not stale.
      // The search text keeps this compatible with your existing getCustomers API.
      const response = await getCustomers({ search: searchValue });
      const data = response?.data?.data;
      const customerList = Array.isArray(data) ? data : data?.customers || [];

      return (
        customerList.find((customer) => customer?._id === customerId) || null
      );
    } catch (error) {
      console.error('Failed to refresh customer:', error);
      return null;
    }
  }, []);

  const refreshSelectedCustomer = useCallback(async () => {
    const customerId = selectedCustomer?._id;
    if (!customerId) return;

    const freshCustomer = await fetchFreshCustomer(
      customerId,
      selectedCustomer.name || selectedCustomer.customerCode || ''
    );

    if (freshCustomer) {
      setSelectedCustomer(freshCustomer);
    }
  }, [fetchFreshCustomer, selectedCustomer?._id, selectedCustomer?.name, selectedCustomer?.customerCode]);

  const selectCustomer = async (customer) => {
    // Show immediately, then replace it with the newest API data.
    setSelectedCustomer(customer);

    const freshCustomer = await fetchFreshCustomer(
      customer._id,
      customer.name || customer.customerCode || ''
    );

    if (freshCustomer) {
      setSelectedCustomer(freshCustomer);
    }
  };

  /*
   * Keep the open customer card synchronized when customer data changes.
   * It refreshes when the browser regains focus, every 5 seconds while open,
   * and when another component dispatches a `customer:updated` event.
   */
  useEffect(() => {
    if (!selectedCustomer?._id || !searchOpen) return undefined;

    const handleCustomerUpdated = (event) => {
      const updatedCustomer = event?.detail?.customer;
      const updatedCustomerId =
        event?.detail?.customerId || updatedCustomer?._id;

      if (updatedCustomerId && updatedCustomerId !== selectedCustomer._id) {
        return;
      }

      if (updatedCustomer) {
        setSelectedCustomer((current) => ({
          ...current,
          ...updatedCustomer,
        }));
      } else {
        refreshSelectedCustomer();
      }
    };

    const handleWindowFocus = () => refreshSelectedCustomer();
    const intervalId = window.setInterval(refreshSelectedCustomer, 5000);

    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('customer:updated', handleCustomerUpdated);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('customer:updated', handleCustomerUpdated);
    };
  }, [searchOpen, selectedCustomer?._id, refreshSelectedCustomer]);

  const goBackToSearchResults = () => {
    setSelectedCustomer(null);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const toggleNotifications = () => {
    setNotificationsOpen((current) => !current);
    setSearchOpen(false);
  };

  const markNotificationRead = (id) => {
    setReadNotificationIds((current) =>
      current.includes(id) ? current : [...current, id]
    );
  };

  const markAllAsRead = () => {
    setReadNotificationIds(
      paymentNotifications.map((notification) => notification.id)
    );
  };

  return (
    <>
      <header
        className="h-16 flex items-center justify-between px-6 glass-card border-b flex-shrink-0 relative z-40"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{pageTitle}</h1>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
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
            id="navbar-customer-search-btn"
            type="button"
            onClick={() => {
              setSearchOpen(true);
              setNotificationsOpen(false);
            }}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors border"
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--surface-hover)',
              borderColor: 'var(--border-color)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--input-background)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            }}
            aria-label="Search customers"
          >
            <Search size={15} />
            <span>Search customer...</span>

            <kbd className="text-xs px-1.5 py-0.5 rounded" style={{
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--text-muted)',
            }}>
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchOpen(true);
              setNotificationsOpen(false);
            }}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Search customers"
          >
            <Search size={18} />
          </button>

          <div ref={notificationRef} className="relative">
            <button
              id="navbar-notifications-btn"
              type="button"
              onClick={toggleNotifications}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Payment notifications"
            >
              <Bell size={18} />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden border shadow-2xl"
                style={{
                  backgroundColor: 'var(--modal-background)',
                  borderColor: 'var(--border-color)',
                  boxShadow: 'var(--shadow-popup)',
                }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Payment Received
                    </h2>

                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {unreadCount} unread payment
                      {unreadCount === 1 ? '' : 's'}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                      style={{ color: 'var(--primary)' }}
                    >
                      <CheckCheck size={14} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="px-4 py-10 text-center">
                      <div className="mx-auto h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                        Loading payments...
                      </p>
                    </div>
                  ) : paymentNotifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <WalletCards
                        size={28}
                        className="mx-auto mb-3"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        No payment received notifications.
                      </p>
                    </div>
                  ) : (
                    paymentNotifications.map((notification) => {
                      const isRead = readNotificationIds.includes(
                        notification.id
                      );

                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() =>
                            markNotificationRead(notification.id)
                          }
                          className={`w-full px-4 py-3 text-left border-b transition-colors`}
                          style={{
                            backgroundColor: isRead ? 'transparent' : 'var(--primary-soft)',
                            borderColor: 'var(--divider-color)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isRead ? 'transparent' : 'var(--primary-soft)';
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-9 h-9 rounded-xl text-emerald-400 flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: 'var(--success-soft)' }}
                            >
                              <WalletCards size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                  Payment received
                                </p>

                                {!isRead && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                )}
                              </div>

                              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Rs. {Number(notification.amount || 0).toLocaleString()}
                                {' '}received from{' '}
                                <span style={{ color: 'var(--text-primary)' }}>
                                  {notification.customerName}
                                </span>
                              </p>

                              <div className="flex items-center justify-between gap-3 mt-1.5">
                                <p className="text-[11px] capitalize" style={{ color: 'var(--text-muted)' }}>
                                  {notification.method}
                                  {notification.reference
                                    ? ` • ${notification.reference}`
                                    : ''}
                                </p>

                                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                  {notification.createdAt
                                    ? formatDate(notification.createdAt)
                                    : '—'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <ThemeSwitcher />

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold select-none">
              {getInitials(user?.name || 'Admin')}
            </div>

            <div className="hidden md:block">
              <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                {user?.name || 'Admin'}
              </p>

              <p className="text-xs capitalize" style={{ color: 'var(--primary)' }}>
                {user?.role || 'admin'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-24 backdrop-blur-sm"
          style={{
            backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.4)',
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSearchOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl"
            style={{
              backgroundColor: 'var(--modal-background)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--shadow-popup)',
            }}
          >
            <div
              className="flex items-center gap-3 border-b px-4 py-3"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div
                className="relative flex h-9 flex-1 items-center rounded-xl border transition-colors"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3"
                  style={{ color: 'var(--text-muted)' }}
                />

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);

                    if (selectedCustomer) {
                      goBackToSearchResults();
                    }
                  }}
                  placeholder="Search customer by name, code, phone or email..."
                  className="h-full w-full rounded-xl bg-transparent py-2 pl-9 pr-9 text-sm outline-none"
                  style={{
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(event) => {
                    event.currentTarget.parentElement.style.borderColor =
                      'var(--primary)';
                  }}
                  onBlur={(event) => {
                    event.currentTarget.parentElement.style.borderColor =
                      'var(--border-color)';
                  }}
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      goBackToSearchResults();
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 rounded-md p-1 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    aria-label="Clear customer search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1.5 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor =
                    'var(--surface-hover)';
                  event.currentTarget.style.color =
                    'var(--text-primary)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = 'transparent';
                  event.currentTarget.style.color =
                    'var(--text-muted)';
                }}
                aria-label="Close customer search"
              >
                <X size={17} />
              </button>
            </div>

            <div className="max-h-[460px] overflow-y-auto p-2">
              {selectedCustomer ? (
                <div className="p-4">
                  <div className="flex items-center gap-4 pb-5" style={{ borderBottom: `1px solid var(--border-subtle)` }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                      {getInitials(selectedCustomer.name || 'Customer')}
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {selectedCustomer.name || 'Unnamed customer'}
                      </h2>

                      <p className="text-sm" style={{ color: 'var(--primary)' }}>
                        {selectedCustomer.customerCode || 'No customer code'}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mt-5">
                    <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)' }}>
                      <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Phone
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                        <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                        {selectedCustomer.phone || '—'}
                      </p>
                    </div>

                    <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)' }}>
                      <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Email
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm break-all" style={{ color: 'var(--text-primary)' }}>
                        <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                        {selectedCustomer.email || '—'}
                      </p>
                    </div>

                    <div className="sm:col-span-2 rounded-xl border p-3" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)' }}>
                      <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Address
                      </p>
                      <p className="mt-1 flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                        <MapPin
                          size={14}
                          className="mt-0.5 flex-shrink-0"
                          style={{ color: 'var(--text-muted)' }}
                        />
                        {selectedCustomer.address || '—'}
                      </p>
                    </div>

                    <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)' }}>
                      <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Gender
                      </p>
                      <p className="mt-1 text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
                        {selectedCustomer.gender || '—'}
                      </p>
                    </div>

                    <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)' }}>
                      <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Status
                      </p>
                      <p className="mt-1 text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
                        {selectedCustomer.status || 'active'}
                      </p>
                    </div>

                    <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)' }}>
                      <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Balance
                      </p>
                      <p className="mt-1 text-sm font-semibold" style={{ color: '#f59e0b' }}>
                        Rs.{' '}
                        {Number(
                          selectedCustomer.balance ??
                          selectedCustomer.ledgerBalance ??
                          0
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)' }}>
                      <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Quantity
                      </p>
                      <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {selectedCustomer.quantity ?? 0}
                      </p>
                    </div>
                  </div>

                  {selectedCustomer.notes && (
                    <div className="rounded-xl border p-3 mt-3" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)' }}>
                      <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Notes
                      </p>
                      <p className="mt-1 text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                        {selectedCustomer.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <div className="px-4 py-10 text-center">
                  <UserRound
                    size={30}
                    className="mx-auto mb-3"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Enter at least 2 letters to search customers.
                  </p>
                </div>
              ) : searchLoading ? (
                <div className="px-4 py-10 text-center">
                  <div className="mx-auto mb-3 h-6 w-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Searching customers...
                  </p>
                </div>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <button
                    key={customer._id}
                    type="button"
                    onClick={() => selectCustomer(customer)}
                    className="w-full rounded-xl px-3 py-3 text-left transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold flex-shrink-0" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                        {getInitials(customer.name || 'Customer')}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {customer.name || 'Unnamed customer'}
                          </p>

                          <span className="text-[11px]" style={{ color: 'var(--primary)' }}>
                            {customer.customerCode || 'No code'}
                          </span>
                        </div>

                        <div className="mt-2 grid gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {customer.phone && (
                            <p className="flex items-center gap-1.5">
                              <Phone size={12} />
                              {customer.phone}
                            </p>
                          )}

                          {customer.email && (
                            <p className="flex items-center gap-1.5 truncate">
                              <Mail size={12} />
                              {customer.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-10 text-center">
                  <Search
                    size={28}
                    className="mx-auto mb-3"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No customer found for "{searchQuery}".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}