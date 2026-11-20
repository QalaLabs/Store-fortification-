'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import {
  FileCheck2,
  ShieldCheck,
  AlertCircle,
  Lock,
  Layers,
  ArrowRight,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useGovernance } from '@/lib/api';

export function ComplianceCentre() {
  const { dpdpControls, pciControls, dataCategories, isLoading, error, mode } = useGovernance();
  const controls = dpdpControls;

  const alignedCount = controls.filter((c) => c.readinessStatus === 'READINESS_ALIGNED').length;
  const reviewRequiredCount = controls.filter((c) => c.readinessStatus === 'REVIEW_REQUIRED').length;
  const partialCount = controls.filter((c) => c.readinessStatus === 'PARTIAL_CONTROLS').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#302A28]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#F3EEEC] flex items-center gap-2.5">
              <FileCheck2 className="h-6 w-6 text-[#A20903]" />
              <span>Compliance Centre</span>
            </h2>
            <Badge variant="neutral" size="sm">
              GOVERNANCE
            </Badge>
            <Badge
              variant={mode === 'LIVE' ? 'success' : mode === 'ERROR' ? 'error' : 'neutral'}
              size="sm"
            >
              {mode === 'LIVE' ? 'LIVE CONTROLS' : mode === 'ERROR' ? 'API DISCONNECTED' : 'DEMO MODE'}
            </Badge>
          </div>
          <p className="text-xs text-[#A79B96] mt-1 max-w-2xl">
            Continuous verification of DPDP-aligned readiness and controls, purpose limitation, and PCI DSS cardholder boundary posture.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-[#26502B]/30 px-3 py-1.5 rounded-lg border border-[#26502B] text-xs">
            <span className="text-[#86EFAC]">Readiness Aligned:</span>{' '}
            <strong className="text-[#86EFAC] font-mono">{alignedCount}</strong>
          </div>
          <div className="bg-[#78350F]/30 px-3 py-1.5 rounded-lg border border-[#D97706]/40 text-xs">
            <span className="text-[#FDE047]">Review Required:</span>{' '}
            <strong className="text-[#FDE047] font-mono">{reviewRequiredCount}</strong>
          </div>
          <div className="bg-[#141211] px-3 py-1.5 rounded-lg border border-[#302A28] text-xs">
            <span className="text-[#756B67]">Partial Controls:</span>{' '}
            <strong className="text-[#D0C4C0] font-mono">{partialCount}</strong>
          </div>
        </div>
      </div>

      {/* Mandatory Language Guardrail Callout */}
      <div className="p-4 rounded-lg bg-[#141211] border border-[#302A28] text-xs text-[#D0C4C0] flex items-start gap-3">
        <Info className="h-5 w-5 text-[#A2847B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold text-[#F3EEEC]">
            Governance Scope Specification: DPDP-Aligned Readiness &amp; Controls
          </strong>
          <p className="text-[#A79B96] leading-relaxed text-[11px]">
            In strict compliance with QALA LABS governance standards, CARTGUARD AI provides <em>DPDP-aligned readiness and controls</em>. The platform does not claim full legal certification, nor does the prototype consent tracker represent a registered DPDP Consent Manager. PCI DSS controls are strictly bounded to tokenized payment interfaces.
          </p>
        </div>
      </div>

      {/* Section 1: DPDP Readiness Controls Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>
              <ShieldCheck className="h-4 w-4 text-[#4ADE80]" />
              <span>DPDP-Aligned Readiness &amp; Safeguards Status</span>
            </CardTitle>
            <span className="text-xs text-[#756B67] font-mono">5 Assessed Control Areas</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#302A28] bg-[#100E0D] text-[11px] font-semibold text-[#756B67] uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-3">Control Name</th>
                  <th className="py-3 px-3">Readiness Status</th>
                  <th className="py-3 px-3">Evidence State</th>
                  <th className="py-3 px-3">Telemetry Frequency</th>
                  <th className="py-3 px-4">Analyst Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#302A28] text-[#D0C4C0]">
                {controls.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1D1A19] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#F3EEEC] whitespace-nowrap">
                      {item.sectionCode}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#F3EEEC]">{item.name}</div>
                      <p className="text-[11px] text-[#756B67] max-w-sm mt-0.5">{item.description}</p>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge
                        variant={
                          item.readinessStatus === 'READINESS_ALIGNED'
                            ? 'success'
                            : item.readinessStatus === 'REVIEW_REQUIRED'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                        pulse={item.readinessStatus === 'REVIEW_REQUIRED'}
                      >
                        {item.readinessStatus.replace(/_/g, ' ')}
                      </Badge>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.evidenceAvailable ? (
                        <div className="flex items-center gap-1.5 text-[#86EFAC] font-mono text-[11px]">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#4ADE80]" />
                          <span>{item.evidenceRef}</span>
                        </div>
                      ) : (
                        <span className="text-[#756B67] font-mono text-[11px] italic">In Testing</span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-[#756B67] whitespace-nowrap">
                      {item.auditFrequency}
                    </td>

                    <td className="py-3 px-4 text-[11px] text-[#756B67]">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: PCI DSS Scope & Cardholder Protection Boundaries */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Lock className="h-4 w-4 text-[#D97706]" />
            <span>PCI DSS Scope Boundaries &amp; Cardholder Data Isolation</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pciControls.map((pci, i) => (
              <div
                key={i}
                className="p-3.5 rounded-lg bg-[#100E0D] border border-[#302A28] space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-[#F3EEEC]">{pci.requirement}</span>
                  <Badge
                    variant={pci.scopeStatus === 'OUT_OF_SCOPE' ? 'neutral' : 'info'}
                    size="sm"
                  >
                    {pci.scopeStatus.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p className="text-[11px] text-[#A79B96] leading-relaxed">{pci.description}</p>
                <div className="pt-2 border-t border-[#302A28] flex items-center justify-between text-[10px] text-[#756B67] font-mono">
                  <span>Tamper Shield: {pci.tamperProtectionActive ? 'ACTIVE' : 'INACTIVE'}</span>
                  <span>{formatDateTime(pci.lastVerification)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Personal Data Categories Managed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>
              <Layers className="h-4 w-4 text-[#A20903]" />
              <span>Personal Data Categories &amp; Cryptographic Storage Posture</span>
            </CardTitle>
            <Link
              href="/governance/privacy"
              className="text-xs text-[#D0C4C0] hover:text-[#F3EEEC] font-medium flex items-center gap-1"
            >
              <span>View Privacy Centre</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#A20903]" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {dataCategories.map((cat, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-[#100E0D] border border-[#302A28] space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#F3EEEC]">{cat.category}</span>
                <Badge variant={cat.sensitivity === 'HIGH_PII' ? 'critical' : 'info'} size="sm">
                  {cat.sensitivity}
                </Badge>
              </div>
              <p className="text-[11px] text-[#756B67] font-mono">
                {cat.fields.join(', ')}
              </p>
              <div className="pt-2 border-t border-[#302A28] flex items-center justify-between text-[10px] text-[#756B67] font-mono">
                <span>{cat.encryptionStatus}</span>
                <span>{cat.retentionPeriod.split(' ')[0]} {cat.retentionPeriod.split(' ')[1]}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
