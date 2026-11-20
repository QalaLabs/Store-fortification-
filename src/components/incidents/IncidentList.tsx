'use client';

import React, { useState, useMemo } from 'react';
import { Incident } from '@/types/incidents';
import { IncidentFilters, IncidentFiltersState } from './IncidentFilters';
import { IncidentTable } from './IncidentTable';
import { Badge } from '@/components/ui/Badge';
import { FileWarning, ShieldAlert, AlertTriangle, UserCheck, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useIncidents } from '@/lib/api';

interface IncidentListProps {
  initialIncidents?: Incident[];
}

const defaultFilters: IncidentFiltersState = {
  searchQuery: '',
  severity: 'all',
  status: 'all',
  sortBy: 'risk_desc',
};

export function IncidentList({ initialIncidents }: IncidentListProps) {
  const { incidents: apiIncidents, isLoading, error, mode, refetch } = useIncidents();
  const incidents = initialIncidents || apiIncidents;
  const [filters, setFilters] = useState<IncidentFiltersState>(defaultFilters);

  // Compute header summary metrics
  const totalCount = incidents.length;
  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const highCount = incidents.filter((i) => i.severity === 'high').length;
  const pendingApprovalCount = incidents.filter(
    (i) => i.recommendedAction.status === 'pending_approval'
  ).length;

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.severity !== 'all' ||
    filters.status !== 'all' ||
    filters.sortBy !== 'risk_desc';

  // Filter and sort incidents
  const filteredIncidents = useMemo(() => {
    return incidents
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
  }, [incidents, filters]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#302A28]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#F3EEEC] flex items-center gap-2.5">
              <FileWarning className="h-6 w-6 text-[#A20903]" />
              <span>Incident Management</span>
            </h2>
            <Badge variant="neutral" size="sm">
              SOC TRIAGE
            </Badge>
            <Badge
              variant={mode === 'LIVE' ? 'success' : mode === 'ERROR' ? 'error' : 'neutral'}
              size="sm"
            >
              {mode === 'LIVE' ? 'LIVE DATA' : mode === 'ERROR' ? 'API DISCONNECTED' : 'DEMO MODE'}
            </Badge>
          </div>
          <p className="text-xs text-[#A79B96] mt-1 max-w-2xl">
            Investigate, prioritize and track correlated security incidents across your e-commerce ecosystem.
          </p>
        </div>

        {/* Header Summary Counter Cards */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#141211] px-3 py-1.5 rounded-lg border border-[#302A28] text-xs">
            <span className="text-[#756B67] font-medium">Total:</span>
            <span className="font-mono font-bold text-[#F3EEEC]">{totalCount}</span>
          </div>

          <div className="flex items-center gap-2 bg-[#5C1811]/30 px-3 py-1.5 rounded-lg border border-[#A20903]/40 text-xs">
            <ShieldAlert className="h-3.5 w-3.5 text-[#A20903]" />
            <span className="text-[#FCA5A5] font-medium">Critical P0:</span>
            <span className="font-mono font-bold text-[#F3EEEC]">{criticalCount}</span>
          </div>

          <div className="flex items-center gap-2 bg-[#7C2D12]/30 px-3 py-1.5 rounded-lg border border-[#C2410C]/40 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-[#C2410C]" />
            <span className="text-[#FDBA74] font-medium">High:</span>
            <span className="font-mono font-bold text-[#F3EEEC]">{highCount}</span>
          </div>

          <div className="flex items-center gap-2 bg-[#78350F]/30 px-3 py-1.5 rounded-lg border border-[#D97706]/40 text-xs">
            <UserCheck className="h-3.5 w-3.5 text-[#D97706]" />
            <span className="text-[#FDE047] font-medium">Pending Approval:</span>
            <span className="font-mono font-bold text-[#F3EEEC]">{pendingApprovalCount}</span>
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
      <div className="flex items-center justify-between text-xs text-[#756B67] px-1">
        <span>
          Showing <strong className="text-[#D0C4C0]">{filteredIncidents.length}</strong> of{' '}
          <strong className="text-[#D0C4C0]">{totalCount}</strong> correlated incidents
        </span>
        {hasActiveFilters && (
          <span className="text-[11px] text-[#A2847B]">Filters applied</span>
        )}
      </div>

      {/* Incident Table */}
      <IncidentTable incidents={filteredIncidents} />
    </div>
  );
}
