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
  Zap,
  ArrowRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api';
import { GenerativeUIRenderer } from '@/components/generative-ui/GenerativeUIRenderer';
import { EvidenceDrawer } from '@/components/EvidenceDrawer';
import { CorrectionModal } from '@/components/CorrectionModal';
import { CopilotMessage, CitationSource } from '@/types/generative-ui';

function CopilotChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am **WellSight AI**, your Asset Intelligence Copilot for Permian Basin operations.\n\n" +
        "I am connected to your live operational database with deterministic tool-calling, thermal differential rules, 24-hour spill compliance tracking, and Google Gemini reasoning.\n\n" +
        "Try asking one of the verified operational questions below or type your inquiry:",
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
    <div className="flex h-full flex-col bg-[#070D19] relative overflow-hidden text-slate-100">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/15 via-transparent to-transparent" />

      {/* 1. Header Bar */}
      <header className="relative z-10 flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-[#0A1224]/90 px-6 py-3.5 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-extrabold tracking-tight text-white">Asset Intelligence Copilot</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini Orchestrator
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Active Context User: <span className="text-emerald-400 font-bold">{activeUser}</span> · Permian Asset Fleet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCorrectionTargetId('INSP-2026-0017');
              setCorrectionModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/70 hover:bg-slate-700 hover:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Edit3 className="h-3.5 w-3.5 text-emerald-400" /> Submit Correction
          </button>
          <button
            onClick={() => {
              setMessages(messages.slice(0, 1));
              setConversationId(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/70 hover:bg-slate-700 hover:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-xs cursor-pointer active:scale-95"
            title="Reset conversation"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* 2. Messages Stream */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white shadow-md shadow-indigo-500/20">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-2xl p-5 text-xs leading-relaxed transition-all shadow-lg ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-indigo-600/25'
                    : 'bg-[#0E1626]/90 border border-slate-800/90 hover:border-slate-700/80 text-slate-100 rounded-tl-none backdrop-blur-xl shadow-black/40'
                }`}
              >
                {/* Assistant Top Metadata & Tools Trace */}
                {m.role === 'assistant' && (
                  <div className="mb-3.5 flex items-center justify-between border-b border-slate-800/80 pb-2.5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white tracking-wide">WellSight Intelligence</span>
                      <span className="rounded bg-indigo-950/70 border border-indigo-700/50 px-1.5 py-0.2 font-mono text-[9px] text-indigo-300">
                        Verified Facts
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy response text"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Executed Tools Badge */}
                {m.tool_calls && m.tool_calls.length > 0 && (
                  <div className="mb-3.5 flex flex-wrap items-center gap-2 rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 text-[11px] font-mono text-slate-300">
                    <Terminal className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-slate-400">Agentic Tools:</span>
                    {m.tool_calls.map((t: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-md bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 text-emerald-300 font-semibold text-[10px]"
                      >
                        {t.tool_name} {t.execution_time_ms ? `(${Math.round(t.execution_time_ms)}ms)` : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Markdown Text Response */}
                <div className="prose prose-invert prose-xs max-w-none space-y-2 text-slate-200 leading-relaxed font-sans">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>

                {/* Generative UI Component */}
                {m.visualization && (
                  <div className="mt-4 pt-3 border-t border-slate-800/70">
                    <GenerativeUIRenderer
                      spec={m.visualization}
                      onCitationClick={handleCitationClick}
                      onOptionSelect={(opt) => handleSendMessage(opt)}
                    />
                  </div>
                )}

                {/* Conflicts & Uncertainty Callout */}
                {m.conflicts && m.conflicts.length > 0 && (
                  <div className="mt-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-amber-200">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-300 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Data Conflict / Inconsistency Detected</span>
                    </div>
                    {m.conflicts.map((c: any, i: number) => (
                      <p key={i} className="text-[11px] text-amber-200/90">
                        {c.description || c.title || JSON.stringify(c)}
                      </p>
                    ))}
                  </div>
                )}

                {/* Ground Citations Pills */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-slate-800/80 pt-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" /> Evidence Citing:
                    </span>
                    {m.sources.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCitationClick(src.record_id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 font-mono text-[10px] text-emerald-400 transition-colors cursor-pointer"
                        title={src.title || src.record_id}
                      >
                        <span>{src.record_id}</span>
                        {src.source_type && (
                          <span className="text-slate-400 font-sans text-[9px] capitalize">
                            · {src.source_type}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300 shadow-sm">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-[#0E1626]/90 px-4 py-3 text-xs text-slate-300 shadow-lg">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Orchestrating agentic tools, evaluating domain rules & synthesizing Gemini response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Followups & Input Box */}
      <div className="relative z-10 border-t border-slate-800/80 bg-[#0A1224]/95 p-4 shrink-0 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Quick Prompt Pills with smooth horizontal scrolling */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] text-slate-400 shrink-0 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Prompts:
            </span>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="shrink-0 rounded-full border border-slate-700/80 bg-[#0E1626]/90 hover:bg-[#16223B] hover:border-indigo-400/50 px-3.5 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5 rounded-2xl border border-slate-700/80 bg-[#0E1626]/90 p-1.5 pl-4 shadow-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about well downtime, 24h spill rules, temperature deltas, repairs, or submit corrections..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 disabled:opacity-40 transition-all cursor-pointer active:scale-95"
            >
              <span>Send</span>
              <Send className="h-3.5 w-3.5" />
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
