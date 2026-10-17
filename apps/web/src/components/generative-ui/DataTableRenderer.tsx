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
    let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
    if (str.includes('producing') || str.includes('compliant') || str.includes('completed') || str.includes('active') || str === 'yes') {
      badgeClass = 'bg-emerald-950/70 text-emerald-300 border-emerald-800';
    } else if (str.includes('not producing') || str.includes('violation') || str.includes('failed') || str === 'no') {
      badgeClass = 'bg-rose-950/70 text-rose-300 border-rose-800';
    } else if (str.includes('contested') || str.includes('insufficient') || str.includes('investigating') || str.includes('missed')) {
      badgeClass = 'bg-amber-950/70 text-amber-300 border-amber-800';
    } else if (str.includes('planned') || str.includes('shut-in')) {
      badgeClass = 'bg-sky-950/70 text-sky-300 border-sky-800';
    }
    return (
      <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
        {val}
      </span>
    );
  };

  return (
    <VisualContainer spec={spec} onExportCsv={handleExportCsv} onCitationClick={onCitationClick}>
      {/* Search Input */}
      {spec.rows.length > 5 && (
        <div className="mb-3 relative max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search in table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-800 bg-slate-900/90 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
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
                  className={`cursor-pointer px-3 py-2.5 font-medium hover:text-slate-200 transition-colors ${
                    col.alignment === 'right' ? 'text-right' : col.alignment === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  <div className="inline-flex items-center gap-1">
                    {col.header}
                    <ArrowUpDown className="h-3 w-3 text-slate-600" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={spec.columns.length} className="px-3 py-4 text-center text-slate-500">
                  No matching records found.
                </td>
              </tr>
            ) : (
              filtered.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/50 transition-colors">
                  {spec.columns.map((col) => {
                    const val = row[col.key];
                    const align = col.alignment === 'right' ? 'text-right' : col.alignment === 'center' ? 'text-center' : 'text-left';
                    return (
                      <td key={col.key} className={`px-3 py-2 text-slate-300 font-mono text-[12px] ${align}`}>
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
