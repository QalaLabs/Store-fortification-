'use client';

import React from 'react';
import Link from 'next/link';
import {
  privacyIncidentReferences,
} from '@/data/fixtures/compliance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import {
  Lock,
  Layers,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useGovernance } from '@/lib/api';

export function PrivacyCentre() {
  const { accessPurposes, dataCategories, isLoading, error, mode } = useGovernance();
  const unapprovedDestinations = accessPurposes.filter((m) => !m.isDestinationApproved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#302A28]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#F3EEEC] flex items-center gap-2.5">
              <Lock className="h-6 w-6 text-[#A20903]" />
              <span>Data Privacy &amp; Purpose Limitation Centre</span>
            </h2>
            <Badge variant="neutral" size="sm">
              DPDP ALIGNED
            </Badge>
            <Badge
              variant={mode === 'LIVE' ? 'success' : mode === 'ERROR' ? 'error' : 'neutral'}
              size="sm"
            >
              {mode === 'LIVE' ? 'LIVE CONTROLS' : mode === 'ERROR' ? 'API DISCONNECTED' : 'DEMO MODE'}
            </Badge>
          </div>
          <p className="text-xs text-[#A79B96] mt-1 max-w-2xl">
            Monitors customer personal data access purposes, detects unapproved export destinations, and tracks data fiduciary incident readiness.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-[#5C1811]/30 px-3 py-1.5 rounded-lg border border-[#A20903]/40 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-[#A20903] inline mr-1" />
            <span className="text-[#FCA5A5]">Unapproved Exfiltration Alert:</span>{' '}
            <strong className="text-[#F3EEEC] font-mono">{unapprovedDestinations.length}</strong>
          </div>
          <div className="bg-[#141211] px-3 py-1.5 rounded-lg border border-[#302A28] text-xs">
            <span className="text-[#756B67]">Monitored Categories:</span>{' '}
            <strong className="text-[#F3EEEC] font-mono">{dataCategories.length}</strong>
          </div>
        </div>
      </div>

      {/* Privacy Alert Banner if unapproved destinations exist */}
      {unapprovedDestinations.length > 0 && (
        <div className="p-4 rounded-lg bg-[#5C1811]/20 border border-[#A20903]/40 text-xs text-[#FCA5A5] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldAlert className="h-4 w-4 text-[#A20903]" />
              <span>Critical Privacy Anomaly: Unauthorized Personal Data Exfiltration Detected</span>
            </div>
            <Link
              href="/incidents/INC-2026-0841"
              className="px-2.5 py-1 rounded bg-[#A20903] hover:bg-[#850702] text-[#F3EEEC] font-semibold flex items-center gap-1 transition-colors text-[11px]"
            >
              <span>View Incident INC-2026-0841</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-[11px] text-[#A79B96]">
            Automated purpose inspection detected 4,520 customer &amp; order history records dispatched to external unapproved destination <strong>198.51.100.42 (Synthetic Test IP RFC 5737, Bucharest RO simulation)</strong> under compromised session <code>sess-tok-84729a1b</code> without step-up OTP challenge.
          </p>
        </div>
      )}

      {/* Access-Purpose Mapping & Destination Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>
              <Layers className="h-4 w-4 text-[#A20903]" />
              <span>Access-Purpose Mapping &amp; Destination Verification</span>
            </CardTitle>
            <span className="text-xs text-[#756B67] font-mono">Continuous Telemetry Hook</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#302A28] bg-[#100E0D] text-[11px] font-semibold text-[#756B67] uppercase tracking-wider">
                  <th className="py-3 px-4">Service / Initiator</th>
                  <th className="py-3 px-3">Data Category</th>
                  <th className="py-3 px-3">Permitted Purpose</th>
                  <th className="py-3 px-3">Actual Destination</th>
                  <th className="py-3 px-3">Destination Status</th>
                  <th className="py-3 px-4 text-right">Associated Incident</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#302A28] text-[#D0C4C0]">
                {accessPurposes.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#1D1A19] transition-colors ${
                      !item.isDestinationApproved ? 'bg-[#5C1811]/15' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-[#F3EEEC]">
                      {item.serviceOrRole}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-[#A79B96]">
                      {item.dataCategory}
                    </td>

                    <td className="py-3 px-3 text-[#756B67]">
                      {item.permittedPurpose}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      <span className={item.isDestinationApproved ? 'text-[#D0C4C0]' : 'text-[#FCA5A5] font-bold'}>
                        {item.actualDestination}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge
                        variant={item.isDestinationApproved ? 'success' : 'critical'}
                        size="sm"
                        pulse={!item.isDestinationApproved}
                      >
                        {item.isDestinationApproved ? 'APPROVED DESTINATION' : 'UNAPPROVED DESTINATION'}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {item.associatedIncidentId ? (
                        <Link
                          href={`/incidents/${item.associatedIncidentId}`}
                          className="font-mono text-xs font-bold text-[#FCA5A5] hover:underline inline-flex items-center gap-1"
                        >
                          <span>{item.associatedIncidentId}</span>
                          <ExternalLink className="h-3 w-3 text-[#A20903]" />
                        </Link>
                      ) : (
                        <span className="text-[#756B67] font-mono text-[11px]">Clean</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Incident Readiness Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>
              <ShieldAlert className="h-4 w-4 text-[#A20903]" />
              <span>Data Fiduciary Privacy Incident &amp; Breach Protocol Drafting</span>
            </CardTitle>
            <span className="text-xs text-[#756B67] font-mono">DPDP Readiness Protocol</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {privacyIncidentReferences.map((inc) => (
            <div
              key={inc.id}
              className="p-4 rounded-lg bg-[#100E0D] border border-[#A20903]/40 space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#FCA5A5]">
                      {inc.incidentId}
                    </span>
                    <Badge variant={inc.severity} size="sm" pulse>
                      {inc.severity}
                    </Badge>
                    <span className="font-mono text-[11px] text-[#756B67]">
                      {formatDateTime(inc.reportedTimestamp)}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#F3EEEC] mt-1">
                    {inc.title}
                  </h4>
                </div>

                <Link
                  href={`/incidents/${inc.incidentId}`}
                  className="px-3 py-1.5 rounded bg-[#1D1A19] hover:bg-[#221E1D] text-[#D0C4C0] border border-[#302A28] text-xs font-medium flex items-center gap-1 shrink-0 self-start sm:self-auto transition-colors"
                >
                  <span>Open Incident Dossier</span>
                  <ArrowRight className="h-3 w-3 text-[#A20903]" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#302A28] text-[#756B67] text-[11px]">
                <div>
                  Affected Principal Records: <strong className="text-[#FCA5A5] font-mono">{inc.affectedRecords.toLocaleString()}</strong>
                </div>
                <div>
                  Data Scope: <strong className="text-[#D0C4C0]">{inc.dataCategory}</strong>
                </div>
                <div>
                  Breach Notification Draft: <strong className="text-[#86EFAC]">READY (72h Window)</strong>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
