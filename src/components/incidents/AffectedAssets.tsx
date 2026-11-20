import React from 'react';
import { Incident } from '@/types/incidents';
import { SecurityEvent } from '@/types/events';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  Key,
  Globe,
  Database,
  Shield,
  Layers,
} from 'lucide-react';

interface AffectedAssetsProps {
  incident: Incident;
  linkedEvents: SecurityEvent[];
}

export function AffectedAssets({ incident, linkedEvents }: AffectedAssetsProps) {
  // Aggregate unique affected assets from linked events
  const uniqueUsers = Array.from(
    new Set(linkedEvents.map((e) => e.userId).filter(Boolean))
  );
  const uniqueSessions = Array.from(
    new Set(linkedEvents.map((e) => e.sessionId).filter(Boolean))
  );
  const uniqueEndpoints = Array.from(
    new Set(linkedEvents.map((e) => e.endpoint).filter(Boolean))
  );
  const uniqueDataCategories = Array.from(
    new Set(linkedEvents.map((e) => e.dataCategory).filter(Boolean))
  );
  const totalRecordCount = linkedEvents.reduce((acc, e) => acc + (e.recordCount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Database className="h-4 w-4 text-orange-400" />
          <span>Affected E-Commerce Assets & Data Categories</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Accounts & Identities */}
        <div className="p-3.5 rounded-lg bg-[#090e17] border border-[#1b2a45] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            <span>Target Identities ({incident.affectedIdentities.length})</span>
          </div>
          <div className="space-y-1.5">
            {incident.affectedIdentities.map((id, i) => (
              <div
                key={i}
                className="font-mono text-xs bg-[#0d1524] px-2.5 py-1.5 rounded border border-[#1b2a45] text-slate-200"
              >
                {id}
              </div>
            ))}
          </div>
        </div>

        {/* Sessions & Access Tokens */}
        <div className="p-3.5 rounded-lg bg-[#090e17] border border-[#1b2a45] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Key className="h-3.5 w-3.5 text-amber-400" />
            <span>Compromised Sessions & Tokens</span>
          </div>
          <div className="space-y-1.5">
            {uniqueSessions.length > 0 ? (
              uniqueSessions.map((sess, i) => (
                <div
                  key={i}
                  className="font-mono text-xs bg-[#0d1524] px-2.5 py-1.5 rounded border border-amber-500/30 text-amber-300 flex items-center justify-between"
                >
                  <span>{sess}</span>
                  <Badge variant="warning" size="sm">Flagged</Badge>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No specific session persisted</span>
            )}
          </div>
        </div>

        {/* Targeted Endpoints */}
        <div className="p-3.5 rounded-lg bg-[#090e17] border border-[#1b2a45] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Globe className="h-3.5 w-3.5 text-sky-400" />
            <span>Targeted API Endpoints</span>
          </div>
          <div className="space-y-1">
            {uniqueEndpoints.map((ep, i) => (
              <div
                key={i}
                className="font-mono text-[11px] bg-[#0d1524] px-2 py-1 rounded border border-[#1b2a45] text-slate-300"
              >
                {ep}
              </div>
            ))}
          </div>
        </div>

        {/* Data Categories & Volume */}
        <div className="p-3.5 rounded-lg bg-[#090e17] border border-[#1b2a45] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Layers className="h-3.5 w-3.5 text-emerald-400" />
              <span>Data Categories in Scope</span>
            </div>
            <span className="text-xs font-mono font-bold text-red-400">
              {totalRecordCount > 0 ? `${totalRecordCount.toLocaleString()} Records` : 'Audit Logs'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {uniqueDataCategories.map((cat, i) => (
              <span
                key={i}
                className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-500/30"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
