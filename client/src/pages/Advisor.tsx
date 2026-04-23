import { useEffect, useState, useRef } from 'react';
import { useAdvisorStore } from '../store/advisorStore';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Send, MessageSquarePlus, Trash2 } from 'lucide-react';

export default function Advisor() {
  const { conversations, activeConversation, isStreaming, loadConversations, createConversation, loadConversation, deleteConversation, sendMessage } = useAdvisorStore();
  const [input, setInput] = useState("");
  const [streamBuffer, setStreamBuffer] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, streamBuffer]);

  const handleStartNew = async () => {
    const id = await createConversation();
    await loadConversation(id);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !activeConversation) return;
    const msg = input;
    setInput("");
    setStreamBuffer("");
    await sendMessage(activeConversation._id, msg, (chunk) => {
      setStreamBuffer(prev => prev + chunk);
    });
    setStreamBuffer("");
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] gap-6 max-w-5xl mx-auto w-full">
      {/* Sidebar - Desktop / Full Mobile when NO active chat */}
      <div className={`${activeConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 bg-surface border border-border rounded-2xl p-4 overflow-hidden`}>
        <button onClick={handleStartNew} className="w-full bg-accent text-bg py-3 flex items-center justify-center gap-2 rounded-xl font-bold hover:bg-accent-hover mb-6 transition-colors">
          <MessageSquarePlus size={18} /> New Chat
        </button>
        <h3 className="text-text-secondary text-sm font-medium mb-3 px-2">Recent Chats</h3>
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
          {conversations.map(c => (
            <div key={c._id} className={`group flex items-center justify-between p-1 rounded-xl transition-colors ${activeConversation?._id === c._id ? 'bg-bg text-accent' : 'hover:bg-bg/50 text-text-primary'}`}>
              <button
                onClick={() => loadConversation(c._id)}
                className="flex-1 text-left p-2 rounded-xl transition-colors truncate text-sm"
              >
                {c.title}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(c._id);
                }}
                className="p-2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-all"
                title="Delete Chat"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area - Full Mobile when active chat exists */}
      <div className={`${!activeConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-surface border border-border rounded-2xl overflow-hidden relative`}>
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8 text-center">
            <Sparkles size={48} className="mb-4 opacity-20 text-accent-purple animate-pulse" />
            <h2 className="text-xl font-display font-semibold mb-2">FinFlow AI Advisor</h2>
            <p className="max-w-md">Your personal wealth coach. Start a conversation to analyze spending, plan budgets, or ask financial advice.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-bg/50 border-b border-border p-4 flex items-center gap-3">
              <button
                onClick={() => useAdvisorStore.setState({ activeConversation: null })}
                className="md:hidden p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors"
                title="Back to Chats"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-display font-semibold">AI Advisor</h3>
                <p className="text-xs text-text-secondary">Using Gemini Flash</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
              {activeConversation.messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-bg border border-border rounded-br-sm' : 'bg-accent-purple/10 border border-accent-purple/20 rounded-bl-sm prose prose-invert prose-p:leading-relaxed prose-pre:bg-bg prose-pre:border prose-pre:border-border'}`}>
                    {m.role === 'user' ? (
                      <p>{m.content}</p>
                    ) : (
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}

              {isStreaming && streamBuffer && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] md:max-w-[70%] p-4 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 rounded-bl-sm prose prose-invert">
                    <ReactMarkdown>{streamBuffer}</ReactMarkdown>
                    <span className="inline-block w-2 h-4 bg-accent-purple animate-pulse ml-1 align-middle"></span>
                  </div>
                </div>
              )}
              {isStreaming && !streamBuffer && (
                <div className="flex justify-start">
                  <div className="p-4 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 rounded-bl-sm flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-bg/50 border-t border-border">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isStreaming}
                  placeholder="Ask about your spending, investments, or SIPs..."
                  className="w-full bg-surface border border-border rounded-xl pl-4 pr-14 py-4 focus:outline-none focus:border-accent-purple transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent-purple text-bg rounded-lg flex items-center justify-center hover:bg-accent-purple/90 disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[10px] text-text-secondary">FinFlow AI can make mistakes. Consider verifying important information.</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
