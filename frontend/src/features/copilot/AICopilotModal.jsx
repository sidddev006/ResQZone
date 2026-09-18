import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { api } from '../../api/client';

export default function AICopilotModal({ isOpen, onClose, onSelectHabitation, onNavigate }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello, Officer. I am ResQ Copilot. Ask me questions about habitation vulnerability, shelter bottlenecks, or road network risks in Chamoli district.",
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

    // Add user message
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
          text: "I couldn't process this query against the live database. Please check your query or try one of the suggested options below.",
          suggestions: ["Show critical habitations with capacity shortage", "Which shelters can absorb 300 people?"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[680px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">ResQ AI Copilot</h3>
              <p className="text-[11px] text-slate-400">Deterministic Knowledge Retrieval & Fact-Grounded Synthesis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/40">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-4 rounded-2xl space-y-2 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-slate-950 font-semibold rounded-tr-none'
                    : 'bg-slate-800/90 border border-slate-700 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {/* Structured Table If Provided */}
                {m.structured && Array.isArray(m.structured) && m.structured.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-700 overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="text-slate-400 font-mono text-[10px]">
                        <tr>
                          <th className="pb-1">Name</th>
                          <th className="pb-1">Metrics</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/60">
                        {m.structured.slice(0, 4).map((item, i) => (
                          <tr key={i}>
                            <td className="py-1 font-semibold text-white">{item.name}</td>
                            <td className="py-1 font-mono text-emerald-400">
                              {item.available_capacity ? `${item.available_capacity} spots (${item.bottleneck})` : `Risk: ${item.hazard_score || item.risk}`}
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
                        className="px-2.5 py-1 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-indigo-500/30 text-[10px] text-indigo-300 font-medium transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-slate-950 flex items-center justify-center shrink-0 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-indigo-400 font-medium pl-10">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Querying Chamoli spatial database...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask Copilot a question about Chamoli disaster vulnerability..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
