'use client';

import React from 'react';
import Link from 'next/link';
import { Incident } from '@/types/incidents';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Database,
  Layers,
  Clock,
} from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
}

export function IncidentTable({ incidents }: IncidentTableProps) {
  if (incidents.length === 0) {
    return (
      <div className="bg-[#0d1524] rounded-lg border border-[#1b2a45] p-12 text-center space-y-3">
        <ShieldAlert className="h-10 w-10 text-slate-500 mx-auto" />
        <h4 className="text-sm font-semibold text-slate-300">No Incidents Match Filters</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No security incidents found matching the selected search query, severity, or status criteria.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: Incident['status']) => {
    switch (status) {
      case 'containment_pending':
        return (
          <Badge variant="warning" size="sm" pulse>
            Pending Approval
          </Badge>
        );
      case 'investigating':
        return (
          <Badge variant="info" size="sm">
            Investigating
          </Badge>
        );
      case 'open':
        return (
          <Badge variant="high" size="sm">
            Open
          </Badge>
        );
      case 'contained':
        return (
          <Badge variant="success" size="sm">
            Contained
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="neutral" size="sm">
            Resolved
          </Badge>
        );
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const getAffectedRecords = (incident: Incident) => {
    if (incident.id === 'INC-2026-0841') return '4,520 records';
    if (incident.id === 'INC-2026-0839') return '14 guest cards';
    if (incident.id === 'INC-2026-0834') return '650 SKU catalog';
    return '-';
  };

  return (
    <div className="bg-[#0d1524] rounded-lg border border-[#1b2a45] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1b2a45] bg-[#0a0f1a] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Incident</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Severity</th>
              <th className="py-3 px-3">Risk Score</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Events</th>
              <th className="py-3 px-3">Affected Records</th>
              <th className="py-3 px-3">Updated</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b2a45]/60 text-slate-300">
            {incidents.map((incident) => {
              const isP0 = incident.severity === 'critical';

              return (
                <tr
                  key={incident.id}
                  className={`hover:bg-[#121d31]/60 transition-colors group ${
                    isP0 ? 'bg-red-950/10' : ''
                  }`}
                >
                  {/* ID & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="font-mono text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
                      >
                        <span>{incident.id}</span>
                        {isP0 && (
                          <span className="text-[10px] font-sans font-extrabold text-red-400 bg-red-950/80 px-1 py-0.2 rounded border border-red-500/40">
                            P0
                          </span>
                        )}
                      </Link>
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="text-xs font-semibold text-slate-100 group-hover:text-white mt-1 hover:underline line-clamp-1 max-w-[280px]"
                      >
                        {incident.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 truncate max-w-[280px]">
                        Target: {incident.affectedIdentities[0]}
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="text-[11px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                      {incident.type.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <Badge variant={incident.severity} size="sm" pulse={isP0}>
                      {incident.severity}
                    </Badge>
                  </td>

                  {/* Risk Score */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {incident.riskScore}
                        <span className="text-slate-500 text-[10px]">/100</span>
                      </span>
                      <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${
                            incident.riskScore >= 90
                              ? 'bg-red-500'
                              : incident.riskScore >= 75
                              ? 'bg-orange-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${incident.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {getStatusBadge(incident.status)}
                  </td>

                  {/* Associated Events */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
                      <Layers className="h-3.5 w-3.5 text-slate-500" />
                      <span>{incident.relatedEventIds.length} events</span>
                    </div>
                  </td>

                  {/* Affected Records */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
                      <Database className="h-3.5 w-3.5 text-slate-500" />
                      <span>{getAffectedRecords(incident)}</span>
                    </div>
                  </td>

                  {/* Updated Time */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>{formatDateTime(incident.updatedAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* Open in AI Investigator */}
                      <Link
                        href={`/investigate?incidentId=${incident.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[11px] font-semibold transition-colors"
                        title="Open in AI Investigator"
                      >
                        <Sparkles className="h-3 w-3 text-cyan-400" />
                        <span>Investigate</span>
                      </Link>

                      {/* View Details */}
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
