'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Edit3,
  Terminal,
  Paperclip,
  Download,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api';
import { GenerativeUIRenderer } from '@/components/generative-ui/GenerativeUIRenderer';
import { EvidenceDrawer } from '@/components/EvidenceDrawer';
import { CorrectionModal } from '@/components/CorrectionModal';
import { CopilotMessage, VisualSpecUnion, CitationSource, ConflictNotice } from '@/types/generative-ui';

function CopilotChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am **WellSight AI**, your Asset Intelligence Copilot for Permian Basin operations.\n\n" +
        "I can investigate well performance, calculate exact downtime using thermal differential rules, audit 24-hour spill reporting compliance, check documented repair causes, and surface data discrepancies.\n\n" +
        "Try asking one of the operational questions below or type your own question:",
      created_at: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionTargetId, setCorrectionTargetId] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState('demo_user_alpha');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read active user from localStorage if available
    const saved = localStorage.getItem('wellsight_active_user');
    if (saved) setActiveUser(saved);

    const handleStorage = () => {
      const u = localStorage.getItem('wellsight_active_user');
      if (u) setActiveUser(u);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage({
        message: text,
        conversation_id: conversationId || undefined,
        user_id: activeUser,
      });

      if (res.conversation_id) setConversationId(res.conversation_id);

      const assistantMsg: CopilotMessage = {
        id: res.message_id || `asst-${Date.now()}`,
        role: 'assistant',
        content: res.content,
        tool_calls: res.tool_traces,
        visualization: res.visualization,
        sources: res.sources,
        conflicts: res.conflicts,
        warnings: res.warnings,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Operational Engine Error:** ${err.message || 'Unable to execute copilot query.'}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Handle URL query parameter launch
  useEffect(() => {
    if (initialQuery && messages.length === 1) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleCitationClick = (recId: string) => {
    setSelectedCitationId(recId);
    setEvidenceDrawerOpen(true);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sampleQuestions = [
    'Which wells in Area A had the longest downtime this summer, what caused it, and show me the results as a chart.',
    'Why was WELL-0007 not producing?',
    'Which spills required reporting within 24 hours?',
    'Show monthly downtime by area as a heatmap.',
    'Compare repair costs by area this quarter.',
    'Which conclusions are uncertain because records conflict?',
    'What changed after the latest correction?',
  ];

  return (
    <div className="flex h-full flex-col bg-[#070D19] relative">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-[#0A1224] px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Asset Intelligence Copilot</h2>
              <span className="rounded bg-sky-950 border border-sky-800 px-1.5 py-0.2 font-mono text-[10px] text-sky-400">
                Agentic Grounded Tools
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Active Context User: <span className="text-slate-200 font-bold">{activeUser}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCorrectionTargetId('INSP-2026-0017');
              setCorrectionModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5 text-emerald-400" /> Submit Correction
          </button>
          <button
            onClick={() => {
              setMessages(messages.slice(0, 1));
              setConversationId(null);
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 shadow-xs transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-2xl p-4.5 text-xs leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white/90 border border-slate-200/90 text-slate-800 rounded-tl-none backdrop-blur-xl shadow-md'
                }`}
              >
                {/* Assistant Tools Execution Badge */}
                {m.tool_calls && m.tool_calls.length > 0 && (
                  <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-[11px] font-mono text-slate-600">
                    <Terminal className="h-3.5 w-3.5 text-indigo-600" />
                    <span className="font-semibold">Executed Tools:</span>
                    {m.tool_calls.map((t: any, idx: number) => (
                      <span key={idx} className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-indigo-700 font-bold">
                        {t.tool_name} ({t.execution_time_ms ? `${Math.round(t.execution_time_ms)}ms` : 'ok'})
                      </span>
                    ))}
                  </div>
                )}

                {/* Markdown Text Response */}
                <div className="prose prose-slate prose-xs max-w-none space-y-2 text-slate-700">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>

                {/* Generative UI Component */}
                {m.visualization && (
                  <div className="mt-4">
                    <GenerativeUIRenderer
                      spec={m.visualization}
                      onCitationClick={handleCitationClick}
                      onOptionSelect={(opt) => handleSendMessage(opt)}
                    />
                  </div>
                )}

                {/* Ground Citations Pills */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-800/70 pt-2.5">
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" /> Evidence Citing:
                    </span>
                    {m.sources.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCitationClick(src.record_id)}
                        className="rounded bg-slate-800/90 hover:bg-sky-950/70 hover:text-sky-300 border border-slate-700/60 px-2 py-0.5 font-mono text-[10px] text-slate-300 transition-colors"
                        title={src.title}
                      >
                        {src.record_id}
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Bar */}
                {m.role === 'assistant' && m.id !== 'welcome' && (
                  <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px] text-slate-500">
                    <span className="font-mono">Audited Output</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="flex items-center gap-1 hover:text-slate-300 transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400 font-mono">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0E1626] px-4 py-3 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Orchestrating tools, evaluating business rules & generating evidence UI...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Followups & Input Box */}
      <div className="border-t border-slate-800 bg-[#0A1224] p-4 shrink-0">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Quick Prompt Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] text-slate-500 shrink-0 font-medium">Quick Prompts:</span>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all shadow-xs cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about well downtime, 24h spill rules, temperature deltas, repairs, or submit corrections..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Evidence Drawer */}
      <EvidenceDrawer
        isOpen={evidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
        recordId={selectedCitationId}
        onOpenCorrectionForm={(tId) => {
          setCorrectionTargetId(tId);
          setCorrectionModalOpen(true);
        }}
      />

      {/* Correction Form Modal */}
      <CorrectionModal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        initialTargetId={correctionTargetId}
        onCorrectionSubmitted={() => {
          // Re-trigger query if desired
        }}
      />
    </div>
  );
}

export default function CopilotPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-slate-500">Initializing Asset Intelligence Copilot...</div>}>
      <CopilotChatContent />
    </Suspense>
  );
}
