import React from 'react';
import { Incident } from '@/types/incidents';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

interface ExecutiveSummaryProps {
  incident: Incident;
}

export function ExecutiveSummary({ incident }: ExecutiveSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>
            <FileText className="h-4 w-4 text-[#A20903]" />
            <span>Executive Summary</span>
          </CardTitle>

          <span className="text-[10px] font-mono uppercase tracking-wider text-[#756B67] bg-[#100E0D] px-2 py-0.5 rounded border border-[#302A28]">
            Synthetic Replay Data
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Concise Narrative */}
        <p className="text-xs text-[#F3EEEC] leading-relaxed bg-[#100E0D] p-3.5 rounded-lg border border-[#302A28]">
          {incident.evidenceSummary}
        </p>

        {/* AI Analysis Summary if present */}
        {incident.aiAnalysisSummary && (
          <div className="p-3.5 bg-[#1D1A19] rounded-lg border border-[#302A28] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D0C4C0]">
              <Sparkles className="h-3.5 w-3.5 text-[#A2847B]" />
              <span>AI Correlation Analysis (Deterministic Mock Model)</span>
            </div>
            <p className="text-xs text-[#A79B96] leading-relaxed">
              {incident.aiAnalysisSummary}
            </p>
          </div>
        )}

        {/* Compliance Posture Callout */}
        {incident.complianceImpact && (
          <div className="pt-2 border-t border-[#302A28] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#100E0D] border border-[#302A28] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#D0C4C0]">DPDP Readiness Scope:</span>
                <Badge
                  variant={incident.complianceImpact.dpdpAligned ? 'warning' : 'neutral'}
                  size="sm"
                >
                  {incident.complianceImpact.dpdpAligned ? 'Triggered' : 'Not Applicable'}
                </Badge>
              </div>
              <p className="text-[11px] text-[#756B67] mt-1">
                {incident.complianceImpact.dpdpAligned
                  ? 'Breach assessment required: Potential notification obligation under DPDP readiness guidelines.'
                  : 'Customer personal data not directly affected in this incident.'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#100E0D] border border-[#302A28] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#D0C4C0]">PCI DSS Scope:</span>
                <Badge
                  variant={incident.complianceImpact.pciScope ? 'critical' : 'neutral'}
                  size="sm"
                >
                  {incident.complianceImpact.pciScope ? 'In Scope' : 'Out of Scope'}
                </Badge>
              </div>
              <p className="text-[11px] text-[#756B67] mt-1">
                {incident.complianceImpact.pciScope
                  ? 'Cardholder transaction flow affected. Log retention and payment page tamper checks required.'
                  : 'Raw PAN cardholder data was not exposed; transactions tokenized.'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
