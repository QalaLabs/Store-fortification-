/**
 * CARTGUARD AI - Synthetic Incident Fixtures
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * Scenarios:
 * 1. INC-2026-0841: Critical Account Takeover + High-Frequency API Abuse
 * 2. INC-2026-0839: High Suspicious Payment Activity & BIN Attack Velocity
 * 3. INC-2026-0834: High Third-Party Seller API Scope Violation & Exposure
 */

import { Incident } from '../../types/incidents';

export const syntheticIncidents: Incident[] = [
  {
    id: 'INC-2026-0841',
    title: 'Account Takeover & Bulk Order History Extraction',
    type: 'ACCOUNT_TAKEOVER_API_ABUSE',
    severity: 'critical',
    status: 'containment_pending',
    createdAt: '2026-11-20T12:16:30.000Z',
    updatedAt: '2026-11-20T12:23:45.000Z',
    affectedIdentities: ['usr-vip-9902 (vip.customer@aurora-fashion.com)'],
    affectedResources: [
      'res:account/usr-vip-9902',
      'res:db/orders/history',
      'res:endpoint/admin/orders/export',
    ],
    relatedEventIds: [
      'evt-2026-1120-001',
      'evt-2026-1120-002',
      'evt-2026-1120-003',
      'evt-2026-1120-004',
      'evt-2026-1120-008',
      'evt-2026-1120-009',
    ],
    riskScore: 96,
    evidenceSummary:
      'Seven failed login attempts succeeded by login from new IP (198.51.100.42, RO). Within 45 seconds, shipping destination and recovery phone were modified, followed by 420 rapid API calls dumping 4,520 customer & order history records.',
    recommendedAction: {
      id: 'act-0841-1',
      actionType: 'REVOKE_SESSION',
      label: 'Revoke Active Session & Invalidate Tokens',
      description: 'Terminates active session token sess-tok-84729a1b, resets password, and requires out-of-band identity re-verification.',
      requiresApproval: true,
      status: 'pending_approval',
      riskReduction: 'Immediate prevention of further PII and order data exfiltration.',
    },
    complianceImpact: {
      dpdpAligned: true,
      pciScope: false,
      details: 'Potential Data Fiduciary obligation under DPDP readiness: requires logging breach telemetry and preparing breach notification readiness draft.',
    },
    aiAnalysisSummary:
      'High confidence (98%) deterministic correlation confirmed. Credential stuffing led to session hijack, rapid parameter manipulation, and structured scraping of transaction databases.',
    timeline: [
      {
        id: 'tl-0841-1',
        timestamp: '2026-11-20T12:14:02Z',
        title: 'Credential Stuffing Detected',
        description: '7 rapid failed login attempts from IP 198.51.100.42.',
        type: 'detection',
        severity: 'medium',
      },
      {
        id: 'tl-0841-2',
        timestamp: '2026-11-20T12:15:18Z',
        title: 'Successful Authentication',
        description: 'Compromised credentials accepted without step-up MFA challenge.',
        type: 'user_action',
        severity: 'low',
      },
      {
        id: 'tl-0841-3',
        timestamp: '2026-11-20T12:16:04Z',
        title: 'Profile Tampering & Geo-Anomaly',
        description: 'Shipping address replaced to overseas depot (RO); notification phone swapped.',
        type: 'detection',
        severity: 'high',
      },
      {
        id: 'tl-0841-4',
        timestamp: '2026-11-20T12:17:33Z',
        title: 'High-Volume Order API Scraping',
        description: 'Burst pagination: 420 requests in 3 minutes harvesting order records.',
        type: 'correlation',
        severity: 'critical',
      },
      {
        id: 'tl-0841-5',
        timestamp: '2026-11-20T12:23:45Z',
        title: 'Automated Containment Requested',
        description: 'CARTGUARD correlation engine created P0 incident and requested human approval for session revocation.',
        type: 'containment',
        actor: 'CARTGUARD-CORRELATOR-ENGINE',
      },
    ],
  },
  {
    id: 'INC-2026-0839',
    title: 'Distributed Carding Attack & Checkout Velocity Spike',
    type: 'SUSPICIOUS_PAYMENT_ACTIVITY',
    severity: 'high',
    status: 'investigating',
    createdAt: '2026-11-20T11:45:10.000Z',
    updatedAt: '2026-11-20T12:21:30.000Z',
    affectedIdentities: ['usr-guest-9941', '14 synthetic guest accounts'],
    affectedResources: ['res:gateway/payment/stripe-sandbox', 'res:checkout/endpoint'],
    relatedEventIds: ['evt-2026-1120-007'],
    riskScore: 84,
    evidenceSummary:
      'High frequency card testing detected across 16 rapid checkout attempts in 180 seconds. Multiple BIN prefixes tested against low-value shopping cart items with rotating synthetic guest accounts.',
    recommendedAction: {
      id: 'act-0839-1',
      actionType: 'RATE_LIMIT_IP',
      label: 'Deploy Dynamic Cloudflare WAF Rate Limit',
      description: 'Throttle client IP subnet 198.51.100.0/24 to 2 requests per minute on checkout endpoints.',
      requiresApproval: true,
      status: 'pending_approval',
      riskReduction: 'Mitigates gateway authorization fees and card testing fraud penalties.',
    },
    complianceImpact: {
      dpdpAligned: false,
      pciScope: true,
      details: 'Card testing velocity alert. Requires PCI DSS Req 6.4 (WAF/payment page tamper protection) logging.',
    },
    aiAnalysisSummary:
      'Automated script testing stolen credit card combinations via headless browser session. Recommends CAPTCHA step-up on checkout and rate-limiting IP subnet.',
    timeline: [
      {
        id: 'tl-0839-1',
        timestamp: '2026-11-20T11:45:10Z',
        title: 'Initial BIN Probe Detected',
        description: 'First card decline on test transaction $1.99.',
        type: 'detection',
        severity: 'medium',
      },
      {
        id: 'tl-0839-2',
        timestamp: '2026-11-20T12:21:12Z',
        title: 'Carding Velocity Threshold Exceeded',
        description: '16 attempts in 3 minutes across 6 distinct BIN ranges.',
        type: 'correlation',
        severity: 'high',
      },
    ],
  },
  {
    id: 'INC-2026-0834',
    title: 'Third-Party Seller Partner Token Scope Abuse',
    type: 'SELLER_API_EXPOSURE',
    severity: 'high',
    status: 'open',
    createdAt: '2026-11-20T10:12:00.000Z',
    updatedAt: '2026-11-20T12:19:50.000Z',
    affectedIdentities: ['seller-app-vertex-global', 'PARTNER-991'],
    affectedResources: ['res:api/partner/catalog/pricing', 'res:token/api-key-seller-88390'],
    relatedEventIds: ['evt-2026-1120-006'],
    riskScore: 79,
    evidenceSummary:
      'External merchant partner integration token utilized to query and modify catalog pricing outside its authorized tenant namespace, generating 88 consecutive 403 authorization rejections.',
    recommendedAction: {
      id: 'act-0834-1',
      actionType: 'FREEZE_API_KEY',
      label: 'Isolate Seller API Token',
      description: 'Quarantine API key api-key-seller-88390 and notify merchant security contact.',
      requiresApproval: false,
      status: 'executed',
      riskReduction: 'Eliminates cross-tenant pricing contamination risk.',
    },
    complianceImpact: {
      dpdpAligned: false,
      pciScope: false,
      details: 'Third-party integration risk under enterprise vendor security governance.',
    },
    aiAnalysisSummary:
      'Misconfigured seller synchronization worker or compromised partner credential attempting cross-tenant inventory operations.',
    timeline: [
      {
        id: 'tl-0834-1',
        timestamp: '2026-11-20T10:12:00Z',
        title: 'Scope Policy Violation',
        description: 'Repeated 403 Forbidden responses on pricing mutation endpoint.',
        type: 'detection',
        severity: 'high',
      },
      {
        id: 'tl-0834-2',
        timestamp: '2026-11-20T12:19:45Z',
        title: 'Token Auto-Quarantine Executed',
        description: 'Partner API key frozen automatically by policy engine.',
        type: 'containment',
        actor: 'CARTGUARD-POLICY-GUARD',
      },
    ],
  },
];
