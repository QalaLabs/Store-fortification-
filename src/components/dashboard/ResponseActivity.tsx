import React from 'react';
import { RecentResponseActivity } from '@/types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatTimestamp } from '@/lib/formatters';
import { Zap, CheckCircle2, Clock } from 'lucide-react';

interface ResponseActivityProps {
  activities: RecentResponseActivity[];
}

export function ResponseActivity({ activities }: ResponseActivityProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>
          <Zap className="h-4 w-4 text-amber-400" />
          <span>Recent Response Activity</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {activities.map((act) => {
          const isPending = act.status === 'pending_approval';

          return (
            <div
              key={act.id}
              className="p-3 rounded-lg bg-[#121d31]/50 border border-[#1b2a45] space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  {act.action}
                </span>
                <Badge
                  variant={isPending ? 'warning' : 'success'}
                  size="sm"
                  pulse={isPending}
                >
                  {isPending ? 'APPROVAL REQUIRED' : 'EXECUTED (MOCK)'}
                </Badge>
              </div>

              <p className="text-[11px] text-slate-400">
                {act.details}
              </p>

              <div className="pt-2 border-t border-[#1b2a45]/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>By: {act.actor}</span>
                <span>{formatTimestamp(act.timestamp)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
