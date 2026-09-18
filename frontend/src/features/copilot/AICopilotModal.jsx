import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, Send, Bot, User, ArrowRight, Terminal, Cpu, 
  Key, Check, Shield, Info, HelpCircle 
} from 'lucide-react';
import { api } from '../../api/client';

const PREFED_PROMPTS = [
  { label: "Sunil Ward Risk", icon: "🏔️", text: "Why is Sunil Ward marked as Critical Priority 1?" },
  { label: "Wayanad Mudslide", icon: "🌴", text: "Tell me about Wayanad mudslides" },
  { label: "Shelters 300+ Cap", icon: "🏢", text: "Which shelters can absorb 300 evacuees?" },
  { label: "Blocked Corridors", icon: "🛣️", text: "Which mountain road corridors have high landslide risk?" },
  { label: "Sphere Standards", icon: "📜", text: "What are Sphere humanitarian standards?" },
  { label: "Landslide Protocol", icon: "⛰️", text: "What should people do during a landslide?" },
  { label: "Emergency Go-Bag", icon: "🎒", text: "What goes in an emergency evacuation kit?" },
  { label: "ResQ Twin Simulation", icon: "⚡", text: "What is ResQ Twin counterfactual simulation?" },
  { label: "InSAR Radar Feeds", icon: "🛰️", text: "How does satellite InSAR detect landslide subsidence?" },
  { label: "Priority 1 Habitations", icon: "🔴", text: "Show all Critical Priority 1 habitations across India" },
  { label: "Chamoli Vulnerability", icon: "🏔️", text: "What is Chamoli and why was it vulnerable?" }
];

export default function AICopilotModal({ 
  isOpen, 
  onClose, 
  onSelectHabitation, 
  onNavigate,
  theme = 'light' 
}) {
  const isDark = theme === 'dark';
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 **ResQZone AI Copilot Online.**\n\nI am your real-time crisis operations assistant for Intelligent Hazard Red Zone Identification, Dynamic Carrying Capacity, and Evacuation Logistics (SIH26191).\n\nAsk me **ANY** question or click any of the verified operational prompts below.",
      structured: null,
      suggestions: [
        "Why is Sunil Ward marked as Critical Priority 1?",
        "Which shelters can absorb 300 evacuees?",
        "What should people do during a landslide?",
        "What are Sphere humanitarian standards?"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('resqzone_gemini_key') || '');
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      localStorage.setItem('resqzone_gemini_key', apiKeyInput.trim());
    } else {
      localStorage.removeItem('resqzone_gemini_key');
    }
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyModal(false);
    }, 1200);
  };

  const handleSend = async (queryText) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend) return;

    const newMsgList = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMsgList);
    setInput('');
    setLoading(true);

    try {
      const storedKey = localStorage.getItem('resqzone_gemini_key') || null;
      const res = await api.askCopilot(textToSend, storedKey);
      setMessages([
        ...newMsgList,
        {
          sender: 'bot',
          text: res.response,
          structured: res.structured_data,
          suggestions: res.suggested_actions || []
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMsgList,
        {
          sender: 'bot',
          text: "⚠️ Telemetry graph temporarily unavailable. Please try one of the verified suggestions below.",
          suggestions: [
            "Why is Sunil Ward marked as Critical Priority 1?",
            "Which shelters can absorb 300 evacuees?",
            "What are Sphere humanitarian standards?"
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      <div className={`border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[94vh] sm:h-[660px] transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.1] text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-3.5 border-b ${
          isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/90'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm tracking-tight">ResQ AI Copilot</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}>
                  Spatial Intelligence
                </span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Answers any disaster, shelter, routing, or safety question
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Optional Gemini Key Button */}
            <button
              onClick={() => setShowKeyModal(!showKeyModal)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1 border transition-all ${
                apiKeyInput 
                  ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                  : (isDark ? 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-100')
              }`}
              title="Configure Optional Google Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{apiKeyInput ? 'LLM Live' : 'Add Key'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional API Key Input Drawer */}
        {showKeyModal && (
          <div className={`p-4 border-b text-xs animate-fade-in ${
            isDark ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold flex items-center gap-1.5 text-xs">
                <Key className="w-3.5 h-3.5 text-sky-500" />
                Optional Google Gemini API Key
              </span>
              <span className="text-[10px] text-slate-400">Zero keys required for built-in GIS graph</span>
            </div>
            <form onSubmit={handleSaveKey} className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy... (leave empty to use local graph engine)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
              >
                {keySaved ? <Check className="w-3.5 h-3.5" /> : 'Save'}
              </button>
            </form>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] p-4 rounded-2xl space-y-2.5 leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-medium rounded-tr-none shadow-md shadow-sky-500/20'
                    : (isDark ? 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none' : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none')
                }`}
              >
                <div className="whitespace-pre-line text-xs sm:text-[13px] leading-relaxed">{m.text}</div>

                {/* Structured Table If Provided */}
                {m.structured && Array.isArray(m.structured) && m.structured.length > 0 && (
                  <div className={`mt-2 pt-2 border-t overflow-x-auto ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <table className="w-full text-left text-[11px]">
                      <thead className="opacity-60 font-bold text-[10px] uppercase">
                        <tr>
                          <th className="pb-1.5">ENTITY</th>
                          <th className="pb-1.5">STATUS / METRICS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800">
                        {m.structured.slice(0, 5).map((item, i) => (
                          <tr key={i}>
                            <td className="py-1.5 font-bold">{item.name}</td>
                            <td className="py-1.5 text-sky-600 dark:text-sky-400 font-semibold">
                              {item.available_capacity !== undefined 
                                ? `${item.available_capacity} free beds (${item.bottleneck})` 
                                : `Risk: ${item.hazard_score || item.risk || 'Priority'}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Follow-up Suggested Action Chips */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {m.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(sug)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                          isDark 
                            ? 'bg-slate-800/90 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border-slate-700' 
                            : 'bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border-slate-200 shadow-2xs'
                        }`}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-sky-500 pl-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
              <span>Querying Disaster Spatial Knowledge Graph...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Persistent Pre-fed Prompts Ribbon (ALWAYS VISIBLE) */}
        <div className={`px-4 py-2 border-t overflow-x-auto no-scrollbar flex items-center space-x-2 shrink-0 ${
          isDark ? 'border-slate-800/80 bg-slate-900/50' : 'border-slate-200/70 bg-slate-100/60'
        }`}>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-500" /> Prompts:
          </span>
          {PREFED_PROMPTS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(p.text)}
              className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all flex items-center space-x-1.5 ${
                isDark 
                  ? 'bg-slate-800/80 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700/60' 
                  : 'bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200/90 shadow-2xs'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className={`p-3 sm:p-4 border-t ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-white'}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask any question about red zones, shelters, routes, or citizen safety..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`flex-1 border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold disabled:opacity-40 transition-all shadow-md shadow-sky-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
