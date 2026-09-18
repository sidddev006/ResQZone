import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight, Terminal, Cpu } from 'lucide-react';
import { api } from '../../api/client';

export default function AICopilotModal({ isOpen, onClose, onSelectHabitation, onNavigate }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "ResQ Incident Commander Online. Direct deterministic queries into Chamoli spatial database, Sphere capacity thresholds, or graph routing.",
      structured: null,
      suggestions: [
        "Why is Manohar Bagh Ward marked critical?",
        "Show critical habitations with capacity shortage",
        "Which shelters can absorb 300 people?",
        "Which routes are currently risky?"
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
          text: "Unable to query live telemetry graph. Please test one of the verified prompts below.",
          suggestions: ["Show critical habitations with capacity shortage", "Which shelters can absorb 300 people?"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090E]/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0B0F17]/95 border border-white/15 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[640px] font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#131A2B]/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-glow-cyan">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-sm">ResQ Copilot Terminal</h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  RAG-ENGINE v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Ground-Truth Deterministic Spatial Knowledge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
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
                className={`max-w-[88%] p-4 rounded-xl space-y-2 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-100 border border-cyan-500/40 rounded-tr-none shadow-glow-cyan/20'
                    : 'bg-[#131A2B] border border-white/10 text-slate-200 rounded-tl-none shadow-lg'
                }`}
              >
                <div className="whitespace-pre-line text-xs font-mono">{m.text}</div>

                {/* Structured Table If Provided */}
                {m.structured && Array.isArray(m.structured) && m.structured.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10 overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="text-slate-400 font-medium text-[10px]">
                        <tr>
                          <th className="pb-1">ENTITY</th>
                          <th className="pb-1">ASSESSMENT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {m.structured.slice(0, 4).map((item, i) => (
                          <tr key={i}>
                            <td className="py-1 font-bold text-white">{item.name}</td>
                            <td className="py-1 text-cyan-300">
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
                        className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-[10px] text-slate-300 hover:text-cyan-300 transition-all font-mono"
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
            <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono pl-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>QUERYING CHAMOLI SPATIAL GRAPH...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-[#131A2B]/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask Copilot a question regarding Chamoli vulnerability..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#0B0F17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold disabled:opacity-40 transition-all shadow-glow-cyan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
