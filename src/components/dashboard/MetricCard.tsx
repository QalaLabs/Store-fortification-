import React, { useEffect, useRef, useState } from 'react';
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

/** rAF count-up (~600ms); skipped under prefers-reduced-motion. */
function useCountUp(value: string | number): string | number {
  const target = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
  const numeric = Number.isFinite(target) && String(value).trim() !== '';
  const withCommas = typeof value === 'string' && value.includes(',');
  const [shown, setShown] = useState<number>(numeric ? target : 0);
  const shownRef = useRef(shown);
  useEffect(() => {
    if (!numeric) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || shownRef.current === target) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    const from = shownRef.current;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 600);
      const v = Math.round(from + (target - from) * p);
      shownRef.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, numeric]);
  if (!numeric) return value;
  return withCommas ? shown.toLocaleString('en-US') : shown;
}

export function MetricCard({ data }: MetricCardProps) {
  const displayValue = useCountUp(data.value);
  const getIcon = () => {
    switch (data.iconName) {
      case 'shield-alert':
        return <ShieldAlert className="h-4 w-4 text-[#A20903]" />;
      case 'alert-triangle':
        return <AlertTriangle className="h-4 w-4 text-[#A20903]" />;
      case 'activity':
        return <Activity className="h-4 w-4 text-[#C2410C]" />;
      case 'database':
        return <Database className="h-4 w-4 text-[#A2847B]" />;
      case 'user-check':
        return <UserCheck className="h-4 w-4 text-[#D97706]" />;
      default:
        return <Activity className="h-4 w-4 text-[#A79B96]" />;
    }
  };

  const getBorderColor = () => {
    switch (data.severityVariant) {
      case 'critical':
        return 'border-[#A20903]/40 hover:border-[#A20903]/70';
      case 'high':
        return 'border-[#C2410C]/40 hover:border-[#C2410C]/70';
      case 'medium':
        return 'border-[#D97706]/40 hover:border-[#D97706]/70';
      default:
        return 'border-[#302A28] hover:border-[#4D4440]';
    }
  };

  return (
    <div
      className={cn(
        'bg-[#141211] rounded-lg border p-4 transition-all duration-150 flex flex-col justify-between shadow-sm',
        getBorderColor()
      )}
    >
      {/* Top: Icon + Label + Change badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#1D1A19] border border-[#302A28] shrink-0">
            {getIcon()}
          </div>
          <span className="text-[11px] font-semibold text-[#A79B96] uppercase tracking-wider">
            {data.label}
          </span>
        </div>

        <div
          className={cn(
            'inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border',
            data.isPositive
              ? 'bg-[#26502B]/30 text-[#86EFAC] border-[#26502B]'
              : 'bg-[#5C1811]/30 text-[#FCA5A5] border-[#A20903]/40'
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
      <div className="mt-3 mb-1 flex items-baseline gap-1.5">
        <span className="text-2xl lg:text-3xl font-extrabold text-[#F3EEEC] font-mono tracking-tight">
          {displayValue}
        </span>
        {data.unit && (
          <span className="text-xs text-[#756B67] font-medium">{data.unit}</span>
        )}
      </div>

      {/* Contextual description */}
      <p className="text-[11px] text-[#756B67] leading-relaxed truncate" title={data.contextDescription}>
        {data.contextDescription}
      </p>
    </div>
  );
}
