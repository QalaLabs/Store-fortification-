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
              <Activity className="h-4 w-4 text-[#A20903]" />
              <span>Threat Activity Overview</span>
            </CardTitle>
            <p className="text-xs text-[#A79B96] mt-1">
              Synchronized multi-vector anomaly telemetry across customer, API, and payment endpoints
            </p>
          </div>

          <span className="hidden sm:inline-block text-[11px] text-[#756B67] bg-[#1D1A19] px-2 py-0.5 rounded border border-[#302A28] font-mono">
            Window: Last 2 Hours
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-2">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#A79B96] pb-4 border-b border-[#302A28]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#A20903]" />
            <span className="text-[#A79B96] text-[11px]">API Spikes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#C2410C]" />
            <span className="text-[#A79B96] text-[11px]">Data Access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#D97706]" />
            <span className="text-[#A79B96] text-[11px]">Auth Anomalies</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#A2847B]" />
            <span className="text-[#A79B96] text-[11px]">Payment Probes</span>
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
                  <div className="absolute -top-16 bg-[#141211] border border-[#302A28] text-[#F3EEEC] text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                    <p className="font-semibold text-[#D0C4C0]">{item.time} UTC</p>
                    <p className="text-[#FCA5A5]">API Spikes: {item.apiSpikes}</p>
                    <p className="text-[#FDBA74]">Data Access: {item.dataAccessAnomalies}</p>
                    <p className="text-[#FDE047]">Auth Anomalies: {item.authAnomalies}</p>
                    <p className="text-[#A2847B]">Payment: {item.paymentAnomalies}</p>
                  </div>

                  {/* Stacked Bar */}
                  <div
                    className="w-full max-w-[48px] rounded-t flex flex-col-reverse overflow-hidden transition-all duration-300 bg-[#1D1A19]"
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                  >
                    <div
                      style={{ height: `${apiPct}%` }}
                      className="bg-[#A20903] group-hover:bg-[#C2410C] transition-colors"
                    />
                    <div
                      style={{ height: `${dataPct}%` }}
                      className="bg-[#C2410C] group-hover:bg-[#EA580C] transition-colors"
                    />
                    <div
                      style={{ height: `${authPct}%` }}
                      className="bg-[#D97706] group-hover:bg-[#F59E0B] transition-colors"
                    />
                    <div
                      style={{ height: `${payPct}%` }}
                      className="bg-[#A2847B] group-hover:bg-[#D0C4C0] transition-colors"
                    />
                  </div>

                  {/* Time label */}
                  <span className="text-[10px] font-mono text-[#756B67] group-hover:text-[#F3EEEC] tracking-tight transition-colors">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anomaly Callout */}
        <div className="mt-2 bg-[#1D1A19] rounded p-2.5 border border-[#A20903]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#A20903] animate-pulse" />
            <span className="text-[#D0C4C0] font-medium text-[11px]">
              Critical Anomaly Spike detected at 12:30 (420 API burst + 85 data access events)
            </span>
          </div>
          <span className="text-[#FCA5A5] font-mono text-[11px] font-semibold">RULE: P0-STUFFING-BURST</span>
        </div>
      </CardContent>
    </Card>
  );
}
