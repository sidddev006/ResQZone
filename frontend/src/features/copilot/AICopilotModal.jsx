import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';

export default function AICopilotModal({ isOpen, onClose, onSelectHabitation, onNavigate }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Good day, Officer. I am ResQ Copilot. You can ask factual questions regarding habitation vulnerability, shelter resource bottlenecks, or route impedance in Chamoli district.",
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
          text: "Unable to complete query against live spatial records. Please try a suggested prompt below.",
          suggestions: ["Show critical habitations with capacity shortage", "Which shelters can absorb 300 people?"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-elevated flex flex-col h-[640px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">ResQ Copilot</h3>
              <p className="text-[10px] text-stone-400">Deterministic Spatial Knowledge Retrieval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
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
                className={`max-w-[85%] p-4 rounded-xl space-y-2 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-stone-900 text-stone-50 rounded-tr-none'
                    : 'bg-stone-50 border border-stone-200/80 text-stone-800 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line text-xs font-normal">{m.text}</div>

                {/* Structured Table If Provided */}
                {m.structured && Array.isArray(m.structured) && m.structured.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-stone-200 overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="text-stone-400 font-medium text-[10px]">
                        <tr>
                          <th className="pb-1">Entity</th>
                          <th className="pb-1">Assessment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {m.structured.slice(0, 4).map((item, i) => (
                          <tr key={i}>
                            <td className="py-1 font-medium text-stone-900">{item.name}</td>
                            <td className="py-1 font-mono text-stone-600">
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
                        className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-100 border border-stone-200 text-[10px] text-stone-700 font-medium transition-colors shadow-xs"
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
            <div className="flex items-center space-x-1.5 text-xs text-stone-500 font-medium pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse"></span>
              <span>Querying Chamoli spatial database...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50">
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
              className="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 shadow-xs"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 disabled:opacity-40 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
