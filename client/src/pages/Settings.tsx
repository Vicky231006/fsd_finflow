import { useAuthStore } from '../store/authStore';
import { User, LogOut, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-display font-semibold mb-6">Settings</h2>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><User size={18} /> Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary">Name</label>
            <p className="font-medium text-lg">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm text-text-secondary">Email</label>
            <p className="text-text-primary">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="font-display font-semibold mb-4">Preferences</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text-primary">Theme</p>
            <p className="text-sm text-text-secondary">Choose between light and dark mode.</p>
          </div>
          <div className="flex bg-bg border border-border rounded-xl p-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'light' ? 'bg-surface text-text-primary shadow-sm border border-border/50' : 'text-text-muted hover:text-text-primary'}`}
            >
              <Sun size={16} /> Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-surface text-accent shadow-sm border border-border/50' : 'text-text-muted hover:text-text-primary'}`}
            >
              <Moon size={16} /> Dark
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="font-display font-semibold mb-4 text-accent-red">Danger Zone</h3>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full md:w-auto text-accent-red hover:bg-accent-red/10 px-4 py-3 rounded-xl transition-colors font-bold border border-accent-red/20"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}
