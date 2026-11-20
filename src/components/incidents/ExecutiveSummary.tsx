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
            <FileText className="h-4 w-4 text-blue-400" />
            <span>Executive Summary</span>
          </CardTitle>

          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            Synthetic Replay Data
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Concise Narrative */}
        <p className="text-xs text-slate-200 leading-relaxed bg-[#090e17] p-3.5 rounded-lg border border-[#1b2a45]">
          {incident.evidenceSummary}
        </p>

        {/* AI Analysis Summary if present */}
        {incident.aiAnalysisSummary && (
          <div className="p-3.5 bg-blue-950/20 rounded-lg border border-blue-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>AI Correlation Analysis (Deterministic Mock Model)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {incident.aiAnalysisSummary}
            </p>
          </div>
        )}

        {/* Compliance Posture Callout */}
        {incident.complianceImpact && (
          <div className="pt-2 border-t border-[#1b2a45]/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#090e17] border border-[#1b2a45] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">DPDP Readiness Scope:</span>
                <Badge
                  variant={incident.complianceImpact.dpdpAligned ? 'warning' : 'neutral'}
                  size="sm"
                >
                  {incident.complianceImpact.dpdpAligned ? 'Triggered' : 'Not Applicable'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {incident.complianceImpact.dpdpAligned
                  ? 'Breach assessment required: Potential notification obligation under DPDP readiness guidelines.'
                  : 'Customer personal data not directly affected in this incident.'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#090e17] border border-[#1b2a45] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">PCI DSS Scope:</span>
                <Badge
                  variant={incident.complianceImpact.pciScope ? 'critical' : 'neutral'}
                  size="sm"
                >
                  {incident.complianceImpact.pciScope ? 'In Scope' : 'Out of Scope'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
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
