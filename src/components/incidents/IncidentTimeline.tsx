'use client';

import React, { useState } from 'react';
import { Incident } from '@/types/incidents';
import { SecurityEvent } from '@/types/events';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatTimestamp, formatDateTime } from '@/lib/formatters';
import {
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Globe,
  User,
  ShieldAlert,
  ArrowRight,
  Code,
} from 'lucide-react';

interface IncidentTimelineProps {
  incident: Incident;
  allEvents: SecurityEvent[];
}

export function IncidentTimeline({ incident, allEvents }: IncidentTimelineProps) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Map relatedEventIds to full event records
  const linkedEvents = incident.relatedEventIds
    .map((id) => allEvents.find((e) => e.id === id))
    .filter((e): e is SecurityEvent => e !== undefined)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>
              <Clock className="h-4 w-4 text-[#A20903]" />
              <span>Attack Timeline &amp; Correlated Security Events</span>
            </CardTitle>
            <p className="text-xs text-[#A79B96] mt-1">
              Chronological sequence of verified raw events comprising this correlated incident
            </p>
          </div>

          <span className="text-xs text-[#756B67] font-mono bg-[#100E0D] px-2.5 py-1 rounded border border-[#302A28]">
            {linkedEvents.length} Verified Events
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timeline Items */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#302A28]">
          {linkedEvents.map((evt, idx) => {
            const isExpanded = expandedEventId === evt.id;
            const isP0 = evt.severity === 'critical';

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline node dot */}
                <div
                  className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-[#141211] transition-colors ${
                    isP0
                      ? 'border-[#A20903] bg-[#5C1811]'
                      : evt.severity === 'high'
                      ? 'border-[#C2410C] bg-[#7C2D12]'
                      : evt.severity === 'medium'
                      ? 'border-[#D97706] bg-[#78350F]'
                      : 'border-[#302A28] bg-[#1D1A19]'
                  }`}
                />

                {/* Event Card */}
                <div
                  className={`p-3.5 rounded-lg border transition-all ${
                    isExpanded
                      ? 'bg-[#1D1A19] border-[#A20903]/60 shadow-md'
                      : 'bg-[#100E0D] border-[#302A28] hover:border-[#4D4440]'
                  }`}
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                    onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#F3EEEC]">
                        {evt.id}
                      </span>
                      <Badge variant={evt.severity} size="sm">
                        {evt.severity}
                      </Badge>
                      <span className="text-xs font-semibold text-[#F3EEEC]">
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-[#756B67]">
                        ({evt.source})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#756B67] font-mono">
                      <span>{formatDateTime(evt.timestamp)}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-[#756B67]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#756B67]" />
                      )}
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="mt-2 text-xs text-[#A79B96] flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-mono text-[#756B67]">
                      <Globe className="h-3 w-3 text-[#756B67]" />
                      <span>{evt.sourceIp}</span>
                      {evt.geoCountry && <span>({evt.geoCountry})</span>}
                    </span>

                    <span className="font-mono text-[#756B67]">
                      <strong className="text-[#D0C4C0]">{evt.httpMethod}</strong> {evt.endpoint}
                    </span>

                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        evt.responseStatus === 200
                          ? 'bg-[#26502B]/30 text-[#86EFAC] border border-[#26502B]'
                          : 'bg-[#78350F]/30 text-[#FDE047] border border-[#D97706]/40'
                      }`}
                    >
                      Status: {evt.responseStatus}
                    </span>

                    {evt.recordCount > 0 && (
                      <span className="text-[11px] font-mono text-[#756B67]">
                        Records: {evt.recordCount.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {evt.description && (
                    <p className="text-[11px] text-[#A79B96] mt-2 bg-[#141211] p-2 rounded border border-[#302A28]">
                      {evt.description}
                    </p>
                  )}

                  {/* Expanded JSON / Metadata drawer */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#302A28] space-y-2">
                      <span className="text-[10px] font-semibold text-[#756B67] uppercase tracking-wider block">
                        Raw Event Telemetry Metadata
                      </span>
                      <pre className="text-[11px] font-mono bg-[#141211] p-3 rounded border border-[#302A28] text-[#D0C4C0] overflow-x-auto leading-relaxed">
                        {JSON.stringify(
                          {
                            id: evt.id,
                            timestamp: evt.timestamp,
                            source: evt.source,
                            eventType: evt.eventType,
                            severity: evt.severity,
                            userId: evt.userId,
                            userEmail: evt.userEmail,
                            sessionId: evt.sessionId,
                            sourceIp: evt.sourceIp,
                            geoCountry: evt.geoCountry,
                            endpoint: evt.endpoint,
                            httpMethod: evt.httpMethod,
                            responseStatus: evt.responseStatus,
                            requestCount: evt.requestCount,
                            resourceType: evt.resourceType,
                            recordCount: evt.recordCount,
                            dataCategory: evt.dataCategory,
                            metadata: evt.metadata,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
