import { PlaceholderPage } from '@/components/ui/PlaceholderPage';
import { Users } from 'lucide-react';

export default function IdentityPage() {
  return (
    <PlaceholderPage
      title="Identity & Access Monitoring"
      category="INVESTIGATE"
      plannedPhase="Phase 4 Scheduled"
      description="Customer account velocity, session hygiene, and privileged credential exposure tracking."
      icon={Users}
      keyCapabilities={[
        'Customer credential risk scoring',
        'Geo-velocity and impossible travel alerts',
        'Privileged admin & partner token activity tracking',
      ]}
    />
  );
}
