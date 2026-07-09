import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../api/staff';
import { formatCurrency, formatDate, getInitials } from '../utils/helpers';

const ROLES = ['tailor','cutter','helper','receptionist'];
const ROLE_COLORS = {
  tailor:       'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  cutter:       'bg-violet-500/20 text-violet-400 border-violet-500/30',
  helper:       'bg-slate-500/20 text-slate-400 border-slate-500/30',
  receptionist: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

export default function Staff() {
  const [staff, setStaff]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStaff();
      setStaff(res.data.data || []);
    } catch { setStaff([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const openAdd  = () => { setEditing(null); reset({}); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); reset({ ...s, joiningDate: s.joiningDate?.slice(0,10) }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); reset({}); };

  const onSubmit = async (data) => {
    const payload = { ...data, salary: Number(data.salary) };
    try {
      editing ? await updateStaff(editing._id, payload) : await createStaff(payload);
      toast.success(editing ? 'Staff updated' : 'Staff added');
      closeModal(); fetchStaff();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    try { await deleteStaff(id); toast.success('Deleted'); setDeleting(null); fetchStaff(); }
    catch { toast.error('Delete failed'); }
  };

  const columns = [
    {
      key: 'name', label: 'Staff Member',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(v)}
          </div>
          <div>
            <p className="font-medium text-slate-200">{v}</p>
            <p className="text-xs text-slate-500">{row.phone || '—'}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'Role', render: (v) => <Badge label={v} className={`${ROLE_COLORS[v] ?? ROLE_COLORS.helper} capitalize`} /> },
    { key: 'salary', label: 'Salary', render: (v) => <span className="font-semibold text-emerald-400">{formatCurrency(v)}</span> },
    { key: 'joiningDate', label: 'Joined', render: (v) => formatDate(v) },
    {
      key: 'assignedOrders', label: 'Performance',
      render: (assigned, row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full w-20">
            <div
              className="h-1.5 bg-indigo-500 rounded-full transition-all"
              style={{ width: `${row.assignedOrders ? Math.round((row.completedOrders / row.assignedOrders) * 100) : 0}%` }}
            />
          </div>
          <span className="text-xs text-slate-400">{row.completedOrders}/{row.assignedOrders}</span>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (v) => <Badge label={v ? 'Active' : 'Inactive'} className={v ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'} /> },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button id={`edit-staff-${row._id}`} onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"><Edit2 size={14}/></button>
          <button id={`delete-staff-${row._id}`} onClick={() => setDeleting(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14}/></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Staff"
        subtitle={`${staff.length} team members`}
        actions={
          <button id="add-staff-btn" onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors glow-indigo">
            <Plus size={16} /> Add Staff
          </button>
        }
      />

      {/* Role Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ROLES.map((role) => {
          const count = staff.filter((s) => s.role === role).length;
          return (
            <div key={role} className={`glass-card rounded-xl border border-white/8 p-4`}>
              <p className="text-xs text-slate-400 capitalize mb-1">{role}s</p>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          );
        })}
      </div>

      <DataTable columns={columns} data={staff} loading={loading} emptyTitle="No staff yet" emptyDescription="Add your team members to get started." />

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Staff' : 'Add Staff Member'}>
        <form id="staff-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name *</label>
              <input {...register('name', { required: 'Required' })} placeholder="Ahmed Khan" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
              <input {...register('phone')} placeholder="03XX-XXXXXXX" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
              <select {...register('role')} className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 capitalize">
                {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Salary (Rs.)</label>
              <input {...register('salary')} type="number" min="0" placeholder="0" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Joining Date</label>
              <input {...register('joiningDate')} type="date" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select {...register('status')} className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50">
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5">Cancel</button>
            <button id="staff-submit-btn" type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-60">
              {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Add Staff'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Remove Staff" size="sm">
        <p className="text-slate-300 text-sm mb-5">Remove <span className="text-white font-semibold">{deleting?.name}</span> from staff?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5">Cancel</button>
          <button id="confirm-delete-staff-btn" onClick={() => handleDelete(deleting?._id)} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold">Remove</button>
        </div>
      </Modal>
    </div>
  );
}
