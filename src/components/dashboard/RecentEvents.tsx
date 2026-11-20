import React from 'react';
import Link from 'next/link';
import { SecurityEvent } from '@/types/events';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatTimestamp } from '@/lib/formatters';
import { Radio, ChevronRight, ArrowUpRight } from 'lucide-react';

interface RecentEventsProps {
  events: SecurityEvent[];
}

export function RecentEvents({ events }: RecentEventsProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>
              <Radio className="h-4 w-4 text-[#A20903]" />
              <span>Recent Security Events</span>
            </CardTitle>
            <p className="text-xs text-[#A79B96] mt-1">
              Normalized real-time audit stream from e-commerce API, auth, checkout, and partner gateways
            </p>
          </div>

          <Link
            href="/threats/live"
            className="text-xs text-[#D0C4C0] hover:text-[#F3EEEC] font-medium flex items-center gap-1 group"
          >
            <span>Live Stream</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform text-[#756B67]" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#302A28] bg-[#100E0D] text-[11px] font-semibold text-[#756B67] uppercase tracking-wider">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Endpoint</th>
                <th className="py-2.5 px-3 text-right">Status</th>
                <th className="py-2.5 px-4 text-right">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#302A28] text-[#D0C4C0] font-mono text-[11px]">
              {events.slice(0, 7).map((evt) => {
                return (
                  <tr
                    key={evt.id}
                    className="hover:bg-[#1D1A19] transition-colors group cursor-default"
                  >
                    <td className="py-2.5 px-4 text-[#756B67] font-mono whitespace-nowrap">
                      {formatTimestamp(evt.timestamp)}
                    </td>

                    <td className="py-2.5 px-3 font-sans font-medium text-[#F3EEEC]">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[160px]">{evt.eventType.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-[#756B67]">{evt.source}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <Badge variant={evt.severity} size="sm">
                        {evt.severity}
                      </Badge>
                    </td>

                    <td className="py-2.5 px-3 text-[#D0C4C0] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{evt.sourceIp}</span>
                        {evt.geoCountry && (
                          <span className="text-[10px] text-[#756B67] font-sans">
                            ({evt.geoCountry})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-[#756B67] font-mono truncate max-w-[170px]" title={evt.endpoint}>
                      <span className="text-[#A79B96] mr-1 font-semibold">{evt.httpMethod}</span>
                      {evt.endpoint}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          evt.responseStatus === 200
                            ? 'bg-[#26502B]/30 text-[#86EFAC] border border-[#26502B]'
                            : evt.responseStatus === 401 || evt.responseStatus === 403
                            ? 'bg-[#78350F]/30 text-[#FDE047] border border-[#D97706]/40'
                            : 'bg-[#5C1811]/30 text-[#FCA5A5] border border-[#A20903]/40'
                        }`}
                      >
                        {evt.responseStatus}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono text-[#D0C4C0]">
                      {evt.recordCount > 0 ? evt.recordCount.toLocaleString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
