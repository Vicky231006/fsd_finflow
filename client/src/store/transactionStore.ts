import { create } from 'zustand';
import { api } from '../api/axios';
import { useAnalyticsStore } from './analyticsStore';
import { useBudgetStore } from './budgetStore';
import toast from 'react-hot-toast';

interface Transaction {
    _id: string;
    amount: number;
    type: "expense" | "income";
    category: string;
    description: string;
    date: string;
    source: "chat" | "paste" | "manual" | "csv";
}

interface TransactionState {
    transactions: Transaction[];
    loading: boolean;
    progress: number; // 0 to 100
    filters: any;
    meta: {
        total: number;
        page: number;
        limit: number;
    };
    fetchTransactions: (filters?: any, append?: boolean) => Promise<void>;
    addTransaction: (t: any) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    confirmBatch: (transactions: any[]) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
    transactions: [],
    loading: false,
    progress: 0,
    filters: { limit: 50, page: 1 },
    meta: { total: 0, page: 1, limit: 50 },

    fetchTransactions: async (f, append = false) => {
        set({ loading: true });
        try {
            const currentFilters = get().filters;
            const updatedFilters = { ...currentFilters, ...f };

            const { data } = await api.get('/transactions', { params: updatedFilters });

            set((state) => ({
                transactions: append ? [...state.transactions, ...data.data] : data.data,
                meta: data.meta,
                filters: updatedFilters,
                loading: false
            }));
        } catch (err) {
            console.error("fetchTransactions failed:", err);
            set({ loading: false });
        }
    },

    addTransaction: async (t) => {
        set({ loading: true });
        await api.post('/transactions', t);
        get().fetchTransactions({ page: 1 }, false);
        useAnalyticsStore.getState().fetchAll(undefined, true);
        useBudgetStore.getState().fetchBudgets();
        window.dispatchEvent(new CustomEvent('transaction-mutation'));
        set({ loading: false });
    },

    deleteTransaction: async (id) => {
        await api.delete(`/transactions/${id}`);
        get().fetchTransactions({ page: 1 }, false);
        useAnalyticsStore.getState().fetchAll(undefined, true);
        useBudgetStore.getState().fetchBudgets();
        window.dispatchEvent(new CustomEvent('transaction-mutation'));
    },

    confirmBatch: async (transactions) => {
        if (!transactions.length) return;
        set({ loading: true, progress: 0 });

        const chunkSize = 100;
        const total = transactions.length;
        let processed = 0;

        try {
            // Processing in sequential chunks to provide meaningful UI feedback
            for (let i = 0; i < total; i += chunkSize) {
                const chunk = transactions.slice(i, i + chunkSize);
                await api.post('/transactions/confirm/batch', { transactions: chunk });
                processed += chunk.length;
                set({ progress: Math.min(100, Math.round((processed / total) * 100)) });
            }

            get().fetchTransactions({ page: 1 }, false);
            useAnalyticsStore.getState().fetchAll(undefined, true);
            useBudgetStore.getState().fetchBudgets();
            window.dispatchEvent(new CustomEvent('transaction-mutation'));
            toast.success(`Successfully saved ${total} transactions!`);
        } catch (err: any) {
            console.error("Batch confirm failed:", err);
            toast.error(err.response?.data?.error?.message || "Critical sync error");
            set({ progress: 0 });
        } finally {
            setTimeout(() => set({ loading: false, progress: 0 }), 500);
        }
    }
}));
