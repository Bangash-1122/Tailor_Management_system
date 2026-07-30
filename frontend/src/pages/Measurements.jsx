import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, Ruler } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { getMeasurements, createMeasurement, updateMeasurement, deleteMeasurement } from '../api/measurements';
import { getCustomers } from '../api/customers';
import { formatDate } from '../utils/helpers';

const CLOTHING_TYPES = [
    'shirt',
    'pant',
    'kurta',
    'shalwar',
    'trouser',
    'coat',
    'waistcoat',
    'sherwani',
    'blazer',
    'custom',
];

/*
 * Each clothing type displays only the measurements required for that garment.
 * All values are stored inside payload.measurements.
 */
const MEASUREMENT_CONFIG = {
    shirt: [
        'neck',
        'chest',
        'waist',
        'hip',
        'shoulder',
        'sleeve',
        'armhole',
        'bicep',
        'cuff',
        'length',
    ],
    pant: [
        'waist',
        'hip',
        'rise',
        'thigh',
        'knee',
        'bottom',
        'inseam',
        'outseam',
        'length',
    ],
    kurta: [
        'neck',
        'chest',
        'waist',
        'hip',
        'shoulder',
        'sleeve',
        'armhole',
        'bicep',
        'cuff',
        'length',
        'sideSlit',
    ],
    shalwar: [
        'waist',
        'hip',
        'thigh',
        'length',
        'bottom',
        'pancha',
    ],
    trouser: [
        'waist',
        'hip',
        'rise',
        'thigh',
        'knee',
        'bottom',
        'inseam',
        'outseam',
        'length',
    ],
    coat: [
        'neck',
        'chest',
        'waist',
        'hip',
        'shoulder',
        'backWidth',
        'sleeve',
        'armhole',
        'bicep',
        'wrist',
        'length',
    ],
    waistcoat: [
        'chest',
        'waist',
        'hip',
        'shoulder',
        'armhole',
        'neckDepth',
        'frontLength',
        'backLength',
    ],
    sherwani: [
        'neck',
        'chest',
        'waist',
        'hip',
        'shoulder',
        'backWidth',
        'sleeve',
        'armhole',
        'bicep',
        'wrist',
        'length',
        'collarHeight',
        'sideSlit',
    ],
    blazer: [
        'neck',
        'chest',
        'waist',
        'hip',
        'shoulder',
        'backWidth',
        'sleeve',
        'armhole',
        'bicep',
        'wrist',
        'length',
    ],
    custom: [
        'neck',
        'chest',
        'waist',
        'hip',
        'shoulder',
        'backWidth',
        'sleeve',
        'armhole',
        'bicep',
        'cuff',
        'wrist',
        'rise',
        'thigh',
        'knee',
        'bottom',
        'inseam',
        'outseam',
        'length',
        'frontLength',
        'backLength',
        'neckDepth',
        'collarHeight',
        'sideSlit',
        'pancha',
    ],
};

const ALL_MEASUREMENT_FIELDS = [
    ...new Set(Object.values(MEASUREMENT_CONFIG).flat()),
];

const FIELD_LABELS = {
    neck: 'Neck',
    chest: 'Chest',
    waist: 'Waist',
    hip: 'Hip',
    shoulder: 'Shoulder',
    backWidth: 'Back Width',
    sleeve: 'Sleeve',
    armhole: 'Armhole',
    bicep: 'Bicep',
    cuff: 'Cuff',
    wrist: 'Wrist',
    rise: 'Rise',
    thigh: 'Thigh',
    knee: 'Knee',
    bottom: 'Bottom',
    inseam: 'Inseam',
    outseam: 'Outseam',
    length: 'Length',
    frontLength: 'Front Length',
    backLength: 'Back Length',
    neckDepth: 'Neck Depth',
    collarHeight: 'Collar Height',
    sideSlit: 'Side Slit',
    pancha: 'Pancha',
};

