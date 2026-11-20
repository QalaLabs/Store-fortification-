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
          <CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Immutable Response Audit Journal</span>
          </CardTitle>
          <span className="text-xs text-slate-400 font-mono">
            {records.length} Audit Entries Logged
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1b2a45] bg-[#0a0f1a] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
            <tbody className="divide-y divide-[#1b2a45]/60 text-slate-300">
              {records.map((rec) => (
                <tr
                  key={rec.auditId}
                  className="hover:bg-[#121d31]/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRecord(rec)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                    {rec.auditId}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                    {formatDateTime(rec.timestamp)}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                    <Link
                      href={`/incidents/${rec.incidentId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-400 hover:text-blue-300 underline"
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
                    <span className="font-semibold text-slate-200 line-clamp-1">{rec.actionTitle}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{rec.details}</span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
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

                  <td className="py-3.5 px-4 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    <span className="bg-[#090e17] px-2 py-0.5 rounded border border-[#1b2a45]">
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
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0d1524] border border-[#1b2a45] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1b2a45] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-400">
                    {selectedRecord.auditId}
                  </span>
                  <Badge variant="success" size="sm">
                    {selectedRecord.actionState}
                  </Badge>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-100">{selectedRecord.actionTitle}</h4>
                <p className="text-slate-300 bg-[#090e17] p-3 rounded border border-[#1b2a45]">
                  {selectedRecord.details}
                </p>

                <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
                  <div>Incident: <strong className="text-slate-200 font-mono">{selectedRecord.incidentId}</strong></div>
                  <div>Actor: <strong className="text-slate-200">{selectedRecord.actor}</strong></div>
                  <div>Action Type: <strong className="text-slate-200">{selectedRecord.category}</strong></div>
                  <div>Timestamp: <strong className="text-slate-200 font-mono">{formatDateTime(selectedRecord.timestamp)}</strong></div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Cryptographic Integrity Hash:
                  </span>
                  <div className="font-mono text-[10px] bg-[#05080f] p-2.5 rounded border border-slate-800 text-cyan-300 break-all">
                    {selectedRecord.immutableHash}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
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
