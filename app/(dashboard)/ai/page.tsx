"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Globe,
  Plus,
  TrendingUp,
  Mail,
  MessageSquare,
} from "lucide-react";

export default function AiAssistantPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Hello! I am SaganFG AI, your expert tax intelligence assistant. I have access to your active client documents, prior year returns, and local tax code changes. How can I help you prepare or research today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [researchMode, setResearchMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    { title: "Draft client request email", desc: "Request W-2 and mortgage Form 1098 details", icon: Mail },
    { title: "Analyze Sch C mileage rules", desc: "Federal safe harbor rate updates for tax year 2024", icon: Globe },
    { title: "Research Section 179 limits", desc: "Maximum deduction and phase-out thresholds", icon: TrendingUp },
  ];

  // Fetch all conversations on mount
  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/v1/ai/chat");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
    return [];
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectConversation = (conv: any) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages);
  };

  const handleStartNewChat = () => {
    setActiveConvId(null);
    setMessages([
      {
        role: "assistant",
        content: "Hello! I am SaganFG AI, your expert tax intelligence assistant. I have access to your active client documents, prior year returns, and local tax code changes. How can I help you prepare or research today?",
      },
    ]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setLoading(true);

    // Optimistically add user message
    const updatedMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(updatedMessages);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          conversationId: activeConvId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveConvId(data.conversationId);
        setMessages((prev) => [...prev, data.assistantMessage]);
        
        // Refresh conversations list
        await fetchConversations();
      }
    } catch (err) {
      console.error("AI assistant send error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-10rem)] max-w-6xl mx-auto">
      {/* Sidebar: Conversation history */}
      <div className="w-64 bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
        <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
          <button
            onClick={handleStartNewChat}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-100"
          >
            <Plus size={14} />
            New Chat
          </button>

          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-2">
              Recent Chats
            </span>
            {conversations.length === 0 ? (
              <p className="text-[11px] text-gray-400 px-2 py-4 italic">No recent chats.</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-left text-xs transition-all ${
                    activeConvId === conv.id
                      ? "bg-indigo-50 border border-indigo-100 text-indigo-900 font-bold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <MessageSquare size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{conv.title || "Untitled Chat"}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main chat view */}
      <div className="flex-1 flex flex-col justify-between gap-4 h-full">
        {/* Messages viewport */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 overflow-y-auto space-y-4 shadow-sm relative no-scrollbar">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-4 max-w-2xl ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow ${
                  m.role === "user" ? "bg-indigo-600" : "bg-gradient-to-br from-indigo-900 to-[#0D1B4B]"
                }`}
              >
                {m.role === "user" ? "U" : <Bot size={16} />}
              </div>

              {/* Message bubble */}
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white font-medium"
                    : "bg-gray-50 border border-gray-100 text-gray-800"
                }`}
              >
                {m.hasResearch && (
                  <div className="flex items-center gap-1 mb-2 text-indigo-600 font-bold text-[9px] uppercase tracking-wider bg-indigo-50 w-max px-2 py-0.5 rounded border border-indigo-100">
                    <Globe size={10} />
                    <span>Research Mode Active (Tavily search)</span>
                  </div>
                )}
                <pre className="font-sans whitespace-pre-wrap">{m.content}</pre>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 max-w-2xl mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                <Bot size={16} />
              </div>
              <div className="p-4 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <Sparkles className="animate-spin text-indigo-500" size={14} />
                <span>Thinking and searching tax codes...</span>
              </div>
            </div>
          )}
        </div>

        {/* Prompts suggestions box */}
        {messages.length === 1 && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setInput(p.title)}
                className="p-4 bg-white border border-gray-200 hover:border-indigo-300 rounded-2xl text-left hover:shadow transition-all space-y-2 group"
              >
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-max group-hover:bg-indigo-100 transition-colors">
                  <p.icon size={16} />
                </div>
                <h4 className="text-xs font-bold text-gray-800">{p.title}</h4>
                <p className="text-[10px] text-gray-400 leading-snug">{p.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Interactive Input Form */}
        <form onSubmit={handleSend} className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm flex flex-col gap-2">
          <textarea
            placeholder="Ask a tax question, draft a client request, or research code exemptions..."
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            className="w-full px-3 py-2 text-xs text-gray-700 bg-gray-50 rounded-xl focus:outline-none focus:bg-white border-0 focus:ring-1 focus:ring-indigo-500 transition-all font-medium no-scrollbar resize-none"
          />

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            {/* Research Mode toggle */}
            <button
              type="button"
              onClick={() => setResearchMode(!researchMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                researchMode
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold"
                  : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"
              }`}
            >
              <Globe size={12} />
              <span>Search Web (Research Mode)</span>
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex items-center justify-center p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
