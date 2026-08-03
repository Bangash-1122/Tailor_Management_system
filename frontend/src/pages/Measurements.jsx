import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Ruler,
    FileText,
    Printer,
    UserRound,
    Shirt,
    Circle,
    MoveHorizontal,
    MoveVertical,
    Hand,
    Footprints,
    Scissors,
    Dumbbell,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import {
    getMeasurements,
    createMeasurement,
    updateMeasurement,
    deleteMeasurement,
} from '../api/measurements';
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
    shalwar: ['waist', 'hip', 'thigh', 'length', 'bottom', 'pancha'],
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

/*
 * Simple, consistent icons.
 * Every field has an icon, including Armhole and Collar Height.
 */
const FIELD_ICONS = {
    neck: UserRound,
    chest: Shirt,
    waist: Circle,
    hip: Circle,
    shoulder: MoveHorizontal,
    backWidth: MoveHorizontal,
    sleeve: Ruler,
    armhole: Circle,
    bicep: Dumbbell,
    cuff: Hand,
    wrist: Hand,
    rise: MoveVertical,
    thigh: Circle,
    knee: Circle,
    bottom: MoveHorizontal,
    inseam: MoveVertical,
    outseam: MoveVertical,
    length: Ruler,
    frontLength: MoveVertical,
    backLength: MoveVertical,
    neckDepth: MoveVertical,
    collarHeight: Shirt,
    sideSlit: Scissors,
    pancha: Footprints,
};

const MeasurementIcon = ({ field, size = 14, className = '' }) => {
    const Icon = FIELD_ICONS[field] || Ruler;

    return (
        <Icon
            size={size}
            strokeWidth={1.8}
            className={className}
            aria-hidden="true"
        />
    );
};

