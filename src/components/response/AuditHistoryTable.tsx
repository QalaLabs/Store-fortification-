'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ResponseAuditRecord } from '@/types/response';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import { FileText, ShieldCheck, ExternalLink, X, Hash } from 'lucide-react';

interface AuditHistoryTableProps {
  records: ResponseAuditRecord[];
}

export function AuditHistoryTable({ records }: AuditHistoryTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<ResponseAuditRecord | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Response Audit Journal</span>
            </CardTitle>
            <p className="text-[11px] text-[#A79B96] mt-0.5">
              Local simulated audit records with demonstration integrity hashes (simulated ledger)
            </p>
          </div>
          <span className="text-xs text-[#756B67] font-mono">
            {records.length} Audit Entries Logged
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#302A28] bg-[#100E0D] text-[11px] font-semibold text-[#756B67] uppercase tracking-wider">
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Incident Ref</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Action Description</th>
                <th className="py-3 px-3">Authorized By</th>
                <th className="py-3 px-3">Execution State</th>
                <th className="py-3 px-4 text-right">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#302A28]/60 text-[#A79B96]">
              {records.map((rec) => (
                <tr
                  key={rec.auditId}
                  className="hover:bg-[#1D1A19]/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRecord(rec)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#A2847B] whitespace-nowrap">
                    {rec.auditId}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[#756B67] whitespace-nowrap">
                    {formatDateTime(rec.timestamp)}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[#F3EEEC] whitespace-nowrap">
                    <Link
                      href={`/incidents/${rec.incidentId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#A2847B] hover:text-[#F3EEEC] underline transition-colors"
                    >
                      {rec.incidentId}
                    </Link>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <Badge variant={rec.category === 'BLOCK' ? 'critical' : 'warning'} size="sm">
                      {rec.category}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-3 max-w-[240px]">
                    <span className="font-semibold text-[#F3EEEC] line-clamp-1">{rec.actionTitle}</span>
                    <span className="text-[11px] text-[#756B67] line-clamp-1">{rec.details}</span>
                  </td>

                  <td className="py-3.5 px-3 text-[#A79B96] whitespace-nowrap">
                    {rec.actor}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <Badge
                      variant={rec.actionState === 'SIMULATED_SUCCESS' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {rec.actionState}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-[10px] text-[#756B67] whitespace-nowrap">
                    <span className="bg-[#070505] px-2 py-0.5 rounded border border-[#302A28]">
                      {rec.immutableHash.slice(0, 16)}...
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for inspectable audit record */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141211] border border-[#302A28] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#302A28] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#A2847B]">
                    {selectedRecord.auditId}
                  </span>
                  <Badge variant="success" size="sm">
                    {selectedRecord.actionState}
                  </Badge>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 rounded text-[#756B67] hover:text-[#F3EEEC] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#F3EEEC]">{selectedRecord.actionTitle}</h4>
                <p className="text-[#A79B96] bg-[#070505] p-3 rounded-lg border border-[#302A28] leading-relaxed">
                  {selectedRecord.details}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[#756B67] pt-1">
                  <div>Incident: <strong className="text-[#F3EEEC] font-mono">{selectedRecord.incidentId}</strong></div>
                  <div>Actor: <strong className="text-[#F3EEEC]">{selectedRecord.actor}</strong></div>
                  <div>Action Type: <strong className="text-[#F3EEEC]">{selectedRecord.category}</strong></div>
                  <div>Timestamp: <strong className="text-[#F3EEEC] font-mono">{formatDateTime(selectedRecord.timestamp)}</strong></div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-semibold text-[#756B67] block mb-1">
                    Integrity Hash (Local Simulated SHA-256):
                  </span>
                  <div className="font-mono text-[10px] bg-[#070505] p-2.5 rounded-lg border border-[#302A28] text-cyan-400 break-all">
                    {selectedRecord.immutableHash}
                  </div>
                  <span className="text-[10px] text-[#756B67] italic block mt-1">
                    *Demonstration cryptographic hash generated in local environment.
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-1.5 bg-[#1D1A19] hover:bg-[#302A28] text-[#F3EEEC] text-xs font-medium rounded-lg border border-[#302A28] transition-colors"
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
