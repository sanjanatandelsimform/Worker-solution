import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { useModalConfig } from "@/hooks/useModalConfig";

const RenderConfig = ({ type, config }: { type: any; config: any }) => {
  const cfg = useModalConfig(type, config);
  return (
    <div>
      <div data-testid="title">{cfg.title}</div>
      <div data-testid="subtitle">{cfg.subtitle}</div>
      <div data-testid="buttons">
        {cfg.buttons && cfg.buttons.map(b => <span key={b.text}>{b.text}</span>)}
      </div>
    </div>
  );
};

describe("useModalConfig (duplicate)", () => {
  it("returns updateInfoSuccess config", () => {
    const onClose = vi.fn();
    render(<RenderConfig type="updateInfoSuccess" config={{ isOpen: true, onClose }} />);

    expect(screen.getByTestId("title").textContent).toBe("Your Information Has Been Updated.");
    expect(screen.getByTestId("subtitle").textContent).toBe("All set! Your name has been updated.");
    expect(screen.getByTestId("buttons").textContent).toContain("Return to Settings");
  });

  it("returns retakeAssessment with loading state", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <RenderConfig
        type="retakeAssessment"
        config={{ isOpen: true, onClose, onConfirm, additionalData: { loading: true } }}
      />
    );

    // buttons should include a Cancel and a Retaking... text due to loading
    const buttonsText = screen.getByTestId("buttons").textContent || "";
    expect(buttonsText).toContain("Cancel");
    expect(buttonsText).toContain("Retaking...");
  });
});
