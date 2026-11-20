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
        return 'bg-[#A20903]';
      case 'high':
        return 'bg-[#C2410C]';
      case 'medium':
        return 'bg-[#D97706]';
      case 'low':
        return 'bg-[#8A7E79]';
      default:
        return 'bg-[#756B67]';
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>
          <ShieldAlert className="h-4 w-4 text-[#C2410C]" />
          <span>Threat Severity Distribution</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {/* Visual segmented bar */}
        <div className="h-2.5 w-full rounded-full bg-[#1D1A19] flex overflow-hidden">
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
              className="flex items-center justify-between text-xs text-[#A79B96]"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${getColor(item.severity)}`} />
                <span className="capitalize text-[#F3EEEC] font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-[#756B67]">{item.count} events</span>
                <span className="font-semibold text-[#D0C4C0]">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
