'use client';

import React, { useState } from 'react';
import { DataTableSpec } from '@/types/generative-ui';
import { VisualContainer } from './VisualContainer';
import { ArrowUpDown, Search } from 'lucide-react';

interface DataTableRendererProps {
  spec: DataTableSpec;
  onCitationClick?: (recordId: string) => void;
}

export const DataTableRenderer: React.FC<DataTableRendererProps> = ({ spec, onCitationClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleExportCsv = () => {
    const headers = spec.columns.map((c) => `"${c.header}"`).join(',');
    const rows = spec.rows.map((row) =>
      spec.columns
        .map((c) => {
          const val = row[c.key] !== undefined ? String(row[c.key]) : '';
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${spec.title.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  let filtered = spec.rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  const renderBadge = (val: string) => {
    const str = String(val).toLowerCase();
    let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (str.includes('producing') || str.includes('compliant') || str.includes('completed') || str.includes('active') || str === 'yes') {
      badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
    } else if (str.includes('not producing') || str.includes('violation') || str.includes('failed') || str.includes('critical') || str === 'no') {
      badgeClass = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
    } else if (str.includes('contested') || str.includes('insufficient') || str.includes('investigating') || str.includes('missed') || str.includes('moderate')) {
      badgeClass = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
    } else if (str.includes('planned') || str.includes('shut-in')) {
      badgeClass = 'bg-sky-50 text-sky-700 border-sky-200 font-bold';
    }
    return (
      <span className={`inline-block rounded-md border px-2 py-0.5 text-xs ${badgeClass}`}>
        {val}
      </span>
    );
  };

  return (
    <VisualContainer spec={spec} onExportCsv={handleExportCsv} onCitationClick={onCitationClick}>
      {/* Search Input */}
      {spec.rows.length > 5 && (
        <div className="mb-3 relative max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search in table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-mono text-[11px]">
            <tr>
              {spec.columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => {
                    if (sortCol === col.key) {
                      setSortAsc(!sortAsc);
                    } else {
                      setSortCol(col.key);
                      setSortAsc(true);
                    }
                  }}
                  className={`cursor-pointer px-3.5 py-2.5 font-semibold hover:text-slate-900 transition-colors ${
                    col.alignment === 'right' ? 'text-right' : col.alignment === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  <div className="inline-flex items-center gap-1">
                    {col.header}
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={spec.columns.length} className="px-3 py-4 text-center text-slate-400">
                  No matching records found.
                </td>
              </tr>
            ) : (
              filtered.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                  {spec.columns.map((col) => {
                    const val = row[col.key];
                    const align = col.alignment === 'right' ? 'text-right' : col.alignment === 'center' ? 'text-center' : 'text-left';
                    return (
                      <td key={col.key} className={`px-3.5 py-2.5 text-slate-700 font-mono text-[11px] ${align}`}>
                        {col.format === 'badge' ? renderBadge(String(val)) : String(val !== undefined ? val : '-')}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </VisualContainer>
  );
};
