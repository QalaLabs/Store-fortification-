'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import {
  Radar,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { useDetectionRules } from '@/lib/api';

export function ThreatDetectionRules() {
  const { rules, isLoading, error, mode } = useDetectionRules();

  const activeRulesCount = rules.filter((r) => r.status === 'ACTIVE').length;
  const totalTriggers = rules.reduce((acc, r) => acc + r.triggerCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#302A28]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#F3EEEC] flex items-center gap-2.5">
              <Radar className="h-6 w-6 text-[#A20903]" />
              <span>Threat Detection Rules Engine (R1–R8)</span>
            </h2>
            <Badge variant="neutral" size="sm">
              DETERMINISTIC RULES
            </Badge>
            <Badge
              variant={mode === 'LIVE' ? 'success' : mode === 'ERROR' ? 'error' : 'neutral'}
              size="sm"
            >
              {mode === 'LIVE' ? 'LIVE RULES' : mode === 'ERROR' ? 'API DISCONNECTED' : 'DEMO MODE'}
            </Badge>
          </div>
          <p className="text-xs text-[#A79B96] mt-1 max-w-2xl">
            Deterministic security rules evaluating sliding-window thresholds across authentication, burst API volume, and data exfiltration patterns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-[#141211] px-3 py-1.5 rounded-lg border border-[#302A28] text-xs">
            <span className="text-[#756B67]">Active Rules:</span>{' '}
            <strong className="text-[#F3EEEC] font-mono">{activeRulesCount}</strong>
          </div>
          <div className="bg-[#5C1811]/30 px-3 py-1.5 rounded-lg border border-[#A20903]/40 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-[#A20903] inline mr-1" />
            <span className="text-[#FCA5A5]">Total Rule Fires:</span>{' '}
            <strong className="text-[#F3EEEC] font-mono">{totalTriggers}</strong>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          const isCritical = rule.severity === 'critical';

          return (
            <Card
              key={rule.id}
              className={`flex flex-col justify-between transition-colors ${
                isCritical ? 'border-[#A20903]/40' : 'border-[#302A28]'
              }`}
            >
              <CardHeader>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#D0C4C0]">
                        {rule.code}
                      </span>
                      <Badge variant={rule.severity} size="sm" pulse={isCritical}>
                        {rule.severity}
                      </Badge>
                    </div>

                    <span className="text-[10px] font-mono text-[#86EFAC] bg-[#26502B]/30 px-2 py-0.5 rounded border border-[#26502B]">
                      {rule.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#F3EEEC] mt-1.5">{rule.name}</h3>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-xs text-[#A79B96] leading-relaxed">{rule.description}</p>

                <div className="p-3 rounded bg-[#100E0D] border border-[#302A28] space-y-1.5 text-xs text-[#756B67]">
                  <div>
                    <span className="font-semibold text-[#A79B96] block text-[10px] uppercase">
                      Trigger Logic:
                    </span>
                    <p className="text-[#F3EEEC] font-mono text-[11px] mt-0.5">
                      {rule.conditionDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#302A28] text-[11px]">
                    <div>
                      Sliding Window: <strong className="text-[#D0C4C0] font-mono">{rule.slidingWindowSeconds}s</strong>
                    </div>
                    <div>
                      Threshold: <strong className="text-[#D0C4C0] font-mono">{rule.triggerThreshold}</strong>
                    </div>
                    <div>
                      Fires Logged: <strong className="text-[#FCA5A5] font-mono">{rule.triggerCount}</strong>
                    </div>
                    <div>
                      Last: <span className="text-[#756B67] font-mono">{formatDateTime(rule.lastTriggered)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#302A28] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#756B67]">
                    Category: <strong className="text-[#D0C4C0]">{rule.category}</strong>
                  </span>

                  <Link
                    href="/incidents"
                    className="text-[#D0C4C0] hover:text-[#F3EEEC] text-[11px] font-semibold flex items-center gap-1"
                  >
                    <span>View Correlated Incidents</span>
                    <ArrowRight className="h-3 w-3 text-[#A20903]" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
