import { useEffect, useState, useCallback } from 'react';
import { Search, BookOpen, TrendingUp, TrendingDown } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getCustomers } from '../api/customers';
import { getLedger } from '../api/ledger';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function Ledger() {
  const [customers, setCustomers]       = useState([]);
  const [selected, setSelected]         = useState('');
  const [entries, setEntries]           = useState([]);
  const [loadingC, setLoadingC]         = useState(true);
  const [loadingE, setLoadingE]         = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  useEffect(() => {
    getCustomers().then((r) => setCustomers(r.data.data || [])).catch(() => {}).finally(() => setLoadingC(false));
  }, []);

  const fetchLedger = useCallback(async (cid) => {
    if (!cid) return;
    setLoadingE(true);
    try {
      const r = await getLedger(cid);
      setEntries(r.data.data || []);
    } catch { setEntries([]); }
    finally { setLoadingE(false); }
  }, []);

  useEffect(() => { fetchLedger(selected); }, [selected, fetchLedger]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const selectedCustomer = customers.find((c) => c._id === selected);

  const totalDebit  = entries.filter((e) => e.type === 'debit').reduce((s, e) => s + e.amount, 0);
  const totalCredit = entries.filter((e) => e.type === 'credit').reduce((s, e) => s + e.amount, 0);
  const balance     = selectedCustomer?.ledgerBalance ?? (totalCredit - totalDebit);

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'type', label: 'Type', render: (v) => (
      <Badge label={v === 'debit' ? '↑ Debit' : '↓ Credit'} className={v === 'debit' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'} />
    )},
    { key: 'amount', label: 'Amount', render: (v, row) => (
      <span className={`font-semibold ${row.type === 'debit' ? 'text-rose-400' : 'text-emerald-400'}`}>
        {row.type === 'debit' ? '+' : '–'} {formatCurrency(v)}
      </span>
    )},
    { key: 'balance', label: 'Running Balance', render: (v) => <span className={`font-semibold ${v >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(Math.abs(v))}</span> },
    { key: 'description', label: 'Description', render: (v) => <span className="text-slate-400 text-sm">{v || '—'}</span> },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Customer Ledger" subtitle="Debit & credit ledger per customer" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Customer List */}
        <div className="glass-card rounded-2xl border border-white/8 p-4 lg:col-span-1 h-fit lg:sticky lg:top-4">
          <p className="text-xs font-semibold text-slate-400 mb-3">Select Customer</p>
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="ledger-customer-search"
              type="text"
              placeholder="Search…"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          {loadingC ? <LoadingSpinner size="sm" /> : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {filteredCustomers.map((c) => (
                <button
                  key={c._id}
                  id={`ledger-customer-${c._id}`}
                  onClick={() => setSelected(c._id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    selected === c._id
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <p className="font-medium truncate">{c.name}</p>
                  <p className={`text-xs mt-0.5 ${c.ledgerBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatCurrency(Math.abs(c.ledgerBalance || 0))} {c.ledgerBalance < 0 ? 'owed' : 'credit'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ledger Entries */}
        <div className="lg:col-span-3 space-y-4">
          {selected && selectedCustomer && (
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card rounded-xl border border-white/8 p-4">
                <p className="text-xs text-slate-400">Total Debit</p>
                <p className="text-lg font-bold text-rose-400 mt-1">{formatCurrency(totalDebit)}</p>
              </div>
              <div className="glass-card rounded-xl border border-white/8 p-4">
                <p className="text-xs text-slate-400">Total Credit</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(totalCredit)}</p>
              </div>
              <div className={`glass-card rounded-xl border p-4 ${balance >= 0 ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
                <p className="text-xs text-slate-400">Net Balance</p>
                <p className={`text-lg font-bold mt-1 ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(Math.abs(balance))}</p>
              </div>
            </div>
          )}

          {!selected ? (
            <div className="glass-card rounded-2xl border border-white/8 py-20 text-center">
              <BookOpen size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Select a customer to view their ledger</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={entries}
              loading={loadingE}
              emptyTitle="No ledger entries"
              emptyDescription="No transactions found for this customer."
            />
          )}
        </div>
      </div>
    </div>
  );
}
