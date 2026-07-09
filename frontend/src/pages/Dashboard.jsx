import { useEffect, useState } from 'react';
import {
  Users, ShoppingBag, CreditCard, TrendingUp,
  Clock, AlertTriangle, CheckCircle, Package,
  ArrowRight, Scissors,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getDashboard } from '../api/reports';
import { formatCurrency, formatDate, ORDER_STATUS_COLORS } from '../utils/helpers';
import Badge from '../components/common/Badge';
import { Link } from 'react-router-dom';

const STATUS_COLORS_CHART = {
  pending:   '#f59e0b',
  cutting:   '#3b82f6',
  stitching: '#8b5cf6',
  trial:     '#06b6d4',
  ready:     '#10b981',
  delivered: '#64748b',
  cancelled: '#f43f5e',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border border-white/10 rounded-xl px-4 py-3 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <StatCard title="Total Customers"   value={totalCustomers}         icon={Users}        color="indigo"  trend={12}  trendLabel="vs last month" className="animate-fade-in-up stagger-1" />
        <StatCard title="Active Orders"     value={activeOrders}           icon={ShoppingBag}  color="violet"  trend={8}   trendLabel="vs last month" className="animate-fade-in-up stagger-2" />
        <StatCard title="Total Income"      value={formatCurrency(totalIncome)}     icon={TrendingUp}   color="emerald" trend={15}  trendLabel="vs last month" className="animate-fade-in-up stagger-3" />
        <StatCard title="Pending Payments"  value={formatCurrency(pendingPayments)} icon={CreditCard}   color="amber"   trend={-3}  trendLabel="vs last month" className="animate-fade-in-up stagger-4" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area Chart — Income vs Expenses */}
        <div className="xl:col-span-2 glass-card rounded-2xl border border-white/8 p-5 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Income vs Expenses</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly overview</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />Income</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Expenses</span>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d52" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income"   stroke="#6366f1" strokeWidth={2} fill="url(#incomeGrad)"  name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Order Status */}
        <div className="glass-card rounded-2xl border border-white/8 p-5 animate-fade-in-up stagger-3">
          <h3 className="text-sm font-semibold text-white mb-1">Order Status</h3>
          <p className="text-xs text-slate-400 mb-4">Current distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={orderStatusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {orderStatusDist.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, 'Orders']} contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending',   count: s.pendingCount ?? 8,  icon: Clock,         color: 'text-amber-400',  bg: 'bg-amber-500/10' },
          { label: 'Stitching', count: s.stitchingCount ?? 12, icon: Scissors,    color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Ready',     count: s.readyCount ?? 6,    icon: CheckCircle,   color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
          { label: 'Overdue',   count: s.overdueCount ?? 3,  icon: AlertTriangle, color: 'text-rose-400',   bg: 'bg-rose-500/10' },
        ].map(({ label, count, icon: Icon, color, bg }, i) => (
          <div key={label} className={`glass-card rounded-xl border border-white/8 p-4 flex items-center gap-3 animate-fade-in-up stagger-${i+1}`}>
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{count}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="glass-card rounded-2xl border border-white/8 animate-fade-in-up stagger-3">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
          <Link to="/orders" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm">No recent orders</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Order #', 'Customer', 'Items', 'Amount', 'Delivery', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.slice(0, 6).map((o) => (
                  <tr key={o._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-indigo-400 font-mono text-xs">{o.orderNo}</td>
                    <td className="px-5 py-3 text-slate-200">{o.customerId?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-400">{o.items?.length ?? 0}</td>
                    <td className="px-5 py-3 text-emerald-400 font-semibold">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-5 py-3 text-slate-400">{formatDate(o.deliveryDate)}</td>
                    <td className="px-5 py-3">
                      <Badge label={o.status} className={ORDER_STATUS_COLORS[o.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
