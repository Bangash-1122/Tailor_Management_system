import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users, ShoppingBag, CreditCard, TrendingUp,
  Clock, AlertTriangle, CheckCircle, Package,
  ArrowRight, Scissors, ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChartTooltip from '../components/common/ChartTooltip';
import { useTheme } from '../context/ThemeContext';
import { getDashboard } from '../api/reports';
import { formatCurrency, formatDate, ORDER_STATUS_COLORS } from '../utils/helpers';
import Badge from '../components/common/Badge';
import { Link } from 'react-router-dom';
import OrderReviewDrawer from '../components/orders/OrderReviewDrawer';


const STATUS_COLORS_CHART = {
  pending:   '#f59e0b',
  cutting:   '#3b82f6',
  stitching: '#8b5cf6',
  trial:     '#06b6d4',
  ready:     '#10b981',
  delivered: '#64748b',
  cancelled: '#f43f5e',
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { currentThemeObj } = useTheme();
  const isDark = currentThemeObj?.isDark;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = (orderId) => {
    setSelectedOrderId(orderId);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);
  const handleOrderMutated = () => {
    getDashboard()
      .then((res) => setStats(res.data.data))
      .catch(() => {});
  };


  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  // Fallback demo data when backend is offline
  const s = stats || {};
  const totalCustomers   = s.totalCustomers   ?? 248;
  const activeOrders     = s.activeOrders     ?? 34;
  const totalIncome      = s.totalIncome      ?? 285000;
  const pendingPayments  = s.pendingPayments  ?? 42500;
  const recentOrders     = s.recentOrders     ?? [];
  const orderStatusDist  = s.orderStatusDist  ?? [
    { name: 'Pending', value: 8 },
    { name: 'Cutting', value: 5 },
    { name: 'Stitching', value: 12 },
    { name: 'Ready', value: 6 },
    { name: 'Delivered', value: 48 },
  ];
  const monthlyData = s.monthlyData ?? [
    { month: 'Jan', income: 52000, expenses: 18000 },
    { month: 'Feb', income: 61000, expenses: 21000 },
    { month: 'Mar', income: 45000, expenses: 19000 },
    { month: 'Apr', income: 78000, expenses: 22000 },
    { month: 'May', income: 91000, expenses: 25000 },
    { month: 'Jun', income: 85000, expenses: 23000 },
    { month: 'Jul', income: 110000, expenses: 28000 },
  ];

  const pieColors = ['#f59e0b','#3b82f6','#8b5cf6','#10b981','#64748b','#06b6d4','#f43f5e'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title={t('dashboard.totalCustomers')}   value={totalCustomers}         icon={Users}        color="indigo"  trend={12}  trendLabel={t('dashboard.vsLastMonth')} className="animate-fade-in-up stagger-1" />
        <StatCard title={t('dashboard.activeOrders')}     value={activeOrders}           icon={ShoppingBag}  color="violet"  trend={8}   trendLabel={t('dashboard.vsLastMonth')} className="animate-fade-in-up stagger-2" />
        <StatCard title={t('dashboard.totalIncome')}      value={formatCurrency(totalIncome)}     icon={TrendingUp}   color="emerald" trend={15}  trendLabel={t('dashboard.vsLastMonth')} className="animate-fade-in-up stagger-3" />
        <StatCard title={t('dashboard.pendingPayments')}  value={formatCurrency(pendingPayments)} icon={CreditCard}   color="amber"   trend={-3}  trendLabel={t('dashboard.vsLastMonth')} className="animate-fade-in-up stagger-4" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area Chart — Income vs Expenses */}
        <div className="xl:col-span-2 glass-card rounded-2xl border p-5 animate-fade-in-up stagger-2" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('dashboard.incomeVsExpenses')}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('dashboard.monthlyOverview')}</p>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#6366f1' }} />{t('dashboard.income')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#f43f5e' }} />{t('dashboard.expenses')}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" opacity={isDark ? 0.3 : 0.2} />
              <XAxis dataKey="month" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income"   stroke="#6366f1" strokeWidth={2} fill="url(#incomeGrad)"  name={t('dashboard.income')} />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#expenseGrad)" name={t('dashboard.expenses')} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Order Status */}
        <div className="glass-card rounded-2xl border p-5 animate-fade-in-up stagger-3" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t('dashboard.orderStatus')}</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{t('dashboard.currentDistribution')}</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={orderStatusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {orderStatusDist.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--chart-axis)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('dashboard.pending'),   count: s.pendingCount ?? 8,  icon: Clock,         color: 'text-amber-400',  bg: 'bg-amber-500/10' },
          { label: t('dashboard.stitching'), count: s.stitchingCount ?? 12, icon: Scissors,    color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: t('dashboard.ready'),     count: s.readyCount ?? 6,    icon: CheckCircle,   color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
          { label: t('dashboard.overdue'),   count: s.overdueCount ?? 3,  icon: AlertTriangle, color: 'text-rose-400',   bg: 'bg-rose-500/10' },
        ].map(({ label, count, icon: Icon, color, bg }, i) => (
          <div key={label} className={`glass-card rounded-xl border border-white/8 p-4 flex items-center gap-3 animate-fade-in-up stagger-${i+1}`}>
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{count}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="glass-card rounded-2xl border animate-fade-in-up stagger-3" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('dashboard.recentOrders')}</h3>
          <Link to="/orders" className="text-xs flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: 'var(--primary)' }}>
            {t('dashboard.viewAll')} <ArrowRight size={12} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>{t('dashboard.noRecentOrders')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid var(--divider-color)` }}>
                  {[t('dashboard.orderNumber'), t('dashboard.customer'), t('dashboard.items'), t('common.amount'), t('dashboard.delivery'), t('common.status'), ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--table-header-background)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--divider-color)' }}>
                {recentOrders.slice(0, 6).map((o) => (
                  <tr
                    key={o._id}
                    onClick={() => openDrawer(o._id)}
                    className="transition-colors cursor-pointer"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--primary)' }}>{o.orderNo}</td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{o.customerId?.name ?? '—'}</td>
                    <td className="px-5 py-3">{o.items?.length ?? 0}</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--success)' }}>{formatCurrency(o.totalAmount)}</td>
                    <td className="px-5 py-3">{formatDate(o.deliveryDate)}</td>

                    <td className="px-5 py-3">
                      <Badge label={o.status} className={ORDER_STATUS_COLORS[o.status]} />
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button
                        id={`review-order-${o._id}`}
                        onClick={() => openDrawer(o._id)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--primary-soft)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        title={t('orderReview.title')}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderReviewDrawer
        orderId={selectedOrderId}
        open={drawerOpen}
        onClose={closeDrawer}
        onOrderMutated={handleOrderMutated}
      />
    </div>
  );
}
