import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { useTransactionStore } from '../store/transactionStore';
import toast from 'react-hot-toast';
import { Sparkles, FileText, PenTool, CheckCircle, ArrowRight, Upload, Info } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/constants';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';

export default function InputPage() {
  const [mode, setMode] = useState<"chat" | "paste" | "manual" | "csv">("chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedItem, setParsedItem] = useState<any>(null);
  const [parsedBatch, setParsedBatch] = useState<any[]>([]);

  const [manualForm, setManualForm] = useState({
    amount: "", type: "expense", category: "other", description: "", date: new Date().toISOString().substring(0, 10)
  });

  const { addTransaction, confirmBatch, progress, loading: storeLoading } = useTransactionStore();
  const navigate = useNavigate();

  const handleParseSingle = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/transactions/parse', { text: input });
      setParsedItem(data.data);
      setInput("");
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Parsing failed. Try rephrasing.");
    } finally {
      setLoading(false);
    }
  };

  const handleParseBatch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/transactions/parse/batch', { text: input });
      setParsedBatch(data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Parsing failed.");
    } finally {
      setLoading(false);
    }
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
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const normalized = results.data.map((row: any) => {
            let validDate;
            try {
              const dateStr = (row.Date || row.date || "").trim();
              if (dateStr) {
                const parts = dateStr.split(/[\/\-]/);
                if (parts.length === 3) {
                  let p1 = parseInt(parts[0]);
                  let p2 = parseInt(parts[1]);
                  let p3 = parseInt(parts[2]);
                  if (p3 < 100) p3 += 2000;

                  // Decide if it's DD/MM or MM/DD
                  let day = p1;
                  let month = p2;
                  if (p1 > 12) {
                    // Definitely DD/MM/YYYY
                  } else if (p2 > 12) {
                    // Definitely MM/DD/YYYY
                    day = p2;
                    month = p1;
                  } // Else ambiguous, assume DD/MM/YYYY

                  const dObj = new Date(p3, month - 1, day);
                  validDate = isNaN(dObj.getTime()) ? new Date().toISOString() : dObj.toISOString();
                } else {
                  const d = new Date(dateStr);
                  validDate = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
                }
              } else {
                validDate = new Date().toISOString();
              }
            } catch {
              validDate = new Date().toISOString();
            }

            return {
              date: validDate,
              description: row.Description || row.description || "Imported transaction",
              amount: Math.abs(Number(row.Amount || row.amount)) || 0,
              category: normalizeCategory(row.Category || row.category),
              type: (row.Type || row.type)?.toLowerCase() === 'income' ? 'income' : 'expense',
              source: 'csv'
            };
          });
          setParsedBatch(normalized);
          toast.success(`Parsed ${normalized.length} transactions from CSV`);
        } catch (err) {
          console.error("CSV Normalize error:", err);
          toast.error("Format mismatch in CSV data");
        } finally {
          setLoading(false);
        }
      },
      error: () => {
        setLoading(false);
        toast.error("Format error in CSV");
      }
    });
  };

  const handleConfirmSingle = async () => {
    if (!parsedItem) return;
    setLoading(true);
    try {
      await addTransaction({ ...parsedItem, source: "chat" });
      toast.success("Transaction saved!");
      setParsedItem(null);
      navigate("/app/transactions");
    } catch (err: any) {
      toast.error("Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBatch = async () => {
    if (parsedBatch.length === 0) return;
    setLoading(true);
    try {
      const payload = parsedBatch.map(t => ({ ...t, source: mode === 'csv' ? 'csv' : 'paste' }));
      await confirmBatch(payload);
      toast.success(`${payload.length} transactions saved!`);
      setParsedBatch([]);
      setInput("");
      navigate("/app/transactions");
    } catch (err: any) {
      toast.error("Failed to save batch");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addTransaction({
        ...manualForm,
        amount: Number(manualForm.amount),
        source: "manual"
      });
      toast.success("Transaction saved!");
      navigate("/app/transactions");
    } catch (err: any) {
      toast.error("Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
              <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Upload size={40} className="animate-bounce" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-2">Synchronizing</h3>
              <p className="text-text-secondary text-sm mb-8">Processing your records and optimizing your analytics...</p>

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

      <h2 className="text-3xl font-display font-bold mb-6">Capture Activity</h2>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 lg:flex p-1 bg-surface border border-border rounded-2xl w-full lg:w-max overflow-x-auto custom-scrollbar gap-1">
        {[
          { id: "chat", icon: Sparkles, label: "AI Chat" },
          { id: "paste", icon: FileText, label: "Bulk Paste" },
          { id: "manual", icon: PenTool, label: "Manual" },
          { id: "csv", icon: Upload, label: "CSV" }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id as any);
              setParsedBatch([]);
              setParsedItem(null);
              setInput("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${mode === m.id ? 'bg-bg text-accent border border-border/50 shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <m.icon size={16} /> <span>{m.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-12">
          {mode === "chat" && (
            <div className="bg-surface border border-border rounded-3xl p-6 min-h-[400px] flex flex-col justify-end relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Sparkles size={120} /></div>
              {parsedItem ? (
                <div className="bg-bg border-2 border-accent/30 rounded-2xl p-6 mb-6 self-center max-w-md w-full animate-in fade-in zoom-in duration-300 shadow-2xl relative z-10">
                  <h4 className="font-display font-bold text-accent text-xl mb-4 flex items-center gap-2 text-center justify-center"><CheckCircle size={24} /> Review Details</h4>
                  <div className="space-y-4 mb-6 text-sm">
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-text-secondary">Amount</span>
                      <span className="font-mono text-lg font-bold text-text-primary">₹{parsedItem.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-text-secondary">Category</span>
                      <span className="capitalize font-bold" style={{ color: (CATEGORY_COLORS as any)[parsedItem.category] || CATEGORY_COLORS.other }}>{parsedItem.category}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-text-secondary">Description</span>
                      <span className="text-right">{parsedItem.description}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleConfirmSingle} disabled={loading} className="flex-1 bg-accent text-bg py-3 rounded-xl font-bold hover:bg-accent-hover flex items-center justify-center gap-2 transition-all active:scale-95">Accept Entry</button>
                    <button onClick={() => setParsedItem(null)} className="flex-1 border border-border py-3 rounded-xl font-bold hover:bg-bg/50 text-text-secondary transition-all">Retry</button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-text-secondary mb-auto mt-20 opacity-80">
                  <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles size={32} />
                  </div>
                  <p className="text-xl font-display font-medium">What's the update?</p>
                  <p className="text-sm mt-1">"Paid ₹800 for broadband internet"</p>
                </div>
              )}

              <div className="flex gap-2 md:gap-3 relative z-10 w-full max-w-full">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleParseSingle()}
                  disabled={loading || !!parsedItem}
                  placeholder="Tell FinFlow about your activity..."
                  className="flex-1 min-w-0 bg-bg border-2 border-border rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:border-accent disabled:opacity-50 text-sm md:text-lg shadow-inner"
                />
                <button
                  onClick={handleParseSingle}
                  disabled={loading || !!parsedItem || !input.trim()}
                  className="shrink-0 bg-accent text-bg px-5 md:px-6 rounded-2xl hover:bg-accent-hover disabled:opacity-50 flex items-center justify-center transition-all shadow-lg"
                >
                  <ArrowRight size={20} className="md:w-[24px] md:h-[24px]" />
                </button>
              </div>
            </div>
          )}

          {mode === "paste" && (
            <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
              <div className="mb-6">
                <h3 className="text-xl font-display font-bold mb-1">Batch Processing</h3>
                <p className="text-sm text-text-secondary">Paste multiple lines or logs to parse them all at once.</p>
              </div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Example:
Paid uber 350
Got salary 80000
Food at mall 1200`}
                className="w-full h-56 bg-bg border-2 border-border rounded-2xl p-6 focus:outline-none focus:border-accent mb-6 font-mono text-sm resize-none shadow-inner"
              />
              <button
                onClick={handleParseBatch}
                disabled={loading || !input.trim()}
                className="w-full bg-accent text-bg py-4 flex items-center justify-center gap-2 rounded-2xl font-bold hover:bg-accent-hover disabled:opacity-50 mb-8 transition-transform active:scale-[0.99] shadow-lg shadow-accent/10"
              >
                <Sparkles size={20} /> {loading ? "Analyzing Context..." : "Extract Transactions"}
              </button>

              {parsedBatch.length > 0 && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display font-bold text-xl">Review Batch ({parsedBatch.length})</h3>
                    <div className="text-xs font-bold text-accent uppercase bg-accent/10 px-3 py-1 rounded-full">Automated Mapping</div>
                  </div>
                  <div className="space-y-3 mb-8 max-h-80 overflow-y-auto pr-2 custom-scrollbar border-y border-border/50 py-4">
                    {parsedBatch.map((t, i) => (
                      <div key={i} className="flex justify-between items-center bg-bg border border-border/50 p-4 rounded-2xl group hover:border-accent/40 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-accent font-bold"># {i + 1}</div>
                          <div>
                            <p className="font-bold text-sm text-text-primary capitalize">{t.description}</p>
                            <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">{t.category} • {t.type}</p>
                          </div>
                        </div>
                        <div className="font-mono text-sm font-black text-text-primary">₹{t.amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleConfirmBatch}
                    disabled={loading || storeLoading}
                    className="w-full bg-accent-blue text-bg py-4 flex items-center justify-center gap-2 rounded-2xl font-bold hover:bg-accent-blue/90 shadow-lg shadow-accent-blue/20 transition-all active:scale-[0.99]"
                  >
                    <CheckCircle size={20} /> Save All {parsedBatch.length} Entries
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === "csv" && (
            <div className="bg-surface border border-border rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                  <Upload size={32} />
                </div>
                <h3 className="text-2xl font-display font-bold mb-2">Import Statement</h3>
                <p className="text-text-secondary text-sm">Upload your bank statement or record CSV to batch import.</p>
              </div>

              {parsedBatch.length === 0 ? (
                <div className="space-y-8">
                  <div className="bg-bg/50 border-2 border-dashed border-border rounded-[2rem] p-12 group hover:border-accent/50 transition-all relative">
                    <input
                      type="file"
                      accept=".csv"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => e.target.files?.[0] && handleCsvUpload(e.target.files[0])}
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface text-text-muted flex items-center justify-center group-hover:text-accent group-hover:scale-110 transition-all shadow-inner">
                        <Upload size={24} />
                      </div>
                      <p className="font-bold">Select CSV File</p>
                    </div>
                  </div>

                  <div className="bg-bg/30 border border-border rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <Info size={20} className="text-accent-blue shrink-0 mt-0.5" />
                      <div className="space-y-3">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary">Expected Schema</p>
                        <div className="grid grid-cols-5 gap-2 text-[10px] font-mono text-text-muted uppercase font-bold text-center">
                          <div className="bg-surface p-1.5 rounded">Date</div>
                          <div className="bg-surface p-1.5 rounded">Desc</div>
                          <div className="bg-surface p-1.5 rounded">Amount</div>
                          <div className="bg-surface p-1.5 rounded">Category</div>
                          <div className="bg-surface p-1.5 rounded">Type</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-center mb-6 px-2">
                    <div className="flex items-center gap-3">
                      <FileText className="text-accent" />
                      <h4 className="font-display font-bold text-lg">Parsed {parsedBatch.length} records</h4>
                    </div>
                    <button onClick={() => setParsedBatch([])} className="text-xs font-bold text-accent-red underline underline-offset-4">Reset</button>
                  </div>

                  <div className="space-y-2 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar border-y border-border py-4">
                    {parsedBatch.slice(0, 10).map((t, i) => (
                      <div key={i} className="flex justify-between text-xs p-2 hover:bg-bg rounded-lg">
                        <span className="text-text-secondary truncate max-w-[200px]">{t.description}</span>
                        <span className="font-mono font-bold">₹{t.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                    {parsedBatch.length > 10 && <p className="text-[10px] text-center text-text-muted mt-2 italic">+ {parsedBatch.length - 10} more records obscured</p>}
                  </div>

                  <button
                    onClick={handleConfirmBatch}
                    disabled={loading || storeLoading}
                    className="w-full bg-accent text-bg py-4 rounded-2xl font-bold hover:bg-accent-hover shadow-lg shadow-accent/20 transition-all active:scale-[0.98]"
                  >
                    Save Import Data
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === "manual" && (
            <div className="bg-surface border border-border rounded-3xl p-8 max-w-lg mx-auto shadow-2xl">
              <h3 className="text-xl font-display font-bold mb-6">Standard Entrance</h3>
              <form onSubmit={handleManualSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-black text-text-muted mb-2 tracking-widest pl-1">Nature</label>
                    <select value={manualForm.type} onChange={e => setManualForm({ ...manualForm, type: e.target.value })} className="w-full bg-bg border-2 border-border rounded-2xl px-5 py-4 focus:outline-none focus:border-accent font-bold">
                      <option value="expense">Expense (-)</option>
                      <option value="income">Income (+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-black text-text-muted mb-2 tracking-widest pl-1">Volume (₹)</label>
                    <input type="number" required min="0" value={manualForm.amount} onChange={e => setManualForm({ ...manualForm, amount: e.target.value })} className="w-full bg-bg border-2 border-border rounded-2xl px-5 py-4 focus:outline-none focus:border-accent font-mono text-lg font-bold" placeholder="0.00" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-black text-text-muted mb-2 tracking-widest pl-1">Tag</label>
                  <select value={manualForm.category} onChange={e => setManualForm({ ...manualForm, category: e.target.value })} className="w-full bg-bg border-2 border-border rounded-2xl px-5 py-4 focus:outline-none focus:border-accent capitalize font-bold">
                    {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-black text-text-muted mb-2 tracking-widest pl-1">Memo</label>
                  <input type="text" required maxLength={100} value={manualForm.description} onChange={e => setManualForm({ ...manualForm, description: e.target.value })} className="w-full bg-bg border-2 border-border rounded-2xl px-5 py-4 focus:outline-none focus:border-accent" placeholder="What's this for?" />
                </div>

                <div>
                  <label className="block text-xs uppercase font-black text-text-muted mb-2 tracking-widest pl-1">Effective Date</label>
                  <input type="date" required value={manualForm.date} onChange={e => setManualForm({ ...manualForm, date: e.target.value })} className="w-full bg-bg border-2 border-border rounded-2xl px-5 py-4 focus:outline-none focus:border-accent font-bold" />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-accent text-bg py-4 flex items-center justify-center gap-2 rounded-2xl font-bold hover:bg-accent-hover mt-8 shadow-lg shadow-accent/20 transition-all active:scale-[0.98]">
                  {loading ? "Persisting..." : "Save Transaction"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
