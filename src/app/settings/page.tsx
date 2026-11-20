import { PlaceholderPage } from '@/components/ui/PlaceholderPage';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="SOC Settings & Configuration"
      category="OPERATIONS"
      plannedPhase="Phase 5 Scheduled"
      description="SOC environment settings, demo replay modes, notification webhooks, and analyst permissions."
      icon={Settings}
      keyCapabilities={[
        'Demo replay speed and dataset selector',
        'Analyst role and escalation policy settings',
        'Audit trail retention preferences',
      ]}
    />
  );
}
