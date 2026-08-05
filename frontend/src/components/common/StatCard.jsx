import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function StatCard({ title, value, icon: Icon, color = 'indigo', trend, trendLabel, className = '' }) {
  const { currentThemeObj } = useTheme();
  const isDark = currentThemeObj?.isDark;

  const colorMap = {
    indigo:  { bg: isDark ? 'from-indigo-500/20 to-indigo-600/10' : 'from-indigo-50 to-indigo-100/50', border: isDark ? 'border-indigo-500/20' : 'border-indigo-200', icon: isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600', glow: 'glow-indigo' },
    emerald: { bg: isDark ? 'from-emerald-500/20 to-emerald-600/10' : 'from-emerald-50 to-emerald-100/50', border: isDark ? 'border-emerald-500/20' : 'border-emerald-200', icon: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600', glow: 'glow-emerald' },
    violet:  { bg: isDark ? 'from-violet-500/20 to-violet-600/10' : 'from-violet-50 to-violet-100/50', border: isDark ? 'border-violet-500/20' : 'border-violet-200', icon: isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-600', glow: 'glow-violet' },
    amber:   { bg: isDark ? 'from-amber-500/20 to-amber-600/10' : 'from-amber-50 to-amber-100/50', border: isDark ? 'border-amber-500/20' : 'border-amber-200', icon: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600', glow: 'glow-amber' },
    rose:    { bg: isDark ? 'from-rose-500/20 to-rose-600/10' : 'from-rose-50 to-rose-100/50', border: isDark ? 'border-rose-500/20' : 'border-rose-200', icon: isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600', glow: 'glow-rose' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${c.border} ${c.bg} ${c.glow} hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>{value}</p>
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {trend >= 0
                ? <TrendingUp size={13} className="text-emerald-400 flex-shrink-0" />
                : <TrendingDown size={13} className="text-rose-400 flex-shrink-0" />}
              <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 ${c.icon}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
