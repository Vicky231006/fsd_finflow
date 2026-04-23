import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, PlusCircle, Target, Sparkles, Settings, Calendar as CalendarIcon } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();

    const links = [
        { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
        { name: 'Transactions', path: '/app/transactions', icon: Receipt },
        { name: 'Add', path: '/app/input', icon: PlusCircle },
        { name: 'Budgets', path: '/app/budgets', icon: Target },
        { name: 'Calendar', path: '/app/calendar', icon: CalendarIcon },
        { name: 'Advisor', path: '/app/advisor', icon: Sparkles },
        { name: 'Settings', path: '/app/settings', icon: Settings },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 h-full bg-surface border-r border-border p-4">
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-display font-bold text-bg">F</div>
                <span className="font-display font-bold text-xl">FinFlow AI</span>
            </div>
            <nav className="flex-1 space-y-2">
                {links.map(link => {
                    const isActive = location.pathname.startsWith(link.path);
                    const Icon = link.icon;
                    return (
                        <Link key={link.name} to={link.path} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${isActive ? 'bg-bg text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-surface-glass'}`}>
                            <Icon size={20} className={isActive ? "text-accent" : ""} />
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
