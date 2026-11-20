/**
 * CARTGUARD AI - Threat Detection Rules Contracts
 * Team: QALA LABS | E-Commerce Security Operations
 */

import { EventSeverity } from './events';
import { IncidentType } from './incidents';

export interface DetectionRule {
  id: string;
  code: string;
  name: string;
  category: 'AUTHENTICATION' | 'API_BURST' | 'DATA_EXFILTRATION' | 'PAYMENT_FRAUD' | 'PARTNER_INTEGRATION';
  severity: EventSeverity;
  description: string;
  conditionDescription: string;
  slidingWindowSeconds: number;
  triggerThreshold: number;
  status: 'ACTIVE' | 'CALIBRATING' | 'DISABLED';
  triggerCount: number;
  lastTriggered: string; // ISO 8601
  correlatedIncidentType: IncidentType;
}
