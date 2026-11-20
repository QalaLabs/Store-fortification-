import { PlaceholderPage } from '@/components/ui/PlaceholderPage';
import { FileWarning } from 'lucide-react';

export default function IncidentsPage() {
  return (
    <PlaceholderPage
      title="Security Incidents"
      category="INVESTIGATE"
      plannedPhase="Phase 3 Scheduled"
      description="Correlated multi-signal security incidents with root-cause timelines and evidence graphs."
      icon={FileWarning}
      keyCapabilities={[
        'Full correlated incident triage list',
        'Multi-vector evidence association graph',
        'Direct links into AI Investigation provider',
      ]}
    />
  );
}
