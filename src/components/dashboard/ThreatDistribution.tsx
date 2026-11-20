import React from 'react';
import { SeverityDistributionItem } from '@/types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ShieldAlert } from 'lucide-react';

interface ThreatDistributionProps {
  distribution: SeverityDistributionItem[];
}

export function ThreatDistribution({ distribution }: ThreatDistributionProps) {
  const getColor = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-sky-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>
          <ShieldAlert className="h-4 w-4 text-orange-400" />
          <span>Threat Severity Distribution</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {/* Visual segmented bar */}
        <div className="h-3 w-full rounded-full bg-slate-800 flex overflow-hidden">
          {distribution.map((item) => (
            <div
              key={item.severity}
              style={{ width: `${item.percentage}%` }}
              className={`${getColor(item.severity)} transition-all duration-300`}
              title={`${item.label}: ${item.count} (${item.percentage}%)`}
            />
          ))}
        </div>

        {/* Legend & Breakdown */}
        <div className="space-y-2.5">
          {distribution.map((item) => (
            <div
              key={item.severity}
              className="flex items-center justify-between text-xs text-slate-300"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${getColor(item.severity)}`} />
                <span className="capitalize text-slate-200 font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-slate-400">{item.count} events</span>
                <span className="font-semibold text-slate-200">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
