import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight, Terminal, Cpu } from 'lucide-react';
import { api } from '../../api/client';

export default function AICopilotModal({ 
  isOpen, 
  onClose, 
  onSelectHabitation, 
  onNavigate,
  theme = 'light' 
}) {
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "ResQ Disaster Intelligence Assistant Online. Ask natural language queries regarding red zone hazard polygons, humanitarian carrying capacities, or evacuation routes across India.",
      structured: null,
      suggestions: [
        "Why is Sunil Ward marked as Critical Priority 1?",
        "Show settlements with immediate safe capacity shortage",
        "Which shelters in Wayanad can absorb 300 evacuees?",
        "Which mountain road corridors have high landslide risk?"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const newMsgList = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMsgList);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askCopilot(textToSend);
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
          text: "Unable to query live telemetry graph. Please try one of the verified suggestions below.",
          suggestions: ["Show settlements with immediate safe capacity shortage", "Which shelters can absorb 300 evacuees?"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      <div className={`border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[640px] transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.1] text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm">ResQ AI Copilot</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}>
                  Spatial Assistant
                </span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Pan-India Disaster Intelligence & GIS Graph Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] p-4 rounded-2xl space-y-2 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-medium rounded-tr-none shadow-md shadow-sky-500/20'
                    : (isDark ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none' : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-none shadow-sm')
                }`}
              >
                <div className="whitespace-pre-line text-xs">{m.text}</div>

                {/* Structured Table If Provided */}
                {m.structured && Array.isArray(m.structured) && m.structured.length > 0 && (
                  <div className={`mt-2 pt-2 border-t overflow-x-auto ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <table className="w-full text-left text-[11px]">
                      <thead className="opacity-60 font-bold text-[10px] uppercase">
                        <tr>
                          <th className="pb-1">ENTITY</th>
                          <th className="pb-1">ASSESSMENT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800">
                        {m.structured.slice(0, 4).map((item, i) => (
                          <tr key={i}>
                            <td className="py-1 font-bold">{item.name}</td>
                            <td className="py-1 text-sky-600 dark:text-sky-400 font-semibold">
                              {item.available_capacity ? `${item.available_capacity} spots (${item.bottleneck})` : `Score: ${item.hazard_score || item.risk}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Suggested Action Chips */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {m.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(sug)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                          isDark 
                            ? 'bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border-slate-700' 
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
        </div>

        {/* Input Bar */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/60'}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask Copilot a question regarding disaster risk, shelters, or routes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`flex-1 border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
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
