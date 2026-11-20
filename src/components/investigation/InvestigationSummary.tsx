import Link from 'next/link';
import { IncidentInvestigation } from '@/types/investigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  FileText,
  Lightbulb,
  TrendingDown,
  Zap,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Bot,
} from 'lucide-react';

interface InvestigationSummaryProps {
  investigation: IncidentInvestigation;
}

export function InvestigationSummary({ investigation }: InvestigationSummaryProps) {
  return (
    <div className="space-y-4">
      {/* 1. Executive Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FileText className="h-4 w-4 text-[#A20903]" />
            <span>AI Incident Synthesis &amp; Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-[#F3EEEC] leading-relaxed bg-[#100E0D] p-3.5 rounded-lg border border-[#302A28]">
            {investigation.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* 2. Grid: Root-Cause Hypothesis & Business Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Root-Cause Hypothesis */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Lightbulb className="h-4 w-4 text-[#D97706]" />
              <span>Root-Cause Hypothesis</span>
            </CardTitle>
            <Badge variant="warning" size="sm">
              Model Hypothesis
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#D0C4C0] leading-relaxed bg-[#100E0D] p-3 rounded-lg border border-[#302A28]">
              {investigation.rootCauseHypothesis}
            </p>
          </CardContent>
        </Card>

        {/* Business Impact */}
        <Card>
          <CardHeader>
            <CardTitle>
              <TrendingDown className="h-4 w-4 text-[#A20903]" />
              <span>Business &amp; Regulatory Impact</span>
            </CardTitle>
            <Badge variant="critical" size="sm">
              Impact Scope
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#D0C4C0] leading-relaxed bg-[#100E0D] p-3 rounded-lg border border-[#302A28]">
              {investigation.businessImpact}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recommended Action & Unknowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Immediate Containment Recommendation */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Zap className="h-4 w-4 text-[#4ADE80]" />
              <span>Recommended Remediation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-[#100E0D] rounded-lg border border-[#302A28] text-xs text-[#D0C4C0] space-y-2">
              <span className="font-bold text-[#F3EEEC] block">Analyst Action Priority:</span>
              <p className="leading-relaxed">{investigation.recommendedImmediateAction}</p>
              <div className="pt-2 border-t border-[#302A28] flex flex-wrap items-center justify-between gap-2">
                <Link
                  href="/identity/agents?highlightTx=tx-agent-2026-8804"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1D1A19] hover:bg-[#221E1D] text-[#D0C4C0] border border-[#302A28] text-xs font-medium transition-colors"
                >
                  <Bot className="h-3.5 w-3.5 text-[#A2847B]" />
                  <span>Inspect R8 Agent Violation</span>
                </Link>

                <Link
                  href="/operations/response"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#A20903] hover:bg-[#850702] text-[#F3EEEC] font-bold text-xs transition-colors"
                >
                  <span>Authorize in Response Centre</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unknowns and Limitations */}
        <Card>
          <CardHeader>
            <CardTitle>
              <HelpCircle className="h-4 w-4 text-[#756B67]" />
              <span>Unknowns &amp; Verification Gaps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-[#A79B96] space-y-2 list-disc list-inside bg-[#100E0D] p-3 rounded-lg border border-[#302A28]">
              {investigation.unknownsAndLimitations.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
