/**
 * Shared measurement configuration used by both Measurements.jsx and OrderReviewDrawer.
 * Extracted here to avoid duplication.
 */

export const MEASUREMENT_CONFIG = {
  shirt: ['neck','chest','waist','hip','shoulder','sleeve','armhole','bicep','cuff','length'],
  pant: ['waist','hip','rise','thigh','knee','bottom','inseam','outseam','length'],
  kurta: ['neck','chest','waist','hip','shoulder','sleeve','armhole','bicep','cuff','length','sideSlit'],
  shalwar: ['waist','hip','thigh','length','bottom','pancha'],
  trouser: ['waist','hip','rise','thigh','knee','bottom','inseam','outseam','length'],
  coat: ['neck','chest','waist','hip','shoulder','backWidth','sleeve','armhole','bicep','wrist','length'],
  waistcoat: ['chest','waist','hip','shoulder','armhole','neckDepth','frontLength','backLength'],
  sherwani: ['neck','chest','waist','hip','shoulder','backWidth','sleeve','armhole','bicep','wrist','length','collarHeight','sideSlit'],
  blazer: ['neck','chest','waist','hip','shoulder','backWidth','sleeve','armhole','bicep','wrist','length'],
  custom: ['neck','chest','waist','hip','shoulder','backWidth','sleeve','armhole','bicep','cuff','wrist','rise','thigh','knee','bottom','inseam','outseam','length','frontLength','backLength','neckDepth','collarHeight','sideSlit','pancha'],
};

export const FIELD_LABELS = {
  neck: 'Neck', chest: 'Chest', waist: 'Waist', hip: 'Hip',
  shoulder: 'Shoulder', backWidth: 'Back Width', sleeve: 'Sleeve',
  armhole: 'Armhole', bicep: 'Bicep', cuff: 'Cuff', wrist: 'Wrist',
  rise: 'Rise', thigh: 'Thigh', knee: 'Knee', bottom: 'Bottom',
  inseam: 'Inseam', outseam: 'Outseam', length: 'Length',
  frontLength: 'Front Length', backLength: 'Back Length',
  neckDepth: 'Neck Depth', collarHeight: 'Collar Height',
  sideSlit: 'Side Slit', pancha: 'Pancha',
};

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

export const FIELD_ICONS = {
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

export function MeasurementIcon({ field, size = 26, className = '' }) {
  const Icon = FIELD_ICONS[field];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}
