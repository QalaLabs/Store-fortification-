import React from 'react';
import { cn } from '@/lib/utils';
import { EventSeverity } from '@/types/events';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: EventSeverity | 'neutral' | 'success' | 'outline' | 'warning' | 'info' | 'error';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  pulse = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<string, string> = {
    critical: 'bg-red-950/70 text-red-300 border-red-500/30',
    error: 'bg-red-950/70 text-red-300 border-red-500/30',
    high: 'bg-orange-950/70 text-orange-300 border-orange-500/30',
    medium: 'bg-amber-950/70 text-amber-300 border-amber-500/30',
    low: 'bg-sky-950/70 text-sky-300 border-sky-500/30',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-500/30',
    info: 'bg-blue-950/70 text-blue-300 border-blue-500/30',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    outline: 'bg-transparent text-slate-400 border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 leading-tight font-medium',
    md: 'text-xs px-2.5 py-1 leading-normal font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border uppercase tracking-wider',
        variantStyles[variant] || variantStyles.neutral,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {pulse && (
        <span
          className={cn(
            'inline-block h-1.5 w-1.5 rounded-full animate-pulse',
            variant === 'critical'
              ? 'bg-red-400'
              : variant === 'high'
              ? 'bg-orange-400'
              : variant === 'medium'
              ? 'bg-amber-400'
              : variant === 'success'
              ? 'bg-emerald-400'
              : 'bg-blue-400'
          )}
        />
      )}
      {children}
    </span>
  );
}
