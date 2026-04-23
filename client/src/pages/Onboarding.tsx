import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import { api } from '../api/axios';
import { Sun, Moon, ArrowRight, CheckCircle, IndianRupee, Upload, FileText, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    // States
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [inflow, setInflow] = useState("");
    const [cashInBank, setCashInBank] = useState("");
    const [targetName, setTargetName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [targetDate] = useState("");
    const [csvTransactions, setCsvTransactions] = useState<any[]>([]);

    const { addTransaction, confirmBatch, progress, loading: storeLoading } = useTransactionStore();

    const handleThemeSelect = (selectedTheme: string) => {
        setTheme(selectedTheme);
        document.documentElement.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('theme', selectedTheme);
        setTimeout(() => setStep(2), 500);
    };

    const VALID_CATEGORIES = ["food", "transport", "housing", "entertainment", "shopping", "health", "education", "utilities", "salary", "freelance", "investment", "other"];

    const normalizeCategory = (cat: string) => {
        const c = cat?.toLowerCase().trim();
        if (VALID_CATEGORIES.includes(c)) return c;
        if (["rent", "home", "bill", "water", "electricity"].includes(c)) return "housing";
        if (["uber", "travel", "taxi", "ola", "bus", "train", "metro", "fuel"].includes(c)) return "transport";
        if (["food", "groceries", "dining", "restaurant", "swiggy", "zomato"].includes(c)) return "food";
        if (["movie", "netflix", "game", "spotify"].includes(c)) return "entertainment";
        return "other";
    };

    const handleCsvUpload = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const normalized = results.data.map((row: any) => ({
                    date: row.Date ? new Date(row.Date).toISOString() : new Date().toISOString(),
                    description: row.Description || row.description || "Imported transaction",
                    amount: Math.abs(Number(row.Amount || row.amount)) || 0,
                    category: normalizeCategory(row.Category || row.category),
                    type: (row.Type || row.type)?.toLowerCase() === 'income' ? 'income' : 'expense',
                    source: 'csv'
                }));
                setCsvTransactions(normalized);
                toast.success(`Successfully parsed ${normalized.length} transactions!`);
            },
            error: () => {
                toast.error("Format error in CSV");
            }
        });
    };

    const handleComplete = async () => {
        const loadingToast = toast.loading("Finalizing your profile...");
        try {
            // 1. Save goals
            await api.patch('/auth/profile', {
                goals: targetName ? [{
                    name: targetName,
                    amount: Number(targetAmount),
                    deadline: targetDate ? new Date(targetDate) : undefined
                }] : []
            });

            await useAuthStore.getState().fetchConfig();

            // 2. Add starting transactions
            if (Number(cashInBank) > 0) {
                await addTransaction({
                    amount: Number(cashInBank),
                    type: 'income',
                    category: 'other',
                    description: 'Initial Cash in Bank',
                    date: new Date().toISOString(),
                    source: 'manual'
                });
            }
            if (Number(inflow) > 0) {
                await addTransaction({
                    amount: Number(inflow),
                    type: 'income',
                    category: 'salary',
                    description: 'Monthly Inflow Expected',
                    date: new Date().toISOString(),
                    source: 'manual'
                });
            }

            // 3. Add CSV transactions if any
            if (csvTransactions.length > 0) {
                await confirmBatch(csvTransactions);
            }

            toast.dismiss(loadingToast);
            toast.success("Ready for FinFlow AI!");
            navigate('/app/dashboard');
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Something went wrong, but you're good to go!");
            navigate('/app/dashboard');
        }
    };

    const slideVariants = {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 }
    };

    return (
        <div className="fixed inset-0 bg-bg text-text-primary z-50 flex flex-col items-center justify-center p-4 overflow-hidden">
            <AnimatePresence>
                {storeLoading && progress > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-bg/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-md bg-surface border border-border rounded-[2.5rem] p-10 text-center shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto mb-6 text-accent">
                                <CheckCircle size={40} className="animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-display font-bold mb-2">Finalizing Setup</h3>
                            <p className="text-text-secondary text-sm mb-8">Saving your history and securing your profile...</p>

                            <div className="w-full bg-bg h-3 rounded-full overflow-hidden border border-border mb-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-accent shadow-[0_0_15px_rgba(163,230,53,0.5)]"
                                />
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Progress</span>
                                <span className="text-accent font-mono font-bold">{progress}%</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute top-8 right-8">
                <button onClick={() => navigate('/app/dashboard')} className="text-text-muted hover:text-text-primary text-sm font-medium">Skip Setup</button>
            </div>

            <div className="w-full max-w-2xl relative min-h-[500px] flex items-center justify-center">
                <AnimatePresence mode="wait">

                    {step === 1 && (
                        <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full text-center">
                            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">Preference</h2>
                            <p className="text-text-secondary mb-12">How would you like FinFlow to look?</p>

                            <div className="flex justify-center gap-8">
                                <button
                                    onClick={() => handleThemeSelect("light")}
                                    className={`group relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 flex flex-col items-center justify-center gap-2 transition-all ${theme === 'light' ? 'border-accent bg-surface shadow-lg shadow-accent/20 scale-110' : 'border-border bg-bg hover:border-accent/50'}`}
                                >
                                    <Sun size={40} className={theme === 'light' ? "text-accent" : "text-text-secondary group-hover:text-text-primary"} />
                                    <span className="font-medium">Light</span>
                                </button>
                                <button
                                    onClick={() => handleThemeSelect("dark")}
                                    className={`group relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 flex flex-col items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'border-accent bg-[#171717] shadow-lg shadow-accent/20 scale-110' : 'border-border bg-[#0a0a0a] hover:border-accent/50'}`}
                                >
                                    <Moon size={40} className={theme === 'dark' ? "text-accent" : "text-[#a3a3a3] group-hover:text-white"} />
                                    <span className="font-medium">Dark</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full text-center max-w-md mx-auto">
                            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 text-center">Current Capital</h2>
                            <p className="text-text-secondary mb-12 text-center">How much liquid cash/bank balance do you have right now?</p>

                            <div className="relative mb-8">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <IndianRupee className="text-text-muted" size={24} />
                                </div>
                                <input
                                    type="number"
                                    value={cashInBank}
                                    onChange={e => setCashInBank(e.target.value)}
                                    className="w-full bg-surface border-2 border-border focus:border-accent rounded-3xl py-6 pl-14 pr-6 text-3xl font-display font-bold focus:outline-none transition-colors"
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>

                            <button onClick={() => setStep(3)} className="w-full bg-accent text-bg py-5 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-accent-hover transition-all">
                                Next Step <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-md mx-auto">
                            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 text-center">Future Goals</h2>
                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-text-muted mb-2 tracking-widest pl-2">Monthly Inflow (Expected)</label>
                                    <input
                                        type="number"
                                        value={inflow}
                                        onChange={e => setInflow(e.target.value)}
                                        className="w-full bg-surface border-2 border-border focus:border-accent rounded-2xl py-4 px-6 text-xl font-display font-bold focus:outline-none transition-colors"
                                        placeholder="₹ Salary / Profits"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-text-muted mb-2 tracking-widest pl-2">Primary Goal Name</label>
                                    <input
                                        type="text"
                                        value={targetName}
                                        onChange={e => setTargetName(e.target.value)}
                                        className="w-full bg-surface border-2 border-border focus:border-accent rounded-2xl py-4 px-6 text-xl font-display font-bold focus:outline-none transition-colors mb-2"
                                        placeholder="e.g. Tesla Model S"
                                    />
                                    <input
                                        type="number"
                                        value={targetAmount}
                                        onChange={e => setTargetAmount(e.target.value)}
                                        className="w-full bg-surface border-2 border-border focus:border-accent rounded-2xl py-4 px-6 text-xl font-display font-bold focus:outline-none transition-colors"
                                        placeholder="Target Amount (₹)"
                                    />
                                </div>
                            </div>
                            <button onClick={() => setStep(4)} className="w-full bg-accent text-bg py-5 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-accent-hover transition-all">
                                Connect Data <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-md mx-auto text-center">
                            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">Import Data</h2>
                            <p className="text-text-secondary mb-8">Upload a CSV of your past transactions to seed your analytics.</p>

                            <div className="bg-surface/50 border-2 border-dashed border-border rounded-[2rem] p-8 mb-8 group hover:border-accent/40 transition-colors relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => e.target.files?.[0] && handleCsvUpload(e.target.files[0])}
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-3xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {csvTransactions.length > 0 ? <FileText size={32} /> : <Upload size={32} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">
                                            {csvTransactions.length > 0 ? `${csvTransactions.length} items parsed` : "Drop your CSV here"}
                                        </p>
                                        <p className="text-text-muted text-xs">or click to browse files</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-bg border border-border rounded-2xl p-4 text-left mb-8">
                                <div className="flex items-start gap-3">
                                    <Info size={18} className="text-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-text-secondary uppercase mb-1">Required Headers:</p>
                                        <p className="text-[10px] text-text-muted font-mono bg-surface px-2 py-1 rounded">
                                            Date, Description, Amount, Category, Type
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(3)} className="bg-surface border border-border px-6 py-4 rounded-full font-bold flex-1">Back</button>
                                <button onClick={handleComplete} className="bg-accent text-bg px-8 py-4 rounded-full font-bold flex-[2] flex items-center justify-center gap-2 hover:bg-accent-hover transition-all">
                                    Finish <CheckCircle size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Progress indicators */}
            <div className="absolute bottom-12 flex gap-3">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-2 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-accent' : step > s ? 'w-4 bg-text-muted' : 'w-2 bg-border'}`}></div>
                ))}
            </div>
        </div>
    );
}
