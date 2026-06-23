import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ServerGroup from "./ServerGroup";

const group = {
  server: { name: "localhost", uuid: "srv-1" },
  resourcesByType: { applications: [], services: [], databases: [] },
  stats: { total: 4, running: 3, stopped: 1, deploying: 0, worst: "exited" },
};

describe("ServerGroup header", () => {
  it("shows server name and the running count", () => {
    render(<ServerGroup group={group} />);
    expect(screen.getByText("localhost")).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });
});
