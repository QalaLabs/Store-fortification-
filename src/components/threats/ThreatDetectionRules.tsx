'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { syntheticDetectionRules } from '@/data/fixtures/detectionRules';
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

export function ThreatDetectionRules() {
  const [rules] = useState(syntheticDetectionRules);

  const activeRulesCount = rules.filter((r) => r.status === 'ACTIVE').length;
  const totalTriggers = rules.reduce((acc, r) => acc + r.triggerCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1b2a45]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
              <Radar className="h-6 w-6 text-blue-400" />
              <span>Threat Detection Rules Engine</span>
            </h2>
            <Badge variant="info" size="sm">
              DETERMINISTIC RULES
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Deterministic security rules evaluating sliding-window thresholds across authentication, burst API volume, and data exfiltration patterns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-[#0d1524] px-3 py-1.5 rounded-lg border border-[#1b2a45] text-xs">
            <span className="text-slate-400">Active Rules:</span>{' '}
            <strong className="text-slate-100 font-mono">{activeRulesCount}</strong>
          </div>
          <div className="bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-500/40 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400 inline mr-1" />
            <span className="text-red-300">Total Rule Fires:</span>{' '}
            <strong className="text-red-200 font-mono">{totalTriggers}</strong>
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
                isCritical ? 'border-red-500/30' : 'border-[#1b2a45]'
              }`}
            >
              <CardHeader>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {rule.code}
                      </span>
                      <Badge variant={rule.severity} size="sm" pulse={isCritical}>
                        {rule.severity}
                      </Badge>
                    </div>

                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                      {rule.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 mt-1.5">{rule.name}</h3>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">{rule.description}</p>

                <div className="p-3 rounded bg-[#090e17] border border-[#1b2a45] space-y-1.5 text-xs text-slate-400">
                  <div>
                    <span className="font-semibold text-slate-300 block text-[10px] uppercase">
                      Trigger Logic:
                    </span>
                    <p className="text-slate-200 font-mono text-[11px] mt-0.5">
                      {rule.conditionDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1b2a45]/60 text-[11px]">
                    <div>
                      Sliding Window: <strong className="text-slate-200 font-mono">{rule.slidingWindowSeconds}s</strong>
                    </div>
                    <div>
                      Threshold: <strong className="text-slate-200 font-mono">{rule.triggerThreshold}</strong>
                    </div>
                    <div>
                      Fires Logged: <strong className="text-red-400 font-mono">{rule.triggerCount}</strong>
                    </div>
                    <div>
                      Last: <span className="text-slate-400 font-mono">{formatDateTime(rule.lastTriggered)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1b2a45]/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Category: <strong className="text-slate-300">{rule.category}</strong>
                  </span>

                  <Link
                    href="/incidents"
                    className="text-blue-400 hover:text-blue-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <span>View Correlated Incidents</span>
                    <ArrowRight className="h-3 w-3" />
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
