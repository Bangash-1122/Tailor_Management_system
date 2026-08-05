import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
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
        toast.success('Customer updated');
      } else {
        await createCustomer(data);
        toast.success('Customer created');
      }
      closeModal();
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted');
      setDeleting(null);
      fetchCustomers();
    } catch { toast.error('Delete failed'); }
  };

  const columns = [
    {
      key: 'name', label: 'Customer', sortable: true,
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
    { key: 'phone', label: 'Phone', render: (v) => <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Phone size={12}/>{v}</span> },
    { key: 'email', label: 'Email', render: (v) => v ? <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Mail size={12}/>{v}</span> : '—' },
    { key: 'gender', label: 'Gender', render: (v) => <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{v}</span> },
    { key: 'ledgerBalance', label: 'Balance', render: (v) => <span className={`font-semibold`} style={{ color: v < 0 ? 'var(--danger)' : 'var(--success)' }}>Rs. {Math.abs(v || 0).toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge label={v ? 'Active' : 'Inactive'} className={v ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'} /> },
    { key: 'createdAt', label: 'Joined', sortable: true, render: (v) => formatDate(v) },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button id={`edit-customer-${row._id}`} onClick={() => openEdit(row)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--primary-soft)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }} aria-label="Edit"><Edit2 size={14}/></button>
          <button id={`delete-customer-${row._id}`} onClick={() => setDeleting(row)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }} aria-label="Delete"><Trash2 size={14}/></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} total customers`}
        actions={
          <button id="add-customer-btn" onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors glow-indigo" style={{ backgroundColor: 'var(--primary)', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
            <Plus size={16} /> Add Customer
          </button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          id="customers-search"
          type="text"
          placeholder="Search by name, phone, code…"
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

      <DataTable columns={columns} data={customers} loading={loading} emptyTitle="No customers yet" emptyDescription="Add your first customer to get started." />

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
              <input {...register('name', { required: 'Required' })} placeholder="Muhammad Ali" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }} />
              {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Phone *</label>
              <input {...register('phone', { required: 'Required' })} placeholder="03XX-XXXXXXX" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }} />
              {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input {...register('email')} type="email" placeholder="optional@email.com" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Gender</label>
              <select {...register('gender')} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select {...register('status')} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }}>
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Address</label>
              <input {...register('address')} placeholder="Street, City" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
              <textarea {...register('notes')} rows={2} placeholder="Additional notes…" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors resize-none" style={{ backgroundColor: 'var(--form-background)', borderColor: 'var(--border-color)', border: '1px solid', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-sm transition-colors" style={{ color: 'var(--text-secondary)', backgroundColor: 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>Cancel</button>
            <button id="customer-submit-btn" type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60" style={{ backgroundColor: 'var(--primary)' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Delete Customer" size="sm">
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{deleting?.name}</span>? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl text-sm transition-colors" style={{ color: 'var(--text-secondary)', backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Cancel</button>
          <button id="confirm-delete-customer-btn" onClick={() => handleDelete(deleting?._id)} className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-colors" style={{ backgroundColor: 'var(--danger)' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}