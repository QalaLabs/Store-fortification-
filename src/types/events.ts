/**
 * CARTGUARD AI - Security Event Types
 * Team: QALA LABS | E-Commerce Security Operations
 *
 * NOTE FOR INTEGRATION:
 * These types are frozen frontend contracts aligned with QALA LABS Buildathon spec.
 * In the next phase, when backend ingestion routes are ready, align these types
 * with the team lead's frozen backend contracts at src/types/events.ts.
 */

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export type EventSource =
  | 'ecommerce-api'
  | 'auth-service'
  | 'checkout-engine'
  | 'seller-gateway'
  | 'customer-portal'
  | 'aws-cloudtrail'
  | 'aws-guardduty';

export type SecurityEventType =
  | 'failed_login'
  | 'successful_login'
  | 'suspicious_session'
  | 'abnormal_api_volume'
  | 'customer_profile_access'
  | 'bulk_order_access'
  | 'suspicious_payment_attempt'
  | 'seller_integration_access'
  | 'sensitive_data_export';

export type ResourceType =
  | 'customer_account'
  | 'order_database'
  | 'payment_gateway'
  | 'seller_api_key'
  | 'session_token'
  | 'audit_log';

export type DataCategory =
  | 'PII'
  | 'PCI_FINANCIAL'
  | 'AUTHENTICATION'
  | 'ORDER_HISTORY'
  | 'SELLER_CREDENTIALS'
  | 'OPERATIONAL';

export interface SecurityEvent {
  id: string;
  timestamp: string; // ISO 8601
  source: EventSource;
  eventType: SecurityEventType;
  severity: EventSeverity;
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  sourceIp: string;
  geoCountry?: string;
  endpoint: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  responseStatus: number;
  requestCount: number;
  resourceType: ResourceType;
  recordCount: number;
  dataCategory: DataCategory;
  metadata?: Record<string, string | number | boolean | null>;
  description?: string;
}
