import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Layout pulls in the header/footer which run database-backed queries; the
// page under test is the policy content itself.
vi.mock("@/components/layout/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import PrivacyPolicy from "@/pages/PrivacyPolicy";
import { Footer } from "@/components/layout/Footer";

describe("Privacy Policy page", () => {
  it("shows the title and last-updated date", () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(
      screen.getByText("Last updated: October 26, 2026")
    ).toBeInTheDocument();
  });

  it("covers every required section", () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    );
    [
      "Information We Collect",
      "Cookies",
      "Google Analytics",
      "Google AdSense and Advertising",
      "How We Share Information",
      "Children's Privacy",
      "Changes to This Policy",
      "Contact",
    ].forEach((title) =>
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument()
    );
  });

  it("states the key promises and opt-out links", () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/We do not sell your personal information/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/children under 13/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "tools.google.com/dlpage/gaoptout" })
    ).toHaveAttribute("href", "https://tools.google.com/dlpage/gaoptout");
    expect(
      screen.getByRole("link", { name: "adssettings.google.com" })
    ).toHaveAttribute("href", "https://adssettings.google.com");
    expect(screen.getByRole("link", { name: "www.aboutads.info" })).toHaveAttribute(
      "href",
      "https://www.aboutads.info"
    );
  });
});

describe("Footer Quick Links", () => {
  it("links to the Privacy Policy page", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const link = screen.getByRole("link", { name: "Privacy Policy" });
    expect(link).toHaveAttribute("href", "/privacy-policy");
  });
});
