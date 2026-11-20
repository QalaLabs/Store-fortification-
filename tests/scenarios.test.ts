import { describe, it, expect, beforeEach } from "vitest";
import { SecurityEventSchema, type Incident } from "@/lib/types";
import { eventStore, incidentStore, auditStore } from "@/lib/store";
import { detectionEngine } from "@/lib/rules";
import { eventCorrelator } from "@/lib/correlate";
import { getScenario, listScenarios, SCENARIO_IDS, scenarioMeta, type ScenarioId } from "@/lib/scenarios";
import { S4_FAIL_EVENT_ID, S4_MANDATE_LIMIT, S4_PASS_EVENT_ID } from "@/lib/scenarios/s4-agent-payment";

/** Replays a scenario exactly like POST /api/simulate: store, evaluate with recent events, correlate. */
async function replay(id: ScenarioId): Promise<{ rules: Set<string>; incidents: Incident[] }> {
  const rules = new Set<string>();
  for (const event of getScenario(id)) {
    const saved = await eventStore.add(event);
    const recentEvents = await eventStore.list({ limit: 50 });
    const findings = await detectionEngine.evaluate(saved, { recentEvents });
    findings.forEach((f) => rules.add(f.ruleId));
    if (findings.length > 0) await eventCorrelator.correlate(saved, findings);
  }
  return { rules, incidents: await incidentStore.getAll() };
}

describe("Scenario generators (lib/scenarios)", () => {
  beforeEach(async () => {
    await eventStore.clear();
    await incidentStore.clear();
    await auditStore.clear();
  });

  it.each(SCENARIO_IDS)("%s emits events that satisfy the frozen SecurityEvent schema", (id) => {
    for (const event of getScenario(id)) {
      const parsed = SecurityEventSchema.safeParse(event);
      expect(parsed.success, `${event.id}: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
      expect(event.id).toMatch(new RegExp("^evt_" + id + "_[0-9]{2}$"));
    }
  });

  it("is deterministic across calls", () => {
    for (const id of SCENARIO_IDS) expect(getScenario(id)).toEqual(getScenario(id));
  });

  it("lists all four scenarios with their expected rules", () => {
    const list = listScenarios();
    expect(list.map((s) => s.id)).toEqual(["s1", "s2", "s3", "s4"]);
    expect(list[0]?.rules).toEqual(["R1", "R2", "R3", "R4", "R5"]);
  });

  it("S1 fires R1-R5 through the real detection engine and correlates into ONE CRITICAL incident", async () => {
    const { rules, incidents } = await replay("s1");
    expect([...rules].sort()).toEqual(["R1", "R2", "R3", "R4", "R5"]);
    expect(incidents).toHaveLength(1);
    expect(incidents[0]?.severity).toBe("CRITICAL");
    expect(incidents[0]?.eventIds).toContain("evt_s1_12");
  });

  it("S2 carries an out-of-scope partner read for R6 and nothing in R1-R5 misfires as bulk access", async () => {
    const events = getScenario("s2");
    const outOfScope = events.filter((e) => (scenarioMeta(e).recordsAccessed ?? []).some((r) => !r.startsWith("merch_acme:")));
    expect(outOfScope.map((e) => e.id)).toEqual(["evt_s2_02", "evt_s2_03"]);
    const { rules } = await replay("s2");
    expect(rules.has("R4")).toBe(false);
    expect(rules.has("R5")).toBe(false);
  });

  it("S3 carries exactly one purpose/consent mismatch for R7", () => {
    const drift = getScenario("s3").filter((e) => {
      const m = scenarioMeta(e);
      return m.purpose && m.consentPurpose && m.purpose !== m.consentPurpose;
    });
    expect(drift.map((e) => e.id)).toEqual(["evt_s3_02"]);
  });

  it("S4 has one passing and one failing agent payment for R8", () => {
    const [pass, fail] = getScenario("s4");
    expect(pass?.id).toBe(S4_PASS_EVENT_ID);
    expect(pass?.paymentMethodOwner).toBe(pass?.principalId);
    expect(pass?.paymentAmount).toBeLessThanOrEqual(S4_MANDATE_LIMIT);
    expect(fail?.id).toBe(S4_FAIL_EVENT_ID);
    expect(fail?.paymentMethodOwner).not.toBe(fail?.principalId);
    expect(fail?.paymentAmount).toBeGreaterThan(S4_MANDATE_LIMIT);
  });

  it("S4 agent payments are classified as a trusted shopping agent, not a bot", async () => {
    const { rules } = await replay("s4");
    expect(rules.has("R3")).toBe(false);
  });
});
