import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
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

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border border-white/10 rounded-xl px-4 py-3 text-xs">
      <p className="text-slate-400 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
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
            <select id="reports-year" value={year} onChange={(e) => setYear(Number(e.target.value))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none">
              {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y} className="bg-[#0f1629]">{y}</option>)}
            </select>
            <select id="reports-month" value={month} onChange={(e) => setMonth(Number(e.target.value))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none">
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={i} value={i+1} className="bg-[#0f1629]">{m}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl border border-emerald-500/20 p-5 glow-emerald">
          <p className="text-xs text-slate-400">Total Income</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{formatCurrency(pl.totalIncome)}</p>
          <p className="text-xs text-slate-500 mt-1">This period</p>
        </div>
        <div className="glass-card rounded-2xl border border-rose-500/20 p-5 glow-rose">
          <p className="text-xs text-slate-400">Total Expenses</p>
          <p className="text-2xl font-bold text-rose-400 mt-2">{formatCurrency(pl.totalExpenses)}</p>
          <p className="text-xs text-slate-500 mt-1">This period</p>
        </div>
        <div className="glass-card rounded-2xl border border-indigo-500/20 p-5 glow-indigo">
          <p className="text-xs text-slate-400">Net Profit</p>
          <p className={`text-2xl font-bold mt-2 ${(pl.netProfit ?? 0) >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>{formatCurrency(pl.netProfit)}</p>
          <p className="text-xs text-slate-500 mt-1">Income – Expenses</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Profit trend chart */}
        <div className="xl:col-span-2 glass-card rounded-2xl border border-white/8 p-5">
          <h3 className="text-sm font-semibold text-white mb-5">Monthly Profit Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d52" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income"   stroke="#10b981" strokeWidth={2} fill="none" name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="none" name="Expenses" />
              <Area type="monotone" dataKey="profit"   stroke="#6366f1" strokeWidth={2} fill="url(#profitGrad)" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* P&L Pie */}
        <div className="glass-card rounded-2xl border border-white/8 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">P&L Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={plData.filter(d => d.value > 0)} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {plData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [formatCurrency(v)]} contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Income vs Expenses Bar */}
      <div className="glass-card rounded-2xl border border-white/8 p-5">
        <h3 className="text-sm font-semibold text-white mb-5">Income vs Expenses (Monthly)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d52" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="income"   fill="#10b981" radius={[4,4,0,0]} name="Income" />
            <Bar dataKey="expenses" fill="#f43f5e" radius={[4,4,0,0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pending Deliveries */}
      {deliveries.length > 0 && (
        <div className="glass-card rounded-2xl border border-white/8">
          <div className="px-5 py-4 border-b border-white/8">
            <h3 className="text-sm font-semibold text-white">Pending Deliveries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Order #','Customer','Delivery Date','Amount','Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {deliveries.map((o) => (
                  <tr key={o._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-indigo-400 font-mono text-xs">{o.orderNo}</td>
                    <td className="px-5 py-3 text-slate-200">{o.customerId?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-400">{new Date(o.deliveryDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-emerald-400 font-semibold">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-5 py-3"><span className="capitalize text-amber-400 text-xs font-medium">{o.status}</span></td>
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
