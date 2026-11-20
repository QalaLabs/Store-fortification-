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
            <FileSearch className="h-4 w-4 text-cyan-400" />
            <span>Correlated Evidence Assessment</span>
          </CardTitle>

          <span className="text-[11px] text-slate-400">
            Categorized by Verification Confidence
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confirmed Event Evidence */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Confirmed Event Evidence (100% Deterministic Verification)</span>
          </div>
          <div className="space-y-2">
            {incident.relatedEventIds.map((eventId) => {
              const evt = allEvents.find((e) => e.id === eventId);
              if (!evt) return null;

              return (
                <div
                  key={evt.id}
                  className="p-3 rounded-lg bg-[#090e17] border border-[#1b2a45] hover:border-blue-500/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedEventId(evt.id)}
                        className="font-mono text-xs font-bold text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                      >
                        <span>{evt.id}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                      <Badge variant={evt.severity} size="sm">
                        {evt.severity}
                      </Badge>
                      <span className="font-semibold text-slate-200">
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {evt.description || `Event observed on ${evt.endpoint} by IP ${evt.sourceIp}`}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 text-right shrink-0">
                    <div>{evt.httpMethod} {evt.endpoint}</div>
                    <div className="text-slate-500">{evt.sourceIp}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suspicious Activity Section */}
        <div className="space-y-2 pt-2 border-t border-[#1b2a45]/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span>Correlated Suspicious Patterns (Correlation Engine Flagged)</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/15 border border-amber-500/30 text-xs text-amber-200 space-y-1">
            <p className="font-semibold">
              Temporal Co-occurrence & Threshold Exceeded
            </p>
            <p className="text-[11px] text-slate-400">
              Pattern matches multi-vector credential stuffing rule: Authentication failure burst within 75s followed by rapid account mutation within 45s and database query volume exceeding 100 req/sec.
            </p>
          </div>
        </div>

        {/* Unverified Information Section */}
        <div className="space-y-2 pt-2 border-t border-[#1b2a45]/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <HelpCircle className="h-4 w-4 text-slate-400" />
            <span>Unverified Information / Open Hypotheses</span>
          </div>
          <div className="p-3 rounded-lg bg-[#090e17] border border-[#1b2a45] text-xs text-slate-400 space-y-1">
            <p className="text-[11px]">
              • Attacker infrastructure identity: Exact VPN/Tor exit provider unverified without external threat intel feed.
            </p>
            <p className="text-[11px]">
              • External data persistence: Whether dumped data has been propagated outside immediate adversary host.
            </p>
          </div>
        </div>

        {/* Event Detail Modal when clicking on event ID */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0d1524] border border-[#1b2a45] rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1b2a45] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-400">
                    {selectedEvent.id}
                  </span>
                  <Badge variant={selectedEvent.severity} size="sm">
                    {selectedEvent.severity}
                  </Badge>
                </div>
                <button
                  onClick={() => setSelectedEventId(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-semibold text-slate-200">{selectedEvent.description}</p>
                <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
                  <div>Source: <span className="text-slate-200 font-mono">{selectedEvent.source}</span></div>
                  <div>IP: <span className="text-slate-200 font-mono">{selectedEvent.sourceIp}</span></div>
                  <div>Endpoint: <span className="text-slate-200 font-mono">{selectedEvent.endpoint}</span></div>
                  <div>Status: <span className="text-slate-200 font-mono">{selectedEvent.responseStatus}</span></div>
                  <div>Records: <span className="text-slate-200 font-mono">{selectedEvent.recordCount}</span></div>
                  <div>Data: <span className="text-slate-200 font-mono">{selectedEvent.dataCategory}</span></div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Metadata</span>
                  <pre className="text-[10px] font-mono bg-[#090e17] p-2 rounded border border-[#1b2a45] text-slate-300 overflow-x-auto mt-1">
                    {JSON.stringify(selectedEvent.metadata || {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedEventId(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded"
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
