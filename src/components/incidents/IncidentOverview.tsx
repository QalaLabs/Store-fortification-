'use client';

import React from 'react';
import Link from 'next/link';
import { Incident } from '@/types/incidents';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import {
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Clock,
  Layers,
  CheckCircle2,
  Bot,
} from 'lucide-react';

interface IncidentOverviewProps {
  incident: Incident;
}

export function IncidentOverview({ incident }: IncidentOverviewProps) {
  const isP0 = incident.severity === 'critical';

  return (
    <div className="bg-[#141211] rounded-lg border border-[#302A28] p-5 space-y-4 shadow-sm">
      {/* Top back button and actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/incidents"
          className="inline-flex items-center gap-1.5 text-xs text-[#A79B96] hover:text-[#F3EEEC] bg-[#100E0D] px-3 py-1.5 rounded-md border border-[#302A28] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Incidents</span>
        </Link>

        {/* Actions to Jump into AI Investigator, Response Centre, and R8 Agent Verification */}
        <div className="flex items-center gap-2 flex-wrap">
          {incident.id === 'INC-2026-0841' && (
            <Link
              href="/identity/agents?highlightTx=tx-agent-2026-8804"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1D1A19] hover:bg-[#221E1D] text-[#D0C4C0] border border-[#302A28] text-xs font-semibold transition-colors"
            >
              <Bot className="h-3.5 w-3.5 text-[#A2847B]" />
              <span>R8 Mandate (Ownership Mismatch)</span>
            </Link>
          )}

          <Link
            href="/operations/response"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1D1A19] hover:bg-[#221E1D] text-[#D0C4C0] border border-[#302A28] text-xs font-semibold transition-colors"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-[#D97706]" />
            <span>Response Centre</span>
          </Link>

          <Link
            href={`/investigate?incidentId=${incident.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#A20903] hover:bg-[#850702] text-[#F3EEEC] text-xs font-semibold shadow transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Open in AI Investigator</span>
          </Link>
        </div>
      </div>

      {/* Main title & Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-sm font-bold text-[#F3EEEC] bg-[#100E0D] px-2.5 py-0.5 rounded border border-[#302A28]">
              {incident.id}
            </span>
            <Badge variant={incident.severity} size="md" pulse={isP0}>
              {incident.severity} Severity
            </Badge>
            <span className="text-xs font-mono text-[#D0C4C0] bg-[#1D1A19] px-2 py-0.5 rounded border border-[#302A28]">
              {incident.type.replace(/_/g, ' ')}
            </span>
          </div>

          <h2 className="text-xl font-bold text-[#F3EEEC] tracking-tight">
            {incident.title}
          </h2>
        </div>

        {/* Risk Score Pill */}
        <div className="bg-[#100E0D] p-3 rounded-lg border border-[#302A28] flex items-center gap-4 shrink-0">
          <div>
            <span className="text-[10px] text-[#756B67] font-semibold uppercase tracking-wider block">
              Risk Score
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`text-2xl font-extrabold font-mono ${
                  incident.riskScore >= 90
                    ? 'text-[#FCA5A5]'
                    : incident.riskScore >= 75
                    ? 'text-[#FDBA74]'
                    : 'text-[#FDE047]'
                }`}
              >
                {incident.riskScore}
              </span>
              <span className="text-xs text-[#756B67] font-mono">/100</span>
            </div>
          </div>

          <div className="w-24 h-2 rounded-full bg-[#141211] overflow-hidden border border-[#302A28]">
            <div
              className={`h-full ${
                incident.riskScore >= 90
                  ? 'bg-[#A20903]'
                  : incident.riskScore >= 75
                  ? 'bg-[#C2410C]'
                  : 'bg-[#D97706]'
              }`}
              style={{ width: `${incident.riskScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metadata strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#302A28] text-xs text-[#756B67]">
        <div>
          <span className="text-[10px] uppercase font-semibold text-[#756B67] block">Status</span>
          <span className="font-semibold text-[#F3EEEC] capitalize mt-0.5 block">
            {incident.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-[#756B67] block">Detected</span>
          <span className="font-mono text-[#D0C4C0] mt-0.5 block">
            {formatDateTime(incident.createdAt)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-[#756B67] block">Last Activity</span>
          <span className="font-mono text-[#D0C4C0] mt-0.5 block">
            {formatDateTime(incident.updatedAt)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-[#756B67] block">Correlated Events</span>
          <span className="font-mono text-[#D0C4C0] mt-0.5 block">
            {incident.relatedEventIds.length} raw telemetry signals
          </span>
        </div>
      </div>
    </div>
  );
}
