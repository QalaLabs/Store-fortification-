import React from 'react';
import { Integration } from '@/types/integrations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Network, Info, ShieldCheck } from 'lucide-react';

interface IntegrationStatusProps {
  integrations: Integration[];
}

export function IntegrationStatus({ integrations }: IntegrationStatusProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div>
          <CardTitle>
            <Network className="h-4 w-4 text-[#A2847B]" />
            <span>Telemetry &amp; Service Integrations</span>
          </CardTitle>
          <p className="text-xs text-[#A79B96] mt-1">
            Real-time telemetry adapters and AWS cloud service connectors
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg bg-[#141211] border border-[#302A28] space-y-2 hover:border-[#4D4440] transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-semibold text-[#F3EEEC]">
                  {item.name}
                </h4>
                <p className="text-[11px] text-[#A79B96] mt-0.5">
                  {item.description}
                </p>
              </div>

              <Badge variant={item.badgeVariant} size="sm" className="shrink-0">
                {item.statusLabel}
              </Badge>
            </div>

            <div className="pt-2 border-t border-[#302A28] flex items-center justify-between text-[10px] text-[#756B67] font-mono">
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3 text-[#756B67] shrink-0" />
                <span className="text-[#A79B96] italic truncate max-w-[240px]">
                  {item.disclaimer}
                </span>
              </span>
              <span className="text-[#D0C4C0]">
                {item.latencyMs}ms
              </span>
            </div>
          </div>
        ))}

        <div className="p-2.5 rounded bg-[#1D1A19] border border-[#302A28] text-[11px] text-[#D0C4C0] flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-[#4ADE80] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#F3EEEC]">Local-First Architecture:</strong> When AWS Bedrock credentials are provided in .env, provider switches automatically from local deterministic mock to Bedrock runtime.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
