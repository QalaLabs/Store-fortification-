'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavigationItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: 'critical' | 'high' | 'info' | 'neutral';
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

export function NavigationItem({
  label,
  href,
  icon: Icon,
  badge,
  badgeVariant = 'neutral',
  isCollapsed = false,
  onNavigate,
}: NavigationItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    (href !== '/' && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={isCollapsed ? label : undefined}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors duration-150',
        isActive
          ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-2 border-blue-500 rounded-l-none'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
        isCollapsed && 'justify-center px-2 py-2.5'
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
        )}
      />

      {!isCollapsed && (
        <span className="truncate flex-1 tracking-wide">{label}</span>
      )}

      {!isCollapsed && badge !== undefined && (
        <span
          className={cn(
            'ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded border leading-none',
            badgeVariant === 'critical' && 'bg-red-950/80 text-red-300 border-red-500/40',
            badgeVariant === 'high' && 'bg-orange-950/80 text-orange-300 border-orange-500/40',
            badgeVariant === 'info' && 'bg-blue-950/80 text-blue-300 border-blue-500/40',
            badgeVariant === 'neutral' && 'bg-slate-800 text-slate-400 border-slate-700'
          )}
        >
          {badge}
        </span>
      )}

      {/* Floating tooltip when collapsed */}
      {isCollapsed && (
        <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
          {label}
          {badge !== undefined && (
            <span className="ml-1.5 text-[10px] text-blue-400">({badge})</span>
          )}
        </div>
      )}
    </Link>
  );
}
