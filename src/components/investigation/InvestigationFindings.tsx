'use client';

import React from 'react';
import { InvestigationFinding } from '@/types/investigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Lightbulb, ExternalLink, ArrowRight } from 'lucide-react';

interface InvestigationFindingsProps {
  findings: InvestigationFinding[];
  onSelectEvent: (eventId: string) => void;
}

export function InvestigationFindings({
  findings,
  onSelectEvent,
}: InvestigationFindingsProps) {
  const confirmedFindings = findings.filter((f) => f.category === 'CONFIRMED_EVIDENCE');
  const hypotheses = findings.filter((f) => f.category !== 'CONFIRMED_EVIDENCE');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>
            <ShieldCheck className="h-4 w-4 text-[#A20903]" />
            <span>Structured Findings &amp; Evidence Association</span>
          </CardTitle>
          <span className="text-[11px] text-[#756B67]">
            {findings.length} Structured Evidence Items
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confirmed Evidence Findings */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-[#86EFAC] uppercase tracking-wider block">
            Confirmed Telemetry Evidence ({confirmedFindings.length})
          </span>

          <div className="space-y-2">
            {confirmedFindings.map((finding) => (
              <div
                key={finding.id}
                className="p-3.5 rounded-lg bg-[#100E0D] border border-[#302A28] hover:border-[#4D4440] transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-[#F3EEEC]">
                      {finding.title}
                    </span>
                    <Badge variant="success" size="sm">
                      Confirmed Fact
                    </Badge>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-[#86EFAC] bg-[#26502B]/30 px-2 py-0.5 rounded border border-[#26502B] shrink-0">
                    Confidence: {finding.confidence}%
                  </span>
                </div>

                <p className="text-xs text-[#A79B96] leading-relaxed">
                  {finding.description}
                </p>

                {/* Evidence References Tag Pills */}
                <div className="pt-2 border-t border-[#302A28] flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-[#756B67] uppercase font-semibold">
                    Referenced Events:
                  </span>
                  {finding.relatedEventIds.map((eventId) => (
                    <button
                      key={eventId}
                      onClick={() => onSelectEvent(eventId)}
                      className="font-mono text-[11px] font-bold text-[#D0C4C0] hover:text-[#F3EEEC] bg-[#1D1A19] hover:bg-[#221E1D] px-2 py-0.5 rounded border border-[#302A28] flex items-center gap-1 transition-colors"
                      title="Inspect full event telemetry"
                    >
                      <span>{eventId}</span>
                      <ExternalLink className="h-2.5 w-2.5 text-[#756B67]" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hypotheses */}
        {hypotheses.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-[#302A28]">
            <span className="text-[11px] font-bold text-[#FDE047] uppercase tracking-wider block">
              Investigator Hypotheses &amp; Inferences ({hypotheses.length})
            </span>

            <div className="space-y-2">
              {hypotheses.map((finding) => (
                <div
                  key={finding.id}
                  className="p-3.5 rounded-lg bg-[#100E0D] border border-[#302A28] hover:border-[#4D4440] transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-[#F3EEEC]">
                        {finding.title}
                      </span>
                      <Badge variant="warning" size="sm">
                        Model Hypothesis
                      </Badge>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-[#FDE047] bg-[#78350F]/30 px-2 py-0.5 rounded border border-[#D97706]/40 shrink-0">
                      Confidence: {finding.confidence}%
                    </span>
                  </div>

                  <p className="text-xs text-[#A79B96] leading-relaxed">
                    {finding.description}
                  </p>

                  <div className="pt-2 border-t border-[#302A28] flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-[#756B67] uppercase font-semibold">
                      Supporting Signals:
                    </span>
                    {finding.relatedEventIds.map((eventId) => (
                      <button
                        key={eventId}
                        onClick={() => onSelectEvent(eventId)}
                        className="font-mono text-[11px] font-bold text-[#D0C4C0] hover:text-[#F3EEEC] bg-[#1D1A19] hover:bg-[#221E1D] px-2 py-0.5 rounded border border-[#302A28] flex items-center gap-1 transition-colors"
                      >
                        <span>{eventId}</span>
                        <ExternalLink className="h-2.5 w-2.5 text-[#756B67]" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
