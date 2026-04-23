import { useEffect, useState, useRef, useCallback } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { CATEGORY_COLORS } from '../utils/constants';
import { Search, Trash2, Receipt, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Transactions() {
  const { transactions, fetchTransactions, deleteTransaction, loading, meta } = useTransactionStore();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const observerTarget = useRef(null);

  // Initial fetch
  useEffect(() => {
    fetchTransactions({ page: 1 }, false);
  }, [fetchTransactions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions({ search, page: 1 }, false);
  };

  const handleLoadMore = useCallback(() => {
    if (loading || transactions.length >= meta.total) return;
    fetchTransactions({ page: meta.page + 1 }, true);
  }, [loading, transactions.length, meta.total, meta.page, fetchTransactions]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleLoadMore]);

  const hasMore = transactions.length < meta.total;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold">Transaction History</h2>
          <p className="text-text-secondary mt-1">Detailed list of all your financial activities.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description..."
              className="w-full bg-surface border-2 border-border rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-accent transition-all text-sm font-medium"
            />
          </form>
          <button
            onClick={() => navigate('/app/input')}
            className="bg-accent text-bg px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent-hover transition-all active:scale-95 shadow-lg shadow-accent/20"
          >
            <Plus size={20} /> Add New
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[2rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg text-text-muted font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-4 md:px-8 py-5 hidden md:table-cell">Date</th>
                <th className="px-4 md:px-8 py-5">Description</th>
                <th className="px-4 md:px-8 py-5">Category</th>
                <th className="px-4 md:px-8 py-5">Amount</th>
                <th className="px-4 md:px-8 py-5 text-right hidden sm:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {transactions.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="px-4 md:px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Receipt size={64} className="mb-4" />
                      <p className="font-display font-bold text-xl">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-bg/40 transition-colors group">
                    <td className="px-4 md:px-8 py-5 text-text-secondary font-mono hidden md:table-cell">{new Date(t.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 md:px-8 py-5">
                      <p className="font-bold text-text-primary capitalize max-w-[120px] md:max-w-none truncate">{t.description}</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-tighter">Source: {t.source || 'manual'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all"
                        style={{ color: (CATEGORY_COLORS as any)[t.category] || CATEGORY_COLORS.other, borderColor: `${(CATEGORY_COLORS as any)[t.category] || CATEGORY_COLORS.other}40`, backgroundColor: `${(CATEGORY_COLORS as any)[t.category] || CATEGORY_COLORS.other}10` }}
                      >
                        {t.category}
                      </span>
                    </td>
                    <td className={`px-8 py-5 font-mono font-black text-lg ${t.type === 'income' ? 'text-accent' : 'text-text-primary'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => { if (confirm('Delete transaction permanently?')) deleteTransaction(t._id); }}
                        className="p-3 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sentinel for Infinite Scroll */}
        <div ref={observerTarget} className="p-8 flex items-center justify-center">
          {loading && hasMore && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-accent" size={24} />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Loading older records...</span>
            </div>
          )}
          {!hasMore && transactions.length > 0 && (
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
              End of Records • Total {meta.total} entries
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
