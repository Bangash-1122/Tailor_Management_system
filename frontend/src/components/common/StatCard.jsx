import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color = 'indigo', trend, trendLabel, className = '' }) {
  const colorMap = {
    indigo:  { bg: 'from-indigo-500/20 to-indigo-600/10',  border: 'border-indigo-500/20', icon: 'bg-indigo-500/20 text-indigo-400', glow: 'glow-indigo' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', icon: 'bg-emerald-500/20 text-emerald-400', glow: 'glow-emerald' },
    violet:  { bg: 'from-violet-500/20 to-violet-600/10',  border: 'border-violet-500/20', icon: 'bg-violet-500/20 text-violet-400', glow: 'glow-violet' },
    amber:   { bg: 'from-amber-500/20 to-amber-600/10',   border: 'border-amber-500/20',  icon: 'bg-amber-500/20 text-amber-400',  glow: 'glow-amber' },
    rose:    { bg: 'from-rose-500/20 to-rose-600/10',     border: 'border-rose-500/20',   icon: 'bg-rose-500/20 text-rose-400',   glow: 'glow-rose' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className={`glass-card rounded-2xl p-5 border ${c.border} bg-gradient-to-br ${c.bg} ${c.glow} hover:-translate-y-1 transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-400 truncate">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white tracking-tight truncate">{value}</p>
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {trend >= 0
                ? <TrendingUp size={13} className="text-emerald-400 flex-shrink-0" />
                : <TrendingDown size={13} className="text-rose-400 flex-shrink-0" />}
              <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && <span className="text-xs text-slate-500">{trendLabel}</span>}
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
