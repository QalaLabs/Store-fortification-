'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SecurityEvent } from '@/types/events';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatTimestamp, formatDateTime } from '@/lib/formatters';
import {
  Radio,
  Search,
  Filter,
  Play,
  Pause,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Layers,
  Globe,
  Info,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useEvents } from '@/lib/api';

interface LiveThreatFeedProps {
  initialEvents?: SecurityEvent[];
}

export function LiveThreatFeed({ initialEvents }: LiveThreatFeedProps) {
  const { events: apiEvents, isLoading, error, mode, refetch } = useEvents();
  const events = initialEvents || apiEvents;
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedEvent, setInspectedEvent] = useState<SecurityEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (selectedSource !== 'ALL' && evt.source !== selectedSource) return false;
      if (selectedSeverity !== 'ALL' && evt.severity !== selectedSeverity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchType = evt.eventType.toLowerCase().includes(q);
        const matchEndpoint = evt.endpoint.toLowerCase().includes(q);
        const matchIp = evt.sourceIp.toLowerCase().includes(q);
        const matchUser = evt.userId?.toLowerCase().includes(q) || false;
        if (!matchType && !matchEndpoint && !matchIp && !matchUser) return false;
      }
      return true;
    });
  }, [events, selectedSource, selectedSeverity, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#302A28]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#F3EEEC] flex items-center gap-2.5">
              <Radio className="h-6 w-6 text-[#A20903]" />
              <span>Live Threat Feed &amp; Signal Ingestion</span>
            </h2>
            <Badge variant="info" size="sm" pulse={isStreaming}>
              {isStreaming ? 'STREAMING ACTIVE' : 'STREAM PAUSED'}
            </Badge>
            <Badge
              variant={mode === 'LIVE' ? 'success' : mode === 'ERROR' ? 'error' : 'neutral'}
              size="sm"
            >
              {mode === 'LIVE' ? 'LIVE DATA' : mode === 'ERROR' ? 'API ERROR' : 'DEMO MODE'}
            </Badge>
          </div>
          <p className="text-xs text-[#A79B96] mt-1 max-w-2xl">
            Normalized real-time security events captured across authentication gateways, e-commerce checkout APIs, and partner endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isStreaming
                ? 'bg-[#1D1A19] hover:bg-[#221E1D] text-[#D0C4C0] border-[#302A28]'
                : 'bg-[#26502B] hover:bg-[#1e4022] text-[#F3EEEC] border-[#26502B]'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="h-3 w-3" />
                <span>Pause Ingestion Feed</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" />
                <span>Resume Feed</span>
              </>
            )}
          </button>

          <Link
            href="/incidents/INC-2026-0841"
            className="px-3 py-1.5 rounded-lg bg-[#5C1811]/40 hover:bg-[#5C1811]/60 text-[#FCA5A5] border border-[#A20903]/50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-[#A20903]" />
            <span>Active Incident P0 (INC-0841)</span>
          </Link>
        </div>
      </div>

      {/* Primary Attack Story Highlighter Banner */}
      <div className="p-4 rounded-lg bg-[#141211] border border-[#A20903]/40 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#A20903] animate-pulse" />
            <span className="text-xs font-bold text-[#FCA5A5] uppercase tracking-wider">
              Primary Attack Story Demonstration: Account Takeover + High-Frequency Order Scraping
            </span>
          </div>

          <Link
            href="/incidents/INC-2026-0841"
            className="text-xs text-[#D0C4C0] hover:text-[#F3EEEC] font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Inspect Correlated Incident &amp; Timeline</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#A20903]" />
          </Link>
        </div>

        <p className="text-xs text-[#A79B96] leading-relaxed">
          Ingestion telemetry streams 6 correlated events (<code>evt-001</code> to <code>evt-009</code>): 7 credential stuffing failed logins &rarr; successful authentication &rarr; shipping/phone swap within 45s &rarr; 420 burst order calls &rarr; bulk CSV export dumping 4,520 records.
        </p>

        <div className="flex items-center gap-2 pt-1 text-[11px] text-[#756B67] font-mono">
          <span>IP 198.51.100.42: <strong className="text-[#D0C4C0] font-sans">Synthetic Test IP (RFC 5737 TEST-NET-2)</strong></span>
          <span>•</span>
          <span>Correlated Target: <strong className="text-[#D0C4C0] font-sans">usr-vip-9902</strong></span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#141211] p-3.5 rounded-lg border border-[#302A28] space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#756B67]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event type, IP, endpoint or user ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#100E0D] border border-[#302A28] rounded-md text-[#F3EEEC] placeholder-[#756B67] focus:outline-none focus:border-[#A20903]/60"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-xs bg-[#100E0D] border border-[#302A28] rounded-md px-2.5 py-1.5 text-[#F3EEEC] focus:outline-none focus:border-[#A20903]/60"
            >
              <option value="ALL">All Sources</option>
              <option value="auth-service">Auth Service</option>
              <option value="ecommerce-api">E-Commerce API</option>
              <option value="customer-portal">Customer Portal</option>
              <option value="checkout-engine">Checkout Engine</option>
              <option value="seller-gateway">Seller Gateway</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="text-xs bg-[#100E0D] border border-[#302A28] rounded-md px-2.5 py-1.5 text-[#F3EEEC] focus:outline-none focus:border-[#A20903]/60"
            >
              <option value="ALL">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>
              <Layers className="h-4 w-4 text-[#A20903]" />
              <span>Real-Time Ingestion Event Stream</span>
            </CardTitle>
            <span className="text-xs text-[#756B67] font-mono">
              Showing {filteredEvents.length} of {events.length} Events
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#302A28] bg-[#100E0D] text-[11px] font-semibold text-[#756B67] uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">Event ID</th>
                  <th className="py-3 px-3">Type &amp; Source</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Source IP</th>
                  <th className="py-3 px-3">Endpoint</th>
                  <th className="py-3 px-3 text-right">Status</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#302A28] text-[#D0C4C0] font-mono text-[11px]">
                {filteredEvents.map((evt) => {
                  const isCritical = evt.severity === 'critical';

                  return (
                    <tr
                      key={evt.id}
                      className={`hover:bg-[#1D1A19] transition-colors cursor-pointer ${
                        isCritical ? 'bg-[#5C1811]/15' : ''
                      }`}
                      onClick={() => setInspectedEvent(evt)}
                    >
                      <td className="py-3 px-4 text-[#756B67] whitespace-nowrap">
                        {formatTimestamp(evt.timestamp)}
                      </td>

                      <td className="py-3 px-3 text-[#D0C4C0] font-bold whitespace-nowrap">
                        {evt.id}
                      </td>

                      <td className="py-3 px-3 font-sans font-medium text-[#F3EEEC]">
                        <div className="flex flex-col">
                          <span>{evt.eventType.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-[#756B67] font-mono">{evt.source}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge variant={evt.severity} size="sm">
                          {evt.severity}
                        </Badge>
                      </td>

                      <td className="py-3 px-3 text-[#D0C4C0] whitespace-nowrap">
                        {evt.sourceIp} {evt.geoCountry ? `(${evt.geoCountry})` : ''}
                      </td>

                      <td className="py-3 px-3 text-[#756B67] font-mono truncate max-w-[200px]">
                        <span className="text-[#A79B96] font-bold mr-1">{evt.httpMethod}</span>
                        {evt.endpoint}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            evt.responseStatus === 200
                              ? 'bg-[#26502B]/30 text-[#86EFAC] border border-[#26502B]'
                              : 'bg-[#78350F]/30 text-[#FDE047] border border-[#D97706]/40'
                          }`}
                        >
                          {evt.responseStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedEvent(evt);
                          }}
                          className="px-2 py-1 rounded bg-[#1D1A19] hover:bg-[#221E1D] text-[#D0C4C0] font-sans text-[11px] font-medium border border-[#302A28] transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Raw Event Inspector Modal */}
      {inspectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141211] border border-[#302A28] rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#302A28] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[#F3EEEC]">
                  {inspectedEvent.id}
                </span>
                <Badge variant={inspectedEvent.severity} size="sm">
                  {inspectedEvent.severity}
                </Badge>
              </div>
              <button
                onClick={() => setInspectedEvent(null)}
                className="p-1 rounded text-[#756B67] hover:text-[#F3EEEC]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold text-[#F3EEEC]">{inspectedEvent.description}</p>
              <div className="grid grid-cols-2 gap-2 text-[#756B67] pt-1 font-mono text-[11px]">
                <div>Source: <span className="text-[#D0C4C0]">{inspectedEvent.source}</span></div>
                <div>IP: <span className="text-[#D0C4C0]">{inspectedEvent.sourceIp} (Synthetic Test IP)</span></div>
                <div>Endpoint: <span className="text-[#D0C4C0]">{inspectedEvent.endpoint}</span></div>
                <div>Status: <span className="text-[#D0C4C0]">{inspectedEvent.responseStatus}</span></div>
                <div>Records: <span className="text-[#D0C4C0]">{inspectedEvent.recordCount}</span></div>
                <div>Category: <span className="text-[#D0C4C0]">{inspectedEvent.dataCategory}</span></div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] uppercase font-semibold text-[#756B67] block mb-1">
                  Ingestion Metadata Payload:
                </span>
                <pre className="text-[10px] font-mono bg-[#100E0D] p-2.5 rounded border border-[#302A28] text-[#D0C4C0] overflow-x-auto">
                  {JSON.stringify(inspectedEvent.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedEvent(null)}
                className="px-4 py-1.5 bg-[#1D1A19] hover:bg-[#221E1D] text-[#A79B96] text-xs font-medium rounded border border-[#302A28] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