export default function Measurements() {
    const [measurements, setMeasurements] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        unregister,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            customerId: '',
            type: '',
            notes: '',
        },
    });

    const selectedType = watch('type');

    const visibleMeasurementFields = useMemo(
        () => MEASUREMENT_CONFIG[selectedType] || [],
        [selectedType]
    );

    const fetchAll = useCallback(async () => {
        setLoading(true);

        try {
            const [mRes, cRes] = await Promise.all([
                getMeasurements({ search }),
                getCustomers(),
            ]);

            const mData = mRes.data.data;
            const cData = cRes.data.data;

            setMeasurements(
                Array.isArray(mData) ? mData : mData?.measurements || []
            );
            setCustomers(Array.isArray(cData) ? cData : cData?.customers || []);
        } catch {
            setMeasurements([]);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    /*
     * Remove hidden fields from react-hook-form whenever the garment changes.
     * This prevents measurements from the previous garment being submitted.
     */
    useEffect(() => {
        if (!selectedType) return;

        const allowedFields = new Set(MEASUREMENT_CONFIG[selectedType] || []);

        ALL_MEASUREMENT_FIELDS.forEach((field) => {
            if (!allowedFields.has(field)) {
                unregister(field);
            }
        });
    }, [selectedType, unregister]);

    const openAdd = () => {
        setEditing(null);
        reset({
            customerId: '',
            type: '',
            notes: '',
        });
        setShowModal(true);
    };

    const openEdit = (measurement) => {
        setEditing(measurement);

        reset({
            customerId:
                measurement.customerId?._id || measurement.customerId || '',
            type: measurement.type || '',
            notes: measurement.notes || '',
            ...(measurement.measurements || {}),
        });

        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        reset({
            customerId: '',
            type: '',
            notes: '',
        });
    };

    const onSubmit = async (data) => {
        const fieldsForSelectedType = MEASUREMENT_CONFIG[data.type] || [];

        const measurementValues = Object.fromEntries(
            fieldsForSelectedType
                .map((field) => {
                    const rawValue = data[field];

                    if (
                        rawValue === undefined ||
                        rawValue === null ||
                        rawValue === ''
                    ) {
                        return null;
                    }

                    return [field, Number(rawValue)];
                })
                .filter(Boolean)
        );

        const payload = {
            customerId: data.customerId,
            type: data.type,
            notes: data.notes?.trim() || '',
            measurements: measurementValues,
        };

        try {
            if (editing) {
                await updateMeasurement(editing._id, payload);
            } else {
                await createMeasurement(payload);
            }

            toast.success(editing ? 'Measurement updated' : 'Measurement saved');
            closeModal();
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save measurement');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteMeasurement(id);
            toast.success('Deleted');
            setDeleting(null);
            fetchAll();
        } catch {
            toast.error('Delete failed');
        }
    };

    const columns = [
        {
            id: 'col-customer',
            key: 'customerId',
            label: 'Customer',
            render: (value) => (
                <span className="font-medium text-slate-200">
                    {value?.name ?? '—'}
                </span>
            ),
        },
        {
            id: 'col-type',
            key: 'type',
            label: 'Type',
            render: (value) => (
                <Badge
                    label={value}
                    className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 capitalize"
                />
            ),
        },
        {
            id: 'col-chest',
            key: 'measurements',
            label: 'Chest',
            render: (value) => value?.chest ? `${value.chest}"` : '—',
        },
        {
            id: 'col-waist',
            key: 'measurements',
            label: 'Waist',
            render: (value) => value?.waist ? `${value.waist}"` : '—',
        },
        {
            id: 'col-shoulder',
            key: 'measurements',
            label: 'Shoulder',
            render: (value) => value?.shoulder ? `${value.shoulder}"` : '—',
        },
        {
            id: 'col-length',
            key: 'measurements',
            label: 'Length',
            render: (value) => value?.length ? `${value.length}"` : '—',
        },
        {
            id: 'col-version',
            key: 'version',
            label: 'Version',
            render: (value) => (
                <span className="text-slate-500">v{value ?? 1}</span>
            ),
        },
        {
            id: 'col-date',
            key: 'createdAt',
            label: 'Date',
            render: (value) => formatDate(value),
        },
        {
            key: '_id',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <button
                        id={`edit-measurement-${row._id}`}
                        type="button"
                        onClick={() => openEdit(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        aria-label="Edit measurement"
                    >
                        <Edit2 size={14} />
                    </button>

                    <button
                        id={`delete-measurement-${row._id}`}
                        type="button"
                        onClick={() => setDeleting(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        aria-label="Delete measurement"
                    >
                        <Trash2 size={14} />
                    </button>
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
                    <button
                        id="add-measurement-btn"
                        type="button"
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors glow-indigo"
                    >
                        <Plus size={16} />
                        Add Measurement
                    </button>
                }
            />

            <div className="relative max-w-sm">
                <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                    id="measurements-search"
                    type="text"
                    placeholder="Search measurements…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
            </div>

            <DataTable
                columns={columns}
                data={measurements}
                loading={loading}
                emptyTitle="No measurements yet"
                emptyDescription="Add measurements for your customers."
            />

            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={editing ? 'Edit Measurement' : 'Add Measurement'}
                size="lg"
            >
                <form
                    id="measurement-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                Customer *
                            </label>

                            <select
                                {...register('customerId', {
                                    required: 'Customer required',
                                })}
                                className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                            >
                                <option value="">Select customer…</option>
                                {customers.map((customer) => (
                                    <option key={customer._id} value={customer._id}>
                                        {customer.name} — {customer.customerCode}
                                    </option>
                                ))}
                            </select>

                            {errors.customerId && (
                                <p className="text-xs text-rose-400 mt-1">
                                    {errors.customerId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                Clothing Type *
                            </label>

                            <select
                                {...register('type', {
                                    required: 'Type required',
                                })}
                                className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 capitalize"
                            >
                                <option value="">Select type…</option>
                                {CLOTHING_TYPES.map((type) => (
                                    <option
                                        key={type}
                                        value={type}
                                        className="capitalize"
                                    >
                                        {type}
                                    </option>
                                ))}
                            </select>

                            {errors.type && (
                                <p className="text-xs text-rose-400 mt-1">
                                    {errors.type.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
                            <Ruler size={13} />
                            Measurements (in inches)
                        </p>

                        {!selectedType ? (
                            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-center text-sm text-slate-500">
                                Select a clothing type to display its measurement fields.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {visibleMeasurementFields.map((field) => (
                                    <div key={field}>
                                        <label
                                            htmlFor={`measurement-${field}`}
                                            className="block text-xs text-slate-500 mb-1"
                                        >
                                            {FIELD_LABELS[field] || field}
                                        </label>

                                        <input
                                            id={`measurement-${field}`}
                                            {...register(field, {
                                                setValueAs: (value) =>
                                                    value === '' ? undefined : Number(value),
                                                validate: (value) =>
                                                    value === undefined ||
                                                    value >= 0 ||
                                                    'Value cannot be negative',
                                            })}
                                            type="number"
                                            step="0.25"
                                            min="0"
                                            placeholder='0"'
                                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                        />

                                        {errors[field] && (
                                            <p className="text-xs text-rose-400 mt-1">
                                                {errors[field].message}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                            Notes
                        </label>

                        <textarea
                            {...register('notes')}
                            rows={2}
                            placeholder="Fitting notes…"
                            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            id="measurement-submit-btn"
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                            {isSubmitting
                                ? 'Saving…'
                                : editing
                                    ? 'Update'
                                    : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                title="Delete Measurement"
                size="sm"
            >
                <p className="text-slate-300 text-sm mb-5">
                    Delete this{' '}
                    <span className="text-white font-semibold capitalize">
                        {deleting?.type}
                    </span>{' '}
                    measurement? This cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setDeleting(null)}
                        className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        id="confirm-delete-measurement-btn"
                        type="button"
                        onClick={() => handleDelete(deleting?._id)}
                        className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </div>
    );
}