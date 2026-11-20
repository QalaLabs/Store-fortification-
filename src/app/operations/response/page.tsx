import { ResponseCentre } from '@/components/response/ResponseCentre';
import {
  syntheticProposedResponses,
  syntheticAuditRecords,
} from '@/data/fixtures/responses';

export default function ResponsePage() {
  return (
    <ResponseCentre
      initialProposals={syntheticProposedResponses}
      initialAuditRecords={syntheticAuditRecords}
    />
  );
}
