import { create } from 'zustand';
import { api } from '../api/axios';

interface AnalyticsState {
    summary: any | null;
    allTimeSummary: any | null;
    categoryBreakdown: any[];
    trends: any[];
    forecast: any | null;
    loading: boolean;
    lastFetched: number | null;
    fetchAll: (period?: string, force?: boolean) => Promise<void>;
}

let fetchLock = false; // Singleton lock outside the store

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
    summary: null,
    allTimeSummary: null,
    categoryBreakdown: [],
    trends: [],
    forecast: null,
    loading: false,
    lastFetched: null,

    fetchAll: async (period = "currentMonth", force = false) => {
        const { lastFetched } = get();
        const now = Date.now();

        // Strict Singleton + Time Cache (30s)
        if (fetchLock) return;
        if (lastFetched && (now - lastFetched < 30000) && !force) return;

        fetchLock = true;
        set({ loading: true });

        try {
            console.log(`[AnalyticsStore] Fetching all data... (${period})`);
            const [sumRes, allSumRes, catRes, trendRes, forcRes] = await Promise.all([
                api.get(`/analytics/summary?period=${period}`),
                api.get(`/analytics/summary?period=all`),
                api.get(`/analytics/by-category?period=${period}`),
                api.get(`/analytics/trends`),
                api.get(`/analytics/forecast`)
            ]);

            set({
                summary: sumRes.data.data,
                allTimeSummary: allSumRes.data.data,
                categoryBreakdown: catRes.data.data,
                trends: trendRes.data.data,
                forecast: forcRes.data.data,
                loading: false,
                lastFetched: now
            });
        } catch (err) {
            console.error("[AnalyticsStore] FetchAll failed:", err);
            set({ loading: false });
        } finally {
            fetchLock = false;
        }
    }
}));
