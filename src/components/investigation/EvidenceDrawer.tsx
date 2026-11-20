'use client';

import React from 'react';
import { SecurityEvent } from '@/types/events';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import { X, Globe, User, Database, Code, ShieldCheck } from 'lucide-react';

interface EvidenceDrawerProps {
  event: SecurityEvent | null;
  onClose: () => void;
}

export function EvidenceDrawer({ event, onClose }: EvidenceDrawerProps) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1524] border border-[#1b2a45] rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1b2a45] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
              {event.id}
            </span>
            <Badge variant={event.severity} size="sm">
              {event.severity}
            </Badge>
            <span className="text-xs font-semibold text-slate-200">
              {event.eventType.replace(/_/g, ' ')}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Narrative Description */}
        <div className="p-3 bg-[#090e17] rounded-lg border border-[#1b2a45] text-xs text-slate-200">
          {event.description || 'Verified event captured by ingestion gateway.'}
        </div>

        {/* Structured Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-[#090e17] rounded border border-[#1b2a45] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Event Source</span>
            <div className="font-mono text-slate-200">{event.source}</div>
          </div>

          <div className="p-2.5 bg-[#090e17] rounded border border-[#1b2a45] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Timestamp</span>
            <div className="font-mono text-slate-200">{formatDateTime(event.timestamp)}</div>
          </div>

          <div className="p-2.5 bg-[#090e17] rounded border border-[#1b2a45] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Source IP & Geo</span>
            <div className="font-mono text-slate-200">
              {event.sourceIp} {event.geoCountry ? `(${event.geoCountry})` : ''}
            </div>
          </div>

          <div className="p-2.5 bg-[#090e17] rounded border border-[#1b2a45] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Endpoint</span>
            <div className="font-mono text-slate-200">
              {event.httpMethod} {event.endpoint}
            </div>
          </div>

          <div className="p-2.5 bg-[#090e17] rounded border border-[#1b2a45] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">HTTP Status</span>
            <div className="font-mono text-emerald-400 font-bold">{event.responseStatus}</div>
          </div>

          <div className="p-2.5 bg-[#090e17] rounded border border-[#1b2a45] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Records Affected</span>
            <div className="font-mono text-slate-200">{event.recordCount.toLocaleString()}</div>
          </div>
        </div>

        {/* Metadata JSON */}
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Raw Ingestion Payload:
          </span>
          <pre className="text-[11px] font-mono bg-[#05080f] p-3 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto">
            {JSON.stringify(event, null, 2)}
          </pre>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
