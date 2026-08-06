import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Ruler,
    FileText,
    Printer,
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
 * Custom tailoring SVG icons.
 * All measurement fields use purpose-built SVGs instead of generic Lucide icons.
 */
const SvgBase = ({ size = 26, className = '', children }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        {children}
    </svg>
);

const FIELD_ICONS = {
    neck: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M8 4v3c0 1.6-1.1 2.8-3 3.8" />
            <path d="M16 4v3c0 1.6 1.1 2.8 3 3.8" />
            <path d="M6 11c1.8 2 3.8 3 6 3s4.2-1 6-3" />
            <path d="M7 18c1.5-1.4 3.2-2 5-2s3.5.6 5 2" />
        </SvgBase>
    ),
    chest: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M8 4 4 7l3 4 2-1v10h6V10l2 1 3-4-4-3" />
            <path d="M9 4c.6 1.5 1.6 2.2 3 2.2S14.4 5.5 15 4" />
            <path d="M7.5 12h9" /><path d="m7.5 12 1.7-1.7" /><path d="m7.5 12 1.7 1.7" />
            <path d="m16.5 12-1.7-1.7" /><path d="m16.5 12-1.7 1.7" />
        </SvgBase>
    ),
    waist: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M8 4c0 3 1.2 5 2 7-1.1 2.2-2 5-2 9" />
            <path d="M16 4c0 3-1.2 5-2 7 1.1 2.2 2 5 2 9" />
            <path d="M7 11h10" /><path d="m7 11 2-2" /><path d="m7 11 2 2" />
            <path d="m17 11-2-2" /><path d="m17 11-2 2" />
        </SvgBase>
    ),
    hip: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M9 4c0 3-.8 5.3-2 7 1.6 2.1 2.4 5.1 2.5 9" />
            <path d="M15 4c0 3 .8 5.3 2 7-1.6 2.1-2.4 5.1-2.5 9" />
            <path d="M6.5 13h11" /><path d="m6.5 13 2-2" /><path d="m6.5 13 2 2" />
            <path d="m17.5 13-2-2" /><path d="m17.5 13-2 2" />
        </SvgBase>
    ),
    shoulder: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M4 17c1-3.5 3.3-5.5 6-5.5h4c2.7 0 5 2 6 5.5" />
            <path d="M7 8c1.4 1.2 3 1.8 5 1.8S15.6 9.2 17 8" />
            <path d="M5 6h14" /><path d="m5 6 2-2" /><path d="m5 6 2 2" />
            <path d="m19 6-2-2" /><path d="m19 6-2 2" />
        </SvgBase>
    ),
    backWidth: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M6 20V9c0-2 1.5-3.5 3.5-4.2L12 4l2.5.8C16.5 5.5 18 7 18 9v11" />
            <path d="M8 11h8" /><path d="m8 11 2-2" /><path d="m8 11 2 2" />
            <path d="m16 11-2-2" /><path d="m16 11-2 2" />
        </SvgBase>
    ),
    sleeve: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M8 5c2 1 6 1 8 0" />
            <path d="M8 5 5 8l3 3 2-2 1 10" />
            <path d="M16 5l3 3-3 3-2-2-1 10" />
            <path d="M10.8 19h2.4" />
            <path d="M9 8.5 12 18l3-9.5" />
        </SvgBase>
    ),
    armhole: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M8 4h8" />
            <path d="M8 4c0 2.8-1 5-3 7v9" />
            <path d="M16 4c0 2.8 1 5 3 7v9" />
            <path d="M8.5 7.5c2.6.8 3.8 3 3.5 6.5" />
            <path d="M15.5 7.5c-2.6.8-3.8 3-3.5 6.5" />
            <path d="M9 17h6" />
        </SvgBase>
    ),
    bicep: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M9 4c1.4 2.2 1.4 4.2 0 6" /><path d="M15 4c-1.4 2.2-1.4 4.2 0 6" />
            <path d="M8 10c1.6-1 2.8-.8 4 .5 1.2-1.3 2.4-1.5 4-.5" />
            <path d="M7 13h10" /><path d="m7 13 2-2" /><path d="m7 13 2 2" />
            <path d="m17 13-2-2" /><path d="m17 13-2 2" /><path d="M9 20h6" />
        </SvgBase>
    ),
    cuff: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M8 4v7M16 4v7" /><rect x="7" y="11" width="10" height="7" rx="1.5" />
            <circle cx="12" cy="14.5" r="1" /><path d="M6 15h12" />
        </SvgBase>
    ),
    wrist: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M9 4v7M12 3v8M15 4v7M7 6v6c0 4 2 7 5 8 3-1 5-4 5-8V7" />
            <path d="M7.5 15h9" /><path d="M9 17h6" />
        </SvgBase>
    ),
    rise: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M7 4h10l1 16h-5l-1-7-1 7H6L7 4Z" />
            <path d="M15 6v9" /><path d="m15 6-1.5 1.5" /><path d="m15 6 1.5 1.5" />
            <path d="m15 15-1.5-1.5" /><path d="m15 15 1.5-1.5" />
        </SvgBase>
    ),
    thigh: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M9 4c-.5 5-1 10-1 16M15 4c.5 5 1 10 1 16" />
            <path d="M7.5 11h9" /><path d="m7.5 11 2-2" /><path d="m7.5 11 2 2" />
            <path d="m16.5 11-2-2" /><path d="m16.5 11-2 2" />
        </SvgBase>
    ),
    knee: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M9 4c-.2 4-.6 7-1 10 .4 2 .7 4 .8 6M15 4c.2 4 .6 7 1 10-.4 2-.7 4-.8 6" />
            <path d="M7.8 14h8.4" /><path d="m7.8 14 1.7-1.7" /><path d="m7.8 14 1.7 1.7" />
            <path d="m16.2 14-1.7-1.7" /><path d="m16.2 14-1.7 1.7" />
        </SvgBase>
    ),
    bottom: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M8 4v15M16 4v15M7 19h10" />
            <path d="M8 16h8" /><path d="m8 16 2-2" /><path d="m8 16 2 2" />
            <path d="m16 16-2-2" /><path d="m16 16-2 2" />
        </SvgBase>
    ),
    inseam: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M7 4h10l1 16h-5l-1-8-1 8H6L7 4Z" />
            <path d="M12 10v9" /><path d="m12 10-1.5 1.5" /><path d="m12 19-1.5-1.5" />
        </SvgBase>
    ),
    outseam: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M7 4h10l1 16h-5l-1-8-1 8H6L7 4Z" />
            <path d="M18.5 5v14" /><path d="m18.5 5-1.5 1.5" /><path d="m18.5 19-1.5-1.5" />
        </SvgBase>
    ),
    length: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M8 4 4 7l3 4 2-1v10h6V10l2 1 3-4-4-3" />
            <path d="M12 6v13" /><path d="m12 6-1.5 1.5" /><path d="m12 19-1.5-1.5" />
        </SvgBase>
    ),
    frontLength: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M8 4 4 7l3 4 2-1v10h6V10l2 1 3-4-4-3" />
            <path d="M12 5v14" /><path d="m12 5-1.5 1.5" /><path d="m12 19-1.5-1.5" />
            <path d="M9 9h6" />
        </SvgBase>
    ),
    backLength: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M8 4 4 7l3 4 2-1v10h6V10l2 1 3-4-4-3" />
            <path d="M9 5h6" /><path d="M12 5v14" /><path d="m12 5-1.5 1.5" /><path d="m12 19-1.5-1.5" />
        </SvgBase>
    ),
    neckDepth: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M5 7c2.5 0 3.7-1 4.5-3M19 7c-2.5 0-3.7-1-4.5-3" />
            <path d="M9.5 4c0 4 1 7 2.5 9 1.5-2 2.5-5 2.5-9" />
            <path d="M12 5v8" /><path d="m12 13-1.5-1.5" /><path d="m12 13 1.5-1.5" />
        </SvgBase>
    ),
    collarHeight: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M7 7 10 4l2 3 2-3 3 3-2 5H9L7 7Z" />
            <path d="M18 5v7" /><path d="m18 5-1.5 1.5" /><path d="m18 12-1.5-1.5" />
            <path d="M9 12v4M15 12v4" />
        </SvgBase>
    ),
    sideSlit: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M8 4v16h4v-6M16 4v16h-4" />
            <path d="M18.5 13v7" /><path d="m18.5 13-1.5 1.5" /><path d="m18.5 20-1.5-1.5" />
        </SvgBase>
    ),
    pancha: ({ size, className }) => (
        <SvgBase size={size} className={className}>
            <path d="M8 4v14M16 4v14" /><path d="M7 16h10M7 19h10" />
            <path d="M9 19c-.5 1.4-1.5 2-3 2M15 19c.5 1.4 1.5 2 3 2" />
        </SvgBase>
    ),
};

