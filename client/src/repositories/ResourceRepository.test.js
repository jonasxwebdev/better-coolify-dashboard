import { describe, it, expect, vi } from "vitest";
import { ResourceRepository } from "./ResourceRepository";

describe("ResourceRepository extras", () => {
  it("fetchServers returns the array from the client", async () => {
    const client = {
      get: vi.fn().mockResolvedValue([{ name: "localhost", uuid: "s1" }]),
    };
    const repo = new ResourceRepository(client);
    const servers = await repo.fetchServers();
    expect(client.get).toHaveBeenCalledWith("/servers");
    expect(servers).toEqual([{ name: "localhost", uuid: "s1" }]);
  });

  it("fetchDeployments returns the array from the client", async () => {
    const client = {
      get: vi.fn().mockResolvedValue([{ application_uuid: "a1" }]),
    };
    const repo = new ResourceRepository(client);
    const deployments = await repo.fetchDeployments();
    expect(client.get).toHaveBeenCalledWith("/deployments");
    expect(deployments).toEqual([{ application_uuid: "a1" }]);
  });

  it("fetchDeployments returns [] on error", async () => {
    const client = { get: vi.fn().mockRejectedValue(new Error("boom")) };
    const repo = new ResourceRepository(client);
    expect(await repo.fetchDeployments()).toEqual([]);
  });
});
