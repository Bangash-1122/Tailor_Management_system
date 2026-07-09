import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, Ruler } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getMeasurements, createMeasurement, updateMeasurement, deleteMeasurement } from '../api/measurements';
import { getCustomers } from '../api/customers';
import { formatDate } from '../utils/helpers';

const CLOTHING_TYPES = ['shirt','pant','kurta','shalwar','trouser','coat','waistcoat','sherwani','blazer','custom'];
const MEASUREMENT_FIELDS = ['neck','chest','waist','hip','shoulder','sleeve','length','bottom','inseam','thigh'];

export default function Measurements() {
  const [measurements, setMeasurements] = useState([]);
  const [customers, setCustomers]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [editing, setEditing]           = useState(null);
  const [deleting, setDeleting]         = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, cRes] = await Promise.all([getMeasurements({ search }), getCustomers()]);
      setMeasurements(mRes.data.data || []);
      setCustomers(cRes.data.data || []);
    } catch { setMeasurements([]); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAdd  = () => { setEditing(null); reset({}); setShowModal(true); };
  const openEdit = (m) => { setEditing(m); reset({ ...m, customerId: m.customerId?._id || m.customerId }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); reset({}); };

  const onSubmit = async (data) => {
    const payload = {
      customerId: data.customerId,
      type: data.type,
      notes: data.notes,
      measurements: Object.fromEntries(
        MEASUREMENT_FIELDS.map((f) => [f, data[f] ? Number(data[f]) : undefined]).filter(([, v]) => v !== undefined)
      ),
    };
    try {
      editing ? await updateMeasurement(editing._id, payload) : await createMeasurement(payload);
      toast.success(editing ? 'Measurement updated' : 'Measurement saved');
      closeModal(); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    try { await deleteMeasurement(id); toast.success('Deleted'); setDeleting(null); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  const columns = [
    { key: 'customerId', label: 'Customer', render: (v) => <span className="font-medium text-slate-200">{v?.name ?? '—'}</span> },
    { key: 'type', label: 'Type', render: (v) => <Badge label={v} className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 capitalize" /> },
    { key: 'measurements', label: 'Chest', render: (v) => v?.chest ? `${v.chest}"` : '—' },
    { key: 'measurements', label: 'Waist', render: (v) => v?.waist ? `${v.waist}"` : '—' },
    { key: 'measurements', label: 'Shoulder', render: (v) => v?.shoulder ? `${v.shoulder}"` : '—' },
    { key: 'measurements', label: 'Length', render: (v) => v?.length ? `${v.length}"` : '—' },
    { key: 'version', label: 'Version', render: (v) => <span className="text-slate-500">v{v ?? 1}</span> },
    { key: 'createdAt', label: 'Date', render: (v) => formatDate(v) },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button id={`edit-measurement-${row._id}`} onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"><Edit2 size={14} /></button>
          <button id={`delete-measurement-${row._id}`} onClick={() => setDeleting(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Measurements"
        subtitle="Customer clothing measurements"
        actions={
          <button id="add-measurement-btn" onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors glow-indigo">
            <Plus size={16} /> Add Measurement
          </button>
        }
      />
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input id="measurements-search" type="text" placeholder="Search measurements…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors" />
      </div>

      <DataTable columns={columns} data={measurements} loading={loading} emptyTitle="No measurements yet" emptyDescription="Add measurements for your customers." />

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Measurement' : 'Add Measurement'} size="lg">
        <form id="measurement-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Customer *</label>
              <select {...register('customerId', { required: 'Customer required' })} className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50">
                <option value="">Select customer…</option>
                {customers.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.customerCode}</option>)}
              </select>
              {errors.customerId && <p className="text-xs text-rose-400 mt-1">{errors.customerId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Clothing Type *</label>
              <select {...register('type', { required: 'Type required' })} className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 capitalize">
                <option value="">Select type…</option>
                {CLOTHING_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
              {errors.type && <p className="text-xs text-rose-400 mt-1">{errors.type.message}</p>}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2"><Ruler size={13} /> Measurements (in inches)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MEASUREMENT_FIELDS.map((field) => (
                <div key={field}>
                  <label className="block text-xs text-slate-500 mb-1 capitalize">{field}</label>
                  <input {...register(field)} type="number" step="0.5" min="0" placeholder='0"' className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
            <textarea {...register('notes')} rows={2} placeholder="Fitting notes…" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none" />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
            <button id="measurement-submit-btn" type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Delete Measurement" size="sm">
        <p className="text-slate-300 text-sm mb-5">Delete this <span className="text-white font-semibold capitalize">{deleting?.type}</span> measurement? This cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
          <button id="confirm-delete-measurement-btn" onClick={() => handleDelete(deleting?._id)} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
