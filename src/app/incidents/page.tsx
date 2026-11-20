import { IncidentList } from '@/components/incidents/IncidentList';
import { syntheticIncidents } from '@/data/fixtures/incidents';

export default function IncidentsPage() {
  return <IncidentList initialIncidents={syntheticIncidents} />;
}
