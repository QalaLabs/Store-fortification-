import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Construction, LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  category: string;
  description: string;
  icon: LucideIcon;
  plannedPhase: string;
  keyCapabilities: string[];
}

export function PlaceholderPage({
  title,
  category,
  description,
  icon: Icon,
  plannedPhase,
  keyCapabilities,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#302A28]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#F3EEEC]">{title}</h2>
            <Badge variant="neutral" size="sm">
              {category}
            </Badge>
            <Badge variant="info" size="sm">
              {plannedPhase}
            </Badge>
          </div>
          <p className="text-xs text-[#A79B96] mt-1 max-w-2xl">{description}</p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#A2847B] hover:text-[#F3EEEC] bg-[#141211] px-3 py-1.5 rounded-lg border border-[#302A28] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Overview</span>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Icon className="h-5 w-5 text-[#A20903]" />
            <span>Module Foundation Staged</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-[#A79B96] leading-relaxed">
            This module route is registered in the CARTGUARD AI application shell. Its typed fixtures and presentation contracts are ready to connect to backend engine routes in subsequent phases.
          </p>

          <div className="bg-[#070505] p-4 rounded-lg border border-[#302A28] space-y-2">
            <h4 className="text-xs font-semibold text-[#F3EEEC] uppercase tracking-wider">
              Target Capabilities in Architecture Plan:
            </h4>
            <ul className="text-xs text-[#756B67] space-y-1.5 list-disc list-inside">
              {keyCapabilities.map((cap, i) => (
                <li key={i}>{cap}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
