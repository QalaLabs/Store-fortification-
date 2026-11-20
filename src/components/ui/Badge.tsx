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
  // CyFocus semantic badge styling: restrained accents, sophisticated dark surfaces
  const variantStyles: Record<string, string> = {
    critical: 'bg-[#5C1811]/40 text-[#FCA5A5] border-[#A20903]/50',
    error: 'bg-[#5C1811]/40 text-[#FCA5A5] border-[#A20903]/50',
    high: 'bg-[#7C2D12]/30 text-[#FDBA74] border-[#EA580C]/40',
    medium: 'bg-[#78350F]/30 text-[#FDE047] border-[#D97706]/40',
    low: 'bg-[#262220] text-[#D0C4C0] border-[#443C39]',
    success: 'bg-[#26502B]/40 text-[#86EFAC] border-[#26502B]',
    warning: 'bg-[#78350F]/30 text-[#FDE047] border-[#D97706]/40',
    info: 'bg-[#382D2A] text-[#D0C4C0] border-[#5A4B46]',
    neutral: 'bg-[#1D1A19] text-[#A79B96] border-[#302A28]',
    outline: 'bg-transparent text-[#A79B96] border-[#302A28]',
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
            variant === 'critical' || variant === 'error'
              ? 'bg-[#A20903]'
              : variant === 'high'
              ? 'bg-[#C2410C]'
              : variant === 'medium' || variant === 'warning'
              ? 'bg-[#D97706]'
              : variant === 'success'
              ? 'bg-[#4ADE80]'
              : 'bg-[#A79B96]'
          )}
        />
      )}
      {children}
    </span>
  );
}
