import React from 'react';
import { notFound } from 'next/navigation';
import { syntheticIncidents } from '@/data/fixtures/incidents';
import { syntheticSecurityEvents } from '@/data/fixtures/events';
import { IncidentOverview } from '@/components/incidents/IncidentOverview';
import { ExecutiveSummary } from '@/components/incidents/ExecutiveSummary';
import { IncidentTimeline } from '@/components/incidents/IncidentTimeline';
import { AffectedAssets } from '@/components/incidents/AffectedAssets';
import { IncidentEvidence } from '@/components/incidents/IncidentEvidence';
import { RecommendedActions } from '@/components/incidents/RecommendedActions';

interface IncidentDetailPageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return syntheticIncidents.map((incident) => ({
    id: incident.id,
  }));
}

export default function IncidentDetailPage({ params }: IncidentDetailPageProps) {
  const incident = syntheticIncidents.find((i) => i.id === params.id);

  if (!incident) {
    notFound();
  }

  // Filter linked events
  const linkedEvents = syntheticSecurityEvents.filter((e) =>
    incident.relatedEventIds.includes(e.id)
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Overview */}
      <IncidentOverview incident={incident} />

      {/* 2. Executive Narrative */}
      <ExecutiveSummary incident={incident} />

      {/* 3. Affected Assets */}
      <AffectedAssets incident={incident} linkedEvents={linkedEvents} />

      {/* 4. Correlated Evidence Assessment */}
      <IncidentEvidence incident={incident} allEvents={syntheticSecurityEvents} />

      {/* 5. Chronological Attack Timeline */}
      <IncidentTimeline incident={incident} allEvents={syntheticSecurityEvents} />

      {/* 6. Recommended Response Action */}
      <RecommendedActions incident={incident} />
    </div>
  );
}
