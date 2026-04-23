import { useAuthStore } from '../store/authStore';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function TopBar() {
    const { user, logout } = useAuthStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <header className="w-full h-16 bg-bg/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-8 z-40 sticky top-0">
            <div className="flex md:hidden items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-display font-bold text-bg">F</div>
            </div>
            <div className="hidden md:block">
                <h1 className="text-xl font-display font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4 relative" ref={menuRef}>
                <div
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center font-medium cursor-pointer hover:border-accent transition-colors select-none"
                >
                    {user?.name?.charAt(0).toUpperCase()}
                </div>

                {menuOpen && (
                    <div className="absolute top-14 right-0 w-48 bg-surface border border-border rounded-2xl shadow-xl py-2 flex flex-col z-50 outline-none">
                        <div className="px-4 py-2 border-b border-border/50 mb-2 outline-none">
                            <p className="font-bold text-sm truncate">{user?.name}</p>
                            <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                        </div>
                        <button onClick={toggleTheme} className="px-4 py-2 text-left text-sm hover:bg-bg/50 transition-colors flex items-center gap-3 text-text-secondary hover:text-text-primary outline-none">
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <button onClick={() => { setMenuOpen(false); logout(); }} className="px-4 py-2 text-left text-sm hover:bg-accent-red/10 transition-colors flex items-center gap-3 text-accent-red mt-1 outline-none">
                            <LogOut size={16} /> Sign out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
