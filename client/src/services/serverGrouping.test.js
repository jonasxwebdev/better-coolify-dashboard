import { describe, it, expect } from "vitest";
import {
  resolveServer,
  deployingIndex,
  serverStats,
  groupByServer,
} from "./serverGrouping";

const servers = [
  { name: "localhost", uuid: "srv-1" },
  { name: "edge", uuid: "srv-2" },
];

describe("resolveServer", () => {
  it("resolves apps/dbs via destination.server.uuid", () => {
    const r = { destination: { server: { uuid: "srv-1", name: "localhost" } } };
    expect(resolveServer(r, servers)).toEqual({ name: "localhost", uuid: "srv-1" });
  });
  it("resolves services via server.uuid", () => {
    const r = { server: { uuid: "srv-2" } };
    expect(resolveServer(r, servers)).toEqual({ name: "edge", uuid: "srv-2" });
  });
  it("resolves services via server_id when server object is empty", () => {
    const r = { server: { uuid: null }, server_id: "srv-2" };
    expect(resolveServer(r, servers).uuid).toBe("srv-2");
  });
  it("falls back to embedded name when servers list is empty", () => {
    const r = { destination: { server: { uuid: "x", name: "ghost" } } };
    expect(resolveServer(r, [])).toEqual({ name: "ghost", uuid: "x" });
  });
  it("returns Unassigned when nothing resolves", () => {
    expect(resolveServer({}, servers)).toEqual({ name: "Unassigned", uuid: null });
  });
});

describe("deployingIndex", () => {
  it("collects resource uuids from deployment entries", () => {
    const deps = [
      { application_uuid: "a1", status: "in_progress" },
      { resource_uuid: "d2" },
    ];
    const idx = deployingIndex(deps);
    expect(idx.has("a1")).toBe(true);
    expect(idx.has("d2")).toBe(true);
    expect(idx.has("nope")).toBe(false);
  });
  it("handles null/empty", () => {
    expect(deployingIndex(null).size).toBe(0);
  });
});

describe("serverStats", () => {
  it("counts running/stopped/deploying and picks worst status", () => {
    const resources = [
      { uuid: "a1", status: "running:healthy" },
      { uuid: "a2", status: "exited" },
      { uuid: "a3", status: "running:healthy" },
    ];
    const idx = new Set(["a3"]);
    const stats = serverStats(resources, idx);
    expect(stats.total).toBe(3);
    expect(stats.running).toBe(1); // a1 (a3 is deploying)
    expect(stats.stopped).toBe(1); // a2
    expect(stats.deploying).toBe(1); // a3
    expect(stats.worst).toBe("exited");
  });
});

describe("groupByServer", () => {
  const resources = [
    { uuid: "a1", type: "application", status: "running:healthy", destination: { server: { uuid: "srv-1" } } },
    { uuid: "s1", type: "service", status: "running:healthy", server: { uuid: "srv-2" } },
    { uuid: "d1", type: "database", status: "exited", destination: { server: { uuid: "srv-1" } } },
  ];

  it("groups resources by server, ordered by the servers list", () => {
    const groups = groupByServer(resources, servers, []);
    expect(groups.map((g) => g.server.name)).toEqual(["localhost", "edge"]);
  });
  it("splits resources into type buckets", () => {
    const groups = groupByServer(resources, servers, []);
    const localhost = groups.find((g) => g.server.uuid === "srv-1");
    expect(localhost.resourcesByType.applications.map((r) => r.uuid)).toEqual(["a1"]);
    expect(localhost.resourcesByType.databases.map((r) => r.uuid)).toEqual(["d1"]);
    expect(localhost.resourcesByType.services).toEqual([]);
  });
  it("omits servers that have no resources", () => {
    const groups = groupByServer([resources[0]], servers, []);
    expect(groups.map((g) => g.server.name)).toEqual(["localhost"]);
  });
  it("puts Unassigned resources in a trailing group", () => {
    const orphan = { uuid: "o1", type: "application", status: "running" };
    const groups = groupByServer([orphan], servers, []);
    expect(groups[groups.length - 1].server.name).toBe("Unassigned");
  });
});
