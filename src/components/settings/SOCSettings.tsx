'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Settings, Shield, Sliders, Database, Save, CheckCircle2 } from 'lucide-react';

export function SOCSettings() {
  const [replaySpeed, setReplaySpeed] = useState('1x');
  const [autoContainmentEnabled, setAutoContainmentEnabled] = useState(false);
  const [retentionDays, setRetentionDays] = useState('90');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1b2a45]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
              <Settings className="h-6 w-6 text-slate-400" />
              <span>SOC Operations &amp; Simulation Settings</span>
            </h2>
            <Badge variant="neutral" size="sm">
              CONFIGURATION
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure synthetic scenario replay rates, human-in-the-loop containment policies, and audit retention parameters.
          </p>
        </div>

        {savedNotice && (
          <div className="bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Settings saved successfully (Local State)</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Scenario Replay Options */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Sliders className="h-4 w-4 text-blue-400" />
              <span>Scenario Replay &amp; Telemetry Feed Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Synthetic Replay Playback Speed
                </label>
                <select
                  value={replaySpeed}
                  onChange={(e) => setReplaySpeed(e.target.value)}
                  className="w-full bg-[#090e17] border border-[#1b2a45] rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="1x">1x Real-time (Normal Demo Pace)</option>
                  <option value="2x">2x Accelerated</option>
                  <option value="5x">5x Fast Burst</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Adjusts the ingestion delay between synthetic credential stuffing, session hijack, and order exfiltration events.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  AI Reasoning Fallback Adapter
                </label>
                <select
                  defaultValue="mock"
                  disabled
                  className="w-full bg-[#090e17] border border-[#1b2a45] rounded-md px-3 py-2 text-slate-400 cursor-not-allowed opacity-80"
                >
                  <option value="mock">Local Deterministic Adapter (Bedrock Pending)</option>
                </select>
                <p className="text-[11px] text-amber-400/90 mt-1">
                  Locked to Local Deterministic Adapter until AWS IAM credentials are provisioned in .env.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Human-in-the-Loop Safeguards */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Shield className="h-4 w-4 text-amber-400" />
              <span>Containment Guardrails &amp; Human Approval Policy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#090e17] border border-[#1b2a45]">
              <div>
                <span className="font-semibold text-slate-200 block">
                  Mandatory Human-in-the-Loop for P0 Session Terminations
                </span>
                <span className="text-[11px] text-slate-400">
                  When enabled, all session terminations and WAF IP drops require explicit analyst authorization.
                </span>
              </div>
              <input
                type="checkbox"
                checked={!autoContainmentEnabled}
                onChange={() => setAutoContainmentEnabled(!autoContainmentEnabled)}
                className="h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-[#0d1524]"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#090e17] border border-[#1b2a45] space-y-1">
              <span className="font-semibold text-slate-200 block">Audit Log Retention Policy</span>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="number"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  className="w-24 bg-[#0d1524] border border-[#1b2a45] rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
                />
                <span className="text-slate-400 text-xs">Days (Complies with DPDP breach record retention readiness)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
