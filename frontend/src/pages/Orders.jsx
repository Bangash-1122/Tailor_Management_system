import { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, FileText, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { getOrders, createOrder, updateOrder, updateOrderStatus, deleteOrder } from '../api/orders';
import { getCustomers } from '../api/customers';
import { getInvoice } from '../api/reports';
import { formatCurrency, formatDate, ORDER_STATUS_COLORS, PRIORITY_COLORS } from '../utils/helpers';

const STATUSES   = ['pending','cutting','stitching','trial','ready','delivered','cancelled'];
const PRIORITIES = ['low','normal','high','urgent'];

export default function Orders() {
  const [orders, setOrders]         = useState([]);
  const [customers, setCustomers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [statusModal, setStatusModal] = useState(null);

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
      setOrders(oRes.data.data || []);
      setCustomers(cRes.data.data || []);
    } catch { setOrders([]); }
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
      toast.success(editing ? 'Order updated' : 'Order created');
      closeModal(); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await updateOrderStatus(id, status); toast.success('Status updated'); setStatusModal(null); fetchAll(); }
    catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    try { await deleteOrder(id); toast.success('Order deleted'); setDeleting(null); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  const handleInvoice = async (orderId) => {
    try {
      const res = await getInvoice(orderId);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch { toast.error('Invoice generation failed'); }
  };

  const columns = [
    { key: 'orderNo', label: 'Order #', sortable: true, render: (v) => <span className="font-mono text-xs text-indigo-400">{v}</span> },
    { key: 'customerId', label: 'Customer', render: (v) => <span className="font-medium text-slate-200">{v?.name ?? '—'}</span> },
    { key: 'items', label: 'Items', render: (v) => <span className="text-slate-400">{v?.length ?? 0} item(s)</span> },
    { key: 'totalAmount', label: 'Total', sortable: true, render: (v) => <span className="font-semibold text-emerald-400">{formatCurrency(v)}</span> },
    { key: 'remainingAmount', label: 'Balance', render: (v) => <span className={v > 0 ? 'text-amber-400' : 'text-slate-500'}>{formatCurrency(v)}</span> },
    { key: 'deliveryDate', label: 'Delivery', sortable: true, render: (v) => formatDate(v) },
    { key: 'priority', label: 'Priority', render: (v) => <Badge label={v} className={PRIORITY_COLORS[v]} /> },
    { key: 'status', label: 'Status', render: (v, row) => (
      <button onClick={() => setStatusModal(row)} className="focus:outline-none" id={`status-btn-${row._id}`}>
        <Badge label={v} className={`${ORDER_STATUS_COLORS[v]} cursor-pointer hover:opacity-80 transition-opacity`} />
      </button>
    )},
    {
      key: '_id', label: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-1">
          <button id={`invoice-${id}`} onClick={() => handleInvoice(id)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors" title="Invoice"><FileText size={14} /></button>
          <button id={`edit-order-${id}`} onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"><Edit2 size={14} /></button>
          <button id={`delete-order-${id}`} onClick={() => setDeleting(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} orders found`}
        actions={
          <button id="add-order-btn" onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors glow-indigo">
            <Plus size={16} /> New Order
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input id="orders-search" type="text" placeholder="Search orders…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
        </div>
        <select id="orders-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize bg-[#0f1629]">{s}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={orders} loading={loading} emptyTitle="No orders yet" emptyDescription="Create your first order." />

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Order' : 'New Order'} size="xl">
        <form id="order-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <label className="block text-xs font-medium text-slate-400 mb-1">Delivery Date *</label>
              <input {...register('deliveryDate', { required: 'Required' })} type="date" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" />
              {errors.deliveryDate && <p className="text-xs text-rose-400 mt-1">{errors.deliveryDate.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
              <select {...register('priority')} className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50">
                {PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Advance (Rs.)</label>
              <input {...register('advanceAmount')} type="number" min="0" placeholder="0" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
              <textarea {...register('notes')} rows={2} placeholder="Order notes…" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none" />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400">Order Items *</p>
              <button type="button" onClick={() => append({ itemName: '', quantity: 1, unitPrice: 0, totalPrice: 0 })} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><Plus size={12} />Add Item</button>
            </div>
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {i === 0 && <p className="text-xs text-slate-500 mb-1">Item Name</p>}
                    <input {...register(`items.${i}.itemName`, { required: true })} placeholder="e.g. Kurta" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <p className="text-xs text-slate-500 mb-1">Qty</p>}
                    <input {...register(`items.${i}.quantity`, { min: 1 })} type="number" min="1" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <p className="text-xs text-slate-500 mb-1">Unit Price</p>}
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
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
            <button id="order-submit-btn" type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {isSubmitting ? 'Saving…' : editing ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Order Status" size="sm">
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
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Delete Order" size="sm">
        <p className="text-slate-300 text-sm mb-5">Delete order <span className="text-indigo-400 font-mono">{deleting?.orderNo}</span>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5">Cancel</button>
          <button id="confirm-delete-order-btn" onClick={() => handleDelete(deleting?._id)} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
