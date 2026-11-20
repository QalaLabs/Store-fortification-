'use client';

import React, { useState } from 'react';
import { Incident } from '@/types/incidents';
import { SecurityEvent } from '@/types/events';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileSearch,
  ExternalLink,
  X,
} from 'lucide-react';

interface IncidentEvidenceProps {
  incident: Incident;
  allEvents: SecurityEvent[];
}

export function IncidentEvidence({ incident, allEvents }: IncidentEvidenceProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedEvent = selectedEventId
    ? allEvents.find((e) => e.id === selectedEventId)
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>
            <FileSearch className="h-4 w-4 text-[#A20903]" />
            <span>Correlated Evidence Assessment</span>
          </CardTitle>

          <span className="text-[11px] text-[#756B67]">
            Categorized by Verification Confidence
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confirmed Event Evidence */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#86EFAC]">
            <ShieldCheck className="h-4 w-4 text-[#4ADE80]" />
            <span>Confirmed Event Evidence (100% Deterministic Verification)</span>
          </div>
          <div className="space-y-2">
            {incident.relatedEventIds.map((eventId) => {
              const evt = allEvents.find((e) => e.id === eventId);
              if (!evt) return null;

              return (
                <div
                  key={evt.id}
                  className="p-3 rounded-lg bg-[#100E0D] border border-[#302A28] hover:border-[#4D4440] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedEventId(evt.id)}
                        className="font-mono text-xs font-bold text-[#F3EEEC] hover:underline flex items-center gap-1"
                      >
                        <span>{evt.id}</span>
                        <ExternalLink className="h-3 w-3 text-[#756B67]" />
                      </button>
                      <Badge variant={evt.severity} size="sm">
                        {evt.severity}
                      </Badge>
                      <span className="font-semibold text-[#F3EEEC]">
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A79B96]">
                      {evt.description || `Event observed on ${evt.endpoint} by IP ${evt.sourceIp}`}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-[#756B67] text-right shrink-0">
                    <div>{evt.httpMethod} {evt.endpoint}</div>
                    <div className="text-[#A79B96]">{evt.sourceIp}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suspicious Activity Section */}
        <div className="space-y-2 pt-2 border-t border-[#302A28]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FDE047]">
            <AlertTriangle className="h-4 w-4 text-[#D97706]" />
            <span>Correlated Suspicious Patterns (Correlation Engine Flagged)</span>
          </div>
          <div className="p-3 rounded-lg bg-[#1D1A19] border border-[#302A28] text-xs text-[#D0C4C0] space-y-1">
            <p className="font-semibold text-[#F3EEEC]">
              Temporal Co-occurrence &amp; Threshold Exceeded
            </p>
            <p className="text-[11px] text-[#A79B96] leading-relaxed">
              Events occurred within a 15-minute sliding window following brute-force failures from synthetic exit node (198.51.100.42). Rule R1 triggered incident correlation.
            </p>
          </div>
        </div>

        {/* Event Detail Modal when clicked */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141211] border border-[#302A28] rounded-lg max-w-xl w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#302A28] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#F3EEEC]">
                    {selectedEvent.id}
                  </span>
                  <Badge variant={selectedEvent.severity} size="sm">
                    {selectedEvent.severity}
                  </Badge>
                </div>
                <button
                  onClick={() => setSelectedEventId(null)}
                  className="text-[#756B67] hover:text-[#F3EEEC] p-1 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-semibold text-[#F3EEEC]">{selectedEvent.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[#756B67] pt-1 font-mono text-[11px]">
                  <div>Source: <span className="text-[#D0C4C0]">{selectedEvent.source}</span></div>
                  <div>IP: <span className="text-[#D0C4C0]">{selectedEvent.sourceIp}</span></div>
                  <div>Endpoint: <span className="text-[#D0C4C0]">{selectedEvent.endpoint}</span></div>
                  <div>Status: <span className="text-[#D0C4C0]">{selectedEvent.responseStatus}</span></div>
                  <div>Records: <span className="text-[#D0C4C0]">{selectedEvent.recordCount}</span></div>
                  <div>Category: <span className="text-[#D0C4C0]">{selectedEvent.dataCategory}</span></div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-semibold text-[#756B67] block mb-1">
                    Metadata Payload:
                  </span>
                  <pre className="text-[10px] font-mono bg-[#100E0D] p-2.5 rounded border border-[#302A28] text-[#D0C4C0] overflow-x-auto">
                    {JSON.stringify(selectedEvent.metadata || {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedEventId(null)}
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
