import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export default function DataTable({
  columns, data, loading = false,
  sortKey, sortDir, onSort,
  emptyTitle, emptyDescription,
}) {
  const { currentThemeObj } = useTheme();
  const isDark = currentThemeObj?.isDark;

  const SortIcon = ({ col }) => {
    if (!onSort || !col.sortable) return null;
    if (sortKey !== col.key) return <ChevronsUpDown size={13} className="ml-1 flex-shrink-0" style={{ color: 'rgba(75, 85, 99, 0.5)' }} />;
    return sortDir === 'asc'
      ? <ChevronUp size={13} className="ml-1 flex-shrink-0" style={{ color: 'var(--primary)' }} />
      : <ChevronDown size={13} className="ml-1 flex-shrink-0" style={{ color: 'var(--primary)' }} />;
  };

  return (
    <div className="glass-card rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--table-header-background)' }}>
              {columns.map((col, index) => (
                <th
                  key={col.id || `${col.key}-${col.label || index}`}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                    col.sortable && onSort ? 'cursor-pointer select-none' : ''
                  }`}
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  onMouseEnter={(e) => {
                    if (col.sortable && onSort) {
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <div className="flex items-center">
                    {col.label}
                    <SortIcon col={col} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--divider-color)' }}>
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
                  className="transition-colors duration-150 group"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {columns.map((col, colIndex) => (
                    <td key={col.id || `${col.key}-${col.label || colIndex}`} className="px-4 py-3 whitespace-nowrap">
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
