# CartGuard AI

**Security monitoring, threat correlation, and human-approved response for e-commerce stores and the AI shopping agents that buy from them.**

> **AI FORGE 2026** — SEESEC x AWS Enterprise GenAI Buildathon
> **Challenge:** AF-2026-01 (Project Sentinel AI)
> **Team:** QALA LABS (Aayush, Aashirwad, Aayash)

Runs fully offline by default: in-memory stores, no AWS credentials, and the AI provider resolves to `MOCK` until Bedrock is configured and verified.

## What the agent does

1. **Ingests events** from the storefront, API gateway, and payment flow into one `SecurityEvent` shape.
2. **Detects with deterministic rules R1–R8.** No model decides whether something is an attack.
3. **Correlates scattered signals into one incident** (failed logins, a success, bulk reads, an export become one story).
4. **Scores risk explainably** on a 0–100 scale (LOW, MEDIUM, HIGH, CRITICAL), listing every contribution.
5. **Tells legitimate AI shopping agents from bots**, and checks agent payments against a mandate that traces to an authenticated human (R8).
6. **Explains each incident** with an evidence-grounded investigator: summary, labelled hypothesis, confidence, unknowns, recommended response.
7. **Refuses to invent evidence.** Every citation must be one of the incident's event IDs; output with no citations, certification wording, or approval-bypass wording is rejected.
8. **Treats event text as data.** Prompt-injection attempts in event fields are scanned and neutralised before reaching a prompt.
9. **Keeps a human in the loop.** Response actions come with a dry run, need analyst approval, execute in simulation only, and are audit-logged. Autonomous response is disabled by design.
10. **Stays honest about status.** "DPDP-aligned readiness and controls", never "certified". Provider status is `MOCK`, `CONFIGURED`, or `BEDROCK_VERIFIED`, never `CONNECTED` without a verified call.

## Detection rules and scenarios

| Rule | Detects |
| --- | --- |
| R1 | Repeated login failures |
| R2 | Successful login after failures |
| R3 | API volume and bot likelihood |
| R4 | Bulk access to sensitive data |
| R5 | Unapproved export |
| R6 | Partner or seller reads outside authorised scope |
| R7 | Data used beyond the consented purpose |
| R8 | Agent payment mandate violations |

| Scenario | Story | Rules |
| --- | --- | --- |
| S1 | Account takeover plus API abuse | R1–R5 |
| S2 | Seller API data exposure | R6 |
| S3 | Marketing consent drift | R7 |
| S4 | Agent payment verification mismatch | R8 |

## Quick start

```bash
pnpm install
pnpm run typecheck
pnpm test
pnpm run lint
pnpm run build
pnpm run dev
```

## Status

- **Done:** rules R1–R8 are registered in the detection engine; the S1 replay runs live through detection and correlation.
- **Still to wire:** the `simulate` route replays only S1 live and returns placeholders for S2–S4. The `investigate` route builds its result inline instead of calling the validated investigator in `lib/ai`. `provider-status` reads `AI_PROVIDER`, while `lib/ai` uses `CARTGUARD_AI_PROVIDER`.
- **Check before deploy:** `pnpm-lock.yaml` appears to contain two YAML documents, which breaks `pnpm install --frozen-lockfile` and the Amplify build.

## Documentation

- [Architecture and contracts](docs/architecture.md)
- [AI branch notes](docs/aashirwad-push-notes.md)

---
*README and documentation owned and maintained by Aashirwad (AI Specialist).*
