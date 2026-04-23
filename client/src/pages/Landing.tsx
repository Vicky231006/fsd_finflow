import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageSquare, Zap, Wallet, Building, Coins, Receipt, CreditCard, TrendingUp, PieChart, Banknote, Shield, Activity, Cpu, Layers } from 'lucide-react';

export default function Landing() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const handleRoute = (path: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate(path);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-lime-400/30 overflow-x-hidden">

      {/* Full-screen Lime Wipe Transition */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[#a3e635] flex items-center justify-center flex-col gap-4 text-[#0a0a0a]"
          >
            <Sparkles className="animate-spin" size={64} />
            <span className="font-bold font-mono text-2xl tracking-widest uppercase">Initializing</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <header className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded bg-lime-400 flex items-center justify-center font-bold text-[#0a0a0a] text-xl">F</div>
          <span className="font-bold text-xl tracking-tight">FinFlow AI</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => handleRoute('/login')} className="text-gray-400 hover:text-white font-medium transition-colors">Log in</button>
          <button onClick={() => handleRoute('/register')} className="bg-lime-400 text-[#0a0a0a] px-6 py-2.5 rounded-full font-bold hover:bg-lime-300 transition-colors shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)]">
            Get Started
          </button>
        </div>
      </header>

      {/* Section A: The Hero */}
      <section className="relative pt-24 pb-32 px-4 flex flex-col items-center justify-center min-h-[80vh] overflow-hidden">
        {/* Floating Icons Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-[15%] left-[10%] p-4 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 hidden md:block">
            <Wallet className="text-gray-400" size={32} />
          </motion.div>
          <motion.div animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute top-[25%] right-[12%] p-4 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 hidden md:block">
            <Building className="text-gray-400" size={32} />
          </motion.div>
          <motion.div animate={{ y: [0, -15, 0], x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 2 }} className="absolute bottom-[20%] left-[18%] p-4 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 hidden md:block">
            <Coins className="text-gray-400" size={32} />
          </motion.div>
          <motion.div animate={{ y: [0, 15, 0], x: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 0.5 }} className="absolute bottom-[22%] right-[22%] p-4 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 hidden md:block">
            <Receipt className="text-gray-400" size={32} />
          </motion.div>

          {/* New Floating Icons */}
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1.5 }} className="absolute top-[10%] left-[40%] p-3 bg-lime-400/[0.03] backdrop-blur-sm rounded-xl border border-lime-400/10 hidden lg:block">
            <CreditCard className="text-lime-400/40" size={24} />
          </motion.div>
          <motion.div animate={{ y: [0, -25, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.2 }} className="absolute top-[45%] left-[5%] p-3 bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/5 hidden lg:block">
            <TrendingUp className="text-gray-500" size={24} />
          </motion.div>
          <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute bottom-[40%] right-[8%] p-3 bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/5 hidden lg:block">
            <Cpu className="text-gray-500" size={24} />
          </motion.div>
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2.5 }} className="absolute top-[60%] left-[25%] p-3 bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/5 hidden lg:block">
            <PieChart className="text-gray-500" size={20} />
          </motion.div>
          <motion.div animate={{ x: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 3 }} className="absolute bottom-[10%] right-[40%] p-3 bg-lime-400/[0.03] backdrop-blur-sm rounded-xl border border-lime-400/10 hidden lg:block">
            <Banknote className="text-lime-400/40" size={24} />
          </motion.div>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 leading-tight px-2 break-words">
            Find the right financial clarity. <br />
            <span className="text-lime-400" style={{ textShadow: "0 0 40px rgba(163,230,53,0.3)" }}>Instantly.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 md:mb-12 px-4 whitespace-normal break-words">
            Dump your messy SMS, chats, and receipts. FinFlow's AI structures it all for you automatically so you never lose track.
          </p>

          {/* Mock Search Bar */}
          <div className="w-[90%] md:w-full max-w-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row items-center gap-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative mb-8">
            <div className="flex items-center gap-3 w-full border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 pr-0 md:pr-4 min-w-0">
              <Sparkles className="text-lime-400 shrink-0 animate-pulse ml-2" size={20} />
              <div className="flex-1 text-left text-gray-400 font-mono text-xs md:text-sm truncate min-w-0">
                Spent ₹450 on swiggy and ₹1200 at starbucks...
              </div>
            </div>
            <button onClick={() => handleRoute('/register')} className="bg-lime-400 text-[#0a0a0a] px-6 py-2.5 md:py-3 rounded-xl font-bold w-full md:w-auto flex items-center justify-center gap-2 hover:bg-lime-300 transition-colors mx-auto">
              Parse with AI
            </button>
          </div>

          <button onClick={() => handleRoute('/register')} className="bg-lime-400/10 text-lime-400 border border-lime-400/30 px-6 py-2 rounded-full text-sm font-medium hover:bg-lime-400/20 transition-colors flex items-center gap-2">
            Start for free <span className="text-lg leading-none">👋</span>
          </button>
        </div>
      </section>

      {/* Section B: Alternating Feature Blocks */}
      <section className="py-24 px-4 max-w-5xl mx-auto space-y-32">
        {/* Feature 1 */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight tracking-tight">Got an unstructured SMS? We parse it.</h2>
            <p className="text-gray-400 text-lg leading-relaxed">Copy-paste an entire month of bank messages. Our deep-learning NLP extracts amounts, identifies categories, and structure your ledger flawlessly.</p>
          </div>
          <div className="flex-1 w-full bg-white/[0.02] border border-white/10 p-6 rounded-3xl backdrop-blur-md relative shadow-2xl">
            <div className="absolute -top-4 -right-4 bg-lime-400/20 text-lime-400 px-4 py-1.5 rounded-full text-xs font-bold font-mono border border-lime-400/30 shadow-lg shadow-lime-400/10">Auto-Detected</div>
            <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl mb-4 font-mono text-xs md:text-sm text-gray-400 leading-relaxed shadow-inner">
              "Acct XX123: INR 850.00 debited on 12-Apr to ZOMATO. Avl Bal INR 14,200."
            </div>
            <div className="flex flex-col items-center opacity-50">
              <div className="h-6 w-px bg-lime-400/50 my-1"></div>
            </div>
            <div className="bg-white/[0.05] border border-white/10 w-full p-5 rounded-2xl flex justify-between items-center shadow-lg">
              <div>
                <p className="font-bold text-white text-lg">Zomato</p>
                <p className="text-xs text-lime-400">Category: Food</p>
              </div>
              <p className="font-mono font-bold text-lime-400 text-xl">-₹850</p>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight tracking-tight">Ask a question, get an <span className="text-lime-400">instant</span> response.</h2>
            <p className="text-gray-400 text-lg leading-relaxed">Your data isn't just stored; it's conversable. Talk to your finances like you would an expert wealth manager right within the app.</p>
          </div>
          <div className="flex-1 w-full bg-white/[0.02] border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-6 -left-6 opacity-10 pointer-events-none">
              <PieChart size={100} />
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-tl-xl rounded-tr-xl rounded-br-none rounded-bl-xl mb-6 text-sm text-white w-[85%] self-end ml-auto shadow-inner relative z-10">
              <p className="font-mono text-gray-300">"How much did I spend on food this month?"</p>
            </div>
            <div className="bg-lime-400/10 border border-lime-400/20 p-5 rounded-tr-xl rounded-br-xl rounded-bl-xl rounded-tl-none text-sm text-white w-[90%] mr-auto flex gap-3 shadow-lg shadow-lime-400/5 relative z-10">
              <Sparkles className="text-lime-400 shrink-0 mt-0.5" size={18} />
              <p className="leading-relaxed">You've spent <span className="text-lime-400 font-mono font-bold">₹14,250</span> on food so far, which is 12% lower than your average. Great job cutting back on Swiggy!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section C: Value Props */}
      <section className="py-24 px-4 max-w-7xl mx-auto text-center">
        <p className="text-lime-400 font-bold tracking-widest text-sm mb-4 uppercase">Features</p>
        <h2 className="text-4xl md:text-6xl font-extrabold mb-16 tracking-tight">Get <span className="text-lime-400">more value</span> from your tools</h2>
        <div className="grid md:grid-cols-3 gap-6 text-left relative">
          {/* Subtle Decorative Icons for Cards */}
          <div className="absolute -top-12 -left-12 opacity-10 pointer-events-none hidden lg:block">
            <Layers className="text-lime-400" size={120} />
          </div>
          <div className="absolute -bottom-12 -right-12 opacity-10 pointer-events-none hidden lg:block">
            <Activity className="text-lime-400" size={120} />
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md hover:bg-white/[0.04] transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity">
              <MessageSquare size={80} />
            </div>
            <MessageSquare className="text-lime-400 mb-6" size={32} />
            <h3 className="text-xl font-bold mb-3">Context-Aware NLP</h3>
            <p className="text-gray-400 leading-relaxed">Our models understand Indian financial context out-of-the-box. 'UPI', 'NEFT', 'Swiggy' - it knows them all natively.</p>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md hover:bg-white/[0.04] transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity">
              <Zap size={80} />
            </div>
            <Zap className="text-lime-400 mb-6" size={32} />
            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-gray-400 leading-relaxed">Powered by Gemini 2.5 Flash, your queries and transaction parsing happen near-instantaneously without bloat.</p>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md hover:bg-white/[0.04] transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity">
              <Shield size={80} />
            </div>
            <Shield className="text-lime-400 mb-6" size={32} />
            <h3 className="text-xl font-bold mb-3">Bank-grade Privacy</h3>
            <p className="text-gray-400 leading-relaxed">Your data is strictly yours. Strict backend anonymization pipelines ensure your raw financials are secure.</p>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-gray-500 text-sm mt-12 bg-[#0a0a0a]">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded bg-lime-400 flex items-center justify-center font-bold text-[#0a0a0a] text-xs">F</div>
          <span className="font-bold text-white tracking-tight">FinFlow AI</span>
        </div>
        <p>© 2026 FinFlow AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