export default function Measurements() {
    const [measurements, setMeasurements] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [sheetMeasurement, setSheetMeasurement] = useState(null);

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

    const openMeasurementSheet = (measurement) => {
        setSheetMeasurement(measurement);
    };

    const closeMeasurementSheet = () => {
        setSheetMeasurement(null);
    };

    const printMeasurementSheet = () => {
        window.print();
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
            toast.error(
                err.response?.data?.message || 'Failed to save measurement'
            );
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
            render: (value) => (value?.chest ? `${value.chest}"` : '—'),
        },
        {
            id: 'col-waist',
            key: 'measurements',
            label: 'Waist',
            render: (value) => (value?.waist ? `${value.waist}"` : '—'),
        },
        {
            id: 'col-shoulder',
            key: 'measurements',
            label: 'Shoulder',
            render: (value) =>
                value?.shoulder ? `${value.shoulder}"` : '—',
        },
        {
            id: 'col-length',
            key: 'measurements',
            label: 'Length',
            render: (value) => (value?.length ? `${value.length}"` : '—'),
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
                        id={`view-measurement-sheet-${row._id}`}
                        type="button"
                        onClick={() => openMeasurementSheet(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                        aria-label="View and print measurement sheet"
                        title="View measurement sheet"
                    >
                        <FileText size={14} />
                    </button>

                    <button
                        id={`edit-measurement-${row._id}`}
                        type="button"
                        onClick={() => openEdit(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        aria-label="Edit measurement"
                        title="Edit measurement"
                    >
                        <Edit2 size={14} />
                    </button>

                    <button
                        id={`delete-measurement-${row._id}`}
                        type="button"
                        onClick={() => setDeleting(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        aria-label="Delete measurement"
                        title="Delete measurement"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    const sheetFields = sheetMeasurement
        ? MEASUREMENT_CONFIG[sheetMeasurement.type] ||
        Object.keys(sheetMeasurement.measurements || {})
        : [];

    const customer = sheetMeasurement?.customerId || {};

    return (
        <div className="space-y-5 animate-fade-in">
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }

                    #measurement-print-sheet,
                    #measurement-print-sheet * {
                        visibility: visible !important;
                    }

                    #measurement-print-sheet {
                        position: absolute !important;
                        inset: 0 !important;
                        width: 100% !important;
                        min-height: 100vh !important;
                        margin: 0 !important;
                        padding: 24px 34px !important;
                        background: white !important;
                        color: black !important;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    #measurement-print-sheet .no-print {
                        display: none !important;
                    }

                    @page {
                        size: A4;
                        margin: 12mm;
                    }
                }
            `}</style>

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
                                {customers.map((item) => (
                                    <option key={item._id} value={item._id}>
                                        {item.name} — {item.customerCode}
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
                                Select a clothing type to display its measurement
                                fields.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {visibleMeasurementFields.map((field) => (
                                    <div key={field}>
                                        <label
                                            htmlFor={`measurement-${field}`}
                                            className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"
                                        >
                                            <MeasurementIcon
                                                field={field}
                                                size={13}
                                                className="shrink-0 text-indigo-300/80"
                                            />
                                            <span>
                                                {FIELD_LABELS[field] || field}
                                            </span>
                                        </label>

                                        <input
                                            id={`measurement-${field}`}
                                            {...register(field, {
                                                setValueAs: (value) =>
                                                    value === ''
                                                        ? undefined
                                                        : Number(value),
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
                isOpen={Boolean(sheetMeasurement)}
                onClose={closeMeasurementSheet}
                title="Customer Measurement Sheet"
                size="lg"
            >
                {sheetMeasurement && (
                    <div
                        id="measurement-print-sheet"
                        className="rounded-xl bg-white text-slate-900 p-7"
                    >
                        <div className="text-center border-b border-slate-300 pb-4 mb-5">
                            <h1 className="text-2xl font-bold tracking-wide">
                                TAILOR MANAGEMENT SYSTEM
                            </h1>
                            <p className="text-sm mt-1">
                                Professional Tailoring Services
                            </p>
                            <h2 className="text-lg font-semibold mt-3">
                                CUSTOMER MEASUREMENT SHEET
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6">
                            <p>
                                <strong>Customer:</strong>{' '}
                                {customer?.name || '—'}
                            </p>
                            <p>
                                <strong>Customer Code:</strong>{' '}
                                {customer?.customerCode || '—'}
                            </p>
                            <p>
                                <strong>Phone:</strong>{' '}
                                {customer?.phone || '—'}
                            </p>
                            <p>
                                <strong>Date:</strong>{' '}
                                {formatDate(sheetMeasurement.createdAt)}
                            </p>
                            <p>
                                <strong>Clothing Type:</strong>{' '}
                                <span className="capitalize">
                                    {sheetMeasurement.type}
                                </span>
                            </p>
                            <p>
                                <strong>Version:</strong> v
                                {sheetMeasurement.version ?? 1}
                            </p>
                        </div>

                        <div className="mb-5">
                            <h3 className="font-semibold border-b border-slate-300 pb-2 mb-3">
                                Measurements (in inches)
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {sheetFields.map((field) => {
                                    const value =
                                        sheetMeasurement.measurements?.[field];

                                    return (
                                        <div
                                            key={field}
                                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-300 px-3 py-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <MeasurementIcon
                                                    field={field}
                                                    size={16}
                                                    className="text-slate-700"
                                                />
                                                <span className="text-sm">
                                                    {FIELD_LABELS[field] ||
                                                        field}
                                                </span>
                                            </div>

                                            <strong className="text-sm">
                                                {value !== undefined &&
                                                    value !== null &&
                                                    value !== ''
                                                    ? `${value}"`
                                                    : '—'}
                                            </strong>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-semibold border-b border-slate-300 pb-2 mb-2">
                                Fitting Notes
                            </h3>
                            <p className="min-h-14 text-sm whitespace-pre-wrap">
                                {sheetMeasurement.notes || 'No fitting notes.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-12 pt-8 text-sm">
                            <div className="border-t border-slate-500 pt-2 text-center">
                                Customer Signature
                            </div>
                            <div className="border-t border-slate-500 pt-2 text-center">
                                Tailor Signature
                            </div>
                        </div>

                        <p className="text-center text-xs mt-10">
                            Thank you for your business!
                        </p>

                        <div className="no-print flex justify-end gap-3 mt-7">
                            <button
                                type="button"
                                onClick={closeMeasurementSheet}
                                className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={printMeasurementSheet}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
                            >
                                <Printer size={16} />
                                Print Sheet
                            </button>
                        </div>
                    </div>
                )}
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