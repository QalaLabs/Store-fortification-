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
        'group relative flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150',
        isActive
          ? 'bg-[#1D1A19] text-[#F3EEEC] font-semibold border-l-2 border-[#A20903] rounded-l-none'
          : 'text-[#A79B96] hover:text-[#F3EEEC] hover:bg-[#141211]',
        isCollapsed && 'justify-center px-2 py-2.5'
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          isActive ? 'text-[#F3EEEC]' : 'text-[#756B67] group-hover:text-[#F3EEEC]'
        )}
      />

      {!isCollapsed && (
        <span className="truncate flex-1 tracking-wide">{label}</span>
      )}

      {!isCollapsed && badge !== undefined && (
        <span
          className={cn(
            'ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded border leading-none',
            badgeVariant === 'critical' && 'bg-[#5C1811]/60 text-[#FCA5A5] border-[#A20903]/60',
            badgeVariant === 'high' && 'bg-[#7C2D12]/50 text-[#FDBA74] border-[#EA580C]/50',
            badgeVariant === 'info' && 'bg-[#382D2A] text-[#D0C4C0] border-[#5A4B46]',
            badgeVariant === 'neutral' && 'bg-[#1D1A19] text-[#A79B96] border-[#302A28]'
          )}
        >
          {badge}
        </span>
      )}

      {/* Floating tooltip when collapsed */}
      {isCollapsed && (
        <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-[#141211] border border-[#302A28] text-[#F3EEEC] text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
          {label}
          {badge !== undefined && (
            <span className="ml-1.5 text-[10px] text-[#A2847B]">({badge})</span>
          )}
        </div>
      )}
    </Link>
  );
}
