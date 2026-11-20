'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Incident } from '@/types/incidents';
import { SecurityEvent } from '@/types/events';
import { IncidentInvestigation } from '@/types/investigation';
import { InvestigationProviderBadge } from './InvestigationProviderBadge';
import { InvestigationSummary } from './InvestigationSummary';
import { InvestigationFindings } from './InvestigationFindings';
import { AskInvestigator } from './AskInvestigator';
import { EvidenceDrawer } from './EvidenceDrawer';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  FileWarning,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useInvestigation } from '@/lib/api';

interface InvestigationWorkspaceProps {
  incidents: Incident[];
  allEvents: SecurityEvent[];
  investigations: Record<string, IncidentInvestigation>;
  initialIncidentId?: string;
}

export function InvestigationWorkspace({
  incidents,
  allEvents,
  investigations,
  initialIncidentId,
}: InvestigationWorkspaceProps) {
  // Default to initialIncidentId or first incident (INC-2026-0841)
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    initialIncidentId && investigations[initialIncidentId]
      ? initialIncidentId
      : incidents[0]?.id || 'INC-2026-0841'
  );

  const { investigation: apiInvestigation, mode: investigationMode } = useInvestigation(selectedIncidentId);
  const [inspectedEventId, setInspectedEventId] = useState<string | null>(null);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
  const currentInvestigation =
    apiInvestigation || investigations[selectedIncidentId] || investigations[incidents[0]?.id];

  const inspectedEvent = inspectedEventId
    ? allEvents.find((e) => e.id === inspectedEventId) || null
    : null;

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#302A28]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#F3EEEC] flex items-center gap-2.5">
              <Sparkles className="h-6 w-6 text-[#A20903]" />
              <span>AI Investigation Workspace</span>
            </h2>
            <Badge variant="neutral" size="sm">
              SOC INVESTIGATOR
            </Badge>
            <Badge
              variant={investigationMode === 'LIVE' ? 'success' : investigationMode === 'ERROR' ? 'error' : 'neutral'}
              size="sm"
            >
              {investigationMode === 'LIVE' ? 'LIVE REASONING' : investigationMode === 'ERROR' ? 'API DISCONNECTED' : 'DEMO MODE'}
            </Badge>
          </div>
          <p className="text-xs text-[#A79B96] mt-1 max-w-2xl">
            Evidence-backed reasoning, root-cause attribution, and automated threat synthesis across correlated e-commerce incidents.
          </p>
        </div>

        {/* Link to view current incident in detail view */}
        {selectedIncident && (
          <Link
            href={`/incidents/${selectedIncident.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-[#D0C4C0] hover:text-[#F3EEEC] bg-[#141211] px-3.5 py-1.5 rounded-md border border-[#302A28] hover:border-[#4D4440] transition-colors"
          >
            <span>View Full Incident Dossier</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#A20903]" />
          </Link>
        )}
      </div>

      {/* Main Layout: Left Incident Selector (1/4) & Right Investigation Workspace (3/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Incident Selector Panel */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#756B67] uppercase tracking-wider">
              Select Incident ({incidents.length})
            </span>
          </div>

          <div className="space-y-2">
            {incidents.map((incident) => {
              const isSelected = incident.id === selectedIncidentId;
              const isP0 = incident.severity === 'critical';

              return (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncidentId(incident.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1D1A19] border-[#A20903] shadow-md ring-1 ring-[#A20903]/40'
                      : 'bg-[#141211] border-[#302A28] hover:border-[#4D4440] hover:bg-[#1D1A19]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#F3EEEC]">
                      {incident.id}
                    </span>
                    <Badge variant={incident.severity} size="sm" pulse={isP0 && isSelected}>
                      {incident.severity}
                    </Badge>
                  </div>

                  <h4 className="text-xs font-semibold text-[#F3EEEC] mt-1 line-clamp-1">
                    {incident.title}
                  </h4>

                  <div className="mt-2.5 pt-2 border-t border-[#302A28] flex items-center justify-between text-[10px] text-[#756B67]">
                    <span className="font-mono">{incident.relatedEventIds.length} Events</span>
                    <span className="capitalize font-medium text-[#D0C4C0]">
                      Risk: {incident.riskScore}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-[#141211] border border-[#302A28] text-xs text-[#756B67] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#A79B96] block">
              Investigation Method
            </span>
            <p className="text-[11px] leading-relaxed">
              Deterministic correlation chains raw telemetry into unified incident timeline; AI synthesis structures facts vs hypotheses.
            </p>
          </div>
        </div>

        {/* Right Column: AI Investigation Details */}
        <div className="lg:col-span-3 space-y-5">
          {/* Truthful Provider Status Banner */}
          {currentInvestigation && (
            <InvestigationProviderBadge
              status={currentInvestigation.providerStatus}
              providerLabel={currentInvestigation.providerLabel}
              providerModel={currentInvestigation.providerModel}
              disclaimer={currentInvestigation.disclaimer}
            />
          )}

          {/* Incident Context Strip */}
          <div className="bg-[#141211] p-4 rounded-lg border border-[#302A28] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#F3EEEC]">
                  {selectedIncident.id}
                </span>
                <span className="text-xs text-[#756B67]">•</span>
                <span className="text-xs font-semibold text-[#F3EEEC]">
                  {selectedIncident.title}
                </span>
              </div>
              <p className="text-[11px] text-[#756B67] mt-0.5">
                Target: {selectedIncident.affectedIdentities[0]}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={selectedIncident.severity} size="sm">
                {selectedIncident.severity}
              </Badge>
              <span className="text-xs font-mono font-bold text-[#F3EEEC] bg-[#100E0D] px-2.5 py-1 rounded border border-[#302A28]">
                Risk {selectedIncident.riskScore}/100
              </span>
            </div>
          </div>

          {/* AI Investigation Executive Summary, Hypotheses & Impact */}
          {currentInvestigation && (
            <InvestigationSummary investigation={currentInvestigation} />
          )}

          {/* Structured Evidence Findings with Clickable Event IDs */}
          {currentInvestigation && (
            <InvestigationFindings
              findings={currentInvestigation.findings}
              onSelectEvent={(eventId) => setInspectedEventId(eventId)}
            />
          )}

          {/* Interactive "Ask AI Investigator" Conversational Panel */}
          {currentInvestigation && (
            <AskInvestigator
              presetQA={currentInvestigation.presetQA}
              onSelectEvent={(eventId) => setInspectedEventId(eventId)}
              incidentId={selectedIncident.id}
            />
          )}
        </div>
      </div>

      {/* Raw Event Inspector Drawer */}
      <EvidenceDrawer
        event={inspectedEvent}
        onClose={() => setInspectedEventId(null)}
      />
    </div>
  );
}
