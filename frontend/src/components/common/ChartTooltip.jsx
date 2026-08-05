import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/helpers';

export default function ChartTooltip({ active, payload, label, valueFormatter }) {
  const { currentThemeObj } = useTheme();
  if (!active || !payload?.length) return null;

  const isDark = currentThemeObj?.isDark;

  return (
    <div
      className={`rounded-xl px-4 py-3 text-xs transition-all duration-200 ${
        isDark
          ? 'bg-[#0f172a] border border-white/15 text-white shadow-2xl'
          : 'bg-white border border-[#E2E8F0] text-[#0F172A]'
      }`}
      style={{
        boxShadow: isDark
          ? '0 20px 40px rgba(0, 0, 0, 0.5)'
          : '0 10px 30px rgba(15, 23, 42, 0.12)',
      }}
    >
      {label && (
        <p
          className={`mb-1.5 font-medium ${
            isDark ? 'text-slate-400' : 'text-[#64748B]'
          }`}
        >
          {label}
        </p>
      )}

      {payload.map((p, idx) => {
        const itemColor = p.color || p.fill || p.payload?.fill || 'var(--primary)';
        const formattedVal = valueFormatter
          ? valueFormatter(p.value)
          : typeof p.value === 'number' && p.value > 100
          ? formatCurrency(p.value)
          : `${p.value}`;

        return (
          <p key={p.name || idx} className="font-semibold flex items-center gap-2 my-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
              style={{ backgroundColor: itemColor }}
            />
            <span className={isDark ? 'text-slate-300' : 'text-[#1E293B]'}>
              {p.name}:
            </span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              {formattedVal}
            </span>
          </p>
        );
      })}
    </div>
  );
}
