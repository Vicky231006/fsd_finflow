import { useEffect, useState } from 'react';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/constants';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { useBudgetStore } from '../store/budgetStore';

export default function Budgets() {
  const { budgets, loading, fetchBudgets, addBudget, deleteBudget } = useBudgetStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ category: "food", limit: "" });

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBudget(form.category, Number(form.limit));
      toast.success("Budget saved");
      setIsModalOpen(false);
      setForm({ category: "food", limit: "" });
    } catch {
      toast.error("Failed to save budget");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete budget?")) return;
    try {
      await deleteBudget(id);
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="p-8 text-center text-text-secondary animate-pulse">Loading budgets...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-semibold">Monthly Budgets</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-bg px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-hover transition-colors"
        >
          <Plus size={18} /> Add Budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-muted">
          <p>No budgets set for this month.</p>
          <button onClick={() => setIsModalOpen(true)} className="mt-4 text-accent hover:underline">Create your first budget</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(b => {
            const percent = Math.min((b.spent / b.limit) * 100, 100);
            let colorClass = "bg-accent";
            if (percent > 70) colorClass = "bg-accent-yellow";
            if (percent >= 90) colorClass = "bg-accent-red";

            return (
              <div key={b._id} className="bg-surface border border-border rounded-2xl p-6 relative group">
                <button onClick={() => handleDelete(b._id)} className="absolute top-4 right-4 text-text-muted md:opacity-0 md:group-hover:opacity-100 hover:text-accent-red transition-all"><Trash2 size={16} /></button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-opacity-20 border" style={{ backgroundColor: `${CATEGORY_COLORS[b.category]}20`, borderColor: CATEGORY_COLORS[b.category] }}>
                    {CATEGORY_ICONS[b.category]}
                  </div>
                  <h3 className="font-display font-semibold capitalize text-lg">{b.category}</h3>
                </div>

                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm text-text-secondary">Spent</p>
                    <p className="font-mono text-xl font-bold text-text-primary">₹{b.spent.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">Limit</p>
                    <p className="font-mono text-lg text-text-primary">₹{b.limit.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="h-3 w-full bg-bg rounded-full overflow-hidden border border-border">
                  <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                </div>
                <p className="text-right text-xs mt-2 text-text-secondary">{percent.toFixed(1)}% used</p>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-display font-semibold text-xl mb-4 text-text-primary">Set Budget</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-bg text-text-primary border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent capitalize">
                  {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Monthly Limit (₹)</label>
                <input type="number" required min="1" value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} className="w-full bg-bg text-text-primary border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent font-mono" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-border text-text-primary rounded-xl hover:bg-bg transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-accent text-bg font-bold rounded-xl hover:bg-accent-hover transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
