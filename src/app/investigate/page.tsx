import { InvestigationWorkspace } from '@/components/investigation/InvestigationWorkspace';
import { syntheticIncidents } from '@/data/fixtures/incidents';
import { syntheticSecurityEvents } from '@/data/fixtures/events';
import { syntheticInvestigations } from '@/data/fixtures/investigations';

interface InvestigatePageProps {
  searchParams?: {
    incidentId?: string;
  };
}

export default function InvestigatePage({ searchParams }: InvestigatePageProps) {
  return (
    <InvestigationWorkspace
      incidents={syntheticIncidents}
      allEvents={syntheticSecurityEvents}
      investigations={syntheticInvestigations}
      initialIncidentId={searchParams?.incidentId}
    />
  );
}
