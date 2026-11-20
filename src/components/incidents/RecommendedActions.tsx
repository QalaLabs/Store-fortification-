'use client';

import React, { useState } from 'react';
import { Incident } from '@/types/incidents';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Zap, CheckCircle2, Clock, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface RecommendedActionsProps {
  incident: Incident;
}

export function RecommendedActions({ incident }: RecommendedActionsProps) {
  const [actionState, setActionState] = useState<'pending' | 'approved' | 'rejected'>(
    incident.recommendedAction.status === 'executed'
      ? 'approved'
      : incident.recommendedAction.status === 'cancelled'
      ? 'rejected'
      : 'pending'
  );
  const [simulationLog, setSimulationLog] = useState<string | null>(null);

  const handleSimulateApproval = () => {
    setActionState('approved');
    setSimulationLog(
      `Simulated Containment Executed: Action "${incident.recommendedAction.label}" approved by analyst. Audit event logged to response journal.`
    );
  };

  const handleSimulateRejection = () => {
    setActionState('rejected');
    setSimulationLog(
      `Simulated Action Dismissed: Action "${incident.recommendedAction.label}" rejected by analyst.`
    );
  };

  const isPending = actionState === 'pending';
  const isApproved = actionState === 'approved';
  const isRejected = actionState === 'rejected';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>
            <Zap className="h-4 w-4 text-[#D97706]" />
            <span>Recommended Response &amp; Containment Workflow</span>
          </CardTitle>

          <span className="text-[10px] uppercase font-mono text-[#756B67] bg-[#100E0D] px-2 py-0.5 rounded border border-[#302A28]">
            Human-in-the-Loop Guard
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Simulation Feedback Alert */}
        {simulationLog && (
          <div className="p-3 rounded-lg bg-[#141211] border border-[#26502B] text-xs text-[#86EFAC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#4ADE80] shrink-0" />
              <span>{simulationLog}</span>
            </div>
            <button
              onClick={() => setSimulationLog(null)}
              className="p-1 hover:bg-[#1D1A19] rounded text-[#756B67] hover:text-[#F3EEEC]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Action Card */}
        <div className="p-4 rounded-lg bg-[#100E0D] border border-[#302A28] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#F3EEEC]">
                  {incident.recommendedAction.actionType}
                </span>
                <Badge
                  variant={isApproved ? 'success' : isRejected ? 'neutral' : 'warning'}
                  size="sm"
                  pulse={isPending}
                >
                  {isApproved
                    ? 'Approved (Simulated)'
                    : isRejected
                    ? 'Rejected'
                    : 'Pending Analyst Approval'}
                </Badge>
              </div>

              <h4 className="text-sm font-semibold text-[#F3EEEC] mt-1">
                {incident.recommendedAction.label}
              </h4>
            </div>

            {/* Approval Buttons */}
            {isPending && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSimulateRejection}
                  className="px-3 py-1.5 rounded bg-[#1D1A19] hover:bg-[#221E1D] text-[#A79B96] hover:text-[#F3EEEC] text-xs font-medium border border-[#302A28] transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleSimulateApproval}
                  className="px-3.5 py-1.5 rounded bg-[#A20903] hover:bg-[#850702] text-[#F3EEEC] text-xs font-bold transition-colors shadow-sm"
                >
                  Approve (Simulated)
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-[#A79B96] leading-relaxed">
            {incident.recommendedAction.description}
          </p>

          <div className="pt-2 border-t border-[#302A28] flex items-center justify-between text-[11px] text-[#756B67]">
            <span>
              Expected Risk Reduction: <strong className="text-[#86EFAC]">{incident.recommendedAction.riskReduction}</strong>
            </span>
            <span className="font-mono text-[#756B67]">
              Requires Approval: {incident.recommendedAction.requiresApproval ? 'YES' : 'NO'}
            </span>
          </div>
        </div>

        {/* Disclaimer on containment */}
        <p className="text-[11px] text-[#756B67] italic">
          Note: In this local demonstration phase, response actions update local simulation state and log to the response audit trail without calling external live AWS/WAF APIs.
        </p>
      </CardContent>
    </Card>
  );
}
