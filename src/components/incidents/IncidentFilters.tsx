'use client';

import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { EventSeverity } from '@/types/events';
import { IncidentStatus } from '@/types/incidents';

export interface IncidentFiltersState {
  searchQuery: string;
  severity: EventSeverity | 'all';
  status: IncidentStatus | 'all';
  sortBy: 'risk_desc' | 'risk_asc' | 'date_desc' | 'date_asc';
}

interface IncidentFiltersProps {
  filters: IncidentFiltersState;
  onChange: (filters: IncidentFiltersState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function IncidentFilters({
  filters,
  onChange,
  onReset,
  hasActiveFilters,
}: IncidentFiltersProps) {
  return (
    <div className="bg-[#0d1524] p-4 rounded-lg border border-[#1b2a45] space-y-3">
      {/* Search and Sort row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by ID (e.g. INC-0841), title, affected user, IP or endpoint..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#090e17] border border-[#1b2a45] rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({ ...filters, sortBy: e.target.value as IncidentFiltersState['sortBy'] })
            }
            aria-label="Sort incidents"
            className="text-xs bg-[#090e17] border border-[#1b2a45] rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="risk_desc">Sort: Highest Risk Score</option>
            <option value="risk_asc">Sort: Lowest Risk Score</option>
            <option value="date_desc">Sort: Most Recent</option>
            <option value="date_asc">Sort: Oldest First</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs px-2.5 py-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/20 border border-slate-700/60 hover:border-red-500/30 transition-colors flex items-center gap-1 shrink-0"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter pills: Severity & Status */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#1b2a45]/60 text-xs">
        {/* Severity filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Severity:</span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => {
            const isActive = filters.severity === sev;
            return (
              <button
                key={sev}
                onClick={() => onChange({ ...filters, severity: sev })}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors capitalize ${
                  isActive
                    ? sev === 'critical'
                      ? 'bg-red-950 text-red-300 border-red-500 font-bold'
                      : sev === 'high'
                      ? 'bg-orange-950 text-orange-300 border-orange-500 font-bold'
                      : sev === 'medium'
                      ? 'bg-amber-950 text-amber-300 border-amber-500 font-bold'
                      : sev === 'low'
                      ? 'bg-sky-950 text-sky-300 border-sky-500 font-bold'
                      : 'bg-blue-600/30 text-blue-300 border-blue-500 font-bold'
                    : 'bg-[#090e17] text-slate-400 border-[#1b2a45] hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Status:</span>
          {(['all', 'open', 'investigating', 'containment_pending', 'resolved'] as const).map(
            (st) => {
              const isActive = filters.status === st;
              const label =
                st === 'all'
                  ? 'All'
                  : st === 'containment_pending'
                  ? 'Pending Approval'
                  : st.charAt(0).toUpperCase() + st.slice(1);

              return (
                <button
                  key={st}
                  onClick={() => onChange({ ...filters, status: st })}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                    isActive
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500 font-bold'
                      : 'bg-[#090e17] text-slate-400 border-[#1b2a45] hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
