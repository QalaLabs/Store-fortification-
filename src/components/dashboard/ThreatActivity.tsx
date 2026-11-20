import React from 'react';
import { ThreatActivityDataPoint } from '@/types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Activity } from 'lucide-react';

interface ThreatActivityProps {
  data: ThreatActivityDataPoint[];
}

export function ThreatActivity({ data }: ThreatActivityProps) {
  // Max value to scale heights
  const maxVal = Math.max(...data.map((d) => d.apiSpikes + d.authAnomalies + d.dataAccessAnomalies + d.paymentAnomalies), 1);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
              <span>Threat Activity Overview</span>
            </CardTitle>
            <p className="text-xs text-slate-400 mt-1">
              Synchronized multi-vector anomaly telemetry across customer, API, and payment endpoints
            </p>
          </div>

          <span className="hidden sm:inline-block text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
            Window: Last 2 Hours
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-2">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pb-4 border-b border-[#1b2a45]/40">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
            <span className="text-slate-400 text-[11px]">API Spikes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-orange-400" />
            <span className="text-slate-400 text-[11px]">Data Access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
            <span className="text-slate-400 text-[11px]">Auth Anomalies</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-400" />
            <span className="text-slate-400 text-[11px]">Payment Probes</span>
          </div>
        </div>

        {/* Stacked Telemetry Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="h-44 flex items-end gap-2 sm:gap-4 md:gap-6 justify-between px-2">
            {data.map((item, idx) => {
              const total = item.apiSpikes + item.authAnomalies + item.dataAccessAnomalies + item.paymentAnomalies;
              const heightPercent = Math.min(Math.round((total / maxVal) * 100), 100);

              const apiPct = Math.round((item.apiSpikes / (total || 1)) * 100);
              const dataPct = Math.round((item.dataAccessAnomalies / (total || 1)) * 100);
              const authPct = Math.round((item.authAnomalies / (total || 1)) * 100);
              const payPct = Math.max(0, 100 - apiPct - dataPct - authPct);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-16 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                    <p className="font-semibold text-blue-400">{item.time} UTC</p>
                    <p className="text-red-400">API Spikes: {item.apiSpikes}</p>
                    <p className="text-orange-400">Data Access: {item.dataAccessAnomalies}</p>
                    <p className="text-amber-400">Auth Anomalies: {item.authAnomalies}</p>
                    <p className="text-sky-400">Payment: {item.paymentAnomalies}</p>
                  </div>

                  {/* Stacked Bar */}
                  <div
                    className="w-full max-w-[48px] rounded-t flex flex-col-reverse overflow-hidden transition-all duration-300 bg-slate-800/40"
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                  >
                    <div
                      style={{ height: `${apiPct}%` }}
                      className="bg-red-500/80 group-hover:bg-red-400 transition-colors"
                    />
                    <div
                      style={{ height: `${dataPct}%` }}
                      className="bg-orange-500/80 group-hover:bg-orange-400 transition-colors"
                    />
                    <div
                      style={{ height: `${authPct}%` }}
                      className="bg-amber-500/80 group-hover:bg-amber-400 transition-colors"
                    />
                    <div
                      style={{ height: `${payPct}%` }}
                      className="bg-sky-500/80 group-hover:bg-sky-400 transition-colors"
                    />
                  </div>

                  {/* Time label */}
                  <span className="text-[10px] font-mono text-slate-400 tracking-tight">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anomaly Callout */}
        <div className="mt-2 bg-[#121d31]/80 rounded p-2.5 border border-red-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-slate-200 font-medium text-[11px]">
              Critical Anomaly Spike detected at 12:30 (420 API burst + 85 data access events)
            </span>
          </div>
          <span className="text-red-400 font-mono text-[11px] font-semibold">RULE: P0-STUFFING-BURST</span>
        </div>
      </CardContent>
    </Card>
  );
}