const MeasurementIcon = ({ field, size = 26, className = '' }) => {
    const Icon = FIELD_ICONS[field] || FIELD_ICONS.length;
    return <Icon size={size} className={className} />;
};

export default function Measurements() {
    const { t } = useTranslation();
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

            toast.success(editing ? t('measurements.measurementUpdated') : t('measurements.measurementSaved'));
            closeModal();
            fetchAll();
        } catch (err) {
            toast.error(
                err.response?.data?.message || t('measurements.saveFailed')
            );
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteMeasurement(id);
            toast.success(t('measurements.deleted'));
            setDeleting(null);
            fetchAll();
        } catch {
            toast.error(t('measurements.deleteFailed'));
        }
    };

    const columns = [
        {
            id: 'col-customer',
            key: 'customerId',
            label: t('common.customer'),
            render: (value) => (
                <span className="font-medium text-slate-200">
                    {value?.name ?? '—'}
                </span>
            ),
        },
        {
            id: 'col-type',
            key: 'type',
            label: t('measurements.type'),
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
            label: t('measurements.chest'),
            render: (value) => (value?.chest ? `${value.chest}"` : '—'),
        },
        {
            id: 'col-waist',
            key: 'measurements',
            label: t('measurements.waist'),
            render: (value) => (value?.waist ? `${value.waist}"` : '—'),
        },
        {
            id: 'col-shoulder',
            key: 'measurements',
            label: t('measurements.shoulder'),
            render: (value) =>
                value?.shoulder ? `${value.shoulder}"` : '—',
        },
        {
            id: 'col-length',
            key: 'measurements',
            label: t('measurements.length'),
            render: (value) => (value?.length ? `${value.length}"` : '—'),
        },
        {
            id: 'col-version',
            key: 'version',
            label: t('measurements.version'),
            render: (value) => (
                <span className="text-slate-500">v{value ?? 1}</span>
            ),
        },
        {
            id: 'col-date',
            key: 'createdAt',
            label: t('measurements.date'),
            render: (value) => formatDate(value),
        },
        {
            key: '_id',
            label: t('common.actions'),
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <button
                        id={`view-measurement-sheet-${row._id}`}
                        type="button"
                        onClick={() => openMeasurementSheet(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                        aria-label={t('measurements.viewMeasurementSheet')}
                        title={t('measurements.viewMeasurementSheet')}
                    >
                        <FileText size={14} />
                    </button>

                    <button
                        id={`edit-measurement-${row._id}`}
                        type="button"
                        onClick={() => openEdit(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        aria-label={t('common.edit')}
                        title={t('common.edit')}
                    >
                        <Edit2 size={14} />
                    </button>

                    <button
                        id={`delete-measurement-${row._id}`}
                        type="button"
                        onClick={() => setDeleting(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        aria-label={t('common.delete')}
                        title={t('common.delete')}
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
                title={t('measurements.title')}
                subtitle={t('measurements.subtitle')}
                actions={
                    <button
                        id="add-measurement-btn"
                        type="button"
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors glow-indigo"
                    >
                        <Plus size={16} />
                        {t('measurements.addMeasurement')}
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
                    placeholder={t('measurements.searchPlaceholder')}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
            </div>

            <DataTable
                columns={columns}
                data={measurements}
                loading={loading}
                emptyTitle={t('measurements.noMeasurementsYet')}
                emptyDescription={t('measurements.noMeasurementsDescription')}
            />

            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={editing ? t('measurements.editMeasurement') : t('measurements.addMeasurement')}
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
                                {t('common.customer')} *
                            </label>

                            <select
                                {...register('customerId', {
                                    required: t('validation.required'),
                                })}
                                className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                            >
                                <option value="">{t('measurements.selectCustomer')}</option>
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
                                {t('measurements.clothingType')} *
                            </label>

                            <select
                                {...register('type', {
                                    required: t('validation.required'),
                                })}
                                className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 capitalize"
                            >
                                <option value="">{t('measurements.selectType')}</option>
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
                            {t('measurements.measurementsInches')}
                        </p>

                        {!selectedType ? (
                            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-center text-sm text-slate-500">
                                {t('measurements.selectTypePrompt')}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5">
                                {visibleMeasurementFields.map((field) => (
                                    <div key={field}>
                                        <label
                                            htmlFor={`measurement-${field}`}
                                            className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2"
                                        >
                                            <MeasurementIcon
                                                field={field}
                                                size={18}
                                                className="shrink-0 text-indigo-300/80"
                                            />
                                            <span>
                                                {t(`measurements.fields.${field}`) || FIELD_LABELS[field] || field}
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
                                                    t('validation.negativeValue'),
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
                            {t('common.notes')}
                        </label>

                        <textarea
                            {...register('notes')}
                            rows={2}
                            placeholder={t('measurements.fittingNotes')}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>

                        <button
                            id="measurement-submit-btn"
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                            {isSubmitting
                                ? t('common.loading')
                                : editing
                                    ? t('common.update')
                                    : t('common.save')}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={Boolean(sheetMeasurement)}
                onClose={closeMeasurementSheet}
                title={t('measurements.measurementSheet')}
                size="lg"
            >
                {sheetMeasurement && (
                    <div
                        id="measurement-print-sheet"
                        className="rounded-xl bg-white text-slate-900 p-7"
                    >
                        <div className="text-center border-b border-slate-300 pb-4 mb-5">
                            <h1 className="text-2xl font-bold tracking-wide">
                                {t('measurements.sheetTitle')}
                            </h1>
                            <p className="text-sm mt-1">
                                {t('measurements.sheetSubtitle')}
                            </p>
                            <h2 className="text-lg font-semibold mt-3">
                                {t('measurements.sheetHeading')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6">
                            <p>
                                <strong>{t('common.customer')}:</strong>{' '}
                                {customer?.name || '—'}
                            </p>
                            <p>
                                <strong>{t('measurements.customerCode')}:</strong>{' '}
                                {customer?.customerCode || '—'}
                            </p>
                            <p>
                                <strong>{t('common.phone')}:</strong>{' '}
                                {customer?.phone || '—'}
                            </p>
                            <p>
                                <strong>{t('measurements.date')}:</strong>{' '}
                                {formatDate(sheetMeasurement.createdAt)}
                            </p>
                            <p>
                                <strong>{t('measurements.clothingType')}:</strong>{' '}
                                <span className="capitalize">
                                    {sheetMeasurement.type}
                                </span>
                            </p>
                            <p>
                                <strong>{t('measurements.version')}:</strong> v
                                {sheetMeasurement.version ?? 1}
                            </p>
                        </div>

                        <div className="mb-5">
                            <h3 className="font-semibold border-b border-slate-300 pb-2 mb-3">
                                {t('measurements.measurementsInches')}
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
                                                    size={18}
                                                    className="text-slate-700"
                                                />
                                                <span className="text-sm">
                                                    {t(`measurements.fields.${field}`) || FIELD_LABELS[field] ||
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
                                {t('measurements.fittingNotes')}
                            </h3>
                            <p className="min-h-14 text-sm whitespace-pre-wrap">
                                {sheetMeasurement.notes || t('measurements.noFittingNotes')}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-12 pt-8 text-sm">
                            <div className="border-t border-slate-500 pt-2 text-center">
                                {t('measurements.customerSignature')}
                            </div>
                            <div className="border-t border-slate-500 pt-2 text-center">
                                {t('measurements.tailorSignature')}
                            </div>
                        </div>

                        <p className="text-center text-xs mt-10">
                            {t('measurements.thankYou')}
                        </p>

                        <div className="no-print flex justify-end gap-3 mt-7">
                            <button
                                type="button"
                                onClick={closeMeasurementSheet}
                                className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100"
                            >
                                {t('common.close')}
                            </button>

                            <button
                                type="button"
                                onClick={printMeasurementSheet}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
                            >
                                <Printer size={16} />
                                {t('measurements.printSheet')}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                title={t('measurements.deleteMeasurement')}
                size="sm"
            >
                <p className="text-slate-300 text-sm mb-5">
                    {t('measurements.deleteConfirmation', { type: deleting?.type })}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setDeleting(null)}
                        className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors"
                    >
                        {t('common.cancel')}
                    </button>

                    <button
                        id="confirm-delete-measurement-btn"
                        type="button"
                        onClick={() => handleDelete(deleting?._id)}
                        className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
                    >
                        {t('common.delete')}
                    </button>
                </div>
            </Modal>
        </div>
    );
}