/**
 * CARTGUARD AI - Agent Payment Verification Contracts (R8 / Who Pays?)
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * NOTE:
 * Accurately models the Agent Payment Authority framework:
 * - Who is acting? (Agent identity, Principal customer)
 * - What authority does the agent have? (Mandate validity, spending limit, merchant scope, expiry)
 * - Who owns the payment method? (Cardholder/account owner vs principal match)
 * - What is the verification outcome?
 */

export type VerificationOutcome =
  | 'VERIFIED'
  | 'EXPIRED_MANDATE'
  | 'LIMIT_EXCEEDED'
  | 'UNAUTHORIZED_MERCHANT'
  | 'OWNERSHIP_MISMATCH'
  | 'INSUFFICIENT_EVIDENCE';

export interface AgentIdentity {
  agentId: string;
  agentName: string;
  agentType: 'AUTONOMOUS_SHOPPER' | 'PROCUREMENT_BOT' | 'INVENTORY_REORDER' | 'CUSTOMER_CONCIERGE';
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  fingerprint: string;
  runtimeEnvironment: string;
}

export interface CustomerPrincipal {
  customerId: string;
  customerName: string;
  customerEmail: string;
  accountTier: 'VIP' | 'ENTERPRISE' | 'STANDARD';
  riskScore: number;
}

export interface PaymentMethodOwner {
  methodId: string;
  cardBrand: 'VISA' | 'MASTERCARD' | 'AMEX' | 'UPI_DIRECT';
  last4: string;
  ownerName: string;
  billingAddressMatch: boolean;
  nameMatchesPrincipal: boolean;
}

export interface AgentMandate {
  mandateId: string;
  principalId: string;
  agentId: string;
  spendingLimitCents: number;
  spentSoFarCents: number;
  currency: string;
  validFrom: string; // ISO 8601
  expiresAt: string; // ISO 8601
  allowedMerchants: string[];
  allowedCategories: string[];
  requiresOtpAboveCents: number;
}

export interface AgentPaymentTransaction {
  id: string;
  timestamp: string; // ISO 8601
  agent: AgentIdentity;
  principal: CustomerPrincipal;
  mandate: AgentMandate;
  paymentMethod: PaymentMethodOwner;
  merchantName: string;
  merchantCategory: string;
  amountCents: number;
  currency: string;
  outcome: VerificationOutcome;
  verificationMessage: string;
  failureReason?: string;
  recommendedReviewAction?: string;
  evidenceTags: string[];
}
