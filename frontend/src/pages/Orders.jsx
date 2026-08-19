import { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, FileText, ChevronDown, Eye } from 'lucide-react';

import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { getOrders, createOrder, updateOrder, updateOrderStatus, deleteOrder } from '../api/orders';
import { getCustomers } from '../api/customers';
import { getInvoice } from '../api/reports';
import { formatCurrency, formatDate, ORDER_STATUS_COLORS, PRIORITY_COLORS } from '../utils/helpers';
import OrderReviewDrawer from '../components/orders/OrderReviewDrawer';


const STATUSES   = ['pending','cutting','stitching','trial','ready','delivered','cancelled'];
const PRIORITIES = ['low','normal','high','urgent'];

export default function Orders() {
  const { t } = useTranslation();
  const { currentThemeObj } = useTheme();
  const isDark = currentThemeObj?.isDark;
  const [orders, setOrders]         = useState([]);
  const [customers, setCustomers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [reviewOrderId, setReviewOrderId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openReview = (id) => { setReviewOrderId(id); setDrawerOpen(true); };
  const closeReview = () => setDrawerOpen(false);


  const { register, handleSubmit, reset, control, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { items: [{ itemName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, cRes] = await Promise.all([
        getOrders({ search, status: statusFilter }),
        getCustomers(),
      ]);
      const oData = oRes.data.data;
      const cData = cRes.data.data;
      setOrders(Array.isArray(oData) ? oData : oData?.orders || []);
      setCustomers(Array.isArray(cData) ? cData : cData?.customers || []);
    } catch { setOrders([]); setCustomers([]); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAdd  = () => { setEditing(null); reset({ items: [{ itemName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }] }); setShowModal(true); };
  const openEdit = (o) => {
    setEditing(o);
    reset({
      ...o,
      customerId: o.customerId?._id || o.customerId,
      deliveryDate: o.deliveryDate ? o.deliveryDate.slice(0, 10) : '',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const onSubmit = async (data) => {
    const items = (data.items || []).map((it) => ({
      ...it,
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
      totalPrice: Number(it.quantity) * Number(it.unitPrice),
    }));
    const totalAmount = items.reduce((s, i) => s + i.totalPrice, 0);
    const payload = { ...data, items, totalAmount, remainingAmount: totalAmount - Number(data.advanceAmount || 0) };
    try {
      editing ? await updateOrder(editing._id, payload) : await createOrder(payload);
      toast.success(editing ? t('orders.orderUpdated') : t('orders.orderCreated'));
      closeModal(); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || t('orders.updateFailed')); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await updateOrderStatus(id, status); toast.success(t('orders.statusUpdated')); setStatusModal(null); fetchAll(); }
    catch { toast.error(t('orders.updateFailed')); }
  };

  const handleDelete = async (id) => {
    try { await deleteOrder(id); toast.success(t('orders.orderDeleted')); setDeleting(null); fetchAll(); }
    catch { toast.error(t('orders.deleteFailed')); }
  };

  const handleInvoice = async (orderId) => {
    try {
      const res = await getInvoice(orderId);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch { toast.error(t('orders.invoiceFailed')); }
  };

  const columns = [
    { key: 'orderNo', label: t('orders.orderNumber'), sortable: true, render: (v) => <span className="font-mono text-xs" style={{ color: 'var(--primary)' }}>{v}</span> },
    { key: 'customerId', label: t('orders.customer'), render: (v) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{v?.name ?? '—'}</span> },
    { key: 'items', label: t('orders.items'), render: (v) => <span style={{ color: 'var(--text-secondary)' }}>{v?.length ?? 0} item(s)</span> },
    { key: 'totalAmount', label: t('orders.total'), sortable: true, render: (v) => <span className="font-semibold" style={{ color: 'var(--success)' }}>{formatCurrency(v)}</span> },
    { key: 'remainingAmount', label: t('orders.balance'), render: (v) => <span style={{ color: v > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{formatCurrency(v)}</span> },
    { key: 'deliveryDate', label: t('orders.delivery'), sortable: true, render: (v) => formatDate(v) },
    { key: 'priority', label: t('orders.priority'), render: (v) => <Badge label={v} className={PRIORITY_COLORS[v]} /> },
    { key: 'status', label: t('common.status'), render: (v, row) => (
      <button onClick={() => setStatusModal(row)} className="focus:outline-none" id={`status-btn-${row._id}`}>
        <Badge label={v} className={`${ORDER_STATUS_COLORS[v]} cursor-pointer hover:opacity-80 transition-opacity`} />
      </button>
    )},
    {
      key: '_id', label: t('common.actions'),
      render: (id, row) => (
        <div className="flex items-center gap-1">
          <button id={`review-order-${id}`} onClick={() => openReview(id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--primary-soft)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }} title={t('orderReview.title')}><Eye size={14} /></button>
          <button id={`invoice-${id}`} onClick={() => handleInvoice(id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--primary-soft)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }} title="Invoice"><FileText size={14} /></button>
          <button id={`edit-order-${id}`} onClick={() => openEdit(row)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--primary-soft)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }}><Edit2 size={14} /></button>
          <button id={`delete-order-${id}`} onClick={() => setDeleting(row)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];


  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title={t('orders.title')}
        subtitle={`${orders.length} ${t('orders.ordersFound')}`}
        actions={
          <button id="add-order-btn" onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors glow-indigo" style={{ backgroundColor: 'var(--primary)' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
            <Plus size={16} /> {t('orders.newOrder')}
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input id="orders-search" type="text" placeholder={t('orders.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', border: '1px solid' }} />
        </div>
        <select id="orders-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-sm focus:outline-none" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', border: '1px solid' }}>
          <option value="">{t('orders.allStatuses')}</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={orders} loading={loading} emptyTitle={t('orders.noOrdersYet')} emptyDescription={t('orders.noOrdersDescription')} />

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editing ? t('orders.editOrder') : t('orders.newOrder')} size="xl">
        <form id="order-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('orders.customer')} *</label>
              <select {...register('customerId', { required: t('validation.required') })} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', border: '1px solid' }}>
                <option value="">{t('orders.selectCustomer')}</option>
                {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.customerId && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.customerId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('orders.deliveryDate')} *</label>
              <input {...register('deliveryDate', { required: t('validation.required') })} type="date" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', border: '1px solid' }} />
              {errors.deliveryDate && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.deliveryDate.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('orders.priority')}</label>
              <select {...register('priority')} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', border: '1px solid' }}>
                {PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('orders.advanceAmount')}</label>
              <input {...register('advanceAmount')} type="number" min="0" placeholder="0" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', border: '1px solid' }} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('common.notes')}</label>
              <textarea {...register('notes')} rows={2} placeholder={t('orders.orderNotes')} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', border: '1px solid' }} />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400">{t('orders.orderItems')} *</p>
              <button type="button" onClick={() => append({ itemName: '', quantity: 1, unitPrice: 0, totalPrice: 0 })} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><Plus size={12} />{t('orders.addItem')}</button>
            </div>
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {i === 0 && <p className="text-xs text-slate-500 mb-1">{t('orders.itemName')}</p>}
                    <input {...register(`items.${i}.itemName`, { required: true })} placeholder={t('orders.itemNamePlaceholder')} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <p className="text-xs text-slate-500 mb-1">{t('orders.qty')}</p>}
                    <input {...register(`items.${i}.quantity`, { min: 1 })} type="number" min="1" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <p className="text-xs text-slate-500 mb-1">{t('orders.unitPrice')}</p>}
                    <input {...register(`items.${i}.unitPrice`, { min: 0 })} type="number" min="0" placeholder="0" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(i)} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={13} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/8">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors">{t('common.cancel')}</button>
            <button id="order-submit-btn" type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {isSubmitting ? t('common.loading') : editing ? t('orders.updateOrder') : t('orders.createOrder')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title={t('orders.updateOrderStatus')} size="sm">
        <p className="text-xs text-slate-400 mb-4">Order: <span className="text-indigo-400 font-mono">{statusModal?.orderNo}</span></p>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              id={`set-status-${s}`}
              onClick={() => handleStatusUpdate(statusModal._id, s)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all duration-200 ${
                statusModal?.status === s ? ORDER_STATUS_COLORS[s] + ' scale-105' : 'text-slate-400 border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title={t('orders.deleteOrder')} size="sm">
        <p className="text-slate-300 text-sm mb-5">{t('orders.deleteConfirmation', { orderNo: deleting?.orderNo })}</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5">{t('common.cancel')}</button>
          <button id="confirm-delete-order-btn" onClick={() => handleDelete(deleting?._id)} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold">{t('common.delete')}</button>
        </div>
      </Modal>

      <OrderReviewDrawer
        orderId={reviewOrderId}
        open={drawerOpen}
        onClose={closeReview}
        onOrderMutated={fetchAll}
      />
    </div>
  );
}
