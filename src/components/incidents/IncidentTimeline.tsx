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
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Attack Timeline & Correlated Security Events</span>
            </CardTitle>
            <p className="text-xs text-slate-400 mt-1">
              Chronological sequence of verified raw events comprising this correlated incident
            </p>
          </div>

          <span className="text-xs text-slate-400 font-mono bg-[#090e17] px-2.5 py-1 rounded border border-[#1b2a45]">
            {linkedEvents.length} Verified Events
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timeline Items */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1b2a45]">
          {linkedEvents.map((evt, idx) => {
            const isExpanded = expandedEventId === evt.id;
            const isP0 = evt.severity === 'critical';

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline node dot */}
                <div
                  className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-[#0d1524] transition-colors ${
                    isP0
                      ? 'border-red-500 bg-red-950'
                      : evt.severity === 'high'
                      ? 'border-orange-500 bg-orange-950'
                      : evt.severity === 'medium'
                      ? 'border-amber-500 bg-amber-950'
                      : 'border-blue-500 bg-blue-950'
                  }`}
                />

                {/* Event Card */}
                <div
                  className={`p-3.5 rounded-lg border transition-all ${
                    isExpanded
                      ? 'bg-[#121d31] border-blue-500/50 shadow-md'
                      : 'bg-[#090e17] border-[#1b2a45] hover:border-slate-600'
                  }`}
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                    onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {evt.id}
                      </span>
                      <Badge variant={evt.severity} size="sm">
                        {evt.severity}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-200">
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({evt.source})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>{formatDateTime(evt.timestamp)}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="mt-2 text-xs text-slate-300 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Globe className="h-3 w-3 text-slate-500" />
                      <span>{evt.sourceIp}</span>
                      {evt.geoCountry && <span>({evt.geoCountry})</span>}
                    </span>

                    <span className="font-mono text-slate-400">
                      <strong className="text-slate-300">{evt.httpMethod}</strong> {evt.endpoint}
                    </span>

                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        evt.responseStatus === 200
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      Status: {evt.responseStatus}
                    </span>

                    {evt.recordCount > 0 && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Records: {evt.recordCount.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {evt.description && (
                    <p className="text-[11px] text-slate-400 mt-2 bg-[#0d1524] p-2 rounded border border-[#1b2a45]">
                      {evt.description}
                    </p>
                  )}

                  {/* Expanded JSON / Metadata drawer */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#1b2a45] space-y-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Raw Event Telemetry Metadata
                      </span>
                      <pre className="text-[11px] font-mono bg-[#05080f] p-3 rounded border border-slate-800 text-slate-300 overflow-x-auto leading-relaxed">
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
