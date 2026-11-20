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
            <FileText className="h-4 w-4 text-cyan-400" />
            <span>AI Incident Synthesis & Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-200 leading-relaxed bg-[#090e17] p-3.5 rounded-lg border border-[#1b2a45]">
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
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <span>Root-Cause Hypothesis</span>
            </CardTitle>
            <Badge variant="warning" size="sm">
              Model Hypothesis
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-300 leading-relaxed bg-amber-950/15 p-3 rounded-lg border border-amber-500/30">
              {investigation.rootCauseHypothesis}
            </p>
          </CardContent>
        </Card>

        {/* Business Impact */}
        <Card>
          <CardHeader>
            <CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span>Business & Regulatory Impact</span>
            </CardTitle>
            <Badge variant="critical" size="sm">
              Impact Scope
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-300 leading-relaxed bg-red-950/15 p-3 rounded-lg border border-red-500/30">
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
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>Recommended Remediation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/30 text-xs text-emerald-200 space-y-2">
              <span className="font-bold block">Analyst Action Priority:</span>
              <p className="leading-relaxed">{investigation.recommendedImmediateAction}</p>
              <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2">
                <Link
                  href="/identity/agents?highlightTx=tx-agent-2026-8804"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 text-xs font-medium transition-colors"
                >
                  <Bot className="h-3.5 w-3.5 text-purple-400" />
                  <span>Inspect R8 Agent Violation</span>
                </Link>

                <Link
                  href="/operations/response"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors"
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
              <HelpCircle className="h-4 w-4 text-slate-400" />
              <span>Unknowns & Verification Gaps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside bg-[#090e17] p-3 rounded-lg border border-[#1b2a45]">
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
