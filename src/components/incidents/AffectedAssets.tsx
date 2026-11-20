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
          <Database className="h-4 w-4 text-[#A20903]" />
          <span>Affected E-Commerce Assets &amp; Data Categories</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Accounts & Identities */}
        <div className="p-3.5 rounded-lg bg-[#100E0D] border border-[#302A28] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D0C4C0]">
            <Users className="h-3.5 w-3.5 text-[#A2847B]" />
            <span>Target Identities ({incident.affectedIdentities.length})</span>
          </div>
          <div className="space-y-1.5">
            {incident.affectedIdentities.map((id, i) => (
              <div
                key={i}
                className="font-mono text-xs bg-[#141211] px-2.5 py-1.5 rounded border border-[#302A28] text-[#F3EEEC]"
              >
                {id}
              </div>
            ))}
          </div>
        </div>

        {/* Sessions & Access Tokens */}
        <div className="p-3.5 rounded-lg bg-[#100E0D] border border-[#302A28] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D0C4C0]">
            <Key className="h-3.5 w-3.5 text-[#D97706]" />
            <span>Compromised Sessions &amp; Tokens</span>
          </div>
          <div className="space-y-1.5">
            {uniqueSessions.length > 0 ? (
              uniqueSessions.map((sess, i) => (
                <div
                  key={i}
                  className="font-mono text-xs bg-[#141211] px-2.5 py-1.5 rounded border border-[#D97706]/40 text-[#FDE047] flex items-center justify-between"
                >
                  <span>{sess}</span>
                  <Badge variant="warning" size="sm">Flagged</Badge>
                </div>
              ))
            ) : (
              <span className="text-xs text-[#756B67] italic">No specific session persisted</span>
            )}
          </div>
        </div>

        {/* Targeted Endpoints */}
        <div className="p-3.5 rounded-lg bg-[#100E0D] border border-[#302A28] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D0C4C0]">
            <Globe className="h-3.5 w-3.5 text-[#A2847B]" />
            <span>Targeted API Endpoints</span>
          </div>
          <div className="space-y-1">
            {uniqueEndpoints.map((ep, i) => (
              <div
                key={i}
                className="font-mono text-[11px] bg-[#141211] px-2 py-1 rounded border border-[#302A28] text-[#A79B96]"
              >
                {ep}
              </div>
            ))}
          </div>
        </div>

        {/* Data Categories & Volume */}
        <div className="p-3.5 rounded-lg bg-[#100E0D] border border-[#302A28] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D0C4C0]">
              <Layers className="h-3.5 w-3.5 text-[#4ADE80]" />
              <span>Data Categories in Scope</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#FCA5A5]">
              {totalRecordCount > 0 ? `${totalRecordCount.toLocaleString()} Records` : 'Audit Logs'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {uniqueDataCategories.map((cat, i) => (
              <span
                key={i}
                className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#1D1A19] text-[#D0C4C0] border border-[#302A28]"
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
