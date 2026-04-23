import { create } from 'zustand';
import { api } from '../api/axios';

interface Budget {
    _id: string;
    category: string;
    limit: number;
    spent: number;
}

interface BudgetState {
    budgets: Budget[];
    loading: boolean;
    fetchBudgets: () => Promise<void>;
    addBudget: (category: string, limit: number) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
    budgets: [],
    loading: false,

    fetchBudgets: async () => {
        set({ loading: true });
        try {
            const { data } = await api.get('/budgets/status');
            set({ budgets: data.data, loading: false });
        } catch {
            set({ loading: false });
        }
    },

    addBudget: async (category, limit) => {
        await api.post('/budgets', { category, limit });
        get().fetchBudgets();
    },

    deleteBudget: async (id) => {
        await api.delete(`/budgets/${id}`);
        get().fetchBudgets();
    }
}));
