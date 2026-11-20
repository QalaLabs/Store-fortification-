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
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Recommended Response & Containment Workflow</span>
          </CardTitle>

          <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            Human-in-the-Loop Guard
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Simulation Feedback Alert */}
        {simulationLog && (
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{simulationLog}</span>
            </div>
            <button
              onClick={() => setSimulationLog(null)}
              className="p-1 hover:bg-emerald-900/40 rounded text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Action Card */}
        <div className="p-4 rounded-lg bg-[#090e17] border border-[#1b2a45] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-200">
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

              <h4 className="text-sm font-semibold text-slate-100 mt-1">
                {incident.recommendedAction.label}
              </h4>
            </div>

            {/* Approval Buttons */}
            {isPending && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSimulateRejection}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleSimulateApproval}
                  className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-colors shadow-sm"
                >
                  Approve (Simulated)
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {incident.recommendedAction.description}
          </p>

          <div className="pt-2 border-t border-[#1b2a45]/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Expected Risk Reduction: <strong className="text-emerald-400">{incident.recommendedAction.riskReduction}</strong>
            </span>
            <span className="font-mono text-slate-500">
              Requires Approval: {incident.recommendedAction.requiresApproval ? 'YES' : 'NO'}
            </span>
          </div>
        </div>

        {/* Disclaimer on containment */}
        <p className="text-[11px] text-slate-500 italic">
          Note: In this local demonstration phase, response actions update local simulation state and log to the response audit trail without calling external live AWS/WAF APIs.
        </p>
      </CardContent>
    </Card>
  );
}
