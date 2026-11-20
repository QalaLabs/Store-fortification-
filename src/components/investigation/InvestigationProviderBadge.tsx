import React from 'react';
import { InvestigationProviderStatus } from '@/types/investigation';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';

interface InvestigationProviderBadgeProps {
  status: InvestigationProviderStatus;
  providerLabel: string;
  providerModel: string;
  disclaimer: string;
}

export function InvestigationProviderBadge({
  status,
  providerLabel,
  providerModel,
  disclaimer,
}: InvestigationProviderBadgeProps) {
  const getBadge = () => {
    switch (status) {
      case 'BEDROCK_VERIFIED':
        return (
          <Badge variant="success" size="sm" pulse>
            BEDROCK VERIFIED
          </Badge>
        );
      case 'CONFIGURED':
        return (
          <Badge variant="info" size="sm">
            CONFIGURED (UNTESTED)
          </Badge>
        );
      case 'MOCK':
      default:
        return (
          <Badge variant="warning" size="sm" pulse>
            MOCK PROVIDER ACTIVE
          </Badge>
        );
    }
  };

  return (
    <div className="bg-[#090e17] rounded-lg border border-amber-500/30 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      <div className="flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-200">{providerLabel}</span>
            {getBadge()}
            <span className="font-mono text-[10px] text-slate-400">({providerModel})</span>
          </div>
          <p className="text-[11px] text-amber-300/90 mt-0.5">{disclaimer}</p>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 font-mono shrink-0 md:text-right">
        <span>Prompt Schema: v1.4 (Deterministic JSON)</span>
      </div>
    </div>
  );
}
