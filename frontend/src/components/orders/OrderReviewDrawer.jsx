import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  X, Edit2, CreditCard, Printer, MessageCircle, Trash2,
  User, Phone, Calendar, Tag, AlertCircle, Ruler, Package,
  ChevronRight,
} from 'lucide-react';

import toast from 'react-hot-toast';
import { useForm, useFieldArray } from 'react-hook-form';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { getOrder, updateOrder, deleteOrder, createOrder } from '../../api/orders';
import { getPayments, createPayment } from '../../api/payments';
import { getCustomers } from '../../api/customers';
import { getInvoice } from '../../api/reports';
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_COLORS,
  PRIORITY_COLORS,
  normalizePhoneForWhatsApp,
} from '../../utils/helpers';
import { MEASUREMENT_CONFIG, FIELD_LABELS, MeasurementIcon } from '../../utils/measurementConfig';

// ── helper ────────────────────────────────────────────────────────────────────
const LabelValue = ({ label, value, valueClass = '' }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
      {label}
    </span>
    <span className={`text-sm font-medium ${valueClass}`} style={{ color: 'var(--text-primary)' }}>
      {value ?? '—'}
    </span>
  </div>
);

const Section = ({ title, children, icon: Icon }) => (
  <div>
    <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid var(--divider-color)' }}>
      {Icon && <Icon size={13} style={{ color: 'var(--primary)' }} />}
      <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </h4>
    </div>
    {children}
  </div>
);

