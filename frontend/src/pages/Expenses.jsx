import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenses';
import { formatCurrency, formatDate } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CATEGORIES = ['rent','salary','material','utilities','repair','transport','internet','other'];
const CAT_COLORS = {
  rent: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  salary: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  material: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  utilities: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  repair: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  transport: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  internet: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  other: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function Expenses() {
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getExpenses({ search, category: catFilter });
      setExpenses(res.data.data || []);
    } catch { setExpenses([]); }
    finally { setLoading(false); }
  }, [search, catFilter]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const openAdd  = () => { setEditing(null); reset({}); setShowModal(true); };
  const openEdit = (e) => { setEditing(e); reset({ ...e, expenseDate: e.expenseDate?.slice(0,10) }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); reset({}); };

  const onSubmit = async (data) => {
    const payload = { ...data, amount: Number(data.amount) };
    try {
      editing ? await updateExpense(editing._id, payload) : await createExpense(payload);
      toast.success(editing ? 'Expense updated' : 'Expense added');
      closeModal(); fetchExpenses();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    try { await deleteExpense(id); toast.success('Deleted'); setDeleting(null); fetchExpenses(); }
    catch { toast.error('Delete failed'); }
  };

  // Chart data by category
  const chartData = CATEGORIES.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    amount: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((d) => d.amount > 0);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const columns = [
    { key: 'expenseDate', label: 'Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'title', label: 'Title', render: (v) => <span className="font-medium text-slate-200">{v}</span> },
    { key: 'category', label: 'Category', render: (v) => <Badge label={v} className={`${CAT_COLORS[v] ?? CAT_COLORS.other} capitalize`} /> },
    { key: 'amount', label: 'Amount', sortable: true, render: (v) => <span className="font-bold text-rose-400">{formatCurrency(v)}</span> },
    { key: 'paymentMethod', label: 'Method', render: (v) => <span className="text-slate-400 capitalize">{v}</span> },
    { key: 'description', label: 'Description', render: (v) => <span className="text-slate-500 text-xs">{v || '—'}</span> },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button id={`edit-expense-${row._id}`} onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"><Edit2 size={14} /></button>
          <button id={`delete-expense-${row._id}`} onClick={() => setDeleting(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Expenses"
        subtitle={`Total: ${formatCurrency(totalExpenses)}`}
        actions={
          <button id="add-expense-btn" onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors glow-indigo">
            <Plus size={16} /> Add Expense
          </button>
        }
      />

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="glass-card rounded-2xl border border-white/8 p-5">
          <p className="text-sm font-semibold text-white mb-4">Expenses by Category</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d52" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [formatCurrency(v)]} contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="amount" fill="#6366f1" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input id="expenses-search" type="text" placeholder="Search expenses…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
        </div>
        <select id="expenses-cat-filter" value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize bg-[#0f1629]">{c}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={expenses} loading={loading} emptyTitle="No expenses yet" emptyDescription="Start tracking your shop expenses." />

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Title *</label>
              <input {...register('title', { required: 'Required' })} placeholder="e.g. Monthly Rent" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
              {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category *</label>
              <select {...register('category', { required: 'Required' })} className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 capitalize">
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
              {errors.category && <p className="text-xs text-rose-400 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount (Rs.) *</label>
              <input {...register('amount', { required: 'Required', min: { value: 1, message: 'Must be > 0' } })} type="number" min="1" placeholder="0" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
              {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
              <input {...register('expenseDate')} type="date" defaultValue={new Date().toISOString().slice(0,10)} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Payment Method</label>
              <input {...register('paymentMethod')} placeholder="cash" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
              <textarea {...register('description')} rows={2} placeholder="Details…" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5">Cancel</button>
            <button id="expense-submit-btn" type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-60">
              {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Delete Expense" size="sm">
        <p className="text-slate-300 text-sm mb-5">Delete <span className="text-white font-semibold">{deleting?.title}</span>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5">Cancel</button>
          <button id="confirm-delete-expense-btn" onClick={() => handleDelete(deleting?._id)} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
