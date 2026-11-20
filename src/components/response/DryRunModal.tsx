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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#141211] border border-[#302A28] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-[#302A28] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#A2847B]">
                {action.id}
              </span>
              <Badge variant="warning" size="sm">
                DRY RUN SIMULATION
              </Badge>
            </div>
            <h3 className="text-base font-bold text-[#F3EEEC] mt-1">
              {action.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#756B67] hover:text-[#F3EEEC] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action description */}
        <p className="text-xs text-[#A79B96] leading-relaxed bg-[#070505] p-3 rounded-lg border border-[#302A28]">
          {action.description}
        </p>

        {/* Dry Run Simulation Metrics */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-[#756B67] uppercase tracking-wider block">
            Automated Impact &amp; Blast Radius Simulation:
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#070505] border border-[#302A28]">
              <span className="text-[10px] text-[#756B67] uppercase block">Expected Risk Reduction</span>
              <span className="text-xl font-mono font-bold text-emerald-400 mt-0.5 block">
                -{action.dryRun.expectedRiskReductionPercent}%
              </span>
              <span className="text-[10px] text-[#756B67] italic block mt-0.5">
                (Illustrative dry-run estimate)
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#070505] border border-[#302A28]">
              <span className="text-[10px] text-[#756B67] uppercase block">Collateral Disruption</span>
              <span className="text-xl font-mono font-bold text-[#F3EEEC] mt-0.5 block">
                {action.dryRun.affectedLegitimateUsersEstimate} Users
              </span>
              <span className="text-[10px] text-[#756B67] italic block mt-0.5">
                (Simulated projection)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#070505] border border-[#302A28] text-xs space-y-1">
            <span className="text-[10px] text-[#756B67] uppercase font-semibold block">Blast Radius Boundary:</span>
            <p className="text-[#F3EEEC]">{action.dryRun.estimatedBlastRadius}</p>
          </div>

          {action.dryRun.sideEffectsWarning && (
            <div className="p-3 rounded-lg bg-[#5C1811]/20 border border-[#A20903]/40 text-xs text-[#F3EEEC] flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-[#A20903] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-[#A2847B]">Side-Effect Warning:</span>
                <span className="text-[11px] text-[#A79B96]">{action.dryRun.sideEffectsWarning}</span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-[#070505] border border-[#302A28] text-xs space-y-1">
            <span className="text-[10px] text-[#756B67] uppercase font-semibold block">Rollback Plan:</span>
            <p className="text-[#A79B96] text-[11px] font-mono">{action.dryRun.rollbackPlan}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#302A28] flex items-center justify-between gap-3">
          <button
            onClick={() => onReject(action.id)}
            className="px-3.5 py-1.5 rounded-lg bg-[#1D1A19] hover:bg-[#302A28] text-[#A79B96] hover:text-[#F3EEEC] text-xs font-medium border border-[#302A28] transition-colors"
          >
            Reject Proposal
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-transparent hover:bg-[#1D1A19] text-[#756B67] hover:text-[#A79B96] text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onApprove(action.id)}
              className="px-4 py-1.5 rounded-lg bg-[#A20903] hover:bg-[#800702] text-white font-bold text-xs transition-colors shadow-md"
            >
              Approve (Simulated)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
