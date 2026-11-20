import { PlaceholderPage } from '@/components/ui/PlaceholderPage';
import { Sparkles } from 'lucide-react';

export default function InvestigatePage() {
  return (
    <PlaceholderPage
      title="AI Investigation"
      category="INVESTIGATE"
      plannedPhase="Phase 3 Scheduled (AI Specialist Lead)"
      description="Amazon Bedrock / Mock Provider security reasoning engine producing explainable evidence hypotheses."
      icon={Sparkles}
      keyCapabilities={[
        'Truthful Bedrock vs local mock provider status banner',
        'Structured security investigation synthesis',
        'Evidence citation and hypothesis vs fact separation',
        'One-click containment recommendations',
      ]}
    />
  );
}
