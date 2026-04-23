import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, PlusCircle, Sparkles, Settings } from 'lucide-react';

export default function MobileNav() {
    const location = useLocation();

    const links = [
        { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
        { name: 'Transactions', path: '/app/transactions', icon: Receipt },
        { name: 'Add', path: '/app/input', icon: PlusCircle, special: true },
        { name: 'Advisor', path: '/app/advisor', icon: Sparkles },
        { name: 'Settings', path: '/app/settings', icon: Settings },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-4 py-2 flex items-center justify-between z-50">
            {links.map(link => {
                const isActive = location.pathname.startsWith(link.path);
                const Icon = link.icon;

                if (link.special) {
                    return (
                        <Link key={link.name} to={link.path} className="relative -top-5 bg-accent text-bg p-4 rounded-full shadow-lg shadow-accent/20 flex-shrink-0">
                            <Icon size={24} />
                        </Link>
                    );
                }

                return (
                    <Link key={link.name} to={link.path} className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}>
                        <Icon size={20} />
                        <span className="text-[10px] font-medium">{link.name}</span>
                    </Link>
                );
            })}
        </div>
    );
}
