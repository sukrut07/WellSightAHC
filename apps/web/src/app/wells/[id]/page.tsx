'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Flame,
  Bot,
  Activity,
  Wrench,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  Plus,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { api, WellItem, InspectionItem, RepairItem } from '@/lib/api';
import { CorrectionModal } from '@/components/CorrectionModal';

function WellDetailContent() {
  const params = useParams();
  const wellId = params.id as string;

  const [well, setWell] = useState<WellItem | null>(null);
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [repairs, setRepairs] = useState<RepairItem[]>([]);
  const [sharedNotes, setSharedNotes] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Shared context form
  const [newNoteKey, setNewNoteKey] = useState('');
  const [newNoteVal, setNewNoteVal] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Correction Modal
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionTargetId, setCorrectionTargetId] = useState('');

  const loadAll = async () => {
    try {
      const [w, insps, reps, notes, confs] = await Promise.all([
        api.getWell(wellId),
        api.getWellInspections(wellId),
        api.getWellRepairs(wellId),
        api.getSharedContext(wellId),
        api.getConflicts(wellId),
      ]);
      setWell(w);
      setInspections(insps);
      setRepairs(reps);
      setSharedNotes(notes);
      setConflicts(confs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [wellId]);

  const handleAddSharedNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteKey || !newNoteVal) return;
    setSubmittingNote(true);
    try {
      await api.addSharedContext(wellId, 'Lead Operator', newNoteKey, newNoteVal);
      setNewNoteKey('');
      setNewNoteVal('');
      const updatedNotes = await api.getSharedContext(wellId);
      setSharedNotes(updatedNotes);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-500">
        Loading operational profile for {wellId}...
      </div>
    );
  }

  if (!well) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>Well {wellId} not found.</p>
        <Link href="/wells" className="mt-4 inline-block text-xs text-emerald-400">
          ← Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/wells"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Wells Directory
        </Link>
        <Link
          href={`/copilot?q=Why was ${well.id} not producing?`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow transition-colors"
        >
          <Bot className="h-3.5 w-3.5" /> Investigate in Copilot
        </Link>
      </div>

      {/* Conflicts Banner if active */}
      {conflicts.length > 0 && (
        <div className="rounded-xl border border-amber-800 bg-amber-950/40 p-4 text-xs text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Active Operational Contradictions Detected for {well.id}</span>
          </div>
          {conflicts.map((c, idx) => (
            <div key={idx} className="rounded bg-slate-900/80 p-2.5 border border-amber-900/60 font-mono text-[11px]">
              <span className="text-amber-400 font-bold">{c.issue}: </span>
              {c.uncertainty_explanation}
            </div>
          ))}
        </div>
      )}

      {/* Wellhead Header Card */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-6 shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">{well.name}</h1>
                <span className="font-mono text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-sky-400 font-bold">
                  {well.id}
                </span>
                <span className="rounded-full bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  {well.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span>Area: <strong className="text-slate-200">{well.area}</strong></span>
                <span>•</span>
                <span>Field: <strong className="text-slate-200">{well.field}</strong></span>
                <span>•</span>
                <span>Target Formation: <strong className="text-slate-200">{well.target_formation}</strong></span>
                <span>•</span>
                <span>Lift Type: <strong className="text-emerald-300">{well.well_type}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCorrectionTargetId(well.id);
                setCorrectionModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
            >
              <Edit3 className="h-3.5 w-3.5 text-emerald-400" /> Correct Well Data
            </button>
          </div>
        </div>

        {/* Telemetry Bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-800 pt-4 text-xs">
          <div>
            <span className="text-slate-400">Measured Summer Downtime:</span>
            <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
              {well.measured_downtime_days} days
            </div>
            <span className="text-[10px] text-slate-500">7d / qualifying inspection</span>
          </div>

          <div>
            <span className="text-slate-400">GPS Coordinates:</span>
            <div className="text-xs font-mono text-slate-200 mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-sky-400" />
              {well.latitude ? `${well.latitude.toFixed(4)}, ${well.longitude?.toFixed(4)}` : 'N/A'}
            </div>
          </div>

          <div>
            <span className="text-slate-400">Commissioned Date:</span>
            <div className="text-xs font-mono text-slate-200 mt-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {well.commissioned_date || 'N/A'}
            </div>
          </div>

          <div>
            <span className="text-slate-400">Total Work Tickets:</span>
            <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
              {repairs.length}
            </div>
          </div>
        </div>
      </div>

      {/* Surface Inspections Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Surface Inspections & Thermal Deltas</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {inspections.length} total inspections
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono">
              <tr>
                <th className="px-3 py-2.5">Record ID</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5 text-right">Ambient (°F)</th>
                <th className="px-3 py-2.5 text-right">Wellhead (°F)</th>
                <th className="px-3 py-2.5 text-right">Delta T (°F)</th>
                <th className="px-3 py-2.5 text-center">Observed Status</th>
                <th className="px-3 py-2.5">Field Remarks</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {inspections.map((insp) => (
                <tr key={insp.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-3 py-2 font-mono text-sky-400 font-semibold">{insp.id}</td>
                  <td className="px-3 py-2 font-mono text-slate-300">{insp.date}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-400">{insp.ambient_temp_f}°F</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-200">{insp.wellhead_temp_f}°F</td>
                  <td className="px-3 py-2 text-right font-mono font-bold">
                    <span className={insp.delta_t_f < 15 ? 'text-rose-400' : 'text-emerald-400'}>
                      {insp.delta_t_f}°F
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium ${
                        insp.observed_status === 'Producing'
                          ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                          : insp.is_missed
                          ? 'bg-slate-800 border border-slate-700 text-slate-400'
                          : insp.observed_status.includes('Planned')
                          ? 'bg-sky-950 border border-sky-800 text-sky-300'
                          : 'bg-rose-950 border border-rose-800 text-rose-300'
                      }`}
                    >
                      {insp.observed_status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-400 text-[11px] max-w-xs truncate">
                    {insp.notes || '-'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => {
                        setCorrectionTargetId(insp.id);
                        setCorrectionModalOpen(true);
                      }}
                      className="text-[10px] font-mono text-slate-400 hover:text-emerald-400"
                    >
                      Correct
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repairs & Maintenance History */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Work Ticket Repairs & Documented Causes</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {repairs.length} records
          </span>
        </div>

        {repairs.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">No work ticket repairs logged for this wellhead.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono">
                <tr>
                  <th className="px-3 py-2.5">Work Ticket</th>
                  <th className="px-3 py-2.5">Start Date</th>
                  <th className="px-3 py-2.5">Repair Type</th>
                  <th className="px-3 py-2.5">Cause Category</th>
                  <th className="px-3 py-2.5">Documented Ground Cause</th>
                  <th className="px-3 py-2.5 text-right">Cost (USD)</th>
                  <th className="px-3 py-2.5">Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {repairs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-3 py-2 font-mono text-sky-400 font-semibold">{r.id}</td>
                    <td className="px-3 py-2 font-mono text-slate-300">{r.start_date}</td>
                    <td className="px-3 py-2 font-medium text-white">{r.repair_type}</td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                        {r.cause_category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-300 text-[11px] leading-relaxed max-w-sm">
                      {r.documented_cause}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-200">
                      ${r.cost_usd.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-slate-400 text-[11px]">{r.technician || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shared Well Context Notes (Accessible across users) */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Shared Well Operational Memory</h3>
              <p className="text-[11px] text-slate-400">Context notes visible across all operators and shifts</p>
            </div>
          </div>
        </div>

        {/* Existing Notes */}
        <div className="space-y-2">
          {sharedNotes.length === 0 ? (
            <p className="text-xs text-slate-500 py-1">No shared context notes recorded yet.</p>
          ) : (
            sharedNotes.map((note) => (
              <div key={note.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-xs">
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                  <span className="font-bold text-sky-400">{note.key}</span>
                  <span>By {note.author} • {note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}</span>
                </div>
                <p className="mt-1 text-slate-200 leading-relaxed">{note.value}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddSharedNote} className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 space-y-3">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
            <Plus className="h-3.5 w-3.5 text-emerald-400" /> Record Shared Operational Note:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <input
              type="text"
              placeholder="Topic / Tag (e.g. Compressor Vibration)"
              value={newNoteKey}
              onChange={(e) => setNewNoteKey(e.target.value)}
              className="rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Observation details..."
              value={newNoteVal}
              onChange={(e) => setNewNoteVal(e.target.value)}
              className="sm:col-span-2 rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingNote || !newNoteKey || !newNoteVal}
              className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow disabled:opacity-50"
            >
              {submittingNote ? 'Saving...' : 'Add Shared Note'}
            </button>
          </div>
        </form>
      </div>

      {/* Correction Modal */}
      <CorrectionModal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        initialTargetId={correctionTargetId}
        onCorrectionSubmitted={loadAll}
      />
    </div>
  );
}

export default function WellDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-slate-500">Loading Operational Profile...</div>}>
      <WellDetailContent />
    </Suspense>
  );
}
