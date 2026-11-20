import { AgentPaymentVerification } from '@/components/agents/AgentPaymentVerification';
import { syntheticAgentTransactions } from '@/data/fixtures/agentPayments';

export default function IdentityPage() {
  return <AgentPaymentVerification initialTransactions={syntheticAgentTransactions} />;
}
