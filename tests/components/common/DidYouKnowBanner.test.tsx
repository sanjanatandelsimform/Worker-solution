import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import DidYouKnowBanner from "@/components/common/DidYouKnowBanner";

const defaultProps = {
  imageSrc: "/test-image.jpg",
  imageAlt: "Test hero image",
  stat: "78%",
  text: "of employees reported they're more likely to stay with an employer because of their benefits program.",
};

describe("DidYouKnowBanner", () => {
  it("renders the 'Did you know?' heading", () => {
    render(<DidYouKnowBanner {...defaultProps} />);
    expect(screen.getByRole("heading", { name: /did you know\?/i })).toBeInTheDocument();
  });

  it("renders the stat in a bold span", () => {
    render(<DidYouKnowBanner {...defaultProps} />);
    const stat = screen.getByText("78%");
    expect(stat.tagName).toBe("SPAN");
    expect(stat).toHaveClass("font-semibold");
  });

  it("renders the descriptive text", () => {
    render(<DidYouKnowBanner {...defaultProps} />);
    expect(screen.getByText(/of employees reported/i)).toBeInTheDocument();
  });

  it("renders the image with the correct src and alt", () => {
    render(<DidYouKnowBanner {...defaultProps} />);
    const img = screen.getByAltText("Test hero image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/test-image.jpg");
  });

  it("reflects custom stat and text props", () => {
    render(
      <DidYouKnowBanner
        imageSrc="/other.jpg"
        imageAlt="Other image"
        stat="42%"
        text="of workers prefer flexible benefits."
      />
    );
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText(/of workers prefer flexible benefits/i)).toBeInTheDocument();
  });
});
