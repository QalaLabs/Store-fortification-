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
} from 'lucide-react';

interface IncidentOverviewProps {
  incident: Incident;
}

export function IncidentOverview({ incident }: IncidentOverviewProps) {
  const isP0 = incident.severity === 'critical';

  return (
    <div className="bg-[#0d1524] rounded-lg border border-[#1b2a45] p-5 space-y-4 shadow-sm">
      {/* Top back button and actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/incidents"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#090e17] px-3 py-1.5 rounded-md border border-[#1b2a45] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Incidents</span>
        </Link>

        {/* Action to Jump into AI Investigator */}
        <Link
          href={`/investigate?incidentId=${incident.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          <span>Open in AI Investigator</span>
        </Link>
      </div>

      {/* Main title & Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-sm font-bold text-slate-200 bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700/60">
              {incident.id}
            </span>
            <Badge variant={incident.severity} size="md" pulse={isP0}>
              {incident.severity} Severity
            </Badge>
            <span className="text-xs font-mono text-slate-300 bg-blue-950/40 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
              {incident.type.replace(/_/g, ' ')}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            {incident.title}
          </h2>
        </div>

        {/* Risk Score Pill */}
        <div className="bg-[#090e17] p-3 rounded-lg border border-[#1b2a45] flex items-center gap-4 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Risk Score
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`text-2xl font-extrabold font-mono ${
                  incident.riskScore >= 90
                    ? 'text-red-400'
                    : incident.riskScore >= 75
                    ? 'text-orange-400'
                    : 'text-amber-400'
                }`}
              >
                {incident.riskScore}
              </span>
              <span className="text-xs text-slate-500 font-mono">/100</span>
            </div>
          </div>

          <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
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
      </div>

      {/* Metadata strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1b2a45]/60 text-xs text-slate-400">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Status</span>
          <span className="font-semibold text-slate-200 capitalize mt-0.5 block">
            {incident.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Detected</span>
          <span className="font-mono text-slate-200 mt-0.5 block">
            {formatDateTime(incident.createdAt)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Last Activity</span>
          <span className="font-mono text-slate-200 mt-0.5 block">
            {formatDateTime(incident.updatedAt)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Correlated Events</span>
          <span className="font-mono text-slate-200 mt-0.5 block">
            {incident.relatedEventIds.length} raw telemetry signals
          </span>
        </div>
      </div>
    </div>
  );
}
