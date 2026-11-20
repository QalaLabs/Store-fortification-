/**
 * Prototype consent tracker.
 * Demo fixture only. isRegisteredConsentManager stays false.
 */

export interface ConsentTrackerEntry {
  id: string;
  userId: string;
  purpose: string;
  /** ISO-8601 instant. */
  grantedAt: string;
  source: "prototype-fixture";
}

export interface ConsentTrackerMeta {
  isRegisteredConsentManager: false;
  prototype: true;
  label: string;
  note: string;
  entries: readonly ConsentTrackerEntry[];
}

/** Matches the S3 demo grant: order fulfillment for usr_shopper_2002. */
export const PROTOTYPE_CONSENT_ENTRIES: readonly ConsentTrackerEntry[] = [
  {
    id: "ctr-proto-001",
    userId: "usr_shopper_2002",
    purpose: "order_fulfillment",
    grantedAt: "2026-11-20T09:20:00.000Z",
    source: "prototype-fixture",
  },
];

export function getConsentTrackerMeta(): ConsentTrackerMeta {
  return {
    isRegisteredConsentManager: false,
    prototype: true,
    label: "Prototype consent tracker",
    note: "Consent-aware controls, not a registered Consent Manager",
    entries: PROTOTYPE_CONSENT_ENTRIES.map((entry) => ({ ...entry })),
  };
}
