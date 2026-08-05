import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { getPayments, createPayment } from '../api/payments';
import { getCustomers } from '../api/customers';
import { getOrders } from '../api/orders';
import { formatCurrency, formatDate } from '../utils/helpers';

const METHODS = ['cash','bank','card','EasyPaisa','JazzCash','online'];
const TYPES   = ['advance','partial','full','refund'];

const METHOD_COLORS = {
  cash:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  bank:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
  card:      'bg-violet-500/20 text-violet-400 border-violet-500/30',
  EasyPaisa: 'bg-green-500/20 text-green-400 border-green-500/30',
  JazzCash:  'bg-red-500/20 text-red-400 border-red-500/30',
  online:    'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const TYPE_COLORS = {
  advance: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  partial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  full:    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  refund:  'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export default function Payments() {
  const { currentThemeObj } = useTheme();
  const isDark = currentThemeObj?.isDark;
  const [payments, setPayments]   = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes, oRes] = await Promise.all([getPayments(), getCustomers(), getOrders()]);
      const pData = pRes.data.data;
      const cData = cRes.data.data;
      const oData = oRes.data.data;
      setPayments(Array.isArray(pData) ? pData : pData?.payments || []);
      setCustomers(Array.isArray(cData) ? cData : cData?.customers || []);
      setOrders(Array.isArray(oData) ? oData : oData?.orders || []);
    } catch { setPayments([]); setCustomers([]); setOrders([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onSubmit = async (data) => {
    try {
      await createPayment({ ...data, amount: Number(data.amount) });
      toast.success('Payment recorded');
      setShowModal(false); reset(); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'paymentDate', label: 'Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'customerId', label: 'Customer', render: (v) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{v?.name ?? '—'}</span> },
    { key: 'orderId', label: 'Order #', render: (v) => v?.orderNo ? <span className="font-mono text-xs" style={{ color: 'var(--primary)' }}>{v.orderNo}</span> : '—' },
    { key: 'amount', label: 'Amount', sortable: true, render: (v) => <span className="font-bold" style={{ color: 'var(--success)' }}>{formatCurrency(v)}</span> },
    { key: 'paymentMethod', label: 'Method', render: (v) => <Badge label={v} className={METHOD_COLORS[v] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30'} /> },
    { key: 'paymentType', label: 'Type', render: (v) => <Badge label={v} className={TYPE_COLORS[v] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30'} /> },
    { key: 'transactionId', label: 'Txn ID', render: (v) => v ? <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{v}</span> : '—' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Payments"
        subtitle={`${payments.length} payment records`}
        actions={
          <button id="add-payment-btn" onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors glow-indigo" style={{ backgroundColor: 'var(--primary)' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
            <Plus size={16} /> Record Payment
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Received', value: payments.filter(p => p.paymentType !== 'refund').reduce((s, p) => s + p.amount, 0), color: 'var(--success)' },
          { label: 'Advance', value: payments.filter(p => p.paymentType === 'advance').reduce((s, p) => s + p.amount, 0), color: 'var(--warning)' },
          { label: 'Full Payments', value: payments.filter(p => p.paymentType === 'full').reduce((s, p) => s + p.amount, 0), color: 'var(--info)' },
          { label: 'Refunds', value: payments.filter(p => p.paymentType === 'refund').reduce((s, p) => s + p.amount, 0), color: 'var(--danger)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            <p className="text-lg font-bold mt-1" style={{ color }}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={payments} loading={loading} emptyTitle="No payments yet" emptyDescription="Record your first payment." />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); }} title="Record Payment">
        <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Customer *</label>
              <select {...register('customerId', { required: 'Required' })} className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50">
                <option value="">Select customer…</option>
                {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.customerId && <p className="text-xs text-rose-400 mt-1">{errors.customerId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Order (optional)</label>
              <select {...register('orderId')} className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50">
                <option value="">No specific order</option>
                {orders.map((o) => <option key={o._id} value={o._id}>{o.orderNo} — {o.customerId?.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount (Rs.) *</label>
              <input {...register('amount', { required: 'Required', min: { value: 1, message: 'Must be > 0' } })} type="number" min="1" placeholder="0" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
              {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Payment Date</label>
              <input {...register('paymentDate')} type="date" defaultValue={new Date().toISOString().slice(0,10)} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Method</label>
              <select {...register('paymentMethod')} className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50">
                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Payment Type</label>
              <select {...register('paymentType')} className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50">
                {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Transaction ID</label>
              <input {...register('transactionId')} placeholder="optional" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
              <textarea {...register('notes')} rows={2} placeholder="Payment notes…" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); reset(); }} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5">Cancel</button>
            <button id="payment-submit-btn" type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-60">
              {isSubmitting ? 'Saving…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
