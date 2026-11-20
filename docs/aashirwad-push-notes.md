# Branch `Aashirwad-push`: AI investigator, scenarios S1-S4, compliance mapping

**Owner:** Aashirwad (AI Specialist). Fills only the owned folders `lib/ai`, `lib/scenarios`, `lib/compliance`,
plus new tests in `tests/` and this note. No file owned by Aayush (`lib/types`, `lib/rules`, `lib/correlate`,
`lib/store`, `lib/validation`, `app/api`) or Aayash (`app/` pages, `components/`) was modified.
Merges into `main` without conflicts: the three folders held only `.gitkeep` on `main`.

## What was done

These modules were first written in a separate workspace with local "mirror" types. They have been
rewritten against the frozen `@/lib/types` contracts so they plug straight into this repo.

### `lib/scenarios`: deterministic S1-S4 generators
- Emit frozen `SecurityEvent` objects (`eventType`, `sourceIp`, `endpoint`, `responseStatus`, `requestCount`,
  `recordCount`, `dataCategory`, `paymentAmount`, ...). IDs follow the repo convention: `evt_s1_01`.
- Fields with no frozen slot (`actorLabel`, `tokenId`, `purpose`, `consentPurpose`, `recordsAccessed`) travel in
  `event.metadata`. Read them with `scenarioMeta(event)`.
- **S1 fires R1, R2, R3, R4 and R5 through the real `detectionEngine` and correlates into ONE CRITICAL incident**
  (verified in `tests/scenarios.test.ts`).
- S2/S3/S4 carry the exact signals R6/R7/R8 need, but **R6-R8 do not exist in `lib/rules` yet**, so replaying
  them produces no incident today. S4 agent payments are classified `TRUSTED_SHOPPING_AGENT` by R3 (no false bot hit).

### `lib/ai`: evidence-grounded investigator
- Produces the frozen `InvestigationResult` (`executiveSummary`, `confirmedEvidence[]`, `rootCauseHypothesis`,
  `confidence`, `complianceConsiderations`, structured `recommendedResponse`, `unknownsAndLimitations`, `providerUsed`).
- `investigate(incident, events, provider = mockProvider)` validates every provider result before returning it.
- Bedrock Converse provider (SigV4 or Bedrock API key, optional Guardrail). Inert by default; only selected when
  status is `BEDROCK_VERIFIED`, and always wrapped in a mock fallback.
- `buildProviderStatus()` returns the frozen `ProviderStatus` payload for `GET /api/provider-status`.

### Guardrail fixes (found by probing the validator: all of these were accepted before)
1. Output with **zero cited evidence** is rejected (frozen schema `min(1)` + post-filter check).
2. **Certification / "compliant" / CONNECTED wording** anywhere in the result is rejected (was prompt-only).
3. **`providerUsed` is stamped by the trusted code path**, never taken from model text.
4. `recommendedResponse` is a structured enum; **approval-bypass wording** ("auto-approve", "execute now") is rejected.
5. **Prompt injection:** the system prompt marks all event fields as untrusted data, and every `<` in embedded JSON
   is escaped so a recorded value cannot close the `<events>` block.
6. Bedrock failures that fall back to mock are **logged and disclosed** in `unknownsAndLimitations`.

### `lib/compliance`: DPDP-aligned readiness mapping
- `buildComplianceReport(incidents, events)` returns a schema-validated frozen `ComplianceReport` (5 controls).
- `considerationsForIncident(incident)` feeds `InvestigationResult.complianceConsiderations`.
- Readiness wording only. The consent tracker stays a prototype (`isRegisteredConsentManager: false`).

## Verification
`pnpm test`: **90/90 passed** (56 existing + 34 new in `tests/ai.test.ts`, `tests/scenarios.test.ts`,
`tests/compliance.test.ts`). `tsc --noEmit` clean. `next lint`: no warnings or errors.

## Needs coordination (not done here: other owners' folders)
- **Aayush, `app/api/incidents/[id]/investigate/route.ts`:** still builds a hard-coded mock inline. Swap the body for
  `investigate(incident, events, selectInvestigationProvider())` from `@/lib/ai` to get citation checking.
- **Aayush, `app/api/simulate/[scenario]/route.ts`:** only S1 is inline. `getScenario(id)` from `@/lib/scenarios`
  returns ready-made frozen events for s1-s4.
- **Aayush, `app/api/compliance/` and `provider-status/`:** can return `buildComplianceReport(...)` / `buildProviderStatus()`.
- **Aayush, `lib/rules`:** R6 (seller scope), R7 (consent drift), R8 (agent mandate) are still missing.
- **`pnpm-lock.yaml` on `main` is corrupt** (two YAML documents; `pnpm install --frozen-lockfile` fails).
  Not touched here; installs were run with `--no-lockfile`.
