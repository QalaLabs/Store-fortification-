/**
 * CARTGUARD AI - AI Investigation Contracts
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * NOTE:
 * Governs the AI Investigator interface. Accurately reflects AI provider
 * status ('MOCK' | 'CONFIGURED' | 'BEDROCK_VERIFIED') without false claims.
 */

export type InvestigationProviderStatus = 'MOCK' | 'CONFIGURED' | 'BEDROCK_VERIFIED';

export type FindingCategory =
  | 'CONFIRMED_EVIDENCE'
  | 'HYPOTHESIS'
  | 'BUSINESS_IMPACT'
  | 'UNKNOWN_LIMITATION';

export interface InvestigationFinding {
  id: string;
  category: FindingCategory;
  title: string;
  description: string;
  relatedEventIds: string[];
  confidence: number; // 0 - 100
  isVerified: boolean;
}

export interface PresetQA {
  question: string;
  answer: string;
  relatedEventIds: string[];
  evidenceNote?: string;
}

export interface IncidentInvestigation {
  incidentId: string;
  providerStatus: InvestigationProviderStatus;
  providerLabel: string;
  providerModel: string;
  disclaimer: string;
  executiveSummary: string;
  rootCauseHypothesis: string;
  businessImpact: string;
  recommendedImmediateAction: string;
  unknownsAndLimitations: string[];
  findings: InvestigationFinding[];
  presetQA: PresetQA[];
}
