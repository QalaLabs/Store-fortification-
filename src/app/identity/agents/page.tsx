import { AgentPaymentVerification } from '@/components/agents/AgentPaymentVerification';
import { syntheticAgentTransactions } from '@/data/fixtures/agentPayments';

export default function IdentityAgentsPage() {
  return <AgentPaymentVerification initialTransactions={syntheticAgentTransactions} />;
}
