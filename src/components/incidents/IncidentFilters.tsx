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
    <div className="bg-[#141211] p-4 rounded-lg border border-[#302A28] space-y-3">
      {/* Search and Sort row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#756B67]" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by ID (e.g. INC-0841), title, affected user, IP or endpoint..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#100E0D] border border-[#302A28] rounded-md text-[#F3EEEC] placeholder-[#756B67] focus:outline-none focus:border-[#A20903]/60 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#756B67] hover:text-[#F3EEEC]"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-[#756B67] shrink-0" />
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({ ...filters, sortBy: e.target.value as IncidentFiltersState['sortBy'] })
            }
            aria-label="Sort incidents"
            className="text-xs bg-[#100E0D] border border-[#302A28] rounded-md px-2.5 py-1.5 text-[#F3EEEC] focus:outline-none focus:border-[#A20903]/60"
          >
            <option value="risk_desc">Sort: Highest Risk Score</option>
            <option value="risk_asc">Sort: Lowest Risk Score</option>
            <option value="date_desc">Sort: Most Recent</option>
            <option value="date_asc">Sort: Oldest First</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs px-2.5 py-1.5 rounded text-[#756B67] hover:text-[#FCA5A5] hover:bg-[#5C1811]/20 border border-[#302A28] hover:border-[#A20903]/40 transition-colors flex items-center gap-1 shrink-0"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter pills: Severity & Status */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#302A28] text-xs">
        {/* Severity filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[#756B67] font-medium mr-1">Severity:</span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => {
            const isActive = filters.severity === sev;
            return (
              <button
                key={sev}
                onClick={() => onChange({ ...filters, severity: sev })}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors capitalize ${
                  isActive
                    ? sev === 'critical'
                      ? 'bg-[#5C1811]/60 text-[#FCA5A5] border-[#A20903] font-bold'
                      : sev === 'high'
                      ? 'bg-[#7C2D12]/50 text-[#FDBA74] border-[#C2410C] font-bold'
                      : sev === 'medium'
                      ? 'bg-[#78350F]/50 text-[#FDE047] border-[#D97706] font-bold'
                      : sev === 'low'
                      ? 'bg-[#1D1A19] text-[#D0C4C0] border-[#443C39] font-bold'
                      : 'bg-[#1D1A19] text-[#F3EEEC] border-[#A20903] font-bold'
                    : 'bg-[#100E0D] text-[#756B67] border-[#302A28] hover:text-[#F3EEEC] hover:bg-[#1D1A19]'
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[#756B67] font-medium mr-1">Status:</span>
          {(['all', 'open', 'investigating', 'containment_pending', 'resolved'] as const).map((st) => {
            const isActive = filters.status === st;
            const labelMap: Record<string, string> = {
              all: 'All',
              open: 'Open',
              investigating: 'Investigating',
              containment_pending: 'Pending Approval',
              resolved: 'Resolved',
            };
            return (
              <button
                key={st}
                onClick={() => onChange({ ...filters, status: st })}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  isActive
                    ? 'bg-[#1D1A19] text-[#F3EEEC] border-[#A20903] font-bold'
                    : 'bg-[#100E0D] text-[#756B67] border-[#302A28] hover:text-[#F3EEEC] hover:bg-[#1D1A19]'
                }`}
              >
                {labelMap[st]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
