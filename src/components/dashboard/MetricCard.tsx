import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Database,
  UserCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPICardData } from '@/types/dashboard';

interface MetricCardProps {
  data: KPICardData;
}

export function MetricCard({ data }: MetricCardProps) {
  const getIcon = () => {
    switch (data.iconName) {
      case 'shield-alert':
        return <ShieldAlert className="h-5 w-5 text-red-400" />;
      case 'alert-triangle':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'activity':
        return <Activity className="h-5 w-5 text-orange-400" />;
      case 'database':
        return <Database className="h-5 w-5 text-blue-400" />;
      case 'user-check':
        return <UserCheck className="h-5 w-5 text-amber-400" />;
      default:
        return <Activity className="h-5 w-5 text-slate-400" />;
    }
  };

  const getBorderColor = () => {
    switch (data.severityVariant) {
      case 'critical':
        return 'border-red-500/30 hover:border-red-500/50';
      case 'high':
        return 'border-orange-500/30 hover:border-orange-500/50';
      case 'medium':
        return 'border-amber-500/30 hover:border-amber-500/50';
      default:
        return 'border-[#1b2a45] hover:border-slate-700';
    }
  };

  return (
    <div
      className={cn(
        'bg-[#0d1524] rounded-lg border p-4.5 transition-all duration-150 flex flex-col justify-between shadow-sm',
        getBorderColor()
      )}
    >
      {/* Top: Icon + Label + Change badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-[#121d31] border border-[#1b2a45]/80 shrink-0">
            {getIcon()}
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {data.label}
          </span>
        </div>

        <div
          className={cn(
            'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border',
            data.isPositive
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
              : 'bg-red-950/60 text-red-300 border-red-500/30'
          )}
        >
          {data.isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{data.changeText}</span>
        </div>
      </div>

      {/* Metric Value */}
      <div className="mt-3.5 mb-1.5 flex items-baseline gap-1.5">
        <span className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
          {data.value}
        </span>
        {data.unit && (
          <span className="text-xs text-slate-400 font-medium">{data.unit}</span>
        )}
      </div>

      {/* Contextual description */}
      <p className="text-[11px] text-slate-400 leading-relaxed truncate" title={data.contextDescription}>
        {data.contextDescription}
      </p>
    </div>
  );
}
