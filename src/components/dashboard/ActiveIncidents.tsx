'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Incident } from '@/types/incidents';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import {
  FileWarning,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface ActiveIncidentsProps {
  incidents: Incident[];
}

export function ActiveIncidents({ incidents }: ActiveIncidentsProps) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>
              <FileWarning className="h-4 w-4 text-[#A20903]" />
              <span>Active Correlated Incidents</span>
            </CardTitle>
            <p className="text-xs text-[#A79B96] mt-1">
              Multi-signal deterministic correlation producing actionable security cases
            </p>
          </div>

          <Link
            href="/incidents"
            className="text-xs text-[#D0C4C0] hover:text-[#F3EEEC] font-medium flex items-center gap-1 group"
          >
            <span>View All ({incidents.length})</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform text-[#756B67]" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {incidents.map((incident) => {
          const isP0 = incident.severity === 'critical';

          return (
            <div
              key={incident.id}
              className={`p-3.5 rounded-lg border transition-all duration-150 cursor-pointer ${
                isP0
                  ? 'bg-[#5C1811]/15 border-[#A20903]/40 hover:border-[#A20903]/70 hover:bg-[#5C1811]/25'
                  : 'bg-[#141211] border-[#302A28] hover:border-[#4D4440] hover:bg-[#1D1A19]'
              }`}
              onClick={() => setSelectedIncident(incident)}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#F3EEEC]">
                    {incident.id}
                  </span>
                  <Badge variant={incident.severity} size="sm" pulse={isP0}>
                    {incident.severity}
                  </Badge>
                  <span className="text-[10px] text-[#756B67] font-mono">
                    {formatDateTime(incident.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-mono font-bold text-[#D0C4C0]">
                    Risk {incident.riskScore}/100
                  </span>
                  <div className="w-12 h-1.5 rounded-full bg-[#100E0D] overflow-hidden border border-[#302A28]">
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

              {/* Title & Evidence */}
              <h4 className="text-xs font-semibold text-[#F3EEEC] mt-2">
                {incident.title}
              </h4>
              <p className="text-[11px] text-[#A79B96] mt-1 line-clamp-2">
                {incident.evidenceSummary}
              </p>

              {/* Bottom Metadata & Recommended Action */}
              <div className="mt-3 pt-2.5 border-t border-[#302A28] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2 text-[#756B67]">
                  <span className="truncate max-w-[200px]">
                    Identities: <span className="text-[#D0C4C0]">{incident.affectedIdentities[0]}</span>
                  </span>
                  <span>•</span>
                  <span>{incident.relatedEventIds.length} Correlated Events</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                      incident.recommendedAction.status === 'pending_approval'
                        ? 'bg-[#78350F]/30 text-[#FDE047] border-[#D97706]/40 animate-pulse'
                        : 'bg-[#26502B]/30 text-[#86EFAC] border-[#26502B]'
                    }`}
                  >
                    Action: {incident.recommendedAction.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Modal / Slide-over detail preview */}
        {selectedIncident && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141211] border border-[#302A28] rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-[#302A28] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#F3EEEC]">
                      {selectedIncident.id}
                    </span>
                    <Badge variant={selectedIncident.severity} size="sm">
                      {selectedIncident.severity}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-[#F3EEEC] mt-1">
                    {selectedIncident.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-[#756B67] hover:text-[#F3EEEC] p-1 rounded"
                >
                  ✕
                </button>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-[#756B67] uppercase tracking-wider">
                  Correlated Evidence Summary
                </h5>
                <p className="text-xs text-[#D0C4C0] mt-1 bg-[#1D1A19] p-3 rounded border border-[#302A28]">
                  {selectedIncident.evidenceSummary}
                </p>
              </div>

              {selectedIncident.aiAnalysisSummary && (
                <div>
                  <h5 className="text-xs font-semibold text-[#A2847B] flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Investigation Reasoning (Simulated Bedrock Adapter)
                  </h5>
                  <p className="text-xs text-[#D0C4C0] mt-1 bg-[#1D1A19] p-3 rounded border border-[#302A28]">
                    {selectedIncident.aiAnalysisSummary}
                  </p>
                </div>
              )}

              <div>
                <h5 className="text-xs font-semibold text-[#756B67] uppercase tracking-wider">
                  Incident Timeline ({selectedIncident.timeline.length} Steps)
                </h5>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedIncident.timeline.map((entry) => (
                    <div
                      key={entry.id}
                      className="text-xs bg-[#100E0D] p-2 rounded border border-[#302A28] flex items-start gap-2"
                    >
                      <span className="font-mono text-[10px] text-[#756B67] shrink-0 mt-0.5">
                        {entry.timestamp.split('T')[1]?.replace('Z', '') || entry.timestamp}
                      </span>
                      <div>
                        <span className="font-semibold text-[#F3EEEC]">{entry.title}: </span>
                        <span className="text-[#A79B96]">{entry.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1D1A19] p-3 rounded border border-[#A20903]/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#FCA5A5] block">
                    Recommended Containment: {selectedIncident.recommendedAction.label}
                  </span>
                  <span className="text-[11px] text-[#A79B96]">
                    {selectedIncident.recommendedAction.description}
                  </span>
                </div>
                <button
                  onClick={() => {
                    alert(`Simulated Action Triggered: ${selectedIncident.recommendedAction.label} has been simulated and logged to response audit trail.`);
                    setSelectedIncident(null);
                  }}
                  className="px-3 py-1.5 bg-[#A20903] hover:bg-[#850702] text-[#F3EEEC] font-bold text-xs rounded transition-colors shrink-0"
                >
                  Approve (Simulated)
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-1.5 bg-[#1D1A19] hover:bg-[#221E1D] text-[#A79B96] text-xs font-medium rounded border border-[#302A28]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
