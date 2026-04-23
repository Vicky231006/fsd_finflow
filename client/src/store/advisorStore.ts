import { create } from 'zustand';
import { api } from '../api/axios';
import { useAuthStore } from './authStore';

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

interface Conversation {
    _id: string;
    title: string;
    messages: Message[];
}

interface AdvisorState {
    conversations: any[];
    activeConversation: Conversation | null;
    isStreaming: boolean;
    loadConversations: () => Promise<void>;
    createConversation: () => Promise<string>;
    loadConversation: (id: string) => Promise<void>;
    deleteConversation: (id: string) => Promise<void>;
    sendMessage: (id: string, content: string, onStreamChunk: (text: string) => void) => Promise<void>;
}

export const useAdvisorStore = create<AdvisorState>((set, get) => ({
    conversations: [],
    activeConversation: null,
    isStreaming: false,

    loadConversations: async () => {
        const { data } = await api.get('/advisor/conversations');
        set({ conversations: data.data });
    },

    createConversation: async () => {
        const { data } = await api.post('/advisor/conversations');
        get().loadConversations();
        return data.data._id;
    },

    loadConversation: async (id) => {
        const { data } = await api.get(`/advisor/conversations/${id}`);
        set({ activeConversation: data.data });
    },

    deleteConversation: async (id) => {
        await api.delete(`/advisor/conversations/${id}`);
        if (get().activeConversation?._id === id) {
            set({ activeConversation: null });
        }
        await get().loadConversations();
    },

    sendMessage: async (id, content, onStreamChunk) => {
        console.log(`[STREAM] Starting message for conversation ${id}`);
        set({ isStreaming: true });

        // Optimistic update for User Message
        const active = get().activeConversation;
        if (active && active._id === id) {
            set({
                activeConversation: {
                    ...active,
                    messages: [...active.messages, { role: "user", content, timestamp: new Date().toISOString() }]
                }
            });
        }

        try {
            const token = useAuthStore.getState().accessToken;
            console.log(`[STREAM] URL: ${api.defaults.baseURL}/advisor/conversations/${id}/message`);

            const response = await fetch(`${api.defaults.baseURL}/advisor/conversations/${id}/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ message: content })
            });

            if (!response.body) throw new Error("No body");
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let assistantMsg = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunkStr = decoder.decode(value);
                const lines = chunkStr.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const raw = line.replace('data: ', '').trim();
                        if (raw === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(raw);
                            if (parsed.text) {
                                assistantMsg += parsed.text;
                                onStreamChunk(parsed.text);
                            }
                            if (parsed.error) {
                                onStreamChunk(`\n\n> [!CAUTION]\n> \${parsed.error}`);
                            }
                        } catch (e) { }
                    }
                }
            }

            // Optimistic update for Assistant Message
            const finalActive = get().activeConversation;
            const finalMsgContent = assistantMsg.trim() || "**FinFlow AI is briefly offline. Checking your connection...**";
            if (finalActive && finalActive._id === id) {
                set({
                    activeConversation: {
                        ...finalActive,
                        messages: [...finalActive.messages, { role: "assistant", content: finalMsgContent, timestamp: new Date().toISOString() }]
                    }
                });
            }

            // Sync with backend after a slight delay to allow mongoose save to complete
            setTimeout(() => {
                get().loadConversation(id);
            }, 1500);
        } finally {
            set({ isStreaming: false });
        }
    }
}));
