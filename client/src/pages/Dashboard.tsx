import { useEffect, useMemo } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_COLORS } from '../utils/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const { summary, allTimeSummary, categoryBreakdown, trends, fetchAll } = useAnalyticsStore();
  const { user, fetchConfig } = useAuthStore();
  const { transactions, fetchTransactions } = useTransactionStore();

  useEffect(() => {
    fetchAll();
    fetchTransactions({ limit: 5 });
    fetchConfig();
  }, []); // Run once on mount

  const savingsRate = useMemo(() => {
    if (!summary || summary.income === 0) return "0.0";
    return ((summary.balance / summary.income) * 100).toFixed(1);
  }, [summary]);

  const trendData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return [...new Set(trends.map(t => `${t._id.year}-${t._id.month}`))].map(key => {
      const [, month] = key.split('-');
      const inc = trends.find(t => `${t._id.year}-${t._id.month}` === key && t._id.type === 'income')?.total || 0;
      const exp = trends.find(t => `${t._id.year}-${t._id.month}` === key && t._id.type === 'expense')?.total || 0;
      return { name: monthNames[Number(month) - 1], income: inc, expense: exp };
    });
  }, [trends]);

  if (!summary) return <div className="p-8 text-text-secondary animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-6 pb-24 w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-display font-bold">Financial Overview</h2>
        <div className="hidden md:flex gap-2">
          <div className="px-3 py-1 bg-surface border border-border rounded-full text-[10px] font-bold text-text-muted uppercase tracking-tighter">Live Updates</div>
        </div>
      </div>

      {/* Goals Progress */}
      {user?.goals && user.goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {user.goals.map((goal, idx) => {
            const currentSavings = allTimeSummary?.balance || 0;
            const progress = Math.min(100, Math.max(0, (currentSavings / goal.amount) * 100));
            const remaining = Math.max(0, goal.amount - currentSavings);

            return (
              <div key={idx} className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp size={48} />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-display font-bold text-lg text-accent-purple">{goal.name}</h4>
                    <span className="text-xs font-mono text-text-muted">₹{goal.amount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="h-2 w-full bg-bg rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full bg-accent-purple transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider">Current Savings</p>
                      <p className="text-sm font-mono font-bold text-text-primary">₹{currentSavings.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider">Remaining</p>
                      <p className="text-sm font-mono font-bold text-accent-orange">₹{remaining.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <button
            onClick={() => navigate('/app/onboarding')}
            className="border-2 border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-text-muted hover:border-accent/50 hover:text-accent transition-all group"
          >
            <Plus size={24} className="group-hover:scale-110 transition-transform" />
            <span className="font-display font-semibold">Add New Target</span>
          </button>
        </div>
      )}

      {/* QuickStats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Income", v: summary.income, icon: ArrowUpRight, col: "text-accent-orange" },
          { label: "Total Expenses", v: summary.expense, icon: ArrowDownRight, col: "text-text-primary" },
          { label: "Net Balance", v: summary.balance, icon: Wallet, col: "text-accent" },
          { label: "Savings Rate", v: `${savingsRate}%`, icon: TrendingUp, col: "text-accent-blue" }
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-5 hover:border-accent/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-text-secondary text-sm font-medium">{stat.label}</span>
              <div className={`p-2 rounded-lg bg-bg ${stat.col}`}><stat.icon size={16} /></div>
            </div>
            <div className="font-mono text-2xl font-bold text-text-primary">
              {typeof stat.v === 'number' ? `₹${stat.v.toLocaleString('en-IN')}` : stat.v}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Donut & List */}
        <div className="lg:col-span-1 bg-surface border border-border rounded-2xl p-5 flex flex-col">
          <h3 className="font-display font-semibold mb-6">Categories (Month)</h3>
          <div className="h-48 mb-6">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="total" nameKey="_id" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2}>
                    {categoryBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={(CATEGORY_COLORS as any)[entry._id] || CATEGORY_COLORS.other} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted">No expenses this month</div>
            )}
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {categoryBreakdown.map((cat: any) => (
              <div key={cat._id} className="p-3 bg-bg/50 rounded-xl border border-border/50 group hover:border-accent/30 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="text-sm font-semibold capitalize text-text-primary">{cat._id}</span>
                    {cat.limit > 0 && <span className="ml-2 text-[10px] text-text-muted">Limit: ₹{cat.limit}</span>}
                  </div>
                  <span className="text-xs font-mono font-bold text-accent">₹{cat.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-1 w-full bg-border/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${cat.limit > 0 && cat.total > cat.limit ? 'bg-accent-orange' : 'bg-accent'}`}
                    style={{ width: `${cat.limit > 0 ? Math.min(100, (cat.total / cat.limit) * 100) : 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-6">Cashflow Trend</h3>
          <div className="h-[300px] md:h-[400px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="name" stroke="#525252" tick={{ fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#525252" tick={{ fill: '#a3a3a3', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', fontFamily: 'JetBrains Mono' }} />
                  <Area type="monotone" dataKey="income" stroke="#fb923c" fillOpacity={1} fill="url(#colorInc)" />
                  <Area type="monotone" dataKey="expense" stroke="#a3e635" fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted">Not enough data to show trends</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {transactions.length === 0 && <span className="text-text-muted">No transactions yet.</span>}
            {transactions.slice(0, 5).map((t: any) => (
              <div key={t._id} className="flex justify-between items-center bg-bg/50 p-3 rounded-xl border border-border/50">
                <div>
                  <p className="font-medium text-text-primary">{t.description}</p>
                  <p className="text-xs text-text-secondary capitalize">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                </div>
                <div className={`font-mono font-bold ${t.type === 'income' ? 'text-accent-orange' : 'text-text-primary'}`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {categoryBreakdown.length > 0 && (
          <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-2xl p-6 relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={64} /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-accent-purple font-display font-bold mb-4">
                <Sparkles size={20} /> FinFlow AI Insights
              </div>
              <ul className="space-y-4 text-text-primary">
                <li className="bg-bg/50 p-3 rounded-lg border border-border/50 shadow-sm backdrop-blur-md">
                  Your top expense category this month is <span className="text-accent underline decoration-accent-purple uppercase">{categoryBreakdown[0]?._id}</span>.
                </li>
                <li className="bg-bg/50 p-3 rounded-lg border border-border/50 shadow-sm backdrop-blur-md">
                  You're on track to save <span className="font-mono text-accent">₹{allTimeSummary?.balance?.toLocaleString('en-IN') || '0'}</span>!
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/app/input')}
        className="fixed bottom-10 right-6 w-16 h-16 bg-accent text-bg rounded-full flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-110 transition-all md:hidden z-50"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
