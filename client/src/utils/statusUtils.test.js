import { describe, it, expect } from "vitest";
import {
  getStatusCategory,
  getStatusSeverity,
  worstStatus,
} from "./statusUtils";

describe("getStatusCategory", () => {
  it("maps running variants to 'running'", () => {
    expect(getStatusCategory("running:healthy")).toBe("running");
    expect(getStatusCategory("running")).toBe("running");
  });
  it("maps exited/stopped to 'stopped'", () => {
    expect(getStatusCategory("exited")).toBe("stopped");
    expect(getStatusCategory("stopped")).toBe("stopped");
  });
  it("maps error/failed to 'error'", () => {
    expect(getStatusCategory("error")).toBe("error");
    expect(getStatusCategory("failed:x")).toBe("error");
  });
  it("maps null/unknown to 'unknown'/'pending'", () => {
    expect(getStatusCategory(null)).toBe("unknown");
    expect(getStatusCategory("weird")).toBe("pending");
  });
});

describe("getStatusSeverity", () => {
  it("ranks error highest, running lowest non-zero", () => {
    expect(getStatusSeverity("error")).toBeGreaterThan(getStatusSeverity("exited"));
    expect(getStatusSeverity("exited")).toBeGreaterThan(getStatusSeverity("running:healthy"));
  });
});

describe("worstStatus", () => {
  it("returns the most severe status string among resources", () => {
    const resources = [
      { status: "running:healthy" },
      { status: "exited" },
      { status: "running:healthy" },
    ];
    expect(worstStatus(resources)).toBe("exited");
  });
  it("returns null for empty input", () => {
    expect(worstStatus([])).toBe(null);
  });
});