const STATUSES = ['pending', 'cutting', 'stitching', 'trial', 'ready', 'delivered', 'cancelled'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

// ── main component ─────────────────────────────────────────────────────────────
export default function OrderReviewDrawer({ orderId, open, onClose, onOrderMutated }) {
  const { t } = useTranslation();

  // data
  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // ui state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // edit form
  const {
    register: regEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    control,
    formState: { errors: editErrors },
  } = useForm({
    defaultValues: { items: [{ itemName: '', quantity: 1, unitPrice: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // payment form
  const {
    register: regPay,
    handleSubmit: handlePaySubmit,
    reset: resetPay,
    formState: { errors: payErrors },
  } = useForm({
    defaultValues: { amount: '', paymentMethod: 'cash', paymentType: 'partial', notes: '' },
  });

  // ── fetch order ─────────────────────────────────────────────────────────────
  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setLoadingOrder(true);
    setOrder(null);
    setPayments([]);
    try {
      const [oRes, pRes] = await Promise.all([
        getOrder(orderId),
        getPayments({ orderId }),
      ]);
      const o = oRes.data.data;
      setOrder(o);
      const pData = pRes.data.data;
      setPayments(Array.isArray(pData) ? pData : pData?.payments ?? []);
    } catch {
      toast.error(t('orderReview.loadError'));
      onClose();
    } finally {
      setLoadingOrder(false);
    }
  }, [orderId, t, onClose]);

  useEffect(() => {
    if (open && orderId) loadOrder();
  }, [open, orderId, loadOrder]);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // ── edit modal open ──────────────────────────────────────────────────────────
  const openEdit = async () => {
    if (!order) return;
    try {
      const cRes = await getCustomers();
      const cData = cRes.data.data;
      setCustomers(Array.isArray(cData) ? cData : cData?.customers ?? []);
    } catch { /* customers list optional */ }
    resetEdit({
      ...order,
      customerId: order.customerId?._id || order.customerId,
      deliveryDate: order.deliveryDate ? order.deliveryDate.slice(0, 10) : '',
    });
    setShowEditModal(true);
  };

  const onEditSubmit = async (data) => {
    setSubmittingEdit(true);
    try {
      const items = (data.items || []).map((it) => ({
        ...it,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        totalPrice: Number(it.quantity) * Number(it.unitPrice),
      }));
      const totalAmount = items.reduce((s, i) => s + i.totalPrice, 0);
      const payload = {
        ...data,
        items,
        totalAmount,
        remainingAmount: totalAmount - Number(order.advanceAmount || 0),
      };
      await updateOrder(order._id, payload);
      toast.success(t('orders.orderUpdated'));
      setShowEditModal(false);
      loadOrder();
      onOrderMutated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || t('orders.updateFailed'));
    } finally {
      setSubmittingEdit(false);
    }
  };

  // ── payment modal open ───────────────────────────────────────────────────────
  const openPayment = () => {
    resetPay({ amount: '', paymentMethod: 'cash', paymentType: 'partial', notes: '' });
    setShowPaymentModal(true);
  };

  const onPaySubmit = async (data) => {
    setSubmittingPayment(true);
    try {
      await createPayment({
        orderId: order._id,
        customerId: order.customerId?._id || order.customerId,
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod,
        paymentType: data.paymentType,
        notes: data.notes,
      });
      toast.success(t('payments.paymentRecorded'));
      setShowPaymentModal(false);
      loadOrder();
      onOrderMutated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || t('orders.updateFailed'));
    } finally {
      setSubmittingPayment(false);
    }
  };

  // ── print ────────────────────────────────────────────────────────────────────
  const handlePrint = async () => {
    if (!order) return;
    try {
      const res = await getInvoice(order._id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch { toast.error(t('orders.invoiceFailed')); }
  };

  // ── whatsapp ─────────────────────────────────────────────────────────────────
  const handleWhatsApp = () => {
    if (!order) return;
    const phone = normalizePhoneForWhatsApp(order.customerId?.phone || '');
    if (!phone) { toast.error('No phone number available'); return; }
    const msg = t('orderReview.whatsappMessage', {
      name: order.customerId?.name ?? '',
      orderNo: order.orderNo,
      status: order.status,
      delivery: formatDate(order.deliveryDate),
      total: formatCurrency(order.totalAmount),
      paid: formatCurrency(order.advanceAmount),
      balance: formatCurrency(order.remainingAmount),
    });
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ── delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await deleteOrder(order._id);
      toast.success(t('orders.orderDeleted'));
      setShowDeleteModal(false);
      onClose();
      onOrderMutated?.();
    } catch { toast.error(t('orders.deleteFailed')); }
  };

  // ── render ───────────────────────────────────────────────────────────────────
  if (!open) return null;

  const measurement = order?.measurementId;
  const measurementFields = measurement
    ? (MEASUREMENT_CONFIG[measurement.type] || Object.keys(measurement.measurements || {}))
    : [];

  return createPortal(
    <>
      {/* ── Overlay ── */}
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer panel ── */}
      <aside
        className="fixed inset-y-0 right-0 z-[9999] h-screen max-h-screen w-full sm:max-w-[490px] flex flex-col overflow-hidden animate-slide-in-right"
        style={{
          backgroundColor: 'var(--modal-background, #0c1220)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-popup, -10px 0 40px rgba(0,0,0,0.5))',
        }}
        aria-label={t('orderReview.title')}
      >


        {/* ── Header ── */}
        <div
          className="flex-none px-6 pt-6 pb-4"
          style={{
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--dropdown-background, #0c1220)',
          }}
        >
          {/* Top row: Badges + Close Button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
              >
                {t('orderReview.title')}
              </span>
              {order && (
                <Badge label={order.status} className={ORDER_STATUS_COLORS[order.status] ?? ''} />
              )}
            </div>

            <button
              id="order-review-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg flex-none transition-all duration-200"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--surface-subtle, rgba(255,255,255,0.05))',
                border: '1px solid var(--border-color)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'var(--surface-subtle, rgba(255,255,255,0.05))'; }}
              aria-label={t('common.close')}
            >
              <X size={16} />
            </button>
          </div>

          {/* Main Title & Customer details */}
          {order ? (
            <div>
              <h2 className="text-xl font-bold font-mono leading-tight tracking-wide" style={{ color: 'var(--text-primary)' }}>
                {order.orderNo}
              </h2>
              <p className="text-xs truncate mt-1" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{order.customerId?.name}</span>
                {order.customerId?.phone && (
                  <span className="ml-1.5" style={{ color: 'var(--text-muted)' }}>
                    • {order.customerId.phone}
                  </span>
                )}
              </p>
            </div>
          ) : loadingOrder ? (
            <p className="text-sm py-1" style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>
          ) : null}
        </div>



        {/* ── Scrollable body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {loadingOrder && (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
          )}

          {!loadingOrder && order && (
            <div className="space-y-5">
              {/* ── Priority & Update Date strip ── */}
              <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--divider-color)' }}>

                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('orderReview.priority')}:</span>
                  <Badge label={order.priority} className={PRIORITY_COLORS[order.priority] ?? ''} />
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {t('orderReview.updatedAt')}: {formatDate(order.updatedAt)}
                </span>
              </div>


              {/* ── Customer & Order ── */}
              <Section title={t('orderReview.customerAndOrder')} icon={User}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <LabelValue label={t('common.customer')} value={order.customerId?.name} />
                  <LabelValue label={t('common.phone')} value={order.customerId?.phone} />
                  <LabelValue label={t('orderReview.reference')} value={order.customerId?.customerCode} />
                  <LabelValue label={t('orderReview.tailor')} value={order.assignedTailorId?.name} />
                  <LabelValue label={t('orderReview.booking')} value={formatDate(order.orderDate)} />
                  <LabelValue label={t('orderReview.delivery')} value={formatDate(order.deliveryDate)} />
                  {order.notes && (
                    <div className="col-span-2">
                      <LabelValue label={t('orderReview.notes')} value={order.notes} />
                    </div>
                  )}
                  {order.stitchingNotes && (
                    <div className="col-span-2">
                      <LabelValue label={t('orderReview.stitchingNotes')} value={order.stitchingNotes} />
                    </div>
                  )}
                </div>
              </Section>

              {/* ── Payment Summary ── */}
              <Section title={t('orderReview.paymentSummary')} icon={CreditCard}>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {/* Per Unit */}
                  <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-color)' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                      {t('orderReview.perUnit')}
                    </p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(order.items?.[0]?.unitPrice ?? 0)}
                    </p>
                  </div>
                  {/* Order Total */}
                  <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--primary-soft)', border: '1px solid var(--primary)', borderOpacity: 0.3 }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--primary)' }}>
                      {t('orderReview.orderTotal')}
                    </p>
                    <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                  {/* Balance */}
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{
                      backgroundColor: order.remainingAmount > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                      border: `1px solid ${order.remainingAmount > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: order.remainingAmount > 0 ? 'var(--warning)' : 'var(--success)' }}>
                      {t('orderReview.toReceive')}
                    </p>
                    <p className="text-sm font-bold" style={{ color: order.remainingAmount > 0 ? 'var(--warning)' : 'var(--success)' }}>
                      {formatCurrency(order.remainingAmount)}
                    </p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {t('orderReview.received')}:{' '}
                  <span className="font-semibold" style={{ color: 'var(--success)' }}>
                    {formatCurrency(order.advanceAmount)}
                  </span>
                </p>
              </Section>

              {/* ── Payment History ── */}
              <Section title={t('orderReview.paymentHistory')} icon={CreditCard}>
                {payments.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    {t('orderReview.noPayments')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                        style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-color)' }}
                      >
                        <div>
                          <p className="text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                            {p.paymentType} · {p.paymentMethod}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {formatDate(p.paymentDate)}
                            {p.notes && ` · ${p.notes}`}
                          </p>
                        </div>
                        <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>
                          {formatCurrency(p.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* ── Garment Details ── */}
              <Section title={t('orderReview.garmentDetails')} icon={Package}>
                <div className="space-y-2">
                  {(order.items || []).map((item, i) => (
                    <div
                      key={i}
                      className="px-3 py-2.5 rounded-xl"
                      style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-color)' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {item.itemName}
                          </p>
                          {item.description && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-bold flex-none" style={{ color: 'var(--primary)' }}>
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>{t('orderReview.itemQty')}: <strong style={{ color: 'var(--text-secondary)' }}>{item.quantity}</strong></span>
                        <span>{t('orderReview.itemUnit')}: <strong style={{ color: 'var(--text-secondary)' }}>{formatCurrency(item.unitPrice)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* ── Measurements ── */}
              <Section title={t('orderReview.measurements')} icon={Ruler}>
                {!measurement ? (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    {t('orderReview.noMeasurements')}
                  </p>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                        style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                        {measurement.type}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        v{measurement.version ?? 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {measurementFields.map((field) => {
                        const val = measurement.measurements?.[field];
                        if (val === undefined || val === null || val === '') return null;
                        return (
                          <div
                            key={field}
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl"
                            style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-color)' }}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MeasurementIcon field={field} size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} className="text-slate-400" />
                              <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                                {FIELD_LABELS[field] || field}
                              </span>
                            </div>
                            <span className="text-xs font-bold flex-none" style={{ color: 'var(--text-primary)' }}>
                              {val}"
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {measurement.notes && (
                      <p className="text-xs mt-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
                        {measurement.notes}
                      </p>
                    )}
                  </div>
                )}
              </Section>

            </div>
          )}
        </div>

        {/* ── Fixed bottom action bar ── */}
        <div
          className="flex-none px-6 pt-3.5 pb-7"
          style={{
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--dropdown-background, #0c1220)',
            boxShadow: '0 -6px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div className="flex items-center gap-2.5">
            {/* Edit */}
            <button
              id="drawer-edit-btn"
              onClick={openEdit}
              disabled={!order}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
              title={t('common.edit')}
            >
              <Edit2 size={14} /> {t('common.edit')}
            </button>

            {/* Payment */}
            <button
              id="drawer-payment-btn"
              onClick={openPayment}
              disabled={!order}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
              style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)' }}
              title={t('orderReview.recordPayment')}
            >
              <CreditCard size={14} /> {t('orderReview.recordPayment')}
            </button>

            {/* Print */}
            <button
              id="drawer-print-btn"
              onClick={handlePrint}
              disabled={!order}
              className="p-2.5 rounded-xl transition-colors disabled:opacity-40"
              style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
              title={t('common.print')}
            >
              <Printer size={16} />
            </button>

            {/* WhatsApp */}
            <button
              id="drawer-whatsapp-btn"
              onClick={handleWhatsApp}
              disabled={!order}
              className="p-2.5 rounded-xl transition-colors disabled:opacity-40"
              style={{ backgroundColor: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.3)' }}
              title="WhatsApp"
            >
              <MessageCircle size={16} />
            </button>

            {/* Delete */}
            <button
              id="drawer-delete-btn"
              onClick={() => setShowDeleteModal(true)}
              disabled={!order}
              className="p-2.5 rounded-xl transition-colors disabled:opacity-40"
              style={{ backgroundColor: 'rgba(244,63,94,0.1)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.3)' }}
              title={t('common.delete')}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

      </aside>

      {/* ── Edit Modal ── */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={t('orders.editOrder')} size="xl">
        <form id="drawer-order-form" onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('orders.customer')} *
              </label>
              <select
                {...regEdit('customerId', { required: t('validation.required') })}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--form-background)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="">{t('orders.selectCustomer')}</option>
                {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {editErrors.customerId && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{editErrors.customerId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('orders.deliveryDate')} *
              </label>
              <input
                {...regEdit('deliveryDate', { required: t('validation.required') })}
                type="date"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--form-background)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('orders.priority')}
              </label>
              <select
                {...regEdit('priority')}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--form-background)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              >
                {PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('orders.advanceAmount')}
              </label>
              <input
                {...regEdit('advanceAmount')}
                type="number"
                min="0"
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--form-background)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('common.notes')}
              </label>
              <textarea
                {...regEdit('notes')}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                style={{ backgroundColor: 'var(--form-background)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-400">{t('orders.orderItems')} *</p>
              <button
                type="button"
                onClick={() => append({ itemName: '', quantity: 1, unitPrice: 0 })}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                + {t('orders.addItem')}
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {i === 0 && <p className="text-xs text-slate-500 mb-1">{t('orders.itemName')}</p>}
                    <input
                      {...regEdit(`items.${i}.itemName`, { required: true })}
                      placeholder={t('orders.itemNamePlaceholder')}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <p className="text-xs text-slate-500 mb-1">{t('orders.qty')}</p>}
                    <input {...regEdit(`items.${i}.quantity`, { min: 1 })} type="number" min="1"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <p className="text-xs text-slate-500 mb-1">{t('orders.unitPrice')}</p>}
                    <input {...regEdit(`items.${i}.unitPrice`, { min: 0 })} type="number" min="0" placeholder="0"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(i)}
                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid var(--divider-color)' }}>
            <button type="button" onClick={() => setShowEditModal(false)}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors">
              {t('common.cancel')}
            </button>
            <button id="drawer-order-submit-btn" type="submit" disabled={submittingEdit}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {submittingEdit ? t('common.loading') : t('orders.updateOrder')}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Payment Modal ── */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title={t('orderReview.recordPayment')} size="sm">
        <form id="drawer-payment-form" onSubmit={handlePaySubmit(onPaySubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              {t('common.amount')} *
            </label>
            <input
              {...regPay('amount', { required: t('validation.required'), min: { value: 1, message: t('validation.negativeValue') } })}
              type="number" min="1" placeholder="0"
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--form-background)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
            {payErrors.amount && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{payErrors.amount.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('payments.method')}
              </label>
              <select {...regPay('paymentMethod')}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--form-background)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                {['cash','bank','card','EasyPaisa','JazzCash','online'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('payments.type')}
              </label>
              <select {...regPay('paymentType')}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--form-background)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                {['advance','partial','full','refund'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              {t('common.notes')}
            </label>
            <input {...regPay('notes')} placeholder={t('common.optional')}
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--form-background)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors">
              {t('common.cancel')}
            </button>
            <button id="drawer-payment-submit-btn" type="submit" disabled={submittingPayment}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {submittingPayment ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={t('orders.deleteOrder')} size="sm">
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          {t('orderReview.deleteConfirm', { orderNo: order?.orderNo })}
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors">
            {t('common.cancel')}
          </button>
          <button id="drawer-confirm-delete-btn" onClick={handleDelete}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors">
            {t('common.delete')}
          </button>
        </div>
      </Modal>
    </>,
    document.body
  );
}

