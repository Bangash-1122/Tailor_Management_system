export const formatCurrency = (amount = 0) =>
  `Rs. ${Number(amount).toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const truncate = (str, n = 40) =>
  str && str.length > n ? str.slice(0, n) + '…' : str;

export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export const ORDER_STATUS_COLORS = {
  pending:    'bg-amber-500/20 text-amber-500 border-amber-500/30',
  cutting:    'bg-indigo-500/20 text-indigo-500 border-indigo-500/30',
  stitching:  'bg-purple-500/20 text-purple-500 border-purple-500/30',
  trial:      'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
  ready:      'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
  delivered:  'bg-blue-500/20 text-blue-500 border-blue-500/30',
  cancelled:  'bg-red-500/20 text-red-500 border-red-500/30',
  overdue:    'bg-rose-500/20 text-rose-500 border-rose-500/30',
  completed:  'bg-green-500/20 text-green-500 border-green-500/30',
};

export const PRIORITY_COLORS = {
  low:    'bg-slate-500/20 text-slate-400 border-slate-500/30',
  normal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  high:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
  urgent: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};
