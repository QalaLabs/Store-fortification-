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
            <Network className="h-4 w-4 text-sky-400" />
            <span>Telemetry & Service Integrations</span>
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry adapters and AWS cloud service connectors
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg bg-[#121d31]/50 border border-[#1b2a45] space-y-2 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {item.description}
                </p>
              </div>

              <Badge variant={item.badgeVariant} size="sm" className="shrink-0">
                {item.statusLabel}
              </Badge>
            </div>

            <div className="pt-2 border-t border-[#1b2a45]/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="text-slate-400 italic truncate max-w-[240px]">
                  {item.disclaimer}
                </span>
              </span>
              <span className="text-slate-300">
                {item.latencyMs}ms
              </span>
            </div>
          </div>
        ))}

        <div className="p-2.5 rounded bg-blue-950/20 border border-blue-500/30 text-[11px] text-blue-300 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            <strong>Local-First Architecture:</strong> When AWS Bedrock credentials are provided in .env, provider switches automatically from local deterministic mock to Bedrock runtime.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
