import { create } from 'zustand';
import { api } from '../api/axios';

interface User {
    id: string;
    name: string;
    email: string;
    currency?: string;
    goals?: {
        name: string;
        amount: number;
        deadline?: string;
        createdAt: string;
    }[];
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    login: (credentials: any) => Promise<void>;
    register: (details: any) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
    fetchConfig: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: localStorage.getItem('finflow_user') ? JSON.parse(localStorage.getItem('finflow_user')!) : null,
    accessToken: localStorage.getItem('finflow_access') || null,

    login: async (credentials) => {
        const { data } = await api.post('/auth/login', credentials);
        const { user, accessToken, refreshToken } = data.data;
        localStorage.setItem('finflow_user', JSON.stringify(user));
        localStorage.setItem('finflow_access', accessToken);
        localStorage.setItem('finflow_refresh', refreshToken);
        set({ user, accessToken });
    },

    register: async (details) => {
        const { data } = await api.post('/auth/register', details);
        const { user, accessToken, refreshToken } = data.data;
        localStorage.setItem('finflow_user', JSON.stringify(user));
        localStorage.setItem('finflow_access', accessToken);
        localStorage.setItem('finflow_refresh', refreshToken);
        set({ user, accessToken });
    },

    logout: async () => {
        try {
            const refreshToken = localStorage.getItem('finflow_refresh');
            if (refreshToken) {
                await api.post('/auth/logout', { refreshToken });
            }
        } catch { }
        localStorage.clear();
        set({ user: null, accessToken: null });
        window.location.href = '/login';
    },

    refreshToken: async () => {
        const token = localStorage.getItem('finflow_refresh');
        if (!token) throw new Error("No refresh token");
        const { data } = await api.post('/auth/refresh', { refreshToken: token });
        const { accessToken, refreshToken } = data.data;
        localStorage.setItem('finflow_access', accessToken);
        localStorage.setItem('finflow_refresh', refreshToken);
        set({ accessToken });
    },

    fetchConfig: async () => {
        try {
            const { data } = await api.get('/auth/me');
            const u = data.data.user;
            set({ user: { ...u, id: u._id } });
            localStorage.setItem('finflow_user', JSON.stringify({ ...u, id: u._id }));
        } catch (err) { }
    }
}));
