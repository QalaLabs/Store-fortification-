# CARTGUARD AI — Technical Architecture & Phase 01 Contract Freeze

**Challenge:** AF-2026-01 (Project Sentinel AI)
**Hackathon:** AI FORGE 2026 (SEESEC x AWS Enterprise GenAI Buildathon)
**Industry Track:** E-Commerce and Online Retail
**Team:** QALA LABS (Aayush — Tech Lead & Core Backend; Aashirwad — AI Specialist; Aayash — Frontend Developer)

---

## 1. Project Overview & Architectural Principles

CartGuard AI is an e-commerce security monitoring, threat correlation, and response platform. As the commerce landscape evolves toward autonomous AI shopping agents, stores can no longer treat all automated traffic as malicious or all human traffic as benign.

CartGuard AI addresses this paradigm shift:
- Distinguishes legitimate AI shopping agents from malicious bots and compromised accounts.
- Enforces Agent Payment Mandates ($R8$) tracing every bot transaction to an authenticated human principal.
- Correlates scattered events (auth brute-force, high-rate API reads, unapproved exfiltration) into a single unified incident story.
- Employs an evidence-grounded AI investigator with strictly cited event IDs.
- Mandates human-in-the-loop approvals for all defensive responses.
- Operates in simulated containment mode (tarpitting, honeypot synthesis) with zero customer disruption.

### Architectural Invariants
1. **One Repository, One Language, One Application:** Built entirely in TypeScript on Next.js 15 (App Router).
2. **Zero Infrastructure Dependencies for Local Dev:** Runs entirely offline with in-memory stores and mock AI fallback; zero AWS credentials required.
3. **No Autonomous Destructive Actions:** Every response proposal requires explicit analyst approval; execution is simulated.
4. **Compliance Honesty:** Uses strictly "DPDP-aligned readiness and controls" (core DPDP obligations active May 2027); never claims full certification.
5. **Provider Status Integrity:** Labels are strictly `MOCK`, `CONFIGURED`, or `BEDROCK_VERIFIED`. Never claims `CONNECTED` without a verified test call.

---

## 2. Team Ownership Boundaries

| Contributor | Role | Owned Directories & Scope |
| :--- | :--- | :--- |
| **Aayush** | FDE, Technical Lead & Core Backend | `/lib/types`, `/lib/rules`, `/lib/correlate`, `/app/api`, `/lib/store`, `/lib/validation`, Ingestion, Correlation, Detection (R1–R8), Approvals, Audit |
| **Aashirwad** | AI Specialist | `/lib/ai`, `/lib/scenarios`, `/lib/compliance`, `README.md`, `/docs`, Bedrock Provider, Scenario Replay (S1–S4) |
| **Aayash** | Frontend Developer | `/app` (pages/layouts), `/components`, UI Shell, Threat Feed, AI Panels, Approvals Screen |

*Rule:* No team member modifies another contributor's owned folders without explicit coordination.

---

## 3. Directory Structure

