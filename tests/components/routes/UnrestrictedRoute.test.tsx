import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UnrestrictedRoute } from "@/components/routes/UnrestrictedRoute";

describe("UnrestrictedRoute", () => {
  it("renders children", () => {
    render(
      <UnrestrictedRoute>
        <div>Unrestricted Content</div>
      </UnrestrictedRoute>
    );
    expect(screen.getByText("Unrestricted Content")).toBeInTheDocument();
  });
});
