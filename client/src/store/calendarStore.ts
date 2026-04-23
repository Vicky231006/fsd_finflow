import { create } from 'zustand';
import { api } from '../api/axios';

interface CalendarState {
    monthlyData: Record<string, any[]>; // Format: "YYYY-MM": transactions[]
    loading: boolean;
    fetchMonth: (year: number, month: number, force?: boolean) => Promise<void>;
    clearCache: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
    monthlyData: {},
    loading: false,

    fetchMonth: async (year, month, force = false) => {
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        const existing = get().monthlyData[key];

        if (existing && !force) return;

        set({ loading: true });
        try {
            // Fetch transactions for the specific month
            const startDate = new Date(year, month, 1).toISOString();
            const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

            const { data } = await api.get('/transactions', {
                params: {
                    startDate,
                    endDate,
                    limit: 1000 // Get all for the month
                }
            });

            set((state) => ({
                monthlyData: {
                    ...state.monthlyData,
                    [key]: data.data
                },
                loading: false
            }));
        } catch (err) {
            console.error("fetchMonth failed:", err);
            set({ loading: false });
        }
    },

    clearCache: () => set({ monthlyData: {} })
}));
