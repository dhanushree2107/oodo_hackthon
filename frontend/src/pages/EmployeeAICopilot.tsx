import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, ShieldCheck, Terminal } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  tools?: string[];
  timestamp: string;
}

export const EmployeeAICopilot: React.FC = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: `Hello ${user?.full_name}! I am your Dayflow AI HR Copilot. Ask me about your leave balances, attendance logs, or salary slips.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: query });
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.data.reply,
        tools: res.data.tools_executed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'AI assistance is temporarily unavailable. Core HR operations remain operational.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col justify-between max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Dayflow AI HR Copilot
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono">
                RBAC PROTECTED
              </span>
            </h1>
            <p className="text-xs text-slate-400">Secure internal tool caller connected to PostgreSQL.</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'bot' && (
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div className={`max-w-xl space-y-2`}>
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-lg shadow-indigo-600/20'
                    : 'glass-panel border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
              </div>

              {/* Tool Execution Logs */}
              {m.tools && m.tools.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 w-fit">
                  <Terminal className="h-3 w-3" />
                  <span>Tools Executed: {m.tools.join(', ')}</span>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0 mt-1">
                {user?.full_name?.charAt(0)}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="glass-panel px-4 py-2 rounded-xl text-xs text-indigo-400 flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
              Executing tool permission checks & querying database...
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompt Presets & Input Bar */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => handleSend('What is my leave balance?')}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 text-[11px] font-semibold whitespace-nowrap"
          >
            "What is my leave balance?"
          </button>
          <button
            onClick={() => handleSend('Show my attendance summary.')}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-purple-400 text-[11px] font-semibold whitespace-nowrap"
          >
            "Show my attendance summary."
          </button>
          <button
            onClick={() => handleSend('When was my last salary slip generated?')}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-[11px] font-semibold whitespace-nowrap"
          >
            "Show my last payslip details."
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Copilot anything about your HR profile..."
            className="w-full pl-4 pr-12 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            onClick={() => handleSend()}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
