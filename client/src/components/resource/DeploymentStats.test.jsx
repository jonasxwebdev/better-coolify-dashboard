import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DeploymentStats from "./DeploymentStats";

describe("DeploymentStats", () => {
  it("renders commit and restart count when present", () => {
    render(
      <DeploymentStats
        resource={{ git_commit_sha: "abcdef1234567", restart_count: 9 }}
        isDeploying={false}
      />
    );
    expect(screen.getByText(/abcdef1/)).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("shows a deploying badge when isDeploying", () => {
    render(<DeploymentStats resource={{}} isDeploying={true} />);
    expect(screen.getByText(/deploying/i)).toBeInTheDocument();
  });

  it("renders nothing about deploying when not deploying", () => {
    const { container } = render(
      <DeploymentStats resource={{}} isDeploying={false} />
    );
    expect(container.textContent).not.toMatch(/deploying/i);
  });
});
