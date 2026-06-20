import { describe, expect, it } from "vitest";
import {
  getSurveyDemoUserFacingCopy,
  surveyDemoSafetyNotices,
  surveyDemoSteps,
} from "./survey-demo.config";

const forbiddenSurveyDemoCopyPatterns = [
  /\bnen mua\b/i,
  /\bnen ban\b/i,
  /\bnen nam giu\b/i,
  /\btin hieu mua\b/i,
  /\btin hieu ban\b/i,
  /\bdiem mua\b/i,
  /\bco phieu an toan\b/i,
  /\bchac chan re\b/i,
  /\bchac chan xau\b/i,
  /\bguaranteed profit\b/i,
  /\bbuy signal\b/i,
  /\bsell signal\b/i,
];

describe("survey demo configuration", () => {
  it("includes the representative modules with survey mode links", () => {
    expect(surveyDemoSteps.map((step) => step.moduleKey)).toEqual([
      "overview",
      "financials",
      "risk",
      "checklist",
    ]);

    for (const step of surveyDemoSteps) {
      expect(step.href).toContain(`/workspace?module=${step.moduleKey}`);
      expect(step.href).toContain("survey=1");
    }
  });

  it("includes the no-advice and no-personal-data warnings", () => {
    expect(surveyDemoSafetyNotices.join(" ")).toContain("not investment advice");
    expect(surveyDemoSafetyNotices.join(" ")).toContain("does not require login");
    expect(surveyDemoSafetyNotices.join(" ")).toContain("personal financial data");
  });

  it("does not include forbidden recommendation copy in user-facing demo text", () => {
    const copy = getSurveyDemoUserFacingCopy().join("\n");

    for (const pattern of forbiddenSurveyDemoCopyPatterns) {
      expect(copy).not.toMatch(pattern);
    }
  });
});

import { getNavigationItems, surveyAllowedModules } from "@/config/navigation.config";

describe("survey mode navigation", () => {
  it("returns all modules when survey mode is inactive", () => {
    const items = getNavigationItems(false);
    // Should have more than just the survey modules
    expect(items.length).toBeGreaterThan(surveyAllowedModules.size);
    // Check if a known non-survey module is present
    expect(items.find((i) => i.key === "screening")).toBeDefined();
  });

  it("filters non-survey modules when survey mode is active", () => {
    const items = getNavigationItems(true);
    expect(items.length).toBe(surveyAllowedModules.size);
    expect(items.find((i) => i.key === "screening")).toBeUndefined();
    
    for (const item of items) {
      expect(surveyAllowedModules.has(item.key)).toBe(true);
    }
  });
});
