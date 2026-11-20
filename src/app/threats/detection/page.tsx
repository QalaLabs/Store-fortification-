import { PlaceholderPage } from '@/components/ui/PlaceholderPage';
import { Radar } from 'lucide-react';

export default function ThreatDetectionPage() {
  return (
    <PlaceholderPage
      title="Threat Detection Rules"
      category="MONITOR"
      plannedPhase="Phase 2 Scheduled"
      description="Configurable deterministic detection engine rules and anomalous threshold managers."
      icon={Radar}
      keyCapabilities={[
        'Deterministic rule configuration (credential stuffing, API burst, pagination sweep)',
        'Sliding time-window threshold tuning',
        'Rule execution telemetry and trigger counts',
      ]}
    />
  );
}
