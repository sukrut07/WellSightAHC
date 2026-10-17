'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileCheck2,
  Search,
  BookOpen,
  FileText,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Bot,
  Layers,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { api, DocumentItem } from '@/lib/api';
import { CitationSource } from '@/types/generative-ui';

export default function EvidencePage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitationSource[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docChunks, setDocChunks] = useState<any[]>([]);
  const [docFilterCategory, setDocFilterCategory] = useState<string>('all');
  const [docSearchQuery, setDocSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const docs = await api.getDocuments();
        setDocuments(docs);
        if (docs.length > 0) {
          // Default to SOP if available, else first doc
          const defaultDoc = docs.find((d) => d.id.includes('SPILL')) || docs[0];
          setSelectedDocId(defaultDoc.id);
          const chunks = await api.getDocumentChunks(defaultDoc.id);
          setDocChunks(chunks);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectDoc = async (docId: string) => {
    setSelectedDocId(docId);
    setSearchResults([]);
    try {
      const chunks = await api.getDocumentChunks(docId);
      setDocChunks(chunks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await api.searchEvidence(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // Filter documents by category and sidebar search
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !docSearchQuery ||
        doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
        doc.id.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
        (doc.file_path && doc.file_path.toLowerCase().includes(docSearchQuery.toLowerCase()));

      let matchesCat = true;
      if (docFilterCategory === 'sops') {
        matchesCat = doc.category === 'sop' || doc.id.includes('SOP');
      } else if (docFilterCategory === 'welltypes') {
        matchesCat = doc.id.includes('T200') || doc.id.includes('T350') || doc.id.includes('T500');
      } else if (docFilterCategory === 'maintenance') {
        matchesCat = doc.id.includes('MNT');
      } else if (docFilterCategory === 'bulletins') {
        matchesCat = doc.id.includes('MOC') || doc.id.includes('RECALL') || doc.id.includes('LETTER');
      }

      return matchesSearch && matchesCat;
    });
  }, [documents, docFilterCategory, docSearchQuery]);

  const selectedDoc = documents.find((d) => d.id === selectedDocId);
  const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);

  const handleAskAboutDoc = () => {
    if (!selectedDoc) return;
    const q = `Explain the operating rules, temperature thresholds, and compliance procedures in ${selectedDoc.title}.`;
    router.push(`/copilot?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E0F2FE] text-[#0369A1]">
              <ShieldCheck className="h-3 w-3" /> Ground Truth Corpus
            </span>
            <span className="text-xs text-slate-400 font-mono">Verifiable Document Citations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ground Evidence & Operating Standards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Authoritative operating manuals, environmental compliance SOPs, and temperature classification rulebooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/copilot?q=What are the standard temperature threshold rules across gas lift and rod lift wells?"
            className="inline-flex items-center gap-2 rounded-full bg-[#111625] hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Bot className="h-3.5 w-3.5 text-emerald-400" /> Ask Copilot About SOPs
          </Link>
        </div>
      </motion.div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 text-xs">
        <div className="border-r border-slate-800/80 pr-3">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Ingested Documents</span>
          <span className="text-base font-extrabold text-cyan-400 font-mono">{documents.length}</span>
          <span className="text-[10px] text-slate-400 ml-1">authoritative sources</span>
        </div>
        <div className="border-r border-slate-800/80 pr-3">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Extracted Chunks</span>
          <span className="text-base font-extrabold text-emerald-400 font-mono">{totalChunks}</span>
          <span className="text-[10px] text-slate-400 ml-1">indexed sections</span>
        </div>
        <div className="border-r border-slate-800/80 pr-3">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Thermal Conformance</span>
          <span className="text-base font-extrabold text-amber-400 font-mono">&Delta;T &ge; 15&deg;F</span>
          <span className="text-[10px] text-slate-400 ml-1">Gas Lift Producing</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Spill Reporting Rule</span>
          <span className="text-base font-extrabold text-indigo-400 font-mono">&ge; 5 bbl / 24h</span>
          <span className="text-[10px] text-slate-400 ml-1">SOP-ENV-004</span>
        </div>
      </div>

      {/* Global Vector Search Input Bar */}
      <form onSubmit={handleSearch} className="glass-panel p-3 rounded-2xl flex gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search all manuals and SOPs (e.g. '24 hours spill reporting', 'Gas Lift 15F threshold', 'T200 specs')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={searching || !searchQuery.trim()}
          className="rounded-xl bg-[#111625] hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          {searching ? 'Searching...' : 'Search Evidence'}
        </button>
      </form>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document Selector (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-3xl space-y-4 flex flex-col max-h-[750px]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-500" /> Ground Corpus
            </h3>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
              {filteredDocuments.length} docs
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 text-[11px] pb-1 border-b border-slate-100">
            {[
              { id: 'all', label: 'All' },
              { id: 'sops', label: 'SOPs' },
              { id: 'welltypes', label: 'Well Specs' },
              { id: 'maintenance', label: 'MNT Logs' },
              { id: 'bulletins', label: 'MOCs & Bulletins' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDocFilterCategory(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  docFilterCategory === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search inside docs */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter document titles..."
              value={docSearchQuery}
              onChange={(e) => setDocSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/90 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Document list */}
          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
            {filteredDocuments.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc.id)}
                className={`w-full rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                  selectedDocId === doc.id && searchResults.length === 0
                    ? 'border-indigo-500 bg-[#EEF2FF] text-indigo-950 shadow-sm'
                    : 'border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="truncate pr-2">{doc.title}</span>
                  <span className="font-mono text-[9px] text-indigo-700 uppercase bg-indigo-100/70 px-2 py-0.5 rounded-full font-bold shrink-0">
                    {doc.category}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span className="truncate max-w-[160px]">{doc.applies_to_well_type || 'Fleet SOP'}</span>
                  <span className="font-mono">{doc.chunk_count} sections</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Document Chunks or Search Results (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl space-y-6">
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-indigo-900">
                  Search Results for &ldquo;{searchQuery}&rdquo; ({searchResults.length} excerpts found)
                </h3>
                <button
                  onClick={() => setSearchResults([])}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Clear Results
                </button>
              </div>

              <div className="space-y-4">
                {searchResults.map((res, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{res.title}</span>
                      <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 font-bold">
                        {res.record_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 p-4 rounded-xl border border-slate-200">
                      &ldquo;{res.excerpt}&rdquo;
                    </p>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                      <span>
                        Category: <strong className="text-slate-700">{res.source_type}</strong> • Section: <strong className="text-slate-700">{res.section_title || '-'}</strong>
                      </span>
                      <button
                        onClick={() => {
                          const docMatch = documents.find((d) => d.id === res.record_id || d.title === res.title);
                          if (docMatch) handleSelectDoc(docMatch.id);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        Inspect Document <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Document Banner */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      {selectedDoc?.category || 'Standard'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{selectedDoc?.id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedDoc?.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedDoc?.file_path || 'Authoritative Corpus Document'} · {selectedDoc?.chunk_count} verified sections
                  </p>
                </div>

                <button
                  onClick={handleAskAboutDoc}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Ask Copilot
                </button>
              </div>

              {/* Document Chunks */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {docChunks.map((chunk) => (
                  <div key={chunk.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-indigo-500" />
                        § Section {chunk.index}: {chunk.section_title}
                      </h4>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {chunk.id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80 font-mono">
                      {chunk.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
