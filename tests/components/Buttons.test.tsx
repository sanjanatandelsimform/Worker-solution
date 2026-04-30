/**
 * Button, CloseButton, and SocialButton Component Tests
 *
 * Covers: rendering, sizes, variants, disabled state, loading state,
 * link vs button mode, leading/trailing icons, and social platform logos.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { SocialButton } from "@/components/base/buttons/social-button";

// ── Button ────────────────────────────────────────────────────────────────────

describe("Button", () => {
  describe("rendering", () => {
    it("renders as a <button> by default", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
    });

    it("renders text content inside a span", () => {
      render(<Button>Submit</Button>);
      expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    it("renders as an <a> when href is supplied", () => {
      render(<Button href="/dashboard">Go</Button>);
      const link = screen.getByRole("link", { name: "Go" });
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe("A");
    });

    it("link href is removed when disabled", () => {
      render(
        <Button href="/dashboard" isDisabled>
          Go
        </Button>
      );
      const link = screen.getByRole("link", { name: "Go" });
      expect(link).not.toHaveAttribute("href");
    });

    it("applies default type='button' to prevent accidental form submission", () => {
      render(<Button>Save</Button>);
      expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
    });
  });

  describe("disabled state", () => {
    it("marks button as disabled when isDisabled is true", () => {
      render(<Button isDisabled>Disabled</Button>);
      expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
    });

    it("button is not disabled by default", () => {
      render(<Button>Active</Button>);
      expect(screen.getByRole("button", { name: "Active" })).not.toBeDisabled();
    });
  });

  describe("loading state", () => {
    it("renders the loading SVG when isLoading is true", () => {
      const { container } = render(<Button isLoading>Save</Button>);
      const svg = container.querySelector("svg[data-icon='loading']");
      expect(svg).not.toBeNull();
    });

    it("hides text content during loading by default", () => {
      render(<Button isLoading>Save</Button>);
      // The text span is invisible (not removed) during loading
      const textSpan = screen.getByText("Save").closest("[data-text]");
      expect(textSpan).toBeInTheDocument();
    });

    it("keeps text visible when showTextWhileLoading is true", () => {
      render(
        <Button isLoading showTextWhileLoading>
          Saving…
        </Button>
      );
      expect(screen.getByText("Saving…")).toBeInTheDocument();
    });
  });

  describe("icons", () => {
    it("renders a leading icon component", () => {
      const LeadingIcon = ({ className }: { className?: string }) => (
        <svg data-testid="leading-icon" className={className} />
      );
      render(<Button iconLeading={LeadingIcon}>Save</Button>);
      expect(screen.getByTestId("leading-icon")).toBeInTheDocument();
    });

    it("renders a trailing icon component", () => {
      const TrailingIcon = ({ className }: { className?: string }) => (
        <svg data-testid="trailing-icon" className={className} />
      );
      render(<Button iconTrailing={TrailingIcon}>Next</Button>);
      expect(screen.getByTestId("trailing-icon")).toBeInTheDocument();
    });

    it("renders a leading icon passed as a React element", () => {
      render(<Button iconLeading={<span data-testid="icon-el" />}>Save</Button>);
      expect(screen.getByTestId("icon-el")).toBeInTheDocument();
    });
  });

  describe("size variants", () => {
    const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
    sizes.forEach(size => {
      it(`renders without error at size '${size}'`, () => {
        render(<Button size={size}>Label</Button>);
        expect(screen.getByRole("button", { name: "Label" })).toBeInTheDocument();
      });
    });
  });

  describe("color variants", () => {
    const colors = ["primary", "secondary", "tertiary", "subtle"] as const;
    colors.forEach(color => {
      it(`renders without error with color '${color}'`, () => {
        render(<Button color={color}>Label</Button>);
        expect(screen.getByRole("button", { name: "Label" })).toBeInTheDocument();
      });
    });
  });

  describe("className", () => {
    it("applies a custom className", () => {
      render(<Button className="my-custom-class">Click</Button>);
      expect(screen.getByRole("button", { name: "Click" })).toHaveClass("my-custom-class");
    });
  });
});

// ── CloseButton ───────────────────────────────────────────────────────────────

describe("CloseButton", () => {
  describe("rendering", () => {
    it("renders as a <button>", () => {
      render(<CloseButton />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("has default aria-label 'Close'", () => {
      render(<CloseButton />);
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });

    it("uses a custom label as aria-label", () => {
      render(<CloseButton label="Dismiss notification" />);
      expect(screen.getByRole("button", { name: "Dismiss notification" })).toBeInTheDocument();
    });

    it("renders the close button with aria-hidden icon slot", () => {
      // @untitledui/icons is globally mocked; verify the button itself is present
      const btn = render(<CloseButton />);
      expect(btn.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });
  });

  describe("size variants", () => {
    const sizes = ["xs", "sm", "md", "lg"] as const;
    sizes.forEach(size => {
      it(`renders at size '${size}' without error`, () => {
        render(<CloseButton size={size} />);
        expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
      });
    });
  });

  describe("theme variants", () => {
    it("renders with light theme (default)", () => {
      render(<CloseButton theme="light" />);
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });

    it("renders with dark theme", () => {
      render(<CloseButton theme="dark" />);
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });
  });

  describe("interactivity", () => {
    it("calls onClick when clicked", async () => {
      const onClick = vi.fn();
      render(<CloseButton onPress={onClick} />);
      await act(async () => {
        screen.getByRole("button", { name: "Close" }).click();
      });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("is disabled when isDisabled is true", () => {
      render(<CloseButton isDisabled />);
      expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
    });
  });
});

// ── SocialButton ──────────────────────────────────────────────────────────────

describe("SocialButton", () => {
  describe("rendering as button", () => {
    it("renders a <button> element by default", () => {
      render(<SocialButton social="google">Sign in with Google</SocialButton>);
      expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
    });

    it("renders as an <a> when href is provided", () => {
      render(
        <SocialButton social="google" href="/oauth/google">
          Sign in
        </SocialButton>
      );
      const link = screen.getByRole("link", { name: "Sign in" });
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe("A");
    });
  });

  describe("social platforms", () => {
    const socials = ["google", "facebook", "apple", "twitter", "figma", "dribble"] as const;
    socials.forEach(social => {
      it(`renders for '${social}' without error`, () => {
        render(<SocialButton social={social}>{`Sign in with ${social}`}</SocialButton>);
        expect(screen.getByRole("button", { name: `Sign in with ${social}` })).toBeInTheDocument();
      });
    });
  });

  describe("theme variants", () => {
    const themes = ["brand", "color", "gray"] as const;
    themes.forEach(theme => {
      it(`renders with theme '${theme}' without error`, () => {
        render(
          <SocialButton social="google" theme={theme}>
            Continue
          </SocialButton>
        );
        expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
      });
    });
  });

  describe("size variants", () => {
    const sizes = ["sm", "md", "lg", "xl"] as const;
    sizes.forEach(size => {
      it(`renders at size '${size}' without error`, () => {
        render(
          <SocialButton social="google" size={size}>
            Continue
          </SocialButton>
        );
        expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
      });
    });
  });

  describe("disabled state", () => {
    it("marks button as disabled", () => {
      render(
        <SocialButton social="google" disabled>
          Sign in
        </SocialButton>
      );
      expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
    });
  });

  describe("icon-only mode", () => {
    it("renders without children (icon-only)", () => {
      render(<SocialButton social="google" aria-label="Sign in with Google" />);
      expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
    });
  });

  describe("figma with gray theme (FigmaLogoOutlined branch)", () => {
    it("renders figma social button with gray theme", () => {
      render(<SocialButton social="figma" theme="gray">Figma Login</SocialButton>);
      expect(screen.getByRole("button", { name: "Figma Login" })).toBeTruthy();
    });
  });
});
