'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { api, DocumentItem } from '@/lib/api';
import { CitationSource } from '@/types/generative-ui';

export default function EvidencePage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitationSource[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docChunks, setDocChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const docs = await api.getDocuments();
        setDocuments(docs);
        if (docs.length > 0) {
          setSelectedDocId(docs[0].id);
          const chunks = await api.getDocumentChunks(docs[0].id);
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-200 pb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E0F2FE] text-[#0369A1]">
            <ShieldCheck className="h-3 w-3" /> Ground Truth Corpus
          </span>
          <span className="text-xs text-slate-400 font-mono">Verifiable Citations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ground Evidence & Operating Standards
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Authoritative operating manuals, environmental compliance SOPs, and temperature classification rulebooks.
        </p>
      </motion.div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="glass-panel p-3 rounded-2xl flex gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search manuals and SOPs (e.g. '24 hours spill reporting', 'Gas Lift 15F threshold')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={searching || !searchQuery.trim()}
          className="rounded-xl bg-[#111625] hover:bg-slate-800 px-6 py-3 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {searching ? 'Searching...' : 'Search Evidence'}
        </button>
      </form>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document Registry */}
        <div className="glass-panel p-5 rounded-3xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-500" /> Operating Manuals & SOPs
          </h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  selectedDocId === doc.id && searchResults.length === 0
                    ? 'border-indigo-500 bg-[#EEF2FF] text-indigo-950 shadow-sm'
                    : 'border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{doc.title}</span>
                  <span className="font-mono text-[10px] text-indigo-700 uppercase bg-indigo-100/70 px-2 py-0.5 rounded-full font-bold">
                    {doc.category}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{doc.applies_to_well_type || 'All Assets'}</span>
                  <span>{doc.chunk_count} sections</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Document Chunks or Search Results */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-6">
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-indigo-900">
                  Search Results for &ldquo;{searchQuery}&rdquo; ({searchResults.length} excerpts found)
                </h3>
                <button
                  onClick={() => setSearchResults([])}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
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
                    <div className="text-[11px] text-slate-500 font-medium">
                      Category: <span className="font-semibold text-slate-700">{res.source_type}</span> • Section: <span className="font-semibold text-slate-700">{res.section_title || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {documents.find((d) => d.id === selectedDocId)?.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Extracted section chunks with embedding provenance and governing rule specifications
                </p>
              </div>

              <div className="space-y-4">
                {docChunks.map((chunk) => (
                  <div key={chunk.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-900">
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
