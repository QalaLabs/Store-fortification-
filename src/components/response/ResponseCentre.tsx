'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProposedResponseAction, ResponseAuditRecord } from '@/types/response';
import { DryRunModal } from './DryRunModal';
import { AuditHistoryTable } from './AuditHistoryTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import {
  Zap,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface ResponseCentreProps {
  initialProposals: ProposedResponseAction[];
  initialAuditRecords: ResponseAuditRecord[];
}

export function ResponseCentre({
  initialProposals,
  initialAuditRecords,
}: ResponseCentreProps) {
  const [proposals, setProposals] = useState<ProposedResponseAction[]>(initialProposals);
  const [auditRecords, setAuditRecords] = useState<ResponseAuditRecord[]>(initialAuditRecords);
  const [inspectingAction, setInspectingAction] = useState<ProposedResponseAction | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const pendingCount = proposals.filter((p) => p.stage === 'PENDING_APPROVAL').length;
  const executedCount = proposals.filter((p) => p.stage === 'EXECUTED_SIMULATED').length;

  const handleApprove = (actionId: string) => {
    const action = proposals.find((p) => p.id === actionId);
    if (!action) return;

    // Update proposal state to EXECUTED_SIMULATED
    setProposals((prev) =>
      prev.map((p) =>
        p.id === actionId
          ? {
              ...p,
              stage: 'EXECUTED_SIMULATED',
              approver: 'Aayash (SecOps Analyst)',
              approvalTimestamp: new Date().toISOString(),
              executionOutcome: {
                success: true,
                executedTimestamp: new Date().toISOString(),
                isSimulated: true,
                auditLogId: `aud-${Date.now()}`,
                summary: `Simulated ${p.category} action executed successfully.`,
              },
            }
          : p
      )
    );

    // Append to audit trail
    const newAuditRecord: ResponseAuditRecord = {
      auditId: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionId: action.id,
      incidentId: action.incidentId,
      category: action.category,
      actionTitle: action.title,
      actor: 'Aayash (SecOps Analyst)',
      actionState: 'SIMULATED_SUCCESS',
      details: `Simulated containment action approved. Blast radius: ${action.dryRun.estimatedBlastRadius}. Risk reduction: -${action.dryRun.expectedRiskReductionPercent}%.`,
      immutableHash: `sha256:${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
    };

    setAuditRecords((prev) => [newAuditRecord, ...prev]);
    setInspectingAction(null);
    setFeedbackBanner(
      `Action Approved: "${action.title}" executed in simulated mode and appended to immutable audit journal.`
    );
  };

  const handleReject = (actionId: string) => {
    const action = proposals.find((p) => p.id === actionId);
    if (!action) return;

    setProposals((prev) =>
      prev.map((p) =>
        p.id === actionId
          ? {
              ...p,
              stage: 'REJECTED',
              approver: 'Aayash (SecOps Analyst)',
              rejectionReason: 'Dismissed by analyst during dry-run review.',
            }
          : p
      )
    );

    const newAuditRecord: ResponseAuditRecord = {
      auditId: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionId: action.id,
      incidentId: action.incidentId,
      category: action.category,
      actionTitle: action.title,
      actor: 'Aayash (SecOps Analyst)',
      actionState: 'REJECTED',
      details: 'Analyst reviewed dry-run impact and rejected proposal.',
      immutableHash: `sha256:${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
    };

    setAuditRecords((prev) => [newAuditRecord, ...prev]);
    setInspectingAction(null);
    setFeedbackBanner(`Action Rejected: "${action.title}" proposal dismissed.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1b2a45]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
              <Zap className="h-6 w-6 text-amber-400" />
              <span>Response Centre &amp; Containment Control</span>
            </h2>
            <Badge variant="warning" size="sm" pulse={pendingCount > 0}>
              HUMAN-IN-THE-LOOP
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Controlled remediation workflow: reviews automated blast-radius dry runs, enforces human authorization, and logs simulated executions to the audit trail.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-500/40 text-xs">
            <span className="text-amber-300">Pending Authorization:</span>{' '}
            <strong className="text-amber-200 font-mono">{pendingCount}</strong>
          </div>
          <div className="bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/40 text-xs">
            <span className="text-emerald-300">Simulated Executed:</span>{' '}
            <strong className="text-emerald-200 font-mono">{executedCount}</strong>
          </div>
          <div className="bg-[#0d1524] px-3 py-1.5 rounded-lg border border-[#1b2a45] text-xs">
            <span className="text-slate-400">Total Audit Logs:</span>{' '}
            <strong className="text-slate-200 font-mono">{auditRecords.length}</strong>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackBanner && (
        <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="p-1 hover:bg-emerald-900/40 rounded text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Response Sequence Pipeline Visualizer */}
      <div className="bg-[#0d1524] p-4 rounded-lg border border-[#1b2a45] space-y-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Required Containment Safety Pipeline
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
          <div className="p-2.5 rounded bg-[#090e17] border border-blue-500/30 text-center">
            <span className="text-[10px] text-blue-400 font-bold block">STAGE 1</span>
            <span className="font-semibold text-slate-200">1. PROPOSE</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Correlation Engine</span>
          </div>

          <div className="p-2.5 rounded bg-[#090e17] border border-cyan-500/30 text-center">
            <span className="text-[10px] text-cyan-400 font-bold block">STAGE 2</span>
            <span className="font-semibold text-slate-200">2. DRY RUN</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Blast Radius Check</span>
          </div>

          <div className="p-2.5 rounded bg-[#090e17] border border-amber-500/40 text-center">
            <span className="text-[10px] text-amber-400 font-bold block">STAGE 3</span>
            <span className="font-semibold text-amber-200">3. HUMAN APPROVAL</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">SecOps Authorization</span>
          </div>

          <div className="p-2.5 rounded bg-[#090e17] border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-400 font-bold block">STAGE 4</span>
            <span className="font-semibold text-slate-200">4. SIMULATED EXECUTION</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Mock Safety Shield</span>
          </div>

          <div className="p-2.5 rounded bg-[#090e17] border border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 font-bold block">STAGE 5</span>
            <span className="font-semibold text-slate-200">5. AUDIT LOG</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">SHA-256 Record</span>
          </div>
        </div>
      </div>

      {/* Proposed Actions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Remediation Proposals Awaiting Action</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3.5">
          {proposals.map((action) => {
            const isPending = action.stage === 'PENDING_APPROVAL';
            const isExecuted = action.stage === 'EXECUTED_SIMULATED';
            const isRejected = action.stage === 'REJECTED';

            return (
              <div
                key={action.id}
                className={`p-4 rounded-lg border transition-all text-xs space-y-3 ${
                  isPending
                    ? 'bg-[#090e17] border-amber-500/40 hover:border-amber-500/70'
                    : isExecuted
                    ? 'bg-[#090e17] border-emerald-500/30 opacity-90'
                    : 'bg-[#090e17] border-slate-800 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {action.id}
                    </span>
                    <Badge
                      variant={
                        action.category === 'BLOCK'
                          ? 'critical'
                          : action.category === 'CONTAIN'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {action.category} ACTION
                    </Badge>
                    <Badge
                      variant={isPending ? 'warning' : isExecuted ? 'success' : 'neutral'}
                      size="sm"
                      pulse={isPending}
                    >
                      {action.stage.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>Proposed {formatDateTime(action.proposedTimestamp)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{action.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{action.description}</p>
                </div>

                {/* Dry Run Outcome Snapshot */}
                <div className="p-3 rounded bg-[#0d1524] border border-[#1b2a45] grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    Target: <strong className="font-mono text-slate-200">{action.targetResource}</strong>
                  </div>
                  <div>
                    Expected Risk Reduction: <strong className="text-emerald-400 font-mono">-{action.dryRun.expectedRiskReductionPercent}%</strong>
                  </div>
                  <div>
                    Estimated Blast Radius: <span className="text-slate-300">{action.dryRun.estimatedBlastRadius}</span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 border-t border-[#1b2a45]/60 flex items-center justify-between gap-3">
                  <Link
                    href={`/incidents/${action.incidentId}`}
                    className="text-blue-400 hover:text-blue-300 font-mono text-[11px] flex items-center gap-1"
                  >
                    <span>View Linked Incident: {action.incidentId}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setInspectingAction(action)}
                        className="px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Inspect Dry Run</span>
                      </button>

                      <button
                        onClick={() => handleReject(action.id)}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => handleApprove(action.id)}
                        className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                      >
                        Approve (Simulated)
                      </button>
                    </div>
                  )}

                  {isExecuted && action.executionOutcome && (
                    <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Simulated Execution Logged ({action.executionOutcome.auditLogId})</span>
                    </span>
                  )}

                  {isRejected && (
                    <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5 text-slate-500" />
                      <span>Proposal Rejected by Analyst</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Immutable Audit Log Table */}
      <AuditHistoryTable records={auditRecords} />

      {/* Dry Run Detail Modal */}
      <DryRunModal
        action={inspectingAction}
        onClose={() => setInspectingAction(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
