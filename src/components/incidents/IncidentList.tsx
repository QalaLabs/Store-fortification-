'use client';

import React, { useState, useMemo } from 'react';
import { Incident } from '@/types/incidents';
import { IncidentFilters, IncidentFiltersState } from './IncidentFilters';
import { IncidentTable } from './IncidentTable';
import { Badge } from '@/components/ui/Badge';
import { FileWarning, ShieldAlert, AlertTriangle, UserCheck, Sparkles } from 'lucide-react';

interface IncidentListProps {
  initialIncidents: Incident[];
}

const defaultFilters: IncidentFiltersState = {
  searchQuery: '',
  severity: 'all',
  status: 'all',
  sortBy: 'risk_desc',
};

export function IncidentList({ initialIncidents }: IncidentListProps) {
  const [filters, setFilters] = useState<IncidentFiltersState>(defaultFilters);

  // Compute header summary metrics
  const totalCount = initialIncidents.length;
  const criticalCount = initialIncidents.filter((i) => i.severity === 'critical').length;
  const highCount = initialIncidents.filter((i) => i.severity === 'high').length;
  const pendingApprovalCount = initialIncidents.filter(
    (i) => i.recommendedAction.status === 'pending_approval'
  ).length;

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.severity !== 'all' ||
    filters.status !== 'all' ||
    filters.sortBy !== 'risk_desc';

  // Filter and sort incidents
  const filteredIncidents = useMemo(() => {
    return initialIncidents
      .filter((incident) => {
        // Severity filter
        if (filters.severity !== 'all' && incident.severity !== filters.severity) {
          return false;
        }

        // Status filter
        if (filters.status !== 'all') {
          if (filters.status === 'resolved' && incident.status !== 'resolved' && incident.status !== 'contained') {
            return false;
          }
          if (filters.status !== 'resolved' && incident.status !== filters.status) {
            return false;
          }
        }

        // Search query
        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase();
          const matchId = incident.id.toLowerCase().includes(query);
          const matchTitle = incident.title.toLowerCase().includes(query);
          const matchType = incident.type.toLowerCase().includes(query);
          const matchIdentity = incident.affectedIdentities.some((id) =>
            id.toLowerCase().includes(query)
          );
          const matchEvidence = incident.evidenceSummary.toLowerCase().includes(query);
          if (!matchId && !matchTitle && !matchType && !matchIdentity && !matchEvidence) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'risk_desc') return b.riskScore - a.riskScore;
        if (filters.sortBy === 'risk_asc') return a.riskScore - b.riskScore;
        if (filters.sortBy === 'date_desc')
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (filters.sortBy === 'date_asc')
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return 0;
      });
  }, [initialIncidents, filters]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1b2a45]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
              <FileWarning className="h-6 w-6 text-red-400" />
              <span>Incident Management</span>
            </h2>
            <Badge variant="info" size="sm">
              SOC TRIAGE
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Investigate, prioritize and track correlated security incidents across your e-commerce ecosystem.
          </p>
        </div>

        {/* Header Summary Counter Cards */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#0d1524] px-3 py-1.5 rounded-lg border border-[#1b2a45] text-xs">
            <span className="text-slate-400 font-medium">Total:</span>
            <span className="font-mono font-bold text-slate-100">{totalCount}</span>
          </div>

          <div className="flex items-center gap-2 bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-500/40 text-xs">
            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
            <span className="text-red-300 font-medium">Critical P0:</span>
            <span className="font-mono font-bold text-red-200">{criticalCount}</span>
          </div>

          <div className="flex items-center gap-2 bg-orange-950/40 px-3 py-1.5 rounded-lg border border-orange-500/40 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-orange-300 font-medium">High:</span>
            <span className="font-mono font-bold text-orange-200">{highCount}</span>
          </div>

          <div className="flex items-center gap-2 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-500/40 text-xs">
            <UserCheck className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-amber-300 font-medium">Pending Approval:</span>
            <span className="font-mono font-bold text-amber-200">{pendingApprovalCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <IncidentFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Filter status line */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-200">{filteredIncidents.length}</strong> of{' '}
          <strong className="text-slate-200">{totalCount}</strong> correlated incidents
        </span>
        {hasActiveFilters && (
          <span className="text-[11px] text-blue-400">Filters applied</span>
        )}
      </div>

      {/* Incident Table */}
      <IncidentTable incidents={filteredIncidents} />
    </div>
  );
}
