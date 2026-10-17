'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Search,
  BookOpen,
  FileText,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <FileCheck2 className="h-6 w-6 text-emerald-400" /> Ground Evidence & Operating Standards
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Searchable standard operating manuals, environmental compliance SOPs, and temperature classification thresholds
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="rounded-xl border border-slate-800 bg-[#0E1626] p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search manuals and SOPs (e.g. '24 hours spill reporting', 'Gas Lift 15F threshold')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={searching || !searchQuery.trim()}
          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow disabled:opacity-50 transition-colors"
        >
          {searching ? 'Searching...' : 'Search Evidence'}
        </button>
      </form>

      {/* Main Split View: Documents List on Left, Document Content/Search Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document Registry */}
        <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-sky-400" /> Operating Manuals & SOPs
          </h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc.id)}
                className={`w-full rounded-lg border p-3 text-left transition-all ${
                  selectedDocId === doc.id && searchResults.length === 0
                    ? 'border-emerald-500 bg-emerald-950/40 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{doc.title}</span>
                  <span className="font-mono text-[10px] text-emerald-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                    {doc.category}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{doc.applies_to_well_type || 'All Assets'}</span>
                  <span>{doc.chunk_count} sections</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Document Chunks or Search Results */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0E1626] p-5 space-y-4">
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-emerald-400">
                  Search Results for "{searchQuery}" ({searchResults.length} excerpts found)
                </h3>
                <button
                  onClick={() => setSearchResults([])}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear Results
                </button>
              </div>

              <div className="space-y-3">
                {searchResults.map((res, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{res.title}</span>
                      <span className="font-mono text-[10px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                        {res.record_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-3 rounded border border-slate-800/80">
                      "{res.excerpt}"
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Category: {res.source_type} • Section: {res.section_title || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">
                  Document Content & Section Chunks: {documents.find((d) => d.id === selectedDocId)?.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Extracted section chunks with embedding metadata and governing rule specifications
                </p>
              </div>

              <div className="space-y-3">
                {docChunks.map((chunk) => (
                  <div key={chunk.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-sky-300">
                        § Section {chunk.index}: {chunk.section_title}
                      </h4>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                        {chunk.id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-3 rounded border border-slate-800/60">
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
