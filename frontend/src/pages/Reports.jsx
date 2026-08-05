import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChartTooltip from '../components/common/ChartTooltip';
import { useTheme } from '../context/ThemeContext';
import { getDashboard, getProfitLoss, getDeliveryReport } from '../api/reports';
import { formatCurrency } from '../utils/helpers';

const DEMO_MONTHLY = [
  { month: 'Jan', income: 52000, expenses: 18000, profit: 34000 },
  { month: 'Feb', income: 61000, expenses: 21000, profit: 40000 },
  { month: 'Mar', income: 45000, expenses: 19000, profit: 26000 },
  { month: 'Apr', income: 78000, expenses: 22000, profit: 56000 },
  { month: 'May', income: 91000, expenses: 25000, profit: 66000 },
  { month: 'Jun', income: 85000, expenses: 23000, profit: 62000 },
  { month: 'Jul', income: 110000, expenses: 28000, profit: 82000 },
];

const PIE_COLORS = ['#10b981','#f43f5e','#6366f1','#f59e0b'];



export default function Reports() {
  const { currentThemeObj } = useTheme();
  const isDark = currentThemeObj?.isDark;
  const [dashboard, setDashboard]     = useState(null);
  const [profitLoss, setProfitLoss]   = useState(null);
  const [deliveries, setDeliveries]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [year, setYear]               = useState(new Date().getFullYear());
  const [month, setMonth]             = useState(new Date().getMonth() + 1);

  useEffect(() => {
    Promise.allSettled([getDashboard(), getProfitLoss({ year, month }), getDeliveryReport()])
      .then(([d, p, del]) => {
        setDashboard(d.value?.data?.data ?? null);
        setProfitLoss(p.value?.data?.data ?? null);
        setDeliveries(del.value?.data?.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  if (loading) return <LoadingSpinner />;

  const monthly = dashboard?.monthlyData ?? DEMO_MONTHLY;
  const pl = profitLoss ?? { totalIncome: 285000, totalExpenses: 48000, netProfit: 237000 };

  const plData = [
    { name: 'Income', value: pl.totalIncome ?? 0 },
    { name: 'Expenses', value: pl.totalExpenses ?? 0 },
    { name: 'Net Profit', value: pl.netProfit ?? 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business performance overview"
        actions={
          <div className="flex items-center gap-2">
            <select id="reports-year" value={year} onChange={(e) => setYear(Number(e.target.value))} className="px-3 py-2 rounded-xl text-sm focus:outline-none" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', border: '1px solid' }}>
              {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select id="reports-month" value={month} onChange={(e) => setMonth(Number(e.target.value))} className="px-3 py-2 rounded-xl text-sm focus:outline-none" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', border: '1px solid' }}>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={i} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl border p-5 glow-emerald hover:shadow-lg transition-all duration-300" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--success)' }}>Total Income</p>
          <p className="text-2xl font-bold mt-2" style={{ color: 'var(--success)' }}>{formatCurrency(pl.totalIncome)}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(16, 185, 129, 0.6)' }}>This period</p>
        </div>
        <div className="glass-card rounded-2xl border p-5 glow-rose hover:shadow-lg transition-all duration-300" style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--danger)' }}>Total Expenses</p>
          <p className="text-2xl font-bold mt-2" style={{ color: 'var(--danger)' }}>{formatCurrency(pl.totalExpenses)}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(244, 63, 94, 0.6)' }}>This period</p>
        </div>
        <div className="glass-card rounded-2xl border p-5 glow-indigo hover:shadow-lg transition-all duration-300" style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Net Profit</p>
          <p className={`text-2xl font-bold mt-2`} style={{ color: (pl.netProfit ?? 0) >= 0 ? 'var(--primary)' : 'var(--danger)' }}>{formatCurrency(pl.netProfit)}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(99, 102, 241, 0.6)' }}>Income – Expenses</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Profit trend chart */}
        <div className="xl:col-span-2 glass-card rounded-2xl border p-5 hover:transition-all hover:duration-300" style={{ borderColor: 'var(--border-color)', '--hover-border': 'rgba(99, 102, 241, 0.3)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
          <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--primary)' }}>Monthly Profit Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={isDark ? '#6366f1' : '#6D5DF6'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isDark ? '#6366f1' : '#6D5DF6'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income"   stroke="#10b981" strokeWidth={2} fill="none" name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="none" name="Expenses" />
              <Area type="monotone" dataKey="profit"   stroke={isDark ? '#6366f1' : '#6D5DF6'} strokeWidth={2} fill="url(#profitGrad)" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* P&L Pie */}
        <div className="glass-card rounded-2xl border p-5 hover:transition-all hover:duration-300" style={{ borderColor: 'var(--border-color)', '--hover-border': 'rgba(244, 63, 94, 0.3)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--danger)' }}>P&L Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={plData.filter(d => d.value > 0)} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {plData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--chart-axis)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Income vs Expenses Bar */}
      <div className="glass-card rounded-2xl border p-5 hover:transition-all hover:duration-300" style={{ borderColor: 'var(--border-color)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
        <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--success)' }}>Income vs Expenses (Monthly)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="income"   fill="#10b981" radius={[4,4,0,0]} name="Income" />
            <Bar dataKey="expenses" fill="#f43f5e" radius={[4,4,0,0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pending Deliveries */}
      {deliveries.length > 0 && (
        <div className="glass-card rounded-2xl border hover:transition-all hover:duration-300" style={{ borderColor: 'var(--border-color)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'rgba(139, 92, 246, 0.8)' }}>Pending Deliveries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid var(--divider-color)` }}>
                  {['Order #','Customer','Delivery Date','Amount','Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--table-header-background)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--divider-color)' }}>
                {deliveries.map((o) => (
                  <tr key={o._id} className="transition-all duration-300 group" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--primary)' }}>{o.orderNo}</td>
                    <td className="px-5 py-3 group-hover:transition-colors" style={{ color: 'var(--text-primary)' }}>{o.customerId?.name ?? '—'}</td>
                    <td className="px-5 py-3 group-hover:transition-colors">{new Date(o.deliveryDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3 font-semibold group-hover:transition-colors" style={{ color: 'var(--success)' }}>{formatCurrency(o.totalAmount)}</td>
                    <td className="px-5 py-3"><span className="capitalize text-xs font-medium group-hover:transition-colors" style={{ color: 'var(--warning)' }}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
