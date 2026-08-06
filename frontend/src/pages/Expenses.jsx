import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      const data = res.data.data;
      setExpenses(Array.isArray(data) ? data : data?.expenses || []);
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
      toast.success(editing ? t('expenses.expenseUpdated') : t('expenses.expenseAdded'));
      closeModal(); fetchExpenses();
    } catch (err) { toast.error(err.response?.data?.message || t('expenses.failed')); }
  };

  const handleDelete = async (id) => {
    try { await deleteExpense(id); toast.success(t('expenses.deleted')); setDeleting(null); fetchExpenses(); }
    catch { toast.error(t('expenses.deleteFailed')); }
  };

  // Chart data by category
  const chartData = CATEGORIES.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    amount: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((d) => d.amount > 0);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const columns = [
    { key: 'expenseDate', label: t('common.date'), sortable: true, render: (v) => formatDate(v) },
    { key: 'title', label: t('expenses.title'), render: (v) => <span className="font-medium text-slate-200">{v}</span> },
    { key: 'category', label: t('expenses.category'), render: (v) => <Badge label={v} className={`${CAT_COLORS[v] ?? CAT_COLORS.other} capitalize`} /> },
    { key: 'amount', label: t('common.amount'), sortable: true, render: (v) => <span className="font-bold text-rose-400">{formatCurrency(v)}</span> },
    { key: 'paymentMethod', label: t('expenses.method'), render: (v) => <span className="text-slate-400 capitalize">{v}</span> },
    { key: 'description', label: t('expenses.description'), render: (v) => <span className="text-slate-500 text-xs">{v || '—'}</span> },
    {
      key: '_id', label: t('common.actions'),
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
        title={t('expenses.title')}
        subtitle={`${t('expenses.total')}: ${formatCurrency(totalExpenses)}`}
        actions={
          <button id="add-expense-btn" onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors glow-indigo">
            <Plus size={16} /> {t('expenses.addExpense')}
          </button>
        }
      />

{/* Bar chart */}
{chartData.length > 0 && (
  <div
    className="
      glass-card
      rounded-2xl
      border
      border-slate-200
      p-5
      dark:border-white/8
    "
  >
    <p
      className="
        mb-4
        text-sm
        font-semibold
        text-slate-900
        dark:text-white
      "
    >
      {t('expenses.byCategory')}
    </p>

    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={chartData}
        margin={{
          top: 4,
          right: 4,
          left: -20,
          bottom: 0,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--chart-grid)"
        />

        <XAxis
          dataKey="name"
          tick={{
            fill: 'var(--chart-axis)',
            fontSize: 11,
          }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{
            fill: 'var(--chart-axis)',
            fontSize: 11,
          }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) =>
            `${(value / 1000).toFixed(0)}k`
          }
        />

        <Tooltip
          cursor={{
            fill: 'var(--primary-soft)',
          }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;

            return (
              <div
                className="
                  min-w-[130px]
                  rounded-xl
                  border
                  px-4
                  py-3
                  text-xs
                  shadow-xl
                  backdrop-blur-md
                "
                style={{
                  backgroundColor: 'var(--chart-tooltip-background)',
                  borderColor: 'var(--chart-tooltip-border)',
                  boxShadow: 'var(--chart-tooltip-shadow)',
                }}
              >
                <p
                  className="mb-1 font-semibold"
                  style={{ color: 'var(--chart-tooltip-title)' }}
                >
                  {label}
                </p>

                {payload.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="
                        inline-block
                        h-2.5
                        w-2.5
                        shrink-0
                        rounded-full
                      "
                      style={{ backgroundColor: 'var(--primary)' }}
                    />

                    <span
                      className="font-bold"
                      style={{ color: 'var(--chart-tooltip-text)' }}
                    >
                      {formatCurrency(p.value)}
                    </span>
                  </div>
                ))}
              </div>
            );
          }}
        />

        <Bar
          dataKey="amount"
          fill="#6366f1"
          radius={[6, 6, 0, 0]}
          activeBar={{
            fill: '#4f46e5',
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
)}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input id="expenses-search" type="text" placeholder={t('expenses.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
        </div>
        <select id="expenses-cat-filter" value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50">
          <option value="">{t('expenses.allCategories')}</option>
          {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize bg-[#0f1629]">{c}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={expenses} loading={loading} emptyTitle={t('expenses.noExpensesYet')} emptyDescription={t('expenses.noExpensesDescription')} />

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? t('expenses.editExpense') : t('expenses.addExpense')}>
        <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">{t('expenses.title')} *</label>
              <input {...register('title', { required: t('validation.required') })} placeholder={t('expenses.titlePlaceholder')} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
              {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">{t('expenses.category')} *</label>
              <select {...register('category', { required: t('validation.required') })} className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 capitalize">
                <option value="">{t('expenses.selectCategory')}</option>
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
              {errors.category && <p className="text-xs text-rose-400 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">{t('expenses.amount')} *</label>
              <input {...register('amount', { required: t('validation.required'), min: { value: 1, message: t('validation.mustBePositive') } })} type="number" min="1" placeholder="0" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
              {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">{t('expenses.date')}</label>
              <input {...register('expenseDate')} type="date" defaultValue={new Date().toISOString().slice(0,10)} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">{t('expenses.paymentMethod')}</label>
              <input {...register('paymentMethod')} placeholder={t('expenses.paymentMethodPlaceholder')} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">{t('expenses.description')}</label>
              <textarea {...register('description')} rows={2} placeholder={t('expenses.descriptionPlaceholder')} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5">{t('common.cancel')}</button>
            <button id="expense-submit-btn" type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-60">
              {isSubmitting ? t('common.loading') : editing ? t('common.update') : t('common.add')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title={t('expenses.deleteExpense')} size="sm">
        <p className="text-slate-300 text-sm mb-5">{t('expenses.deleteConfirmation', { title: deleting?.title })}</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5">{t('common.cancel')}</button>
          <button id="confirm-delete-expense-btn" onClick={() => handleDelete(deleting?._id)} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold">{t('common.delete')}</button>
        </div>
      </Modal>
    </div>
  );
}