```text
Store-fortification-/
├── app/
│   ├── api/
│   │   ├── events/                     # Event ingestion & listing (POST, GET)
│   │   ├── incidents/                  # Incident listing (GET)
│   │   │   └── [id]/
│   │   │       ├── route.ts            # Single incident & event lookup (GET)
│   │   │       ├── investigate/        # AI investigator trigger (POST)
│   │   │       └── actions/            # Propose response action with dry run (POST)
│   │   ├── actions/
│   │   │   └── [id]/
│   │   │       └── decision/           # Approve/reject & simulated execution (POST)
│   │   ├── simulate/
│   │   │   └── [scenario]/             # Scenario replay S1–S4 (POST)
│   │   ├── reset/                      # In-memory store reset (POST)
│   │   ├── posture/                    # System posture & metrics (GET)
│   │   ├── compliance/                 # DPDP-aligned controls mapping (GET)
│   │   ├── provider-status/            # MOCK/CONFIGURED/BEDROCK_VERIFIED (GET)
│   │   ├── audit/                      # Immutable audit log entries (GET)
│   │   └── autonomy-settings/          # Autonomous response policies (GET)
│   ├── globals.css                     # Base styling & theme variables
│   ├── layout.tsx                      # Root layout wrapper
│   └── page.tsx                        # Minimal bootstrap home page
│
├── components/                         # UI Components (Owned by Aayash)
│
├── lib/
│   ├── types/                          # Canonical frozen contracts (Owned by Aayush)
│   │   ├── events.ts                   # SecurityEvent & AgentPaymentMandate
│   │   ├── incidents.ts                # Incident, severity, timeline, evidence
│   │   ├── investigation.ts            # InvestigationResult & cited findings
│   │   ├── actions.ts                  # ResponseAction, dry run, approvals
│   │   ├── audit.ts                    # AuditLogEntry
│   │   ├── posture.ts                  # SecurityPosture
│   │   ├── compliance.ts               # ComplianceControl & ComplianceReport
│   │   ├── provider.ts                 # ProviderStatus
│   │   ├── autonomy.ts                 # AutonomySettings
│   │   └── index.ts                    # Barrel export
│   ├── store/                          # In-memory storage abstraction
│   │   ├── event-store.ts
│   │   ├── incident-store.ts
│   │   ├── action-store.ts
│   │   ├── audit-store.ts
│   │   ├── backup.ts                   # JSON backup & restore
│   │   └── index.ts
│   ├── validation/                     # Zod runtime validation schemas
│   ├── utils/                          # API response wrappers & helpers
│   ├── rules/                          # Detection engine R1–R8 (Aayush — Phase 02)
│   ├── correlate/                      # Correlation & scoring (Aayush — Phase 02)
│   ├── ai/                             # Bedrock / Mock AI (Aashirwad — Phase 02)
│   ├── scenarios/                      # S1–S4 generators (Aashirwad — Phase 02)
│   └── compliance/                     # Detailed control logic (Aashirwad — Phase 02)
│
├── data/                               # JSON persistence directory (.gitkeep)
├── docs/                               # Architecture documentation
├── tests/                              # Foundational test suites
│   ├── contracts.test.ts               # Schema validation tests
│   ├── store.test.ts                   # Storage CRUD & backup tests
│   └── api.test.ts                     # 14 API endpoint integration tests
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 4. Frozen Core Contracts (`/lib/types`)

### A. `SecurityEvent`
Supports all 22 base fields + 4 mandatory agent-payment fields:
- `id`: Unique identifier (`evt_...`)
- `timestamp`: ISO 8601 string
- `source`: Subsystem name (`storefront`, `api-gateway`, etc.)
- `eventType`: Qualified event name (`auth.login.failed`, `api.request`, etc.)
- `userId`, `sessionId`, `sourceIp`, `userAgent`, `accountRole`
- `endpoint`, `httpMethod`, `responseStatus`, `requestCount`
- `resourceType`, `recordCount`, `dataCategory`
- `destination`, `approvedDestination`
- `paymentAmount`, `currency`, `transactionId`
- `metadata`: Structured freeform object
- **Mandatory Agent-Payment Fields:**
  - `agentId`: Identifier of the shopping agent bot
  - `principalId`: Human customer on whose behalf the agent acts
  - `mandate`: `{ limit: number, merchantScope: string[], expiry: string }`
  - `paymentMethodOwner`: Identity verified against principal

### B. `Incident`
- `id`: Unique identifier (`inc_...`)
- `title`, `incidentType`, `severity` (`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`)
- `status` (`OPEN` | `INVESTIGATING` | `CONTAINED` | `RESOLVED` | `CLOSED`)
- `createdAt`, `updatedAt`
- `affectedUserIds`, `affectedSessions`, `affectedResources`
- `eventIds`: Array of referenced event IDs
- `evidence`: Array of `{ eventId, description, ruleId, severity }`
- `riskScore`: Computed score (0–100)
- `summary`, `investigationStatus`, `recommendedActions`, `assignedTo`, `resolution`, `timeline`

### C. `InvestigationResult`
- `executiveSummary`: High-level synopsis
- `confirmedEvidence`: Array of findings strictly citing existing `eventId`s
- `rootCauseHypothesis`: Explicitly labeled hypothesis (never stated as unverified fact)
- `confidence`: Confidence rating (0.0 to 1.0)
- `businessImpact`: E-commerce operational assessment
- `complianceConsiderations`: DPDP-aligned and PCI DSS control mapping
- `recommendedResponse`: Action (`BLOCK`, `ALERT`, `CONTAIN`) with priority and rationale
- `unknownsAndLimitations`: Explicit gaps in telemetry

### D. `ResponseAction`
- `id`: Unique action identifier (`act_...`)
- `incidentId`: Associated incident
- `actionType`: `BLOCK` | `ALERT` | `CONTAIN`
- `status`: `PROPOSED` | `APPROVED` | `REJECTED` | `EXECUTED` | `FAILED`
- `proposedAt`: ISO 8601
- `dryRunResult`: Impact projection (`impactedUsers`, `blastRadius`, `summary`)
- `approvalMetadata`: Human analyst decision, timestamp, notes
- `simulatedExecutionResult`: Execution telemetry (tarpitting ms, honeypot active)
- `auditReferences`: Array of audit log IDs

---

## 5. API Route Inventory (14 Endpoints)

| # | Route | Method | Purpose | Phase 01 Status |
|---|---|---|---|---|
| 1 | `/api/events` | POST | Ingest raw event, validate, audit | Typed stub (Stores & audits) |
| 2 | `/api/events` | GET | List recent events with filtering | Fully functional |
| 3 | `/api/incidents` | GET | List incidents with risk score | Fully functional |
| 4 | `/api/incidents/[id]` | GET | Retrieve incident with events | Fully functional |
| 5 | `/api/incidents/[id]/investigate` | POST | Run AI investigator | Typed stub (Cites real events) |
| 6 | `/api/incidents/[id]/actions` | POST | Propose response with dry run | Fully functional |
| 7 | `/api/actions/[id]/decision` | POST | Approve/reject with simulation | Fully functional |
| 8 | `/api/simulate/[scenario]` | POST | Replay scenario (s1–s4) | Typed stub (Validates scenario) |
| 9 | `/api/reset` | POST | Reset in-memory state | Fully functional |
| 10 | `/api/posture` | GET | Overview metrics & risk score | Fully functional |
| 11 | `/api/compliance` | GET | DPDP & PCI control mapping | Fully functional (Safe wording) |
| 12 | `/api/provider-status` | GET | Provider status (MOCK/CONFIGURED) | Fully functional (Honest labels) |
| 13 | `/api/audit` | GET | List audit trail entries | Fully functional |
| 14 | `/api/autonomy-settings` | GET | Autonomous response policies | Fully functional (Enforces human approval) |

---

## 6. Storage Approach

CartGuard AI uses an in-memory storage abstraction backed by optional JSON serialization:
- `InMemoryEventStore`: Thread-safe, keyed storage for security events with query filtering.
- `InMemoryIncidentStore`: Storage for correlated incidents with immutability guarantees.
- `InMemoryActionStore`: Tracks proposed, approved, and executed response interventions.
- `InMemoryAuditStore`: Append-only, chronological audit log.
- `StorageBackupManager`: Serializes/deserializes all stores to `data/backup.json`.
- Zero database or daemon installation required.

---

## 7. Local Development Commands

```bash
# Install dependencies
pnpm install

# Run TypeScript strict type-check
pnpm run typecheck

# Run test suites (Vitest)
pnpm test

# Run ESLint
pnpm run lint

# Build for production
pnpm run build

# Start local Next.js development server
pnpm run dev
```
