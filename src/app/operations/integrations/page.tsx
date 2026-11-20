import { PlaceholderPage } from '@/components/ui/PlaceholderPage';
import { Network } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <PlaceholderPage
      title="Telemetry Integrations"
      category="OPERATIONS"
      plannedPhase="Phase 5 Scheduled"
      description="Connectors for Amazon Bedrock, AWS CloudTrail, GuardDuty, and Config with truthful live vs mock status."
      icon={Network}
      keyCapabilities={[
        'Amazon Bedrock adapter configuration',
        'AWS CloudTrail S3 / IAM webhook management',
        'Amazon GuardDuty finding ingestor',
        'AWS Config posture auditor',
      ]}
    />
  );
}
