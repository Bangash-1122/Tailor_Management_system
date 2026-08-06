import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customers';
import { formatDate, getInitials } from '../utils/helpers';

export default function Customers() {
  const { t } = useTranslation();
  const { currentThemeObj } = useTheme();
  const isDark = currentThemeObj?.isDark;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomers({ search });
      const data = res.data.data;
      setCustomers(Array.isArray(data) ? data : data?.customers || []);
    } catch { setCustomers([]); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openAdd = () => { setEditing(null); reset({}); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); reset(c); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); reset({}); };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await updateCustomer(editing._id, data);
        toast.success(t('customers.customerUpdated'));
      } else {
        await createCustomer(data);
        toast.success(t('customers.customerCreated'));
      }
      closeModal();
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || t('customers.operationFailed'));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id);
      toast.success(t('customers.customerDeleted'));
      setDeleting(null);
      fetchCustomers();
    } catch { toast.error(t('customers.deleteFailed')); }
  };

  const columns = [
    {
      key: 'name', label: t('common.name'), sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(val)}
          </div>
          <div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{val}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{row.customerCode}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: t('common.phone'), render: (v) => <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Phone size={12}/>{v}</span> },
    { key: 'email', label: t('common.email'), render: (v) => v ? <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Mail size={12}/>{v}</span> : '—' },
    { key: 'gender', label: t('common.gender'), render: (v) => <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{v}</span> },
    { key: 'ledgerBalance', label: t('common.balance'), render: (v) => <span className={`font-semibold`} style={{ color: v < 0 ? 'var(--danger)' : 'var(--success)' }}>Rs. {Math.abs(v || 0).toLocaleString()}</span> },
    { key: 'status', label: t('common.status'), render: (v) => <Badge label={v ? t('common.active') : t('common.inactive')} className={v ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'} /> },
    { key: 'createdAt', label: t('customers.joined'), sortable: true, render: (v) => formatDate(v) },
    {
      key: '_id', label: t('common.actions'),
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button id={`edit-customer-${row._id}`} onClick={() => openEdit(row)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--primary-soft)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }} aria-label={t('common.edit')}><Edit2 size={14}/></button>
          <button id={`delete-customer-${row._id}`} onClick={() => setDeleting(row)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }} aria-label={t('common.delete')}><Trash2 size={14}/></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title={t('customers.title')}
        subtitle={`${customers.length} ${t('customers.totalCustomers')}`}
        actions={
          <button id="add-customer-btn" onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors glow-indigo" style={{ backgroundColor: 'var(--primary)', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
            <Plus size={16} /> {t('customers.addCustomer')}
          </button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          id="customers-search"
          type="text"
          placeholder={t('customers.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
          style={{
            backgroundColor: 'var(--form-background)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            border: '1px solid'
          }}
        />
      </div>

      <DataTable columns={columns} data={customers} loading={loading} emptyTitle={t('customers.noCustomersYet')} emptyDescription={t('customers.noCustomersDescription')} />

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editing ? t('customers.editCustomer') : t('customers.addCustomer')}>
        <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('customers.fullName')}</label>
              <input {...register('name', { required: t('validation.required') })} placeholder="Muhammad Ali" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }} />
              {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('customers.phone')} *</label>
              <input {...register('phone', { required: t('validation.required') })} placeholder="03XX-XXXXXXX" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }} />
              {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('common.email')}</label>
              <input {...register('email')} type="email" placeholder="optional@email.com" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('common.gender')}</label>
              <select {...register('gender')} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }}>
                <option value="male">{t('common.male')}</option>
                <option value="female">{t('common.female')}</option>
                <option value="other">{t('common.other')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('common.status')}</label>
              <select {...register('status')} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }}>
                <option value={true}>{t('common.active')}</option>
                <option value={false}>{t('common.inactive')}</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('common.address')}</label>
              <input {...register('address')} placeholder="Street, City" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('common.notes')}</label>
              <textarea {...register('notes')} rows={2} placeholder={t('customers.additionalNotes')} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors resize-none" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-sm transition-colors" style={{ color: 'var(--text-secondary)', backgroundColor: 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>{t('common.cancel')}</button>
            <button id="customer-submit-btn" type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60" style={{ backgroundColor: 'var(--primary)' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              {isSubmitting ? t('common.loading') : editing ? t('common.update') : t('common.create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title={t('customers.deleteCustomer')} size="sm">
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>{t('customers.deleteConfirmation', { name: deleting?.name })}</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl text-sm transition-colors" style={{ color: 'var(--text-secondary)', backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>{t('common.cancel')}</button>
          <button id="confirm-delete-customer-btn" onClick={() => handleDelete(deleting?._id)} className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-colors" style={{ backgroundColor: 'var(--danger)' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>{t('common.delete')}</button>
        </div>
      </Modal>
    </div>
  );
}