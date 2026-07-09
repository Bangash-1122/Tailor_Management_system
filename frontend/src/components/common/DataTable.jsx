import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export default function DataTable({
  columns, data, loading = false,
  sortKey, sortDir, onSort,
  emptyTitle, emptyDescription,
}) {
  const SortIcon = ({ col }) => {
    if (!onSort || !col.sortable) return null;
    if (sortKey !== col.key) return <ChevronsUpDown size={13} className="text-slate-600 ml-1 flex-shrink-0" />;
    return sortDir === 'asc'
      ? <ChevronUp size={13} className="text-indigo-400 ml-1 flex-shrink-0" />
      : <ChevronDown size={13} className="text-indigo-400 ml-1 flex-shrink-0" />;
  };

  return (
    <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/2">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${
                    col.sortable && onSort ? 'cursor-pointer hover:text-slate-200 select-none' : ''
                  }`}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div className="flex items-center">
                    {col.label}
                    <SortIcon col={col} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row._id || i}
                  className="hover:bg-white/3 transition-colors duration-150 group"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-300 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
