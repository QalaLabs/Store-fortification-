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
      <div className="flex items-center justify-between pb-4 border-b border-[#1b2a45]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">{title}</h2>
            <Badge variant="neutral" size="sm">
              {category}
            </Badge>
            <Badge variant="info" size="sm">
              {plannedPhase}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{description}</p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-[#0d1524] px-3 py-1.5 rounded-md border border-[#1b2a45] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Overview</span>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Icon className="h-5 w-5 text-blue-400" />
            <span>Module Foundation Staged</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            This module route is registered in the CARTGUARD AI application shell. Its typed fixtures and presentation contracts are ready to connect to backend engine routes in subsequent phases.
          </p>

          <div className="bg-[#121d31] p-4 rounded-lg border border-[#1b2a45] space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Target Capabilities in Architecture Plan:
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
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
