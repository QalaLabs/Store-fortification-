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
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>Structured Findings & Evidence Association</span>
          </CardTitle>
          <span className="text-[11px] text-slate-400">
            {findings.length} Structured Evidence Items
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confirmed Evidence Findings */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
            Confirmed Telemetry Evidence ({confirmedFindings.length})
          </span>

          <div className="space-y-2">
            {confirmedFindings.map((finding) => (
              <div
                key={finding.id}
                className="p-3.5 rounded-lg bg-[#090e17] border border-cyan-500/30 hover:border-cyan-500/60 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-slate-100">
                      {finding.title}
                    </span>
                    <Badge variant="success" size="sm">
                      Confirmed Fact
                    </Badge>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40 shrink-0">
                    Confidence: {finding.confidence}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {finding.description}
                </p>

                {/* Evidence References Tag Pills */}
                <div className="pt-2 border-t border-[#1b2a45]/60 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Referenced Events:
                  </span>
                  {finding.relatedEventIds.map((eventId) => (
                    <button
                      key={eventId}
                      onClick={() => onSelectEvent(eventId)}
                      className="font-mono text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-950/70 px-2 py-0.5 rounded border border-blue-500/40 flex items-center gap-1 transition-colors"
                      title="Inspect full event telemetry"
                    >
                      <span>{eventId}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hypotheses */}
        {hypotheses.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-[#1b2a45]/60">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Investigator Hypotheses & Inferences ({hypotheses.length})
            </span>

            <div className="space-y-2">
              {hypotheses.map((finding) => (
                <div
                  key={finding.id}
                  className="p-3.5 rounded-lg bg-amber-950/15 border border-amber-500/30 hover:border-amber-500/50 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-slate-100">
                        {finding.title}
                      </span>
                      <Badge variant="warning" size="sm">
                        Model Hypothesis
                      </Badge>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40 shrink-0">
                      Confidence: {finding.confidence}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {finding.description}
                  </p>

                  <div className="pt-2 border-t border-amber-500/20 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Supporting Signals:
                    </span>
                    {finding.relatedEventIds.map((eventId) => (
                      <button
                        key={eventId}
                        onClick={() => onSelectEvent(eventId)}
                        className="font-mono text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1 transition-colors"
                      >
                        <span>{eventId}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
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
