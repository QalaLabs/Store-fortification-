import { Suspense } from 'react';
import { AgentPaymentVerification } from '@/components/agents/AgentPaymentVerification';

export default function IdentityAgentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading Agent Verification...</div>}>
      <AgentPaymentVerification />
    </Suspense>
  );
}
