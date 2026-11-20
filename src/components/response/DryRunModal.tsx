'use client';

import React from 'react';
import { ProposedResponseAction } from '@/types/response';
import { Badge } from '@/components/ui/Badge';
import { X, Play, ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface DryRunModalProps {
  action: ProposedResponseAction | null;
  onClose: () => void;
  onApprove: (actionId: string) => void;
  onReject: (actionId: string) => void;
}

export function DryRunModal({
  action,
  onClose,
  onApprove,
  onReject,
}: DryRunModalProps) {
  if (!action) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1524] border border-[#1b2a45] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-[#1b2a45] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400">
                {action.id}
              </span>
              <Badge variant="warning" size="sm">
                DRY RUN SIMULATION
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-1">
              {action.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action description */}
        <p className="text-xs text-slate-300 leading-relaxed bg-[#090e17] p-3 rounded border border-[#1b2a45]">
          {action.description}
        </p>

        {/* Dry Run Simulation Metrics */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Automated Impact &amp; Blast Radius Simulation:
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded bg-[#090e17] border border-[#1b2a45]">
              <span className="text-[10px] text-slate-400 uppercase block">Expected Risk Reduction</span>
              <span className="text-xl font-mono font-bold text-emerald-400 mt-0.5 block">
                -{action.dryRun.expectedRiskReductionPercent}%
              </span>
              <span className="text-[10px] text-slate-500 italic block mt-0.5">
                (Illustrative dry-run estimate)
              </span>
            </div>

            <div className="p-3 rounded bg-[#090e17] border border-[#1b2a45]">
              <span className="text-[10px] text-slate-400 uppercase block">Collateral Disruption</span>
              <span className="text-xl font-mono font-bold text-slate-100 mt-0.5 block">
                {action.dryRun.affectedLegitimateUsersEstimate} Users
              </span>
              <span className="text-[10px] text-slate-500 italic block mt-0.5">
                (Simulated projection)
              </span>
            </div>
          </div>

          <div className="p-3 rounded bg-[#090e17] border border-[#1b2a45] text-xs space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blast Radius Boundary:</span>
            <p className="text-slate-200">{action.dryRun.estimatedBlastRadius}</p>
          </div>

          {action.dryRun.sideEffectsWarning && (
            <div className="p-3 rounded bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Side-Effect Warning:</span>
                <span className="text-[11px] text-slate-300">{action.dryRun.sideEffectsWarning}</span>
              </div>
            </div>
          )}

          <div className="p-3 rounded bg-[#090e17] border border-[#1b2a45] text-xs space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rollback Plan:</span>
            <p className="text-slate-400 text-[11px] font-mono">{action.dryRun.rollbackPlan}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#1b2a45] flex items-center justify-between gap-3">
          <button
            onClick={() => onReject(action.id)}
            className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Reject Proposal
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-transparent hover:bg-slate-800 text-slate-400 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onApprove(action.id)}
              className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow-md"
            >
              Approve (Simulated)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
