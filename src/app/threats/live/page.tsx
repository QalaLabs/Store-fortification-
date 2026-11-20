import { PlaceholderPage } from '@/components/ui/PlaceholderPage';
import { Radio } from 'lucide-react';

export default function LiveThreatFeedPage() {
  return (
    <PlaceholderPage
      title="Live Threat Feed"
      category="MONITOR"
      plannedPhase="Phase 2 Scheduled"
      description="Real-time streaming telemetry and raw security event ingestion pipeline across e-commerce gateways."
      icon={Radio}
      keyCapabilities={[
        'Streaming event ingestion with WebSocket/SSE fallback',
        'Filtering by event source (auth, api, checkout, partner)',
        'Live severity escalation triggers',
        'Interactive payload inspection',
      ]}
    />
  );
}
