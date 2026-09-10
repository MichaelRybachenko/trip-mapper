import React, { useState, useRef, useEffect } from 'react';
import { TripData, ChatMessage } from '../types';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Compass, 
  Wine, 
  Clock, 
  RotateCcw,
  Lightbulb
} from 'lucide-react';

interface ConciergeChatProps {
  trip: TripData;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    timestamp: 'Just now',
    content: `Hello! I am your AI Vacation Concierge for your **${'Grand Mediterranean & UK Adventure'}**. 

I have analyzed your entire schedule across San Francisco, London, Athens, Naxos, Venice, Florence, Tuscany (Montepulciano), Pesaro, Rome, Terracina, and Manchester.

How can I assist you today? You can ask me about:
- **Local dining & hidden gems** near your Airbnbs
- **Ferry & flight connections** (like the Piraeus to Naxos ferry)
- **Tuscany driving advice & scenic stops** from Florence to Montepulciano
- **Packing & seasonal weather** for September & October in the Mediterranean`,
    suggestedActions: [
      'Best sunset seafood spot near Mikrolimano Airbnb?',
      'Tips for driving the rental car in Tuscany',
      'What are must-dos in Naxos during late September?',
      'How to spend 2 days in Venice near Ponte Delle Guglie?',
    ],
  },
];

export const ConciergeChat: React.FC<ConciergeChatProps> = ({ trip }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'concierge' | 'local_guide' | 'foodie' | 'logistics'>('local_guide');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          history: historyPayload,
          tripContext: trip,
          role: activeRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: data.suggestedActions || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: "I apologize, but I encountered a slight hiccup generating that answer. Could you ask again or try rephrasing?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Chat request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: "Network error communicating with the concierge service. Please check your connection and try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Chat Header & Persona Selector */}
      <div className="p-3.5 border-b border-slate-200 bg-white sticky top-0 z-10 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">Gemini Concierge</h3>
              <p className="text-[11px] text-slate-500">Live AI Assistant for your trip</p>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            title="Reset conversation"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Persona Tabs */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => setActiveRole('local_guide')}
            className={`px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeRole === 'local_guide'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Local Insider</span>
          </button>
          <button
            onClick={() => setActiveRole('foodie')}
            className={`px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeRole === 'foodie'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Wine className="w-3 h-3" />
            <span>Food & Wine</span>
          </button>
          <button
            onClick={() => setActiveRole('logistics')}
            className={`px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeRole === 'logistics'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Logistics</span>
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs shadow-xs space-y-2'
                }`}
              >
                {/* Format markdown style simple lists and bolds */}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              </div>

              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>

              {/* Quick suggestion chips */}
              {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                  {msg.suggestedActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(action)}
                      className="text-[11px] font-medium bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-700 px-2.5 py-1 rounded-xl shadow-2xs transition-all text-left"
                    >
                      💡 {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl max-w-[70%] text-xs text-slate-500 shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
            <span>Consulting regional travel knowledge...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="p-3 border-t border-slate-200 bg-white sticky bottom-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about stops, dining, routes, or local customs..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
