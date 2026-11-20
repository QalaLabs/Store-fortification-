import React from 'react';
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
            <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/30 text-xs text-emerald-200 space-y-1.5">
              <span className="font-bold block">Analyst Action Priority:</span>
              <p className="leading-relaxed">{investigation.recommendedImmediateAction}</p>
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
