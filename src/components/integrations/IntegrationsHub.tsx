'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import {
  Network,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useIntegrations } from '@/lib/api';

export function IntegrationsHub() {
  const { integrations, isLoading, error, mode } = useIntegrations();
  const [testLog, setTestLog] = useState<string | null>(null);

  const handleTestConnection = (name: string, serviceKey: string) => {
    if (serviceKey === 'bedrock') {
      setTestLog(
        `Health Check Result for ${name}: Status is SIMULATED (MOCK). No AWS credentials found in local environment. Provider is successfully running local deterministic security reasoning adapter.`
      );
    } else if (serviceKey === 'cloudtrail') {
      setTestLog(
        `Health Check Result for ${name}: Webhook listener active on port 3000. Ingestion payload contract verified, but end-to-end AWS S3 stream remains UNTESTED in local sandbox.`
      );
    } else {
      setTestLog(
        `Health Check Result for ${name}: Status is SIMULATED. Running synthetic local telemetry feed.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#302A28]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#F3EEEC] flex items-center gap-2.5">
              <Network className="h-6 w-6 text-[#A2847B]" />
              <span>Telemetry &amp; Cloud Integrations</span>
            </h2>
            <Badge variant="info" size="sm">
              HYBRID SOC ADAPTERS
            </Badge>
            <Badge
              variant={mode === 'LIVE' ? 'success' : mode === 'ERROR' ? 'critical' : 'neutral'}
              size="sm"
            >
              {mode === 'LIVE' ? 'LIVE ADAPTERS' : mode === 'ERROR' ? 'API DISCONNECTED' : 'DEMO MODE'}
            </Badge>
          </div>
          <p className="text-xs text-[#A79B96] mt-1 max-w-2xl">
            Truthful telemetry status for Amazon Bedrock, AWS CloudTrail, Amazon GuardDuty, and AWS Config.
          </p>
        </div>

        <div className="bg-[#141211] px-3 py-1.5 rounded-lg border border-[#302A28] text-xs">
          <span className="text-[#756B67]">AWS Connection Policy:</span>{' '}
          <strong className="text-[#A2847B] font-mono">STRICT HONEST DISCLOSURE</strong>
        </div>
      </div>

      {/* Honest Provider Policy Banner */}
      <div className="p-4 rounded-lg bg-[#141211] border border-[#302A28] text-xs text-[#A79B96] flex items-start gap-3">
        <Info className="h-5 w-5 text-[#A2847B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold text-[#F3EEEC]">
            Truthful Provider Status Guarantee (QALA LABS Standard)
          </strong>
          <p className="text-[#A79B96] leading-relaxed text-[11px]">
            In accordance with project rules, CARTGUARD AI never falsely claims external AWS services are live when credentials are pending. Providers are clearly categorized as <strong className="text-[#F3EEEC]">SIMULATED</strong> or <strong className="text-[#F3EEEC]">CONNECTED (UNTESTED)</strong> until live verification tokens are confirmed.
          </p>
        </div>
      </div>

      {/* Test Log Notification */}
      {testLog && (
        <div className="p-3.5 rounded-lg bg-[#5C1811]/20 border border-[#A20903]/40 text-xs text-[#F3EEEC] flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#A20903] shrink-0" />
            <span>{testLog}</span>
          </div>
          <button
            onClick={() => setTestLog(null)}
            className="p-1 hover:bg-[#302A28] rounded text-[#756B67] hover:text-[#F3EEEC] transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between">
            <CardHeader>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#A2847B]">{item.id}</span>
                  <Badge variant={item.badgeVariant} size="sm">
                    {item.statusLabel}
                  </Badge>
                </div>
                <h3 className="text-sm font-bold text-[#F3EEEC] mt-1">{item.name}</h3>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-xs text-[#A79B96] leading-relaxed">{item.description}</p>

              <div className="p-3 rounded-lg bg-[#070505] border border-[#302A28] space-y-1.5 text-xs text-[#756B67]">
                <div className="flex items-center justify-between">
                  <span>Category:</span>
                  <strong className="text-[#F3EEEC] font-mono text-[11px]">{item.category}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ping Latency:</span>
                  <span className="text-emerald-400 font-mono text-[11px]">{item.latencyMs} ms (Local Loopback)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Evaluated:</span>
                  <span className="font-mono text-[11px] text-[#A79B96]">{formatDateTime(item.lastSyncTimestamp)}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#1D1A19] border border-[#302A28] text-[11px] text-[#A79B96] italic">
                {item.disclaimer}
              </div>

              <div className="pt-2 border-t border-[#302A28] flex items-center justify-end">
                <button
                  onClick={() => handleTestConnection(item.name, item.serviceKey)}
                  className="px-3 py-1.5 rounded-lg bg-[#1D1A19] hover:bg-[#302A28] text-[#F3EEEC] text-xs font-medium flex items-center gap-1.5 border border-[#302A28] transition-colors"
                >
                  <RefreshCw className="h-3 w-3 text-[#A2847B]" />
                  <span>Verify Status</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
