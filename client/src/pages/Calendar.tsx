import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, Info, RefreshCw } from 'lucide-react';
import { useCalendarStore } from '../store/calendarStore';
import { CATEGORY_COLORS } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const { monthlyData, loading, fetchMonth } = useCalendarStore();
    const navigate = useNavigate();

    // Pagination for Activity Log
    const [logPage, setLogPage] = useState(0);
    const logLimit = 4;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        fetchMonth(year, month);
    }, [year, month, fetchMonth]);

    useEffect(() => {
        const handleMutation = () => {
            fetchMonth(year, month, true);
        };
        window.addEventListener('transaction-mutation', handleMutation);
        return () => window.removeEventListener('transaction-mutation', handleMutation);
    }, [year, month, fetchMonth]);

    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const transactions = monthlyData[monthKey] || [];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ day: null, date: null });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dayTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getDate() === i && tDate.getMonth() === month && tDate.getFullYear() === year;
            });
            days.push({ day: i, date, transactions: dayTransactions });
        }
        return days;
    }, [year, month, transactions, daysInMonth, firstDayOfMonth]);

    const selectedTransactions = useMemo(() => {
        if (!selectedDate) return [];
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getDate() === selectedDate.getDate() &&
                tDate.getMonth() === selectedDate.getMonth() &&
                tDate.getFullYear() === selectedDate.getFullYear();
        });
    }, [selectedDate, transactions]);

    const dailyTotals = useMemo(() => {
        return selectedTransactions.reduce((acc, t) => {
            if (t.type === 'income') acc.income += t.amount;
            else acc.expense += t.amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [selectedTransactions]);

    const netAmount = dailyTotals.income - dailyTotals.expense;

    // Reset log page when selecting a new date
    useEffect(() => {
        setLogPage(0);
    }, [selectedDate]);

    const visibleLogs = useMemo(() => {
        const start = logPage * logLimit;
        return selectedTransactions.slice(start, start + logLimit);
    }, [selectedTransactions, logPage]);

    const hasNextLogs = (logPage + 1) * logLimit < selectedTransactions.length;

    const changeMonth = (offset: number) => {
        const newDate = new Date(year, month + offset, 1);
        setCurrentDate(newDate);
        setSelectedDate(null);
    };

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col pb-24 md:pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-4 md:px-0">
                <div>
                    <h2 className="text-3xl font-display font-bold flex items-center gap-3">
                        <CalIcon className="text-accent" size={32} />
                        Finance Calendar
                    </h2>
                    <p className="text-text-secondary mt-1">Track your daily cashflow visually.</p>
                </div>

                <div className="flex items-center gap-3 bg-surface p-1.5 rounded-2xl border border-border self-start md:self-auto">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-bg rounded-xl transition-colors text-text-secondary hover:text-accent">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="px-4 font-display font-bold min-w-[140px] text-center">
                        {MONTHS[month]} {year}
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-bg rounded-xl transition-colors text-text-secondary hover:text-accent">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0 px-4 md:px-0">
                <div className="lg:col-span-3 bg-surface border border-border rounded-3xl p-4 md:p-6 shadow-xl flex flex-col overflow-hidden">
                    <div className="grid grid-cols-7 mb-4">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-[10px] uppercase font-black tracking-widest text-text-muted pb-4 border-b border-border/50">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 flex-1 overflow-y-auto no-scrollbar">
                        {calendarDays.map((item, idx) => {
                            const isSelected = selectedDate && item.date &&
                                selectedDate.getDate() === item.day &&
                                selectedDate.getMonth() === month;
                            const isToday = item.date && new Date().toDateString() === item.date.toDateString();
                            const hasTransactions = item.transactions && item.transactions.length > 0;

                            return (
                                <div
                                    key={idx}
                                    onClick={() => item.date && setSelectedDate(item.date)}
                                    className={`
                                        group relative aspect-square border-b border-r border-border/30 p-1 md:p-2 cursor-pointer transition-all hover:bg-white/5
                                        ${!item.day ? 'bg-bg/20' : ''}
                                        ${isSelected ? 'bg-accent/10 border-accent/20' : ''}
                                    `}
                                >
                                    {item.day && (
                                        <>
                                            <span className={`
                                                text-xs md:text-sm font-display font-bold relative z-10
                                                ${isToday ? 'text-accent' : isSelected ? 'text-text-primary' : 'text-text-secondary'}
                                            `}>
                                                {item.day}
                                            </span>

                                            {hasTransactions && (
                                                <div className="mt-1 flex flex-wrap gap-0.5 md:gap-1 max-h-[70%] overflow-hidden">
                                                    {item.transactions!.slice(0, 4).map((t, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full shadow-sm"
                                                            style={{ backgroundColor: (CATEGORY_COLORS as any)[t.category] || CATEGORY_COLORS.other }}
                                                        />
                                                    ))}
                                                    {item.transactions!.length > 4 && (
                                                        <span className="text-[7px] md:text-[8px] font-black text-text-muted">+{item.transactions!.length - 4}</span>
                                                    )}
                                                </div>
                                            )}

                                            {isToday && (
                                                <div className="absolute top-1 md:top-2 right-1 md:right-2 w-1 h-1 bg-accent rounded-full animate-ping" />
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-display font-bold text-xl">Activity Log</h3>
                            {selectedDate && (
                                <div className="text-[10px] font-black uppercase text-accent bg-accent/10 px-3 py-1 rounded-full">
                                    {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()].substring(0, 3)}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <div key="loading" className="space-y-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-20 bg-bg/50 rounded-2xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : visibleLogs.length > 0 ? (
                                    <motion.div
                                        key={`page-${logPage}-${selectedDate?.toISOString()}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        {visibleLogs.map((t) => (
                                            <div
                                                key={t._id}
                                                className="group bg-bg/50 border border-border/50 p-4 rounded-2xl hover:border-accent/40 transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="font-bold text-sm text-text-primary capitalize leading-tight truncate pr-2" title={t.description}>{t.description}</p>
                                                    <p className={`font-mono text-xs font-bold shrink-0 ${t.type === 'income' ? 'text-accent' : 'text-text-primary'}`}>
                                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: (CATEGORY_COLORS as any)[t.category] || CATEGORY_COLORS.other }} />
                                                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{t.category}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <div key="empty" className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                            <Info size={20} />
                                        </div>
                                        <p className="text-xs font-medium">No activity recorded for this day</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {selectedTransactions.length > 0 && (
                            <div className="mt-6 p-4 bg-bg/50 border border-border rounded-2xl">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-text-muted">Net Cashflow</span>
                                        <span className={netAmount >= 0 ? 'text-accent font-bold' : 'text-accent-red font-bold'}>
                                            {netAmount >= 0 ? '+' : ''}₹{netAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-border/30 h-1 rounded-full overflow-hidden flex">
                                        {dailyTotals.income + dailyTotals.expense > 0 ? (
                                            <>
                                                <div className="bg-accent h-full shadow-[0_0_8px_rgba(163,230,53,0.3)]" style={{ width: `${(dailyTotals.income / (dailyTotals.income + dailyTotals.expense)) * 100}%` }} />
                                                <div className="bg-white/20 h-full" style={{ width: `${(dailyTotals.expense / (dailyTotals.income + dailyTotals.expense)) * 100}%` }} />
                                            </>
                                        ) : (
                                            <div className="bg-border/20 w-full h-full" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedTransactions.length > logLimit && (
                            <div className="mt-4 pt-4 border-t border-border/30">
                                <button
                                    onClick={() => setLogPage(p => hasNextLogs ? p + 1 : 0)}
                                    className="w-full py-2 bg-bg border border-border rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-surface hover:text-accent transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={10} />
                                    {hasNextLogs ? "More Logs" : "Reset View"}
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/app/input')}
                            className="mt-4 w-full bg-accent text-bg py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent-hover transition-all active:scale-95 shadow-lg shadow-accent/20"
                        >
                            <Plus size={18} /> New Entry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
