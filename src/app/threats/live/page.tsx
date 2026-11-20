import { LiveThreatFeed } from '@/components/threats/LiveThreatFeed';
import { syntheticSecurityEvents } from '@/data/fixtures/events';

export default function LiveThreatFeedPage() {
  return <LiveThreatFeed initialEvents={syntheticSecurityEvents} />;
}
